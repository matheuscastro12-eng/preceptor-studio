"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  STAGE_LABEL,
  fmtBRL,
  type VentureRow,
  type VentureStage,
} from "@/lib/ventures";

const BOARD_STAGES: VentureStage[] = [
  "lead",
  "diagnostico",
  "estudo",
  "proposta",
  "onboarding",
  "execucao",
  "manutencao",
  "equity",
  "encerrada",
];
const STAGE_COLOR: Record<VentureStage, string> = {
  lead: "#94A3B8",
  diagnostico: "#60A5FA",
  estudo: "#52E1E7",
  proposta: "#38BDF8",
  onboarding: "#A78BFA",
  execucao: "#34D399",
  manutencao: "#10B981",
  equity: "#F59E0B",
  encerrada: "#64748B",
};
const HEALTH_COLOR: Record<string, string> = {
  verde: "#10B981",
  amarelo: "#F59E0B",
  vermelho: "#EF4444",
};

export function VenturesBoard({ rows }: { rows: VentureRow[] }) {
  const router = useRouter();
  const [ventures, setVentures] = useState<VentureRow[]>(rows);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<VentureStage | null>(null);

  async function moveCard(id: string, toStage: VentureStage) {
    const card = ventures.find((v) => v.id === id);
    if (!card || card.stage === toStage) return;
    const prev = ventures;
    setVentures((list) => list.map((v) => (v.id === id ? { ...v, stage: toStage } : v)));
    try {
      const res = await fetch(`/api/ventures/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: toStage }),
      });
      if (!res.ok) throw new Error("patch failed");
      router.refresh();
    } catch {
      setVentures(prev); // reverte em caso de erro
    }
  }

  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
      {BOARD_STAGES.map((stage) => {
        const items = ventures.filter((v) => v.stage === stage);
        const receita = items.reduce((s, v) => s + v.metrics.receita_realizada, 0);
        const isOver = overStage === stage;
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              if (overStage !== stage) setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={() => {
              if (dragId) moveCard(dragId, stage);
              setDragId(null);
              setOverStage(null);
            }}
            style={{
              flex: "0 0 240px",
              background: isOver ? "rgba(82,225,231,0.10)" : "var(--bg, #F8FAFC)",
              border: isOver ? "1px dashed var(--cyan-deep, #1796A0)" : "1px solid var(--line, #E6EBF2)",
              borderRadius: 14,
              padding: 10,
              minHeight: 320,
              transition: "background 120ms, border-color 120ms",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px 10px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 800, color: "var(--navy)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: STAGE_COLOR[stage] }} />
                {STAGE_LABEL[stage]}
              </span>
              <span className="tabular" style={{ fontSize: 11.5, fontWeight: 800, color: "var(--ink-mute)" }}>
                {items.length}
              </span>
            </div>
            {receita > 0 && (
              <div style={{ fontSize: 10.5, color: "var(--ink-mute)", padding: "0 6px 8px", fontFamily: "var(--font-mono)" }}>
                {fmtBRL(receita)}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((v) => (
                <article
                  key={v.id}
                  draggable
                  onDragStart={() => setDragId(v.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverStage(null);
                  }}
                  onClick={() => router.push(`/dashboard/ventures/${v.id}`)}
                  style={{
                    background: "var(--surface, #fff)",
                    border: "1px solid var(--line, #E6EBF2)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "grab",
                    boxShadow: dragId === v.id ? "var(--sh-card-lg, 0 12px 28px rgba(10,31,68,.18))" : "none",
                    opacity: dragId === v.id ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: HEALTH_COLOR[v.health] || "#94A3B8", flex: "none" }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--navy)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {v.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-soft)", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {v.client_name || "Sem cliente"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    {v.metrics.mrr > 0 ? (
                      <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".04em", color: "#10B981", background: "rgba(16,185,129,.12)", padding: "2px 7px", borderRadius: 999 }}>
                        MRR {fmtBRL(v.metrics.mrr)}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span
                      className="tabular"
                      style={{ fontSize: 11.5, fontWeight: 800, color: v.metrics.margem >= 0 ? "#10B981" : "#EF4444" }}
                    >
                      {fmtBRL(v.metrics.margem)}
                    </span>
                  </div>
                </article>
              ))}
              {items.length === 0 && (
                <div style={{ fontSize: 11, color: "var(--ink-mute)", textAlign: "center", padding: "16px 0" }}>
                  vazio
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
