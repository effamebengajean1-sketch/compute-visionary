// CompilLab — Automates d'exemple prêts à charger.
import { Automaton, uid } from "./types";

function build(
  name: string,
  alphabet: string[],
  states: [label: string, initial: boolean, final: boolean, x: number, y: number][],
  edges: [from: string, to: string, symbol: string][],
): Automaton {
  const idByLabel = new Map<string, string>();
  const stateObjs = states.map(([label, initial, final, x, y]) => {
    const id = uid("q");
    idByLabel.set(label, id);
    return { id, label, isInitial: initial, isFinal: final, x, y };
  });
  return {
    id: uid("aut"),
    name,
    alphabet,
    states: stateObjs,
    transitions: edges.map(([from, to, symbol]) => ({
      id: uid("t"),
      from: idByLabel.get(from)!,
      to: idByLabel.get(to)!,
      symbol,
    })),
  };
}

export function getExamples(): { id: string; title: string; description: string; make: () => Automaton }[] {
  return [
    {
      id: "ends-ab",
      title: "Mots finissant par « ab »",
      description: "AFD sur {a, b} reconnaissant les mots se terminant par ab.",
      make: () =>
        build(
          "Finit par ab",
          ["a", "b"],
          [
            ["q0", true, false, 200, 300],
            ["q1", false, false, 420, 300],
            ["q2", false, true, 640, 300],
          ],
          [
            ["q0", "q1", "a"],
            ["q0", "q0", "b"],
            ["q1", "q1", "a"],
            ["q1", "q2", "b"],
            ["q2", "q1", "a"],
            ["q2", "q0", "b"],
          ],
        ),
    },
    {
      id: "nfa-contains-ab",
      title: "AFN — contient « ab »",
      description: "Automate non déterministe : les mots contenant le facteur ab.",
      make: () =>
        build(
          "Contient ab (AFN)",
          ["a", "b"],
          [
            ["p0", true, false, 200, 300],
            ["p1", false, false, 420, 300],
            ["p2", false, true, 640, 300],
          ],
          [
            ["p0", "p0", "a"],
            ["p0", "p0", "b"],
            ["p0", "p1", "a"],
            ["p1", "p2", "b"],
            ["p2", "p2", "a"],
            ["p2", "p2", "b"],
          ],
        ),
    },
    {
      id: "epsilon",
      title: "ε-AFN — a*b*",
      description: "Automate avec ε-transitions reconnaissant a*b*.",
      make: () =>
        build(
          "a*b* (ε-AFN)",
          ["a", "b"],
          [
            ["s0", true, false, 200, 300],
            ["s1", false, true, 500, 300],
          ],
          [
            ["s0", "s0", "a"],
            ["s0", "s1", "ε"],
            ["s1", "s1", "b"],
          ],
        ),
    },
    {
      id: "even-a",
      title: "Nombre pair de « a »",
      description: "AFD reconnaissant les mots avec un nombre pair de a.",
      make: () =>
        build(
          "Nombre pair de a",
          ["a", "b"],
          [
            ["even", true, true, 250, 300],
            ["odd", false, false, 550, 300],
          ],
          [
            ["even", "odd", "a"],
            ["even", "even", "b"],
            ["odd", "even", "a"],
            ["odd", "odd", "b"],
          ],
        ),
    },
  ];
}
