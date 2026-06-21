// CompilLab — Algorithmes sur les automates finis (couche "moteur").
// Chaque fonction est pure : elle retourne un nouvel automate et/ou une trace.

import {
  Automaton,
  AutomatonState,
  EPSILON,
  Transition,
  delta,
  finalStateIds,
  hasEpsilon,
  initialStateIds,
  isComplete,
  isDeterministic,
  stateLabel,
  uid,
} from "./types";

export interface AlgorithmResult {
  /** Automate produit, si l'algorithme en génère un. */
  automaton?: Automaton;
  /** Étapes pédagogiques détaillées. */
  steps: string[];
  /** Message de synthèse. */
  message: string;
}

export interface RecognitionStep {
  index: number;
  symbol: string;
  before: string[];
  after: string[];
}

export interface RecognitionResult {
  accepted: boolean;
  word: string;
  steps: RecognitionStep[];
  message: string;
  /** Suite des ensembles d'états (pour l'animation), labels. */
  configurations: string[][];
}

// Position circulaire automatique des nouveaux états.
function layoutCircle(states: AutomatonState[]): AutomatonState[] {
  const n = states.length;
  const radius = Math.max(160, n * 45);
  const cx = 400;
  const cy = 300;
  return states.map((s, i) => {
    const angle = (2 * Math.PI * i) / Math.max(n, 1) - Math.PI / 2;
    return {
      ...s,
      x: Math.round(cx + radius * Math.cos(angle)),
      y: Math.round(cy + radius * Math.sin(angle)),
    };
  });
}

// ---------------------------------------------------------------------------
// ε-fermeture
// ---------------------------------------------------------------------------
export function epsilonClosure(a: Automaton, ids: string[]): Set<string> {
  const closure = new Set<string>(ids);
  const stack = [...ids];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const next of delta(a, cur, EPSILON)) {
      if (!closure.has(next)) {
        closure.add(next);
        stack.push(next);
      }
    }
  }
  return closure;
}

export function epsilonClosureReport(a: Automaton, ids: string[]): AlgorithmResult {
  const steps: string[] = [];
  for (const id of ids) {
    const c = epsilonClosure(a, [id]);
    steps.push(
      `ε-fermeture(${stateLabel(a, id)}) = { ${[...c].map((x) => stateLabel(a, x)).join(", ")} }`,
    );
  }
  return {
    steps,
    message: hasEpsilon(a)
      ? "ε-fermeture calculée pour chaque état."
      : "Aucune ε-transition : chaque état est sa propre ε-fermeture.",
  };
}

// ---------------------------------------------------------------------------
// Reconnaissance d'un mot
// ---------------------------------------------------------------------------
export function recognize(a: Automaton, word: string): RecognitionResult {
  const symbols = word === "" ? [] : word.split("");
  const initial = initialStateIds(a);
  let current = epsilonClosure(a, initial);
  const steps: RecognitionStep[] = [];
  const configurations: string[][] = [[...current].map((x) => stateLabel(a, x))];

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    const before = [...current];
    const moved = new Set<string>();
    for (const s of current) {
      for (const t of delta(a, s, sym)) moved.add(t);
    }
    current = epsilonClosure(a, [...moved]);
    steps.push({
      index: i,
      symbol: sym,
      before: before.map((x) => stateLabel(a, x)),
      after: [...current].map((x) => stateLabel(a, x)),
    });
    configurations.push([...current].map((x) => stateLabel(a, x)));
  }

  const finals = new Set(finalStateIds(a));
  const accepted = [...current].some((s) => finals.has(s));
  return {
    accepted,
    word,
    steps,
    configurations,
    message: accepted
      ? `Le mot « ${word || "ε"} » est ACCEPTÉ.`
      : `Le mot « ${word || "ε"} » est REJETÉ.`,
  };
}

// ---------------------------------------------------------------------------
// Suppression des ε-transitions
// ---------------------------------------------------------------------------
export function removeEpsilon(a: Automaton): AlgorithmResult {
  const steps: string[] = [];
  if (!hasEpsilon(a)) {
    return { automaton: a, steps, message: "L'automate ne contient aucune ε-transition." };
  }
  const newTransitions: Transition[] = [];
  const seen = new Set<string>();

  for (const s of a.states) {
    const closure = epsilonClosure(a, [s.id]);
    for (const c of closure) {
      for (const sym of a.alphabet) {
        for (const target of delta(a, c, sym)) {
          for (const finalTarget of epsilonClosure(a, [target])) {
            const key = `${s.id}|${sym}|${finalTarget}`;
            if (!seen.has(key)) {
              seen.add(key);
              newTransitions.push({ id: uid("t"), from: s.id, to: finalTarget, symbol: sym });
            }
          }
        }
      }
    }
  }

  const finals = new Set(finalStateIds(a));
  const newStates = a.states.map((s) => {
    const closure = epsilonClosure(a, [s.id]);
    const becomesFinal = [...closure].some((c) => finals.has(c));
    return { ...s, isFinal: becomesFinal };
  });

  steps.push(`${a.transitions.filter((t) => t.symbol === EPSILON).length} ε-transition(s) éliminée(s).`);
  steps.push("Les transitions ont été reportées via les ε-fermetures.");

  return {
    automaton: {
      id: uid("aut"),
      name: `${a.name} sans ε`,
      alphabet: [...a.alphabet],
      states: newStates,
      transitions: newTransitions,
    },
    steps,
    message: "ε-transitions supprimées.",
  };
}

// ---------------------------------------------------------------------------
// Déterminisation (construction des sous-ensembles)
// ---------------------------------------------------------------------------
export function determinize(a: Automaton): AlgorithmResult {
  const steps: string[] = [];
  if (isDeterministic(a)) {
    steps.push("L'automate est déjà déterministe.");
    return { automaton: a, steps, message: "Déjà déterministe." };
  }

  const finals = new Set(finalStateIds(a));
  const setKey = (s: Set<string>) =>
    [...s].sort().join(",");
  const setLabel = (s: Set<string>) =>
    s.size === 0 ? "∅" : `{${[...s].map((x) => stateLabel(a, x)).sort().join(",")}}`;

  const start = epsilonClosure(a, initialStateIds(a));
  const queue: Set<string>[] = [start];
  const visited = new Map<string, Set<string>>();
  visited.set(setKey(start), start);

  const newStatesMeta: { key: string; set: Set<string> }[] = [{ key: setKey(start), set: start }];
  const newTransitions: { from: string; to: string; symbol: string }[] = [];

  steps.push(`État initial : ${setLabel(start)}`);

  while (queue.length) {
    const cur = queue.shift()!;
    const curKey = setKey(cur);
    for (const sym of a.alphabet) {
      const moved = new Set<string>();
      for (const s of cur) for (const t of delta(a, s, sym)) moved.add(t);
      const target = epsilonClosure(a, [...moved]);
      const targetKey = setKey(target);
      steps.push(`δ(${setLabel(cur)}, ${sym}) = ${setLabel(target)}`);
      if (!visited.has(targetKey)) {
        visited.set(targetKey, target);
        newStatesMeta.push({ key: targetKey, set: target });
        queue.push(target);
      }
      newTransitions.push({ from: curKey, to: targetKey, symbol: sym });
    }
  }

  const idByKey = new Map<string, string>();
  const states: AutomatonState[] = newStatesMeta.map((m) => {
    const id = uid("q");
    idByKey.set(m.key, id);
    return {
      id,
      label: setLabel(m.set),
      isInitial: m.key === setKey(start),
      isFinal: [...m.set].some((x) => finals.has(x)),
      x: 0,
      y: 0,
    };
  });

  const transitions: Transition[] = newTransitions.map((t) => ({
    id: uid("t"),
    from: idByKey.get(t.from)!,
    to: idByKey.get(t.to)!,
    symbol: t.symbol,
  }));

  return {
    automaton: {
      id: uid("aut"),
      name: `${a.name} (AFD)`,
      alphabet: [...a.alphabet],
      states: layoutCircle(states),
      transitions,
    },
    steps,
    message: `Déterminisation terminée : ${states.length} état(s).`,
  };
}

// ---------------------------------------------------------------------------
// Complétion (ajout d'un état puits)
// ---------------------------------------------------------------------------
export function complete(a: Automaton): AlgorithmResult {
  const steps: string[] = [];
  if (hasEpsilon(a)) {
    return { steps, message: "Supprimez d'abord les ε-transitions avant de compléter." };
  }
  if (isComplete(a)) {
    return { automaton: a, steps, message: "L'automate est déjà complet." };
  }

  const states = a.states.map((s) => ({ ...s }));
  const transitions = a.transitions.map((t) => ({ ...t }));
  const sink: AutomatonState = {
    id: uid("q"),
    label: "puits",
    isInitial: false,
    isFinal: false,
    x: 0,
    y: 0,
  };
  let sinkUsed = false;

  for (const s of states) {
    for (const sym of a.alphabet) {
      if (delta(a, s.id, sym).length === 0) {
        transitions.push({ id: uid("t"), from: s.id, to: sink.id, symbol: sym });
        steps.push(`δ(${s.label}, ${sym}) manquante → état puits.`);
        sinkUsed = true;
      }
    }
  }
  if (sinkUsed) {
    for (const sym of a.alphabet) {
      transitions.push({ id: uid("t"), from: sink.id, to: sink.id, symbol: sym });
    }
    states.push(sink);
  }

  return {
    automaton: {
      id: uid("aut"),
      name: `${a.name} (complet)`,
      alphabet: [...a.alphabet],
      states: layoutCircle(states),
      transitions,
    },
    steps,
    message: sinkUsed ? "Automate complété avec un état puits." : "Aucune transition manquante.",
  };
}

// ---------------------------------------------------------------------------
// Accessibilité / co-accessibilité / émondage
// ---------------------------------------------------------------------------
function reachableForward(a: Automaton): Set<string> {
  const reach = new Set<string>(initialStateIds(a));
  const stack = [...reach];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const t of a.transitions.filter((x) => x.from === cur)) {
      if (!reach.has(t.to)) {
        reach.add(t.to);
        stack.push(t.to);
      }
    }
  }
  return reach;
}

function reachableBackward(a: Automaton): Set<string> {
  const reach = new Set<string>(finalStateIds(a));
  const stack = [...reach];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const t of a.transitions.filter((x) => x.to === cur)) {
      if (!reach.has(t.from)) {
        reach.add(t.from);
        stack.push(t.from);
      }
    }
  }
  return reach;
}

export function accessibility(a: Automaton): AlgorithmResult {
  const reach = reachableForward(a);
  const unreachable = a.states.filter((s) => !reach.has(s.id));
  return {
    steps: [
      `États accessibles : ${[...reach].map((x) => stateLabel(a, x)).join(", ") || "aucun"}`,
      unreachable.length
        ? `États inaccessibles : ${unreachable.map((s) => s.label).join(", ")}`
        : "Tous les états sont accessibles.",
    ],
    message: `${reach.size}/${a.states.length} état(s) accessible(s).`,
  };
}

export function coAccessibility(a: Automaton): AlgorithmResult {
  const reach = reachableBackward(a);
  const dead = a.states.filter((s) => !reach.has(s.id));
  return {
    steps: [
      `États co-accessibles : ${[...reach].map((x) => stateLabel(a, x)).join(", ") || "aucun"}`,
      dead.length
        ? `États non co-accessibles : ${dead.map((s) => s.label).join(", ")}`
        : "Tous les états sont co-accessibles.",
    ],
    message: `${reach.size}/${a.states.length} état(s) co-accessible(s).`,
  };
}

export function trim(a: Automaton): AlgorithmResult {
  const fwd = reachableForward(a);
  const bwd = reachableBackward(a);
  const keep = new Set([...fwd].filter((s) => bwd.has(s)));
  const states = a.states.filter((s) => keep.has(s.id)).map((s) => ({ ...s }));
  const transitions = a.transitions
    .filter((t) => keep.has(t.from) && keep.has(t.to))
    .map((t) => ({ ...t }));
  const removed = a.states.length - states.length;
  return {
    automaton: {
      id: uid("aut"),
      name: `${a.name} (émondé)`,
      alphabet: [...a.alphabet],
      states: states.length ? layoutCircle(states) : states,
      transitions,
    },
    steps: [
      `${removed} état(s) supprimé(s) (inaccessibles ou non co-accessibles).`,
    ],
    message: removed ? `Automate émondé : ${states.length} état(s).` : "Automate déjà émondé.",
  };
}

// ---------------------------------------------------------------------------
// Complément (AFD complet → inversion des états finaux)
// ---------------------------------------------------------------------------
export function complement(a: Automaton): AlgorithmResult {
  const steps: string[] = [];
  let base = a;
  if (!isDeterministic(a)) {
    const det = determinize(a);
    base = det.automaton!;
    steps.push("Déterminisation préalable.");
  }
  if (!isComplete(base)) {
    const comp = complete(base);
    base = comp.automaton!;
    steps.push("Complétion préalable.");
  }
  const states = base.states.map((s) => ({ ...s, isFinal: !s.isFinal }));
  steps.push("Inversion des états finaux / non finaux.");
  return {
    automaton: {
      id: uid("aut"),
      name: `${a.name} (complément)`,
      alphabet: [...base.alphabet],
      states: layoutCircle(states),
      transitions: base.transitions.map((t) => ({ ...t })),
    },
    steps,
    message: "Complément calculé.",
  };
}

// ---------------------------------------------------------------------------
// Minimisation (partition / Moore) — nécessite un AFD complet
// ---------------------------------------------------------------------------
export function minimize(a: Automaton): AlgorithmResult {
  const steps: string[] = [];
  let base = a;
  if (!isDeterministic(a)) {
    base = determinize(a).automaton!;
    steps.push("Déterminisation préalable.");
  }
  if (!isComplete(base)) {
    base = complete(base).automaton!;
    steps.push("Complétion préalable.");
  }
  // Garder uniquement les états accessibles.
  const fwd = reachableForward(base);
  base = {
    ...base,
    states: base.states.filter((s) => fwd.has(s.id)),
    transitions: base.transitions.filter((t) => fwd.has(t.from) && fwd.has(t.to)),
  };

  const finals = new Set(finalStateIds(base));
  // Partition initiale : finaux / non-finaux.
  let groups: string[][] = [];
  const nonFinal = base.states.filter((s) => !finals.has(s.id)).map((s) => s.id);
  const finalG = base.states.filter((s) => finals.has(s.id)).map((s) => s.id);
  if (nonFinal.length) groups.push(nonFinal);
  if (finalG.length) groups.push(finalG);
  steps.push(`Partition initiale : ${groups.length} classe(s) (finaux / non finaux).`);

  const groupOf = (id: string, gs: string[][]) => gs.findIndex((g) => g.includes(id));

  let changed = true;
  let iteration = 0;
  while (changed) {
    changed = false;
    iteration += 1;
    const next: string[][] = [];
    for (const group of groups) {
      const buckets = new Map<string, string[]>();
      for (const id of group) {
        const sig = base.alphabet
          .map((sym) => {
            const target = delta(base, id, sym)[0];
            return target !== undefined ? groupOf(target, groups) : -1;
          })
          .join("|");
        if (!buckets.has(sig)) buckets.set(sig, []);
        buckets.get(sig)!.push(id);
      }
      if (buckets.size > 1) changed = true;
      for (const b of buckets.values()) next.push(b);
    }
    groups = next;
    steps.push(`Itération ${iteration} : ${groups.length} classe(s).`);
  }

  // Construire l'automate minimal.
  const idByGroup = new Map<number, string>();
  const newStates: AutomatonState[] = groups.map((g, i) => {
    const id = uid("q");
    idByGroup.set(i, id);
    return {
      id,
      label: `{${g.map((x) => stateLabel(base, x)).join(",")}}`,
      isInitial: g.some((x) => initialStateIds(base).includes(x)),
      isFinal: g.some((x) => finals.has(x)),
      x: 0,
      y: 0,
    };
  });

  const seen = new Set<string>();
  const newTransitions: Transition[] = [];
  groups.forEach((g, i) => {
    const rep = g[0];
    for (const sym of base.alphabet) {
      const target = delta(base, rep, sym)[0];
      if (target === undefined) continue;
      const tg = groupOf(target, groups);
      const key = `${i}|${sym}|${tg}`;
      if (!seen.has(key)) {
        seen.add(key);
        newTransitions.push({
          id: uid("t"),
          from: idByGroup.get(i)!,
          to: idByGroup.get(tg)!,
          symbol: sym,
        });
      }
    }
  });

  return {
    automaton: {
      id: uid("aut"),
      name: `${a.name} (minimal)`,
      alphabet: [...base.alphabet],
      states: layoutCircle(newStates),
      transitions: newTransitions,
    },
    steps,
    message: `Minimisation terminée : ${newStates.length} état(s).`,
  };
}

/** Auto-disposition circulaire (réorganisation). */
export function autoLayout(a: Automaton): Automaton {
  return { ...a, states: layoutCircle(a.states) };
}
