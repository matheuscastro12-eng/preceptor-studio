"use client";

import { useCallback, useEffect, useState } from "react";
import { MarkdownView } from "@/components/MarkdownView";
import { Eyebrow } from "@/components/dashboard/Shared";

interface QuickDraftButtonProps {
  studyId: string;
  initialMd?: string | null;
  initialAt?: string | null;
  onDraftChange?: (md: string, generatedAt: string) => void;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "- ")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/>\s?/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function QuickDraftButton({
  studyId,
  initialMd = null,
  initialAt = null,
  onDraftChange,
}: QuickDraftButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [md, setMd] = useState<string | null>(initialMd);
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialAt);
  const [copied, setCopied] = useState<"md" | "plain" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMd(initialMd);
    setGeneratedAt(initialAt);
  }, [initialMd, initialAt]);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/studies/${studyId}/quick-draft`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        md?: string;
        generated_at?: string;
        error?: string;
      };
      if (!res.ok || !data.md) {
        throw new Error(data.error || "Erro ao gerar resumo");
      }
      setMd(data.md);
      setGeneratedAt(data.generated_at || new Date().toISOString());
      setOpen(true);
      if (onDraftChange && data.generated_at) {
        onDraftChange(data.md, data.generated_at);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, [studyId, onDraftChange]);

  function copyMd() {
    if (!md) return;
    void navigator.clipboard.writeText(md);
    setCopied("md");
    setTimeout(() => setCopied(null), 1500);
  }

  function copyPlain() {
    if (!md) return;
    void navigator.clipboard.writeText(stripMarkdown(md));
    setCopied("plain");
    setTimeout(() => setCopied(null), 1500);
  }

  function downloadMd() {
    if (!md) return;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resumo-executivo-${studyId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button
        type="button"
        className="btn-ghost"
        onClick={generate}
        disabled={loading}
        style={{ fontSize: 12 }}
        title="Gerar resumo executivo pós-reunião"
      >
        ✨ {loading ? "Gerando..." : "Gerar resumo executivo"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-navy-deep/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                padding: 20,
                borderBottom: "1px solid #e2e8f0",
                gap: 12,
              }}
            >
              <div>
                <Eyebrow>RESUMO EXECUTIVO · pronto pra enviar</Eyebrow>
                <h2
                  style={{
                    margin: "8px 0 0",
                    fontFamily: "var(--font-sans)",
                    fontSize: 20,
                    fontWeight: 900,
                    color: "var(--navy)",
                    letterSpacing: "-0.022em",
                  }}
                >
                  Pós-reunião
                </h2>
                {generatedAt && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--ink-mute)",
                      fontFamily: "var(--font-mono)",
                      marginTop: 4,
                    }}
                  >
                    Gerado em {new Date(generatedAt).toLocaleString("pt-BR")}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-ghost"
                style={{ fontSize: 12 }}
              >
                ✕ Fechar
              </button>
            </div>

            <div style={{ overflow: "auto", padding: 28, flex: 1 }}>
              {error && (
                <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>
                  {error}
                </div>
              )}
              {md ? (
                <MarkdownView md={md} />
              ) : (
                <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
                  Nenhum conteúdo gerado ainda.
                </p>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                padding: 16,
                borderTop: "1px solid #e2e8f0",
                flexWrap: "wrap",
                background: "#f8fafc",
              }}
            >
              <button
                type="button"
                className="btn-primary"
                onClick={copyMd}
                disabled={!md}
                style={{ fontSize: 12 }}
              >
                {copied === "md" ? "Copiado!" : "Copiar markdown"}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={copyPlain}
                disabled={!md}
                style={{ fontSize: 12 }}
              >
                {copied === "plain" ? "Copiado!" : "Copiar texto puro"}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={downloadMd}
                disabled={!md}
                style={{ fontSize: 12 }}
              >
                ↓ Baixar .md
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={generate}
                disabled={loading}
                style={{ fontSize: 12, marginLeft: "auto" }}
              >
                ↻ {loading ? "Regenerando..." : "Regenerar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function QuickDraftSummaryCard({
  studyId,
  generatedAt,
  md,
}: {
  studyId: string;
  generatedAt: string | null;
  md: string | null;
}) {
  const [open, setOpen] = useState(false);

  if (!generatedAt || !md) return null;

  const date = new Date(generatedAt);
  const now = Date.now();
  const diffMin = Math.round((now - date.getTime()) / 60000);
  let relative: string;
  if (diffMin < 1) relative = "agora";
  else if (diffMin < 60) relative = `há ${diffMin} min`;
  else if (diffMin < 60 * 24) relative = `há ${Math.round(diffMin / 60)} h`;
  else relative = `há ${Math.round(diffMin / (60 * 24))} dias`;

  return (
    <>
      <div
        className="surface"
        style={{ padding: 16, borderRadius: 12, marginTop: 16 }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
            marginBottom: 8,
          }}
        >
          Último resumo
        </div>
        <div style={{ fontSize: 13, color: "var(--navy)", fontWeight: 600 }}>
          Resumo executivo gerado {relative}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--ink-mute)",
            fontFamily: "var(--font-mono)",
            marginTop: 4,
          }}
        >
          {date.toLocaleString("pt-BR")}
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setOpen(true)}
          style={{ fontSize: 11, padding: "6px 12px", marginTop: 10 }}
        >
          Ver resumo
        </button>
      </div>
      {open && (
        <QuickDraftViewer
          studyId={studyId}
          md={md}
          generatedAt={generatedAt}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function QuickDraftViewer({
  md,
  generatedAt,
  onClose,
}: {
  studyId: string;
  md: string;
  generatedAt: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  function copy() {
    void navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div
      className="fixed inset-0 z-50 bg-navy-deep/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 20,
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div>
            <Eyebrow>RESUMO EXECUTIVO · pronto pra enviar</Eyebrow>
            <div
              style={{
                fontSize: 11,
                color: "var(--ink-mute)",
                fontFamily: "var(--font-mono)",
                marginTop: 6,
              }}
            >
              {new Date(generatedAt).toLocaleString("pt-BR")}
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ fontSize: 12 }}>
            ✕ Fechar
          </button>
        </div>
        <div style={{ overflow: "auto", padding: 28 }}>
          <MarkdownView md={md} />
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: 16,
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          <button
            type="button"
            className="btn-primary"
            onClick={copy}
            style={{ fontSize: 12 }}
          >
            {copied ? "Copiado!" : "Copiar markdown"}
          </button>
        </div>
      </div>
    </div>
  );
}
