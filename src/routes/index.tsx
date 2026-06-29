import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Workflow,
  Regex,
  ArrowRight,
  Sparkles,
  GitBranch,
  Minimize2,
  CheckCircle2,
  ScanSearch,
  Network,
  BookOpen,
  Save,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CompilLab — Logiciel pédagogique de théorie des automates" },
      {
        name: "description",
        content:
          "CompilLab : créez, visualisez et transformez automates finis et expressions régulières. Déterminisation, minimisation, Thompson, Glushkov, Arden — avec étapes pédagogiques.",
      },
      { property: "og:title", content: "CompilLab — Théorie des automates, en clair" },
      {
        property: "og:description",
        content:
          "Atelier interactif d'automates finis et d'expressions régulières avec visualisation et étapes pédagogiques.",
      },
    ],
  }),
  component: Home,
});

const modules = [
  {
    to: "/atelier" as const,
    icon: Workflow,
    title: "Automates finis",
    desc: "Construisez vos automates état par état, testez la reconnaissance de mots et appliquez les grandes transformations.",
    points: ["Déterminisation", "Minimisation", "Suppression des ε", "Complétion & émondage"],
    accent: "primary",
  },
  {
    to: "/regex" as const,
    icon: Regex,
    title: "Expressions régulières",
    desc: "Passez de l'expression à l'automate et inversement, en suivant chaque étape de construction.",
    points: ["Thompson (ε-AFN)", "Glushkov (AFN)", "Arden (automate → regex)", "Export JSON & PDF"],
    accent: "accent",
  },
];

const features = [
  { icon: ScanSearch, title: "Reconnaissance de mots", desc: "Testez un mot et visualisez le chemin parcouru dans l'automate." },
  { icon: GitBranch, title: "Déterminisation", desc: "Transformez un AFN en AFD par construction des sous-ensembles." },
  { icon: Minimize2, title: "Minimisation", desc: "Réduisez l'automate au nombre minimal d'états équivalents." },
  { icon: Network, title: "Visualisation interactive", desc: "Graphe manipulable : déplacez les états, zoomez, exportez en image." },
  { icon: BookOpen, title: "Étapes pédagogiques", desc: "Chaque algorithme détaille son raisonnement, étape par étape." },
  { icon: Save, title: "Sauvegarde locale", desc: "Vos automates restent dans le navigateur ; import/export JSON." },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <Workflow className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-lg font-bold leading-none">CompilLab</h1>
              <p className="text-xs text-muted-foreground">Théorie des automates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/atelier">Atelier</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/regex">Expressions régulières</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:24px_24px] opacity-60" />
        <div className="mx-auto max-w-6xl px-4 py-16 text-center lg:py-24">
          <Badge variant="secondary" className="mb-5 gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Logiciel pédagogique
          </Badge>
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight lg:text-6xl">
            La théorie des automates,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              rendue claire
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground lg:text-lg">
            Créez, visualisez et transformez automates finis et expressions régulières.
            Chaque algorithme s'accompagne de ses étapes, pour comprendre et pas seulement exécuter.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/atelier">
                Ouvrir l'atelier <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/regex">
                <Regex className="h-4 w-4" /> Expressions régulières
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="grid gap-5 md:grid-cols-2">
          {modules.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="group relative flex flex-col rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-panel"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-soft ${
                  m.accent === "primary"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                <m.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold">{m.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
              <ul className="mt-4 grid grid-cols-2 gap-2">
                {m.points.map((p) => (
                  <li key={p} className="flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> {p}
                  </li>
                ))}
              </ul>
              <span className="mt-5 flex items-center gap-1 text-sm font-medium text-primary">
                Explorer le module
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 text-center">
          <h3 className="font-display text-2xl font-bold lg:text-3xl">Tout pour apprendre en manipulant</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Une boîte à outils complète qui montre le « comment » derrière chaque résultat.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-5 shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h4 className="mt-3 font-display text-base font-semibold">{f.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary to-accent p-10 text-center text-primary-foreground shadow-panel">
          <h3 className="font-display text-2xl font-bold lg:text-3xl">Prêt à construire votre premier automate ?</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm opacity-90">
            Tout fonctionne directement dans le navigateur, sans compte ni installation.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/atelier">
              Commencer maintenant <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        CompilLab — Atelier pédagogique de théorie des automates.
      </footer>
    </div>
  );
}
