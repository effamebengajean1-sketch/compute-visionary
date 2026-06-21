// CompilLab — Stockage local (JSON + navigateur). Aucune base de données requise.
import { Automaton, EPSILON, uid } from "./types";

const STORAGE_KEY = "compillab.automata.v1";
const CURRENT_KEY = "compillab.current.v1";

export interface StoredLibrary {
  automata: Automaton[];
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadLibrary(): Automaton[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredLibrary;
    return parsed.automata ?? [];
  } catch {
    return [];
  }
}

export function saveLibrary(automata: Automaton[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ automata }));
}

export function loadCurrent(): Automaton | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? (JSON.parse(raw) as Automaton) : null;
  } catch {
    return null;
  }
}

export function saveCurrent(a: Automaton | null): void {
  if (!isBrowser()) return;
  if (a) localStorage.setItem(CURRENT_KEY, JSON.stringify(a));
  else localStorage.removeItem(CURRENT_KEY);
}

// ---- Import / export JSON ----

export function exportJson(a: Automaton): string {
  return JSON.stringify(
    {
      name: a.name,
      alphabet: a.alphabet,
      states: a.states.map((s) => ({
        label: s.label,
        isInitial: s.isInitial,
        isFinal: s.isFinal,
        x: s.x,
        y: s.y,
      })),
      transitions: a.transitions.map((t) => ({
        from: a.states.find((s) => s.id === t.from)?.label,
        to: a.states.find((s) => s.id === t.to)?.label,
        symbol: t.symbol,
      })),
    },
    null,
    2,
  );
}

export function downloadJson(a: Automaton): void {
  if (!isBrowser()) return;
  const blob = new Blob([exportJson(a)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${a.name.replace(/\s+/g, "_") || "automate"}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export class ImportError extends Error {}

export function importJson(text: string): Automaton {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new ImportError("JSON invalide : impossible de lire le fichier.");
  }
  const obj = raw as Record<string, unknown>;
  if (!obj || typeof obj !== "object") throw new ImportError("Format invalide.");
  if (!Array.isArray(obj.states)) throw new ImportError("Champ « states » manquant.");
  if (!Array.isArray(obj.transitions)) throw new ImportError("Champ « transitions » manquant.");

  const alphabet = Array.isArray(obj.alphabet)
    ? (obj.alphabet as unknown[]).map(String).filter((s) => s !== EPSILON)
    : [];

  const labelToId = new Map<string, string>();
  const states = (obj.states as Record<string, unknown>[]).map((s, i) => {
    const label = String(s.label ?? `q${i}`);
    const id = uid("q");
    labelToId.set(label, id);
    return {
      id,
      label,
      isInitial: Boolean(s.isInitial),
      isFinal: Boolean(s.isFinal),
      x: typeof s.x === "number" ? s.x : 200 + i * 120,
      y: typeof s.y === "number" ? s.y : 300,
    };
  });

  const transitions = (obj.transitions as Record<string, unknown>[]).map((t) => {
    const from = labelToId.get(String(t.from));
    const to = labelToId.get(String(t.to));
    if (!from || !to) {
      throw new ImportError(`Transition vers un état inconnu : ${String(t.from)} → ${String(t.to)}`);
    }
    return { id: uid("t"), from, to, symbol: String(t.symbol) };
  });

  return {
    id: uid("aut"),
    name: String(obj.name ?? "Automate importé"),
    alphabet,
    states,
    transitions,
  };
}
