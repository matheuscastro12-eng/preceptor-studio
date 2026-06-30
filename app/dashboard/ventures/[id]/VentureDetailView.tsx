"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TEAM_COLORS } from "@/lib/teamColors";
import {
  VENTURE_STAGES,
  STAGE_LABEL,
  fmtBRL,
  type VentureDetail,
  type VentureStage,
  type VentureHealth,
  type EquityStatus,
  type TimelineEvent,
  type TimelineKind,
} from "@/lib/ventures";

const HEALTHS: VentureHealth[] = ["verde", "amarelo", "vermelho"];
const EQUITY_STATUSES: EquityStatus[] = ["negociando", "assinado", "vesting", "exit"];

const darkSelect: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 13,
};

const TL_COLOR: Record<TimelineKind, string> = {
  venture: "#5D57EB",
  estudo: "#52E1E7",
  receita: "#10B981",
  saida: "#EF4444",
  custo: "#F59E0B",
  horas: "#60A5FA",
  estagio: "#A78BFA",
  nota: "#94A3B8",
  sistema: "#94A3B8",
};

type Tab = "geral" | "timeline" | "financeiro";

export function VentureDetailView({ detail }: { detail: VentureDetail }) {
  const router = useRouter();
  const v = detail.venture;
  const m = v.metrics;
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("geral");

  async function patch(update: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/ventures/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <Link
        href="/dashboard/ventures"
        className="text-xs uppercase tracking-widest font-bold text-ink-mute hover:text-blue inline-flex items-center gap-2"
      >
        ← Voltar para ventures
      </Link>

      {/* Header */}
      <div
        className="rounded-3xl p-8"
        style={{ background: "var(--grad-ambient-dark)", color: "#fff", boxShadow: "var(--sh-card-lg)" }}
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-0">
            <span className="eyebrow" style={{ color: "var(--cyan)" }}>
              Venture
            </span>
            <h1 className="display-md mt-3" style={{ color: "#fff" }}>
              {v.name}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              {v.client_name || "Sem cliente"} · {detail.studies.length} estudo(s)
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Field label="Estágio">
              <select value={v.stage} disabled={busy} onChange={(e) => patch({ stage: e.target.value as VentureStage })} style={darkSelect}>
                {VENTURE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABEL[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Saúde">
              <select value={v.health} disabled={busy} onChange={(e) => patch({ health: e.target.value })} style={darkSelect}>
                {HEALTHS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Responsável">
              <select value={v.owner_team_key || ""} disabled={busy} onChange={(e) => patch({ owner_team_key: e.target.value || null })} style={darkSelect}>
                <option value="">-</option>
                {Object.entries(TEAM_COLORS).map(([key, t]) => (
                  <option key={key} value={key}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </div>

      {/* KPIs de margem */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Kpi label="Receita realizada" value={fmtBRL(m.receita_realizada)} />
        <Kpi label="Horas" value={`${m.horas.toFixed(1)}h`} sub={fmtBRL(m.custo_horas)} />
        <Kpi label="Custo IA" value={fmtBRL(m.custo_ia)} sub={m.custo_ia_estimado ? "estimado" : "registrado"} />
        <Kpi label="MRR" value={m.mrr ? fmtBRL(m.mrr) : "-"} />
        <Kpi label="Margem" value={fmtBRL(m.margem)} valueColor={m.margem >= 0 ? "#10B981" : "#EF4444"} />
      </div>

      {/* Tabs */}
      <div className="seg-tabs">
        {([
          ["geral", "Visão geral"],
          ["timeline", "Timeline"],
          ["financeiro", "Financeiro"],
        ] as [Tab, string][]).map(([k, label]) => (
          <button key={k} type="button" className={"seg-tabs__btn" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "geral" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Section title="Estudos vinculados">
              {detail.studies.length === 0 ? (
                <Empty>Nenhum estudo ligado a esta venture.</Empty>
              ) : (
                <div className="space-y-2">
                  {detail.studies.map((s) => (
                    <Link
                      key={s.id}
                      href={`/dashboard/study/${s.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-cyan-50"
                      style={{ border: "1px solid var(--line)" }}
                    >
                      <span className="font-semibold text-ink truncate">{s.title}</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-ink-mute">{s.status}</span>
                    </Link>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Execução">
              {detail.tasks.length === 0 ? (
                <Empty>Sem tarefas nesta venture.</Empty>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  {(["todo", "doing", "done", "blocked"] as const).map((st) => {
                    const count = detail.tasks.filter((t) => t.status === st).length;
                    return (
                      <div key={st} className="rounded-xl px-4 py-3" style={{ border: "1px solid var(--line)", minWidth: 96 }}>
                        <div className="text-2xl font-black tabular-nums" style={{ color: "var(--navy)" }}>
                          {count}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-ink-mute">{st}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          </div>

          <div className="space-y-5">
            <EquityCard venture={v} patch={patch} busy={busy} />
          </div>
        </div>
      )}

      {tab === "timeline" && <TimelineTab events={detail.timeline} />}

      {tab === "financeiro" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Section title="Transações">
              {detail.transactions.length === 0 ? (
                <Empty>Sem transações ligadas. A receita aparece ao registrar inflows no Financeiro com o estudo ou cliente desta venture.</Empty>
              ) : (
                <div className="space-y-1">
                  {detail.transactions.slice(0, 20).map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: "1px solid var(--line)" }}>
                      <span className="text-sm text-ink-soft truncate">{t.description}</span>
                      <span className="font-mono text-sm font-bold shrink-0" style={{ color: t.kind === "inflow" ? "#10B981" : "#EF4444" }}>
                        {t.kind === "inflow" ? "+" : "-"}
                        {fmtBRL(t.amount_brl)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
          <div className="space-y-5">
            <TimeCard ventureId={v.id} entries={detail.timeEntries} />
            <CostCard ventureId={v.id} entries={detail.costEntries} />
          </div>
        </div>
      )}

      <style>{`
        .seg-tabs { display:inline-flex; gap:2px; background:var(--bg,#F1F5F9); border:1px solid var(--line,#E6EBF2); border-radius:999px; padding:3px; }
        .seg-tabs__btn { border:0; background:transparent; font-size:13px; font-weight:700; color:var(--ink-soft); padding:8px 18px; border-radius:999px; cursor:pointer; }
        .seg-tabs__btn.on { background:var(--surface,#fff); color:var(--navy); box-shadow:0 1px 3px rgba(10,31,68,.12); }
      `}</style>
    </div>
  );
}

function TimelineTab({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="surface rounded-2xl p-6">
        <Empty>Sem atividade ainda. Mova a venture de estágio, lance horas ou registre receita para começar a timeline.</Empty>
      </div>
    );
  }
  return (
    <div className="surface rounded-2xl p-6">
      <div className="eyebrow mb-5">Linha do tempo</div>
      <div style={{ position: "relative", paddingLeft: 22 }}>
        <div style={{ position: "absolute", left: 5, top: 4, bottom: 4, width: 2, background: "var(--line, #E6EBF2)" }} />
        <div className="space-y-4">
          {events.map((e) => (
            <div key={e.id} style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: -22,
                  top: 4,
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: TL_COLOR[e.kind] || "#94A3B8",
                  border: "2px solid var(--surface, #fff)",
                  boxShadow: "0 0 0 1px var(--line, #E6EBF2)",
                }}
              />
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-ink">
                  {e.title}
                  {e.detail && <span className="text-ink-mute font-normal"> · {e.detail}</span>}
                </span>
                <span className="text-[11px] text-ink-mute tabular-nums shrink-0 font-mono">
                  {new Date(e.date).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EquityCard({
  venture,
  patch,
  busy,
}: {
  venture: VentureDetail["venture"];
  patch: (u: Record<string, unknown>) => void;
  busy: boolean;
}) {
  const [pct, setPct] = useState(venture.equity_pct?.toString() ?? "");
  const [fair, setFair] = useState(venture.fair_value_brl?.toString() ?? "");
  const [mrr, setMrr] = useState(venture.mrr_brl?.toString() ?? "");

  return (
    <Section title="Equity & recorrência">
      <div className="space-y-3">
        <LabeledInput label="MRR (R$/mês)" value={mrr} onChange={setMrr} />
        <LabeledInput label="Equity (%)" value={pct} onChange={setPct} />
        <LabeledInput label="Fair value (R$)" value={fair} onChange={setFair} />
        <div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-ink-mute mb-1">Status equity</div>
          <select
            className="input-field"
            value={venture.equity_status || ""}
            disabled={busy}
            onChange={(e) => patch({ equity_status: e.target.value || null })}
          >
            <option value="">-</option>
            {EQUITY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn-pill btn-pill--primary w-full justify-center"
          disabled={busy}
          onClick={() =>
            patch({
              mrr_brl: mrr === "" ? null : Number(mrr),
              equity_pct: pct === "" ? null : Number(pct),
              fair_value_brl: fair === "" ? null : Number(fair),
            })
          }
        >
          Salvar
        </button>
      </div>
    </Section>
  );
}

function TimeCard({ ventureId, entries }: { ventureId: string; entries: VentureDetail["timeEntries"] }) {
  const router = useRouter();
  const [hours, setHours] = useState("");
  const [cost, setCost] = useState("");
  const [member, setMember] = useState("");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!hours || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/ventures/${ventureId}/time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: Number(hours), hourly_cost_brl: Number(cost) || 0, member_key: member || null }),
      });
      if (res.ok) {
        setHours("");
        setCost("");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Horas">
      <div className="grid grid-cols-2 gap-2">
        <LabeledInput label="Horas" value={hours} onChange={setHours} />
        <LabeledInput label="Custo/h (R$)" value={cost} onChange={setCost} />
      </div>
      <div className="mt-2">
        <select className="input-field" value={member} onChange={(e) => setMember(e.target.value)}>
          <option value="">Membro (opcional)</option>
          {Object.entries(TEAM_COLORS).map(([key, t]) => (
            <option key={key} value={key}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <button type="button" className="btn-pill btn-pill--ghost w-full justify-center mt-2" disabled={saving || !hours} onClick={add}>
        {saving ? "Lançando..." : "Lançar horas"}
      </button>
      {entries.length > 0 && (
        <div className="mt-3 space-y-1">
          {entries.slice(0, 6).map((t) => (
            <div key={t.id} className="flex items-center justify-between text-xs text-ink-soft">
              <span>
                {t.entry_date} · {t.member_key || "—"}
              </span>
              <span className="font-mono">
                {Number(t.hours).toFixed(1)}h · {fmtBRL(Number(t.hours) * Number(t.hourly_cost_brl))}
              </span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function CostCard({ ventureId, entries }: { ventureId: string; entries: VentureDetail["costEntries"] }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("ia_anthropic");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!amount || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/ventures/${ventureId}/cost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_brl: Number(amount), cost_type: type }),
      });
      if (res.ok) {
        setAmount("");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Custos">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-ink-mute mb-1">Tipo</div>
          <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="ia_anthropic">IA (Anthropic)</option>
            <option value="infra">Infra</option>
            <option value="saas">SaaS</option>
            <option value="freelance">Freelance</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <LabeledInput label="Valor (R$)" value={amount} onChange={setAmount} />
      </div>
      <button type="button" className="btn-pill btn-pill--ghost w-full justify-center mt-2" disabled={saving || !amount} onClick={add}>
        {saving ? "Lançando..." : "Lançar custo"}
      </button>
      {entries.length > 0 && (
        <div className="mt-3 space-y-1">
          {entries.slice(0, 6).map((c) => (
            <div key={c.id} className="flex items-center justify-between text-xs text-ink-soft">
              <span>{c.cost_type}</span>
              <span className="font-mono">{fmtBRL(Number(c.amount_brl))}</span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ── helpers de UI ─────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface rounded-2xl p-6">
      <div className="eyebrow mb-4">{title}</div>
      {children}
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink-soft m-0">{children}</p>;
}
function Kpi({ label, value, sub, valueColor }: { label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <div className="surface rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-widest font-bold text-ink-mute">{label}</div>
      <div className="text-xl font-black tabular-nums mt-1" style={{ color: valueColor || "var(--navy)" }}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-ink-mute mt-0.5">{sub}</div>}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}
function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest font-bold text-ink-mute mb-1">{label}</div>
      <input className="input-field" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
