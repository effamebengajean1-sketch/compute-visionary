// CompilLab — Table de transition (synchronisée avec le graphe).
import { Automaton, EPSILON, hasEpsilon, stateLabel } from "@/lib/automata/types";
import { Button } from "@/components/ui/button";
import { Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Props {
  automaton: Automaton;
}

export function TransitionTable({ automaton }: Props) {
  const showEpsilon = hasEpsilon(automaton);
  const columns = [...automaton.alphabet, ...(showEpsilon ? [EPSILON] : [])];

  const targets = (fromId: string, symbol: string) =>
    automaton.transitions
      .filter((t) => t.from === fromId && t.symbol === symbol)
      .map((t) => stateLabel(automaton, t.to));

  const copy = () => {
    const header = ["État", ...columns].join("\t");
    const rows = automaton.states.map((s) => {
      const cells = columns.map((c) => targets(s.id, c).join(", ") || "—");
      return [`${s.isInitial ? "→" : ""}${s.isFinal ? "*" : ""}${s.label}`, ...cells].join("\t");
    });
    navigator.clipboard.writeText([header, ...rows].join("\n"));
    toast.success("Table copiée dans le presse-papiers");
  };

  if (automaton.states.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-muted-foreground">
        Ajoutez des états pour voir la table de transition.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">Table de transition</h3>
        <Button variant="ghost" size="sm" onClick={copy}>
          <Copy className="h-3.5 w-3.5" /> Copier
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 text-left">
              <th className="px-3 py-2 font-semibold">État</th>
              {columns.map((c) => (
                <th key={c} className="px-3 py-2 text-center font-mono font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {automaton.states.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2 font-medium">
                  <span className="inline-flex items-center gap-1">
                    {s.isInitial && <ArrowRight className="h-3.5 w-3.5 text-success" />}
                    <span className={s.isFinal ? "rounded-full bg-state-final/15 px-2 py-0.5" : ""}>
                      {s.label}
                    </span>
                  </span>
                </td>
                {columns.map((c) => {
                  const tg = targets(s.id, c);
                  return (
                    <td key={c} className="px-3 py-2 text-center font-mono text-muted-foreground">
                      {tg.length ? tg.join(", ") : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
