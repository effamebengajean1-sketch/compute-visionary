// CompilLab — Panneau d'édition de l'automate (états, transitions, alphabet).
import { useState } from "react";
import { useAutomataStore } from "@/lib/automata/store";
import { EPSILON } from "@/lib/automata/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Flag, CircleDot } from "lucide-react";

const selectClass =
  "h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function EditorPanel() {
  const current = useAutomataStore((s) => s.current);
  const selectedId = useAutomataStore((s) => s.selectedStateId);
  const {
    rename,
    setAlphabet,
    addState,
    removeState,
    renameState,
    toggleInitial,
    toggleFinal,
    addTransition,
    removeTransition,
  } = useAutomataStore.getState();

  const [alphabetInput, setAlphabetInput] = useState(current.alphabet.join(" "));
  const [tFrom, setTFrom] = useState("");
  const [tTo, setTTo] = useState("");
  const [tSym, setTSym] = useState(current.alphabet[0] ?? "a");

  const selected = current.states.find((s) => s.id === selectedId);
  const symbols = [...current.alphabet, EPSILON];

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Nom de l'automate
        </Label>
        <Input value={current.name} onChange={(e) => rename(e.target.value)} />
      </section>

      <section className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Alphabet (séparé par des espaces)
        </Label>
        <div className="flex gap-2">
          <Input
            value={alphabetInput}
            onChange={(e) => setAlphabetInput(e.target.value)}
            placeholder="a b c"
            className="font-mono"
          />
          <Button variant="secondary" onClick={() => setAlphabet(alphabetInput.split(/\s+/))}>
            OK
          </Button>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            États ({current.states.length})
          </Label>
          <Button size="sm" onClick={addState}>
            <Plus className="h-3.5 w-3.5" /> État
          </Button>
        </div>

        {selected ? (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Input
                value={selected.label}
                onChange={(e) => renameState(selected.id, e.target.value)}
                className="h-8"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => removeState(selected.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selected.isInitial ? "success" : "outline"}
                className="flex-1"
                onClick={() => toggleInitial(selected.id)}
              >
                <CircleDot className="h-3.5 w-3.5" /> Initial
              </Button>
              <Button
                size="sm"
                variant={selected.isFinal ? "destructive" : "outline"}
                className="flex-1"
                onClick={() => toggleFinal(selected.id)}
              >
                <Flag className="h-3.5 w-3.5" /> Final
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Cliquez sur un état du graphe pour le modifier.
          </p>
        )}
      </section>

      <section className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ajouter une transition
        </Label>
        <div className="flex flex-wrap items-center gap-2">
          <select className={selectClass} value={tFrom} onChange={(e) => setTFrom(e.target.value)}>
            <option value="">de…</option>
            {current.states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <select className={selectClass} value={tSym} onChange={(e) => setTSym(e.target.value)}>
            {symbols.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select className={selectClass} value={tTo} onChange={(e) => setTTo(e.target.value)}>
            <option value="">vers…</option>
            {current.states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={() => {
              if (tFrom && tTo) addTransition(tFrom, tTo, tSym);
            }}
            disabled={!tFrom || !tTo}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {current.transitions.length > 0 && (
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2">
            {current.transitions.map((t) => {
              const from = current.states.find((s) => s.id === t.from)?.label ?? "?";
              const to = current.states.find((s) => s.id === t.to)?.label ?? "?";
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded px-2 py-1 text-xs hover:bg-muted"
                >
                  <span className="font-mono">
                    {from} —{t.symbol}→ {to}
                  </span>
                  <button
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeTransition(t.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
