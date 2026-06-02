"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MarkdownView } from "@/components/MarkdownView";

interface NextMeetingCardProps {
  studyId: string;
  clientName: string | null;
  initialAgendaMd?: string | null;
  initialGeneratedAt?: string | null;
}

interface WorkspaceSettings {
  calcom_url: string | null;
}

function suggestedDateRange(): string {
  const now = new Date();
  const fmt = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const start = new Date(now);
  start.setDate(start.getDate() + 5);
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  return `${fmt(start)} a ${fmt(end)}`;
}

export function NextMeetingCard({
  studyId,
  clientName,
  initialAgendaMd = null,
  initialGeneratedAt = null,
}: NextMeetingCardProps) {
  const [calcomUrl, setCalcomUrl] = useState<string | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [agendaMd, setAgendaMd] = useState<string | null>(initialAgendaMd);
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(!!initialAgendaMd);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const res = await fetch("/api/workspace");
        if (!res.ok) return;
        const data = (await res.json()) as { settings?: WorkspaceSettings };
        if (mounted) setCalcomUrl(data.settings?.calcom_url || null);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoadingSettings(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const generate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/studies/${studyId}/next-meeting-agenda`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        md?: string;
        generated_at?: string;
        error?: string;
      };
      if (!res.ok || !data.md) {
        throw new Error(data.error || "Erro ao gerar pauta");
      }
      setAgendaMd(data.md);
      setGeneratedAt(data.generated_at || new Date().toISOString());
      setExpanded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setGenerating(false);
    }
  }, [studyId]);

  function copyAgenda() {
    if (!agendaMd) return;
    void navigator.clipboard.writeText(agendaMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const scheduleUrl = calcomUrl
    ? `${calcomUrl}${calcomUrl.includes("?") ? "&" : "?"}title=${encodeURIComponent(
        `Preceptor com ${clientName || "cliente"}`
      )}`
    : null;

  return (
    <div
      className="surface"
      style={{
        padding: 20,
        borderRadius: 12,
        marginTop: 16,
        position: "sticky",
        top: 16,
        background:
          "linear-gradient(135deg, rgba(82,225,231,0.04), rgba(93,87,235,0.04))",
        border: "1px solid rgba(82,225,231,0.2)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--cyan)",
          marginBottom: 6,
        }}
      >
        Próxima reunião
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--ink-mute)",
          marginBottom: 14,
          fontFamily: "var(--font-mono)",
        }}
      >
        Sugestão: {suggestedDateRange()}
      </div>

      {loadingSettings ? (
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 12 }}>
          Carregando...
        </div>
      ) : scheduleUrl ? (
        <a
          href={scheduleUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-primary"
          style={{
            display: "block",
            textAlign: "center",
            fontSize: 13,
            padding: "10px 14px",
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          → Agendar próxima reunião
        </a>
      ) : (
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-soft)",
            background: "rgba(93,87,235,0.06)",
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          Sem Cal.com configurado.{" "}
          <Link
            href="/dashboard/config"
            style={{ color: "var(--purple)", fontWeight: 600 }}
          >
            Configurar
          </Link>
          .
        </div>
      )}

      <button
        type="button"
        className="btn-ghost"
        onClick={generate}
        disabled={generating}
        style={{ fontSize: 12, width: "100%" }}
      >
        ✨ {generating ? "Gerando..." : agendaMd ? "Regenerar pauta" : "Gerar pauta da próxima reunião"}
      </button>

      {error && (
        <div style={{ color: "#dc2626", fontSize: 12, marginTop: 10 }}>
          {error}
        </div>
      )}

      {agendaMd && (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--navy)",
                background: "transparent",
                border: 0,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {expanded ? "▾ Pauta gerada" : "▸ Pauta gerada"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={copyAgenda}
              style={{ fontSize: 11, padding: "4px 10px" }}
            >
              {copied ? "Copiado!" : "Copiar pauta"}
            </button>
          </div>
          {expanded && (
            <div
              style={{
                background: "rgba(255,255,255,0.6)",
                padding: 12,
                borderRadius: 8,
                border: "1px solid rgba(82,225,231,0.15)",
                fontSize: 13,
              }}
            >
              <MarkdownView md={agendaMd} />
              {generatedAt && (
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--ink-mute)",
                    fontFamily: "var(--font-mono)",
                    marginTop: 8,
                  }}
                >
                  Gerada em {new Date(generatedAt).toLocaleString("pt-BR")}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
