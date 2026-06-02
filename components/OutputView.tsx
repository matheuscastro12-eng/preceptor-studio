"use client";

import { Clipboard, Download, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { extractMarkdownHeadings } from "@/lib/markdownExtensions";
import { StudyWithClient } from "@/lib/store";
import { updateStudyRemote } from "@/lib/storeApi";
import { MarkdownView } from "./MarkdownView";
import { OutputHeader, OutputKind, OutputMetric } from "./OutputHeader";
import { PDFButton } from "./PDFButton";

function wordCount(md: string | null | undefined) {
  return (md || "").trim().split(/\s+/).filter(Boolean).length;
}

export function OutputView({
  study,
  field,
  emptyLabel,
  outputType,
  assigneeLabel,
  onUpdate,
  publicMode = false,
}: {
  study: StudyWithClient;
  field: "brand_brief_md" | "commercial_plan_md";
  outputType: "brand" | "commercial";
  emptyLabel: string;
  assigneeLabel: string;
  onUpdate: () => void;
  publicMode?: boolean;
}) {
  const [copying, setCopying] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const md = (study as any)[field] as string | null;
  const headings = useMemo(() => extractMarkdownHeadings(md, 2), [md]);

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
      alert("Estudo do cliente é necessário para regenerar este output.");
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
      await updateStudyRemote(study.id, { [field]: newMd });
      onUpdate();
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    } finally {
      setRegenerating(false);
    }
  }

  if (!md) {
    return (
      <div>
        <OutputHeader
          kind={outputType as OutputKind}
          study={study}
          metrics={[
            { label: "Destino", value: outputType === "brand" ? "Design" : "Growth", hint: assigneeLabel },
            { label: "Status", value: "Pendente", tone: "warning" },
          ]}
          actions={
            <button onClick={regenerate} disabled={regenerating} className="btn-primary inline-flex items-center gap-2 text-xs">
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
              {regenerating ? "Gerando..." : "Gerar agora"}
            </button>
          }
        />
        <div className="surface rounded-2xl p-12 text-center">
          <div className="eyebrow mb-2">{emptyLabel}</div>
          <p className="text-ink-soft">
            Esse output ainda não foi gerado. Gere agora para liberar a leitura, o markdown e o PDF.
          </p>
        </div>
      </div>
    );
  }

  const metrics: OutputMetric[] = [
    {
      label: "Destino",
      value: outputType === "brand" ? "Design" : "Growth",
      hint: assigneeLabel,
      tone: outputType === "brand" ? "accent" : "success",
    },
    {
      label: "Seções",
      value: headings.length || "N/A",
      hint: "para navegação",
    },
    {
      label: "Leitura",
      value: `${Math.max(1, Math.round(wordCount(md) / 180))} min`,
      hint: "estimada",
    },
    {
      label: "Formato",
      value: "MD + PDF",
      hint: "exportável",
    },
  ];

  return (
    <div>
      <OutputHeader
        kind={outputType as OutputKind}
        study={study}
        metrics={metrics}
        actions={
          publicMode ? (
            <PDFButton study={study} kind={outputType} variant="ghost" label="PDF" />
          ) : (
            <>
              <button onClick={copy} className="btn-ghost inline-flex items-center gap-2 text-xs">
                <Clipboard className="w-3.5 h-3.5" />
                {copying ? "Copiado" : "Copiar MD"}
              </button>
              <button onClick={downloadMd} className="btn-ghost inline-flex items-center gap-2 text-xs">
                <Download className="w-3.5 h-3.5" />
                MD
              </button>
              <PDFButton study={study} kind={outputType} variant="ghost" label="PDF" />
              <button onClick={regenerate} disabled={regenerating} className="btn-ghost inline-flex items-center gap-2 text-xs">
                <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
                {regenerating ? "Regenerando..." : "Regenerar"}
              </button>
            </>
          )
        }
      />
      <div className="surface rounded-2xl p-6 md:p-10 lg:p-12">
        <MarkdownView md={md} withNav />
      </div>
    </div>
  );
}
