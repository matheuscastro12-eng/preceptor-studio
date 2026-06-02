"use client";

import { useCallback, useEffect, useState } from "react";
import { MarkdownView } from "@/components/MarkdownView";

interface Source {
  uri: string;
  title: string;
}

interface Research {
  id: string;
  query: string;
  results_md: string | null;
  sources: Source[];
  created_at: string;
}

export function ResearchCard({ studyId }: { studyId: string }) {
  const [history, setHistory] = useState<Research[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Research | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/studies/${studyId}/research`);
      const data = (await res.json()) as { research?: Research[] };
      setHistory(data.research || []);
      if (!active && data.research && data.research.length > 0) {
        setActive(data.research[0]);
      }
    } catch {
      // ignore
    }
  }, [studyId, active]);

  useEffect(() => {
    void load();
  }, [load]);

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/studies/${studyId}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = (await res.json()) as {
        research?: Research;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Erro");
      if (data.research) {
        setActive(data.research);
        setHistory((h) => [data.research as Research, ...h]);
      }
      setQuery("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="surface"
      style={{
        padding: 24,
        borderRadius: 16,
        marginTop: 20,
        display: "grid",
        gridTemplateColumns: "1fr 240px",
        gap: 20,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
            marginBottom: 12,
          }}
        >
          Pesquisa de mercado
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            value={query}
            placeholder="Tamanho do mercado de educação executiva no Brasil"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void search();
            }}
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={search}
            disabled={loading || !query.trim()}
            style={{ fontSize: 12, padding: "8px 16px" }}
          >
            {loading ? "Pesquisando..." : "✦ Pesquisar"}
          </button>
        </div>

        {error && (
          <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 8 }}>
            {error}
          </div>
        )}

        {active ? (
          <div>
            <div
              style={{
                fontSize: 12,
                color: "var(--ink-mute)",
                marginBottom: 12,
                fontFamily: "var(--font-mono)",
              }}
            >
              Pergunta: {active.query}
            </div>
            <MarkdownView md={active.results_md || ""} />
            {active.sources && active.sources.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
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
                  Fontes
                </div>
                <ol style={{ paddingLeft: 20, fontSize: 12, lineHeight: 1.6 }}>
                  {active.sources.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s.uri}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--navy)", textDecoration: "underline" }}
                      >
                        {s.title || s.uri}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
            Faça uma pergunta de mercado e o Gemini busca na web em tempo real.
          </p>
        )}
      </div>

      <aside>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
            marginBottom: 10,
          }}
        >
          Histórico
        </div>
        {history.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--ink-mute)" }}>
            Sem pesquisas anteriores.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {history.slice(0, 10).map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setActive(r)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background:
                      active?.id === r.id ? "rgba(82,225,231,0.12)" : "transparent",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "8px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                    color: "var(--navy)",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {r.query.length > 50 ? r.query.slice(0, 50) + "..." : r.query}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--ink-mute)", marginTop: 2 }}>
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
