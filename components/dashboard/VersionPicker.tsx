"use client";

import { useEffect, useRef, useState } from "react";
import { MarkdownView } from "@/components/MarkdownView";

export type VersionType =
  | "study"
  | "brand"
  | "commercial"
  | "thesis"
  | "execution"
  | "slides"
  | "artifact"
  | "diagnostic";

interface VersionSummary {
  id: string;
  output_type: string;
  created_at: string;
  preview: string;
  metadata: Record<string, unknown> | null;
}

interface VersionDetail {
  id: string;
  content_md: string | null;
  created_at: string;
  output_type: string;
}

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d}d`;
  return date.toLocaleDateString("pt-BR");
}

export function VersionPicker({
  studyId,
  outputType,
  currentMd,
}: {
  studyId: string;
  outputType: VersionType;
  currentMd: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [compareWith, setCompareWith] = useState<VersionDetail | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function loadVersions() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/studies/${studyId}/versions?type=${outputType}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = (await res.json()) as { versions: VersionSummary[] };
        setVersions(data.versions || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && versions.length === 0) loadVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function openVersion(id: string) {
    setOpen(false);
    const res = await fetch(`/api/studies/${studyId}/versions/${id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { version: VersionDetail };
      setCompareWith(data.version);
    }
  }

  const totalLabel =
    versions.length > 0 ? `v${versions.length}` : "v1";
  const latest = versions[0];
  const latestLabel = latest ? relativeTime(latest.created_at) : "atual";

  return (
    <>
      <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-soft)",
            background: "transparent",
            border: "1px solid var(--line-strong, #CBD5E1)",
            borderRadius: 8,
            padding: "5px 10px",
            cursor: "pointer",
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {totalLabel} · {latestLabel}
          <span aria-hidden="true">▾</span>
        </button>
        {open && (
          <div
            role="listbox"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              minWidth: 280,
              maxHeight: 320,
              overflowY: "auto",
              background: "#fff",
              border: "1px solid var(--line-strong, #CBD5E1)",
              borderRadius: 10,
              boxShadow: "0 16px 40px -16px rgba(10,31,68,0.25)",
              zIndex: 30,
              padding: 6,
            }}
          >
            {loading && (
              <div style={{ padding: 10, fontSize: 12, color: "var(--ink-mute)" }}>
                Carregando versões...
              </div>
            )}
            {!loading && versions.length === 0 && (
              <div style={{ padding: 10, fontSize: 12, color: "var(--ink-mute)" }}>
                Nenhuma versão histórica registrada ainda.
              </div>
            )}
            {versions.map((v, idx) => (
              <button
                key={v.id}
                type="button"
                onClick={() => openVersion(v.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  border: 0,
                  background: "transparent",
                  padding: "8px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12.5,
                  color: "var(--ink)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    color: "var(--ink-mute)",
                  }}
                >
                  v{versions.length - idx} · {relativeTime(v.created_at)}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ink-soft)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {v.preview || "(sem prévia)"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {compareWith && (
        <CompareModal
          oldVersion={compareWith}
          currentMd={currentMd}
          onClose={() => setCompareWith(null)}
        />
      )}
    </>
  );
}

function CompareModal({
  oldVersion,
  currentMd,
  onClose,
}: {
  oldVersion: VersionDetail;
  currentMd: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6, 18, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "min(1200px, 100%)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "var(--ink-mute)",
                textTransform: "uppercase",
              }}
            >
              COMPARAR VERSÕES
            </div>
            <div style={{ fontSize: 14, color: "var(--navy)", fontWeight: 700 }}>
              Lado a lado
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            style={{ fontSize: 12 }}
          >
            Fechar
          </button>
        </div>
        <div
          style={{
            flex: 1,
            overflow: "auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0,
          }}
        >
          <div style={{ borderRight: "1px solid var(--line)", padding: 20, overflow: "auto" }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink-mute)",
                marginBottom: 12,
              }}
            >
              VERSÃO ANTERIOR · {new Date(oldVersion.created_at).toLocaleString("pt-BR")}
            </div>
            <MarkdownView md={oldVersion.content_md || ""} />
          </div>
          <div style={{ padding: 20, overflow: "auto" }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink-mute)",
                marginBottom: 12,
              }}
            >
              VERSÃO ATUAL
            </div>
            <MarkdownView md={currentMd || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
