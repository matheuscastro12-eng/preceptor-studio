"use client";

import { useState } from "react";
import { marked } from "marked";
import { sanitizeHtml } from "@/lib/markdownExtensions";

interface ArtifactData {
  md: string;
  label: string;
  assignee: string;
  error: string | null;
}

export function ArtifactCard({
  type,
  icon,
  description,
  data,
  onRegenerate,
  regenerating,
}: {
  type: string;
  icon: string;
  description: string;
  data: ArtifactData | undefined;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const md = data?.md || "";
  const preview = md.split("\n").slice(0, 4).join(" ").replace(/[#*]/g, "").slice(0, 220);

  const html = open ? sanitizeHtml(marked.parse(md, { async: false }) as string) : "";

  async function copy() {
    if (!md) return;
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function downloadMd() {
    if (!md) return;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="surface surface-hover rounded-2xl p-5 flex flex-col">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-navy-gradient text-cyan flex items-center justify-center text-lg shrink-0 shadow-card">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-navy truncate">{data?.label || type}</div>
            <div className="text-[11px] uppercase tracking-widest text-ink-mute font-bold mt-0.5">
              → {data?.assignee || "—"}
            </div>
          </div>
        </div>

        <p className="text-xs text-ink-soft leading-snug mb-3">{description}</p>

        <div className="flex-1 surface rounded-lg bg-slate-50/60 p-3 text-xs text-ink-soft leading-relaxed mb-3 min-h-[80px]">
          {data?.error ? (
            <span className="text-danger">Erro: {data.error}</span>
          ) : preview ? (
            <span className="line-clamp-4">{preview}…</span>
          ) : (
            <span className="text-ink-mute">Não gerado.</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setOpen(true)}
            disabled={!md}
            className="btn-ghost text-xs disabled:opacity-40"
          >
            Ver completo
          </button>
          <button
            onClick={copy}
            disabled={!md}
            className="btn-ghost text-xs disabled:opacity-40"
          >
            {copied ? "✓ Copiado" : "Copiar"}
          </button>
          <button
            onClick={downloadMd}
            disabled={!md}
            className="btn-ghost text-xs disabled:opacity-40"
          >
            ↓ MD
          </button>
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="btn-ghost text-xs disabled:opacity-40 ml-auto"
          >
            {regenerating ? "..." : "↻ Regenerar"}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-navy-deep/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-navy-gradient text-cyan flex items-center justify-center">
                  {icon}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-mute font-bold">
                    {data?.assignee}
                  </div>
                  <div className="font-bold text-navy">{data?.label}</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="btn-ghost text-xs">
                ✕ Fechar
              </button>
            </div>
            <div className="overflow-auto p-8 prose-study">
              <div dangerouslySetInnerHTML={{ __html: html as string }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
