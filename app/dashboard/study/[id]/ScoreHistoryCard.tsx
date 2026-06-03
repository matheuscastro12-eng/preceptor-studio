"use client";

import { useCallback, useEffect, useState } from "react";
import { Eyebrow, scoreHex } from "@/components/dashboard/Shared";

interface ScoreHistoryRow {
  id: string;
  overall: number | null;
  axes: { label: string; value: number; hint?: string }[];
  note: string | null;
  source: string | null;
  created_at: string;
}

interface RecomputeResponse {
  overall?: number;
  alerted?: boolean;
  error?: string;
}

function Sparkline({ points }: { points: number[] }) {
  const width = 280;
  const height = 64;
  const pad = 6;
  if (points.length === 0) return null;
  const max = 100;
  const min = 0;
  const span = max - min || 1;
  const stepX =
    points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (p - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });
  const path = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];
  const stroke = scoreHex(last);
  const area = `${path} L${coords[coords.length - 1][0].toFixed(1)},${
    height - pad
  } L${coords[0][0].toFixed(1)},${height - pad} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {[25, 50, 75].map((g) => {
        const y = pad + (1 - g / 100) * (height - pad * 2);
        return (
          <line
            key={g}
            x1={pad}
            y1={y}
            x2={width - pad}
            y2={y}
            stroke="#EEF2F6"
            strokeWidth="1"
          />
        );
      })}
      <path d={area} fill={`${stroke}1A`} stroke="none" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === coords.length - 1 ? 4 : 3} fill={stroke} stroke="#fff" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function ScoreHistoryCard({ studyId }: { studyId: string }) {
  const [history, setHistory] = useState<ScoreHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/studies/${studyId}/score-history`);
      const data = (await res.json()) as { history?: ScoreHistoryRow[]; error?: string };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setHistory(data.history ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar histórico.");
    } finally {
      setLoading(false);
    }
  }, [studyId]);

  useEffect(() => {
    load();
  }, [load]);

  async function recompute() {
    setRecomputing(true);
    setError(null);
    setFlash(null);
    try {
      const res = await fetch(`/api/studies/${studyId}/recompute-score`, {
        method: "POST",
      });
      const data = (await res.json()) as RecomputeResponse;
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setFlash(
        data.alerted
          ? `Score recalculado: ${data.overall}. Queda detectada, alerta disparado.`
          : `Score recalculado: ${data.overall}.`
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao recalcular o score.");
    } finally {
      setRecomputing(false);
    }
  }

  const points = history
    .map((h) => (typeof h.overall === "number" ? h.overall : null))
    .filter((v): v is number => v !== null);

  const last5 = [...history].slice(-5).reverse();

  return (
    <div className="surface" style={{ padding: 20, borderRadius: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <Eyebrow>Evolução do score</Eyebrow>
        <button
          type="button"
          className="btn-cyan"
          onClick={recompute}
          disabled={recomputing}
          style={{ fontSize: 12, padding: "8px 14px", opacity: recomputing ? 0.6 : 1 }}
        >
          {recomputing ? "Recalculando..." : "↻ Recalcular score da tese"}
        </button>
      </div>

      {flash && (
        <div
          style={{
            background: "rgba(82,225,231,0.1)",
            border: "1px solid rgba(82,225,231,0.4)",
            color: "var(--navy)",
            padding: "8px 12px",
            borderRadius: 10,
            fontSize: 12.5,
            marginBottom: 12,
          }}
        >
          {flash}
        </div>
      )}
      {error && (
        <div
          style={{
            background: "var(--danger-soft)",
            border: "1px solid rgba(225,29,72,0.3)",
            color: "var(--danger-rose)",
            padding: "8px 12px",
            borderRadius: 10,
            fontSize: 12.5,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="shimmer" style={{ height: 64, borderRadius: 10 }} />
      ) : points.length === 0 ? (
        <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "8px 0 0" }}>
          Sem medições ainda. Recalcule conforme a execução avança.
        </p>
      ) : points.length === 1 ? (
        <div>
          <Sparkline points={points} />
          <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "8px 0 0" }}>
            Primeira medição. Recalcule conforme a execução avança.
          </p>
        </div>
      ) : (
        <div>
          <Sparkline points={points} />
        </div>
      )}

      {last5.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {last5.map((h, idx) => {
            // delta vs medição imediatamente anterior na ordem cronológica
            const chronoIdx = history.findIndex((x) => x.id === h.id);
            const prev = chronoIdx > 0 ? history[chronoIdx - 1] : null;
            const cur = typeof h.overall === "number" ? h.overall : 0;
            const delta =
              prev && typeof prev.overall === "number" ? cur - prev.overall : null;
            const deltaColor =
              delta === null
                ? "var(--ink-mute)"
                : delta > 0
                ? "#10B981"
                : delta < 0
                ? "#E11D48"
                : "var(--ink-mute)";
            const deltaLabel =
              delta === null
                ? "primeira"
                : delta > 0
                ? `+${delta}`
                : `${delta}`;
            return (
              <div
                key={h.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: idx === 0 ? "rgba(15,23,41,0.03)" : "transparent",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--ink-soft)",
                  }}
                >
                  {fmtDate(h.created_at)}
                </span>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: 16,
                    color: scoreHex(cur),
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {cur}
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 12.5,
                    color: deltaColor,
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 56,
                    textAlign: "right",
                  }}
                >
                  {delta !== null && delta > 0 ? "▲ " : delta !== null && delta < 0 ? "▼ " : ""}
                  {deltaLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
