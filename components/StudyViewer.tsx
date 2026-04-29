"use client";

import { useState } from "react";
import { renderRichMarkdown } from "@/lib/markdownExtensions";
import { updateStudy, StudyWithClient } from "@/lib/store";
import { downloadStudyPDF } from "@/lib/pdfClient";

interface Props {
  study: StudyWithClient;
  onUpdate: () => void;
}

export function StudyViewer({ study, onUpdate }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedMd, setEditedMd] = useState(study.output_md || "");
  const [saving, setSaving] = useState(false);

  const html = renderRichMarkdown(editing ? editedMd : study.output_md || "");

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      await downloadStudyPDF(study, "study");
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao gerar PDF: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  }

  function handleSaveEdit() {
    setSaving(true);
    updateStudy(study.id, { output_md: editedMd });
    setEditing(false);
    setSaving(false);
    onUpdate();
  }

  function handleRegenerate() {
    if (!confirm("Regenerar o estudo? Isso vai sobrescrever o conteúdo atual.")) return;
    updateStudy(study.id, { status: "questionnaire" });
    onUpdate();
  }

  const completedAt = study.completed_at
    ? new Date(study.completed_at).toLocaleString("pt-BR")
    : new Date(study.updated_at).toLocaleString("pt-BR");

  return (
    <div>
      {/* Action bar */}
      <div className="surface rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-success-soft text-success">
            <svg viewBox="0 0 14 14" className="w-3.5 h-3.5">
              <path d="M2 7.5L5.5 11L12 3.5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">Estudo Gerado</div>
            <div className="text-sm font-semibold text-navy">{completedAt}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} className="btn-ghost">
                ✎ Editar
              </button>
              <button onClick={handleRegenerate} className="btn-ghost">
                ↻ Regenerar
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="btn-primary"
              >
                {downloading ? "Gerando PDF..." : "↓ Baixar PDF"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditedMd(study.output_md || "");
                }}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {editing ? (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="surface rounded-2xl p-4">
            <div className="eyebrow mb-2">Markdown</div>
            <textarea
              value={editedMd}
              onChange={(e) => setEditedMd(e.target.value)}
              rows={32}
              className="w-full font-mono text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-cyan focus:shadow-glow transition"
            />
          </div>
          <div className="surface rounded-2xl p-8 overflow-auto max-h-[80vh]">
            <div className="eyebrow mb-4">Preview</div>
            <div className="prose-study" dangerouslySetInnerHTML={{ __html: html as string }} />
          </div>
        </div>
      ) : (
        <div className="surface rounded-2xl p-8 md:p-12 lg:p-16">
          <div className="prose-study" dangerouslySetInnerHTML={{ __html: html as string }} />
        </div>
      )}
    </div>
  );
}
