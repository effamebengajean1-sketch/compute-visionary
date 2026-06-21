// CompilLab — Panneau d'informations (toujours visible).
import { useMemo } from "react";
import { Automaton, getProperties } from "@/lib/automata/types";
import { minimize } from "@/lib/automata/algorithms";
import { isDeterministic } from "@/lib/automata/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  automaton: Automaton;
}

function BoolBadge({ value, label }: { value: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      {value ? (
        <CheckCircle2 className="h-4 w-4 text-success" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground/60" />
      )}
      {label}
    </span>
  );
}

export function InfoPanel({ automaton }: Props) {
  const props = useMemo(() => getProperties(automaton), [automaton]);
  const isMinimal = useMemo(() => {
    if (!isDeterministic(automaton) || automaton.states.length === 0) return false;
    try {
      const min = minimize(automaton).automaton;
      return min ? min.states.length === automaton.states.length : false;
    } catch {
      return false;
    }
  }, [automaton]);

  const kindColor =
    props.kind === "AFD" ? "default" : props.kind === "AFN" ? "secondary" : "outline";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">Informations</h3>
        <Badge variant={kindColor}>{props.kind}</Badge>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="États" value={String(props.stateCount)} />
        <Stat label="Transitions" value={String(props.transitionCount)} />
      </dl>

      <Field label="Alphabet">
        {props.alphabet.length ? (
          <div className="flex flex-wrap gap-1">
            {props.alphabet.map((s) => (
              <Badge key={s} variant="outline" className="font-mono">
                {s}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">∅</span>
        )}
      </Field>

      <Field label="État initial">
        <span className="font-mono">{props.initialStates.join(", ") || "—"}</span>
      </Field>
      <Field label="États finaux">
        <span className="font-mono">{props.finalStates.join(", ") || "—"}</span>
      </Field>

      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <BoolBadge value={props.isDeterministic} label="Déterministe" />
        <BoolBadge value={props.isComplete} label="Complet" />
        <BoolBadge value={props.hasEpsilon} label="Contient des ε-transitions" />
        <BoolBadge value={isMinimal} label="Minimal" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-display text-2xl font-semibold">{value}</dd>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
