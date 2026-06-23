import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useAutomataStore } from "@/lib/automata/store";
import { AutomatonGraph } from "@/components/automata/AutomatonGraph";
import { AutomatonToolbar } from "@/components/automata/AutomatonToolbar";
import { EditorPanel } from "@/components/automata/EditorPanel";
import { AlgorithmsPanel } from "@/components/automata/AlgorithmsPanel";
import { InfoPanel } from "@/components/automata/InfoPanel";
import { TransitionTable } from "@/components/automata/TransitionTable";
import { ResultPanel } from "@/components/automata/ResultPanel";
import { HistoryConsole } from "@/components/automata/HistoryConsole";
import { ModuleNav } from "@/components/automata/ModuleNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { Workflow } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CompilLab — Atelier d'automates finis" },
      {
        name: "description",
        content:
          "Logiciel pédagogique pour créer, visualiser et transformer des automates finis : déterminisation, minimisation, reconnaissance de mots et plus.",
      },
      { property: "og:title", content: "CompilLab — Atelier d'automates finis" },
      {
        property: "og:description",
        content:
          "Créez, visualisez et transformez des automates finis : déterminisation, minimisation, reconnaissance de mots.",
      },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const current = useAutomataStore((s) => s.current);
  const selectedStateId = useAutomataStore((s) => s.selectedStateId);
  const highlightStates = useAutomataStore((s) => s.highlightStates);
  const result = useAutomataStore((s) => s.result);
  const history = useAutomataStore((s) => s.history);
  const hydrate = useAutomataStore((s) => s.hydrate);
  const selectState = useAutomataStore((s) => s.selectState);
  const moveState = useAutomataStore((s) => s.moveState);
  const clearHistory = useAutomataStore((s) => s.clearHistory);

  const actionsRef = useRef<{ exportPng: () => void; fit: () => void }>({
    exportPng: () => {},
    fit: () => {},
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur">
        <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <Workflow className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-lg font-bold leading-none">CompilLab</h1>
              <p className="text-xs text-muted-foreground">Atelier d'automates finis</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ModuleNav />
            <AutomatonToolbar
              onExportPng={() => actionsRef.current.exportPng()}
              onFit={() => actionsRef.current.fit()}
            />
          </div>
        </div>
      </header>

      <main className="grid gap-4 p-4 lg:grid-cols-[340px_minmax(0,1fr)_300px]">
        {/* Menu latéral : édition + algorithmes */}
        <aside className="rounded-xl border bg-card p-4 shadow-soft">
          <Tabs defaultValue="edit">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Édition</TabsTrigger>
              <TabsTrigger value="algo">Algorithmes</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-4">
              <EditorPanel />
            </TabsContent>
            <TabsContent value="algo" className="mt-4">
              <AlgorithmsPanel />
            </TabsContent>
          </Tabs>
        </aside>

        {/* Graphe */}
        <section className="flex min-h-[60vh] flex-col overflow-hidden rounded-xl border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <h2 className="font-display text-sm font-semibold">{current.name || "Automate"}</h2>
            <span className="text-xs text-muted-foreground">
              Glissez les états · molette pour zoomer
            </span>
          </div>
          <div className="relative flex-1 bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:22px_22px]">
            <AutomatonGraph
              automaton={current}
              selectedStateId={selectedStateId}
              highlightStates={highlightStates}
              onSelectState={selectState}
              onMoveState={moveState}
              registerActions={(a) => (actionsRef.current = a)}
            />
            {current.states.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm text-muted-foreground">
                <p>
                  Aucun état. Ajoutez-en depuis l'onglet « Édition »
                  <br />
                  ou chargez un exemple.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Informations */}
        <aside className="rounded-xl border bg-card p-4 shadow-soft">
          <InfoPanel automaton={current} />
        </aside>
      </main>

      <section className="grid gap-4 px-4 pb-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-xl border bg-card p-4 shadow-soft">
          <TransitionTable automaton={current} />
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-soft">
          <h3 className="mb-3 font-display text-sm font-semibold">Résultat de l'algorithme</h3>
          <ResultPanel result={result} />
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-soft">
          <HistoryConsole history={history} onClear={clearHistory} />
        </div>
      </section>
    </div>
  );
}
