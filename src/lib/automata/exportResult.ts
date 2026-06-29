// CompilLab — Export du résultat (regex ou automate) et de ses étapes en JSON / PDF.
import { jsPDF } from "jspdf";
import { RegexBuildResult } from "./regex";
import { exportJson } from "./storage";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function triggerDownload(blob: Blob, filename: string): void {
  if (!isBrowser()) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function slug(s: string): string {
  return (
    s
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40) || "resultat"
  );
}

export interface ExportPayload {
  /** Nom de l'algorithme appliqué (Thompson, Glushkov, Arden…). */
  method: string;
  /** Expression régulière de départ, si pertinente. */
  pattern?: string;
  result: RegexBuildResult;
}

/** Construit un objet JSON sérialisable décrivant le résultat complet. */
function buildJsonObject(payload: ExportPayload): unknown {
  const { method, pattern, result } = payload;
  return {
    tool: "CompilLab",
    method,
    pattern: pattern ?? null,
    generatedAt: new Date().toISOString(),
    regex: result.regex ?? null,
    message: result.message,
    steps: result.steps,
    automaton: result.automaton
      ? JSON.parse(exportJson(result.automaton))
      : null,
  };
}

export function exportResultJson(payload: ExportPayload): void {
  const obj = buildJsonObject(payload);
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, `compillab_${slug(payload.method)}.json`);
}

export function exportResultPdf(payload: ExportPayload): void {
  if (!isBrowser()) return;
  const { method, pattern, result } = payload;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeLines = (
    text: string,
    fontSize: number,
    options: { bold?: boolean; font?: string; gap?: number; color?: number[] } = {},
  ) => {
    doc.setFont(options.font ?? "helvetica", options.bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...(options.color ?? [20, 20, 20]) as [number, number, number]);
    const lines = doc.splitTextToSize(text, maxW);
    const lineH = fontSize * 1.35;
    for (const line of lines) {
      ensureSpace(lineH);
      doc.text(line, margin, y);
      y += lineH;
    }
    y += options.gap ?? 0;
  };

  // En-tête
  writeLines("CompilLab", 20, { bold: true, color: [37, 99, 235] });
  writeLines(`Résultat — ${method}`, 13, { bold: true, gap: 6 });
  writeLines(
    `Généré le ${new Date().toLocaleString("fr-FR")}`,
    9,
    { color: [120, 120, 120], gap: 12 },
  );

  if (pattern) {
    writeLines("Expression de départ", 11, { bold: true, gap: 2 });
    writeLines(pattern, 11, { font: "courier", gap: 12 });
  }

  if (result.regex) {
    writeLines("Expression régulière obtenue", 11, { bold: true, gap: 2 });
    writeLines(result.regex, 13, { font: "courier", color: [37, 99, 235], gap: 12 });
  }

  writeLines("Résumé", 11, { bold: true, gap: 2 });
  writeLines(result.message, 11, { gap: 12 });

  if (result.automaton) {
    const a = result.automaton;
    writeLines("Automate produit", 11, { bold: true, gap: 2 });
    writeLines(
      `Nom : ${a.name} · ${a.states.length} état(s) · ${a.transitions.length} transition(s) · alphabet { ${a.alphabet.join(", ")} }`,
      10,
      { gap: 12 },
    );
  }

  if (result.steps.length > 0) {
    writeLines("Étapes pédagogiques", 11, { bold: true, gap: 6 });
    result.steps.forEach((step, i) => {
      writeLines(`${i + 1}. ${step}`, 10, { font: "courier", gap: 4 });
    });
  }

  doc.save(`compillab_${slug(method)}.pdf`);
}
