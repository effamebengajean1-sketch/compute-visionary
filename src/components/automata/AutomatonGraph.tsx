// CompilLab — Visualisation du graphe (Cytoscape.js, couche visualisation).
import { useEffect, useRef } from "react";
import type { Core } from "cytoscape";
import { Automaton, EPSILON } from "@/lib/automata/types";

const COLORS = {
  initial: "#16a34a",
  final: "#e0584f",
  normal: "#5b5be0",
  active: "#f5a524",
  edge: "#94a3b8",
  edgeActive: "#f5a524",
  label: "#1e1b3a",
  labelLight: "#ffffff",
};

interface Props {
  automaton: Automaton;
  selectedStateId: string | null;
  highlightStates: string[];
  onSelectState: (id: string | null) => void;
  onMoveState: (id: string, x: number, y: number) => void;
  registerActions?: (actions: { exportPng: () => void; fit: () => void }) => void;
}

export function AutomatonGraph({
  automaton,
  selectedStateId,
  highlightStates,
  onSelectState,
  onMoveState,
  registerActions,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const onMoveRef = useRef(onMoveState);
  const onSelectRef = useRef(onSelectState);
  onMoveRef.current = onMoveState;
  onSelectRef.current = onSelectState;
  const prevIdRef = useRef<string | null>(null);

  // Initialisation unique de Cytoscape (client uniquement).
  useEffect(() => {
    let cancelled = false;
    import("cytoscape").then(({ default: cytoscape }) => {
      if (cancelled || !containerRef.current || cyRef.current) return;
      const cy = cytoscape({
        container: containerRef.current,
        minZoom: 0.2,
        maxZoom: 3,
        wheelSensitivity: 0.25,
        style: [
          {
            selector: "node[type='state']",
            style: {
              "background-color": COLORS.normal,
              label: "data(label)",
              color: COLORS.labelLight,
              "text-valign": "center",
              "text-halign": "center",
              "font-size": 14,
              "font-weight": 600,
              width: 52,
              height: 52,
              "border-width": 3,
              "border-color": COLORS.normal,
              "text-wrap": "wrap",
              "text-max-width": "70px",
            },
          },
          {
            selector: "node[role='initial']",
            style: { "background-color": COLORS.initial, "border-color": COLORS.initial },
          },
          {
            selector: "node[role='final']",
            style: {
              "background-color": COLORS.final,
              "border-color": "#ffffff",
              "border-width": 3,
              "border-style": "double",
            },
          },
          {
            selector: "node[role='both']",
            style: {
              "background-color": COLORS.initial,
              "border-color": COLORS.final,
              "border-width": 5,
              "border-style": "double",
            },
          },
          {
            selector: "node.highlight",
            style: {
              "background-color": COLORS.active,
              "border-color": COLORS.active,
              "border-width": 5,
              color: COLORS.label,
            },
          },
          {
            selector: "node.selected",
            style: { "border-color": COLORS.active, "border-width": 5 },
          },
          {
            selector: "node[type='start']",
            style: { width: 1, height: 1, "background-opacity": 0, events: "no", label: "" },
          },
          {
            selector: "edge",
            style: {
              width: 2,
              "line-color": COLORS.edge,
              "target-arrow-color": COLORS.edge,
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              label: "data(label)",
              "font-size": 13,
              "font-weight": 600,
              color: COLORS.label,
              "text-background-color": "#ffffff",
              "text-background-opacity": 0.9,
              "text-background-padding": "2px",
              "text-background-shape": "roundrectangle",
            },
          },
          {
            selector: "edge[type='start']",
            style: {
              "line-color": COLORS.initial,
              "target-arrow-color": COLORS.initial,
              width: 2.5,
              label: "",
            },
          },
          {
            selector: "edge.loop",
            style: { "loop-direction": "-90deg", "loop-sweep": "-40deg" },
          },
        ],
        layout: { name: "preset" },
      });

      cy.on("dragfree", "node[type='state']", (e) => {
        const pos = e.target.position();
        onMoveRef.current(e.target.id(), Math.round(pos.x), Math.round(pos.y));
      });
      cy.on("tap", "node[type='state']", (e) => onSelectRef.current(e.target.id()));
      cy.on("tap", (e) => {
        if (e.target === cy) onSelectRef.current(null);
      });

      cyRef.current = cy;
      renderElements(cy, automaton);
      cy.fit(undefined, 60);
    });
    return () => {
      cancelled = true;
      cyRef.current?.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mise à jour des éléments quand l'automate change.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    renderElements(cy, automaton);
    // Recentrer uniquement lors d'un changement d'automate (pas à chaque édition).
    if (prevIdRef.current !== automaton.id) {
      prevIdRef.current = automaton.id;
      cy.fit(undefined, 60);
    }
  }, [automaton]);

  // Sélection.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().removeClass("selected");
    if (selectedStateId) cy.getElementById(selectedStateId).addClass("selected");
  }, [selectedStateId]);

  // Surbrillance (animation de reconnaissance).
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().removeClass("highlight");
    cy.edges().removeClass("active");
    for (const id of highlightStates) cy.getElementById(id).addClass("highlight");
  }, [highlightStates]);

  useEffect(() => {
    if (!registerActions) return;
    registerActions({
      exportPng: () => {
        const cy = cyRef.current;
        if (!cy) return;
        const png = cy.png({ full: true, scale: 2, bg: "#ffffff" });
        const link = document.createElement("a");
        link.href = png;
        link.download = `${automaton.name.replace(/\s+/g, "_") || "automate"}.png`;
        link.click();
      },
      fit: () => cyRef.current?.fit(undefined, 60),
    });
  }, [registerActions, automaton.name]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function roleOf(s: { isInitial: boolean; isFinal: boolean }): string {
  if (s.isInitial && s.isFinal) return "both";
  if (s.isInitial) return "initial";
  if (s.isFinal) return "final";
  return "normal";
}

function renderElements(cy: Core, a: Automaton) {
  const elements: Record<string, unknown>[] = [];

  for (const s of a.states) {
    elements.push({
      group: "nodes",
      data: { id: s.id, label: s.label, type: "state", role: roleOf(s) },
      position: { x: s.x, y: s.y },
    });
    if (s.isInitial) {
      const startId = `__start_${s.id}`;
      elements.push({
        group: "nodes",
        data: { id: startId, type: "start" },
        position: { x: s.x - 70, y: s.y },
      });
      elements.push({
        group: "edges",
        data: { id: `__startedge_${s.id}`, source: startId, target: s.id, type: "start" },
      });
    }
  }

  // Fusion des transitions parallèles (même source/cible) en une seule étiquette.
  const grouped = new Map<string, { from: string; to: string; symbols: string[] }>();
  for (const t of a.transitions) {
    const key = `${t.from}->${t.to}`;
    if (!grouped.has(key)) grouped.set(key, { from: t.from, to: t.to, symbols: [] });
    grouped.get(key)!.symbols.push(t.symbol === EPSILON ? "ε" : t.symbol);
  }
  for (const [key, g] of grouped) {
    elements.push({
      group: "edges",
      data: { id: `e_${key}`, source: g.from, target: g.to, label: g.symbols.join(", ") },
      classes: g.from === g.to ? "loop" : "",
    });
  }

  cy.elements().remove();
  cy.add(elements as never);
}
