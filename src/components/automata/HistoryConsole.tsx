// CompilLab — Console / Historique des opérations.
import { HistoryEntry } from "@/lib/automata/store";
import { Button } from "@/components/ui/button";
import { Trash2, Terminal } from "lucide-react";

interface Props {
  history: HistoryEntry[];
  onClear: () => void;
}

export function HistoryConsole({ history, onClear }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold">
          <Terminal className="h-4 w-4" /> Console / Historique
        </h3>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <Trash2 className="h-3.5 w-3.5" /> Vider
          </Button>
        )}
      </div>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border bg-card p-3 font-mono text-xs">
        {history.length === 0 ? (
          <p className="text-muted-foreground">Aucune opération pour le moment.</p>
        ) : (
          history.map((h) => (
            <div key={h.id} className="flex items-baseline gap-2">
              <span className="text-muted-foreground/60">
                {new Date(h.time).toLocaleTimeString("fr-FR")}
              </span>
              <span className="font-semibold text-primary">{h.label}</span>
              {h.detail && <span className="text-muted-foreground">— {h.detail}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
