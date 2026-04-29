"use client";

import { StudyWithClient, listTasks } from "./store";

export type PDFKind =
  | "study"
  | "brand"
  | "commercial"
  | "thesis"
  | "execution"
  | "diagnostic";

export async function downloadStudyPDF(study: StudyWithClient, kind: PDFKind) {
  const base = {
    kind,
    title: study.title,
    clientName: study.client?.name || null,
    completed_at: study.completed_at,
    created_at: study.created_at,
  };

  let payload: any = base;

  if (kind === "study") payload.output_md = study.output_md;
  else if (kind === "brand") payload.output_md = study.brand_brief_md;
  else if (kind === "commercial") payload.output_md = study.commercial_plan_md;
  else if (kind === "thesis") payload.output_md = study.internal_thesis_md;
  else if (kind === "diagnostic") {
    payload.scores = study.scores;
    payload.insights = study.insights_chave || [];
  } else if (kind === "execution") {
    const tasks = listTasks(study.id);
    const sprints = [1, 2, 3].map((n) => ({
      number: n,
      name: ["Setup e Fundação", "Construção", "Lançamento"][n - 1],
      weeks: ["1-4", "5-8", "9-12"][n - 1],
      objective: "",
      tasks: tasks
        .filter((t) => t.sprint === n)
        .sort((a, b) => a.order_index - b.order_index)
        .map((t) => ({
          title: t.title,
          description: t.description,
          assignee: t.assignee,
          estimated_hours: t.estimated_hours,
          milestone: t.milestone,
        })),
    }));
    payload.execution_plan = { sprints };
  }

  const res = await fetch("/api/studies/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || `Erro ${res.status}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safe = (study.client?.name || study.title).replace(/[^a-z0-9]/gi, "_");
  a.href = url;
  a.download = `${kind}-${safe}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
