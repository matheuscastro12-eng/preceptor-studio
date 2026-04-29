"use client";

import { useState } from "react";
import { StudyWithClient, updateStudy } from "@/lib/store";
import { MarkdownView } from "./MarkdownView";
import { PDFButton } from "./PDFButton";

export function OutputView({
  study,
  field,
  emptyLabel,
  outputType,
  assigneeLabel,
  onUpdate,
}: {
  study: StudyWithClient;
  field: "brand_brief_md" | "commercial_plan_md";
  emptyLabel: string;
  outputType: "brand" | "commercial";
  assigneeLabel: string;
  onUpdate: () => void;
}) {
  const [copying, setCopying] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const md = (study as any)[field] as string | null;

  if (!md) {
    return (
      <div className="surface rounded-2xl p-12 text-center">
        <div className="eyebrow mb-2">{emptyLabel}</div>
        <p className="text-ink-soft">
          Esse output ainda não foi gerado. Regenere o estudo no questionário ou aperte regenerar.
        </p>
        <button onClick={regenerate} disabled={regenerating} className="btn-ghost mt-4">
          {regenerating ? "Gerando..." : "Gerar agora"}
        </button>
      </div>
    );
  }

  async function copy() {
    setCopying(true);
    await navigator.clipboard.writeText(md || "");
    setTimeout(() => setCopying(false), 1500);
  }

  function downloadMd() {
    const blob = new Blob([md || ""], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${field}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function regenerate() {
    if (!study.output_md) {
      alert("Estudo do cliente é necessário pra regenerar este output.");
      return;
    }
    setRegenerating(true);
    try {
      const res = await fetch("/api/studies/regenerate-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outputType,
          category: study.category,
          studyMd: study.output_md,
          clientName: study.client?.name || null,
          title: study.title,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Erro");
      }
      const { md: newMd } = await res.json();
      updateStudy(study.id, { [field]: newMd });
      onUpdate();
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div>
      <div className="surface rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">
            Destinatário
          </div>
          <div className="font-semibold text-navy">{assigneeLabel}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={copy} className="btn-ghost text-xs">
            {copying ? "✓ Copiado" : "Copiar markdown"}
          </button>
          <button onClick={downloadMd} className="btn-ghost text-xs">
            ↓ MD
          </button>
          <PDFButton study={study} kind={outputType} variant="ghost" label="↓ PDF" />
          <button onClick={regenerate} disabled={regenerating} className="btn-ghost text-xs">
            {regenerating ? "Regenerando..." : "↻ Regenerar"}
          </button>
        </div>
      </div>
      <div className="surface rounded-2xl p-8 md:p-12">
        <MarkdownView md={md} />
      </div>
    </div>
  );
}
