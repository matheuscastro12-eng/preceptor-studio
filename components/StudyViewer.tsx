"use client";

import { Check, Pencil, RefreshCw, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { extractMarkdownHeadings } from "@/lib/markdownExtensions";
import { StudyWithClient } from "@/lib/store";
import { updateStudyRemote } from "@/lib/storeApi";
import { MarkdownView } from "./MarkdownView";
import { OutputHeader, OutputMetric } from "./OutputHeader";
import { PDFButton } from "./PDFButton";

interface Props {
  study: StudyWithClient;
  onUpdate: () => void;
  publicMode?: boolean;
}

function wordCount(md: string | null | undefined) {
  return (md || "").trim().split(/\s+/).filter(Boolean).length;
}

export function StudyViewer({ study, onUpdate, publicMode = false }: Props) {
  const [editing, setEditing] = useState(false);
  const [editedMd, setEditedMd] = useState(study.output_md || "");
  const [saving, setSaving] = useState(false);

  const sections = useMemo(() => extractMarkdownHeadings(study.output_md, 2), [study.output_md]);
  const completedAt = study.completed_at
    ? new Date(study.completed_at).toLocaleString("pt-BR")
    : new Date(study.updated_at).toLocaleString("pt-BR");

  async function handleSaveEdit() {
    setSaving(true);
    await updateStudyRemote(study.id, { output_md: editedMd });
    setEditing(false);
    setSaving(false);
    onUpdate();
  }

  async function handleRegenerate() {
    if (!confirm("Regenerar o estudo? Isso vai sobrescrever o conteúdo atual.")) return;
    await updateStudyRemote(study.id, { status: "questionnaire" });
    onUpdate();
  }

  const metrics: OutputMetric[] = [
    {
      label: "Score",
      value: study.scores?.client_facing?.overall ?? "N/A",
      hint: "geral",
      tone: "accent",
    },
    {
      label: "Seções",
      value: sections.length || "N/A",
      hint: "no documento",
    },
    {
      label: "Insights",
      value: study.insights_chave?.length || 0,
      hint: "extraídos",
      tone: "success",
    },
    {
      label: "Leitura",
      value: `${Math.max(1, Math.round(wordCount(study.output_md) / 180))} min`,
      hint: completedAt,
    },
  ];

  const actions = publicMode ? (
    <PDFButton study={study} kind="study" />
  ) : !editing ? (
    <>
      <button onClick={() => setEditing(true)} className="btn-ghost inline-flex items-center gap-2 text-xs">
        <Pencil className="w-3.5 h-3.5" />
        Editar
      </button>
      <button onClick={handleRegenerate} className="btn-ghost inline-flex items-center gap-2 text-xs">
        <RefreshCw className="w-3.5 h-3.5" />
        Regenerar
      </button>
      <PDFButton study={study} kind="study" />
    </>
  ) : (
    <>
      <button
        onClick={() => {
          setEditing(false);
          setEditedMd(study.output_md || "");
        }}
        className="btn-ghost inline-flex items-center gap-2 text-xs"
      >
        <X className="w-3.5 h-3.5" />
        Cancelar
      </button>
      <button onClick={handleSaveEdit} disabled={saving} className="btn-primary inline-flex items-center gap-2 text-xs">
        {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </>
  );

  return (
    <div>
      <OutputHeader kind="study" study={study} metrics={metrics} actions={actions} />

      {editing ? (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="surface rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-4 h-4 text-cyan-deep" />
              <div className="eyebrow">Markdown</div>
            </div>
            <textarea
              value={editedMd}
              onChange={(e) => setEditedMd(e.target.value)}
              rows={32}
              className="w-full font-mono text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-cyan focus:shadow-glow transition"
            />
          </div>
          <div className="surface rounded-2xl p-8 overflow-auto max-h-[80vh]">
            <div className="eyebrow mb-4">Preview</div>
            <MarkdownView md={editedMd} />
          </div>
        </div>
      ) : (
        <div className="surface rounded-2xl p-6 md:p-10 lg:p-12">
          <MarkdownView md={study.output_md} withNav />
        </div>
      )}
    </div>
  );
}
