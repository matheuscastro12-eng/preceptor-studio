"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  STAGE_LABEL,
  fmtBRL,
  type VentureRow,
  type StudioHeader,
  type VentureStage,
  type VentureHealth,
} from "@/lib/ventures";

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
const HEALTH_COLOR: Record<VentureHealth, string> = {
  verde: "#10B981",
  amarelo: "#F59E0B",
  vermelho: "#EF4444",
};

export function VenturesView({
  rows,
  header,
}: {
  rows: VentureRow[];
  header: StudioHeader;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ventures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        setName("");
        setCreating(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="eyebrow">Sistema operacional do studio</div>
          <h1 className="display-md mt-2" style={{ color: "var(--navy)" }}>
            Ventures
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Cada conta do lead à equity, com margem real.
          </p>
        </div>
        <button
          type="button"
          className="btn-pill btn-pill--primary"
          onClick={() => setCreating((v) => !v)}
        >
          Nova venture <span className="btn-pill__icon">+</span>
        </button>
      </div>

      {creating && (
        <div
          className="rounded-2xl p-4 flex items-center gap-3 flex-wrap"
          style={{ background: "rgba(82,225,231,0.08)", border: "1px solid rgba(82,225,231,0.28)" }}
        >
          <input
            className="input-field"
            placeholder="Nome da venture (ex.: Sal Express)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            style={{ flex: 1, minWidth: 260 }}
            autoFocus
          />
          <button
            type="button"
            className="btn-pill btn-pill--primary"
            disabled={saving || !name.trim()}
            onClick={create}
          >
            {saving ? "Criando..." : "Criar"}
          </button>
        </div>
      )}

      {/* Cabeçalho de 4 números */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Caixa do mês" value={fmtBRL(header.caixa_mes)} hint="realizado" />
        <Kpi label="MRR atual" value={fmtBRL(header.mrr_total)} hint="recorrente" accent />
        <Kpi label="Pipeline aberto" value={fmtBRL(header.pipeline_aberto)} hint="leads em negociação" />
        <Kpi
          label="Portfólio de equity"
          value={fmtBRL(header.portfolio_equity)}
          hint="valor de papel"
        />
      </div>

      {/* Tabela */}
      <div className="surface rounded-2xl overflow-hidden">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <Th>Venture</Th>
              <Th>Cliente</Th>
              <Th>Estágio</Th>
              <Th right>Receita</Th>
              <Th right>MRR</Th>
              <Th right>Custo IA</Th>
              <Th right>Margem</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-ink-soft py-10">
                  Nenhuma venture ainda. Rode a migration <code>db/erp_v1_ventures.sql</code> para popular a partir dos clientes, ou crie uma acima.
                </td>
              </tr>
            )}
            {rows.map((v) => (
              <tr
                key={v.id}
                className="ventures-row"
                style={{ borderTop: "1px solid var(--line)" }}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/ventures/${v.id}`}
                    className="font-semibold text-ink hover:text-blue inline-flex items-center gap-2"
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: HEALTH_COLOR[v.health] || "#94A3B8",
                        display: "inline-block",
                      }}
                    />
                    {v.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">{v.client_name || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: STAGE_COLOR[v.stage] || "#94A3B8",
                      background: `${STAGE_COLOR[v.stage] || "#94A3B8"}1A`,
                      padding: "4px 10px",
                      borderRadius: 999,
                    }}
                  >
                    {STAGE_LABEL[v.stage]}
                  </span>
                </td>
                <Td right>{fmtBRL(v.metrics.receita_realizada)}</Td>
                <Td right>{v.metrics.mrr ? fmtBRL(v.metrics.mrr) : "-"}</Td>
                <Td right>
                  {fmtBRL(v.metrics.custo_ia)}
                  {v.metrics.custo_ia_estimado && (
                    <span className="text-ink-mute" style={{ fontSize: 10 }}> est.</span>
                  )}
                </Td>
                <td
                  className="px-4 py-3 text-right font-mono font-bold"
                  style={{ color: v.metrics.margem >= 0 ? "#10B981" : "#EF4444" }}
                >
                  {fmtBRL(v.metrics.margem)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: accent ? "rgba(82,225,231,0.08)" : "var(--surface, #fff)",
        border: accent ? "1px solid rgba(82,225,231,0.3)" : "1px solid var(--line)",
      }}
    >
      <div className="text-[10px] uppercase tracking-widest font-bold text-ink-mute">{label}</div>
      <div className="text-2xl font-black tabular-nums mt-1" style={{ color: "var(--navy)" }}>
        {value}
      </div>
      {hint && <div className="text-[11px] text-ink-mute mt-0.5">{hint}</div>}
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-ink-mute"
      style={{ textAlign: right ? "right" : "left" }}
    >
      {children}
    </th>
  );
}
function Td({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <td
      className="px-4 py-3 font-mono"
      style={{ textAlign: right ? "right" : "left", color: "var(--ink-soft)" }}
    >
      {children}
    </td>
  );
}
