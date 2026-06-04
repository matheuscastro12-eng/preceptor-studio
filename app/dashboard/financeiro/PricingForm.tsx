"use client";

import { useState } from "react";
import {
  ARCHETYPE_LABELS,
  STATUS_LABELS,
  formatBRL,
  type Archetype,
  type PaymentStatus,
  type PricingModel,
  type RecurringPeriod,
  type StudyPricingWithJoins,
} from "@/lib/finance";

interface StudyOption {
  id: string;
  title: string;
  category: string;
  client_name: string | null;
}

// Presets por arquétipo: valores típicos sugeridos (editáveis) ao selecionar.
interface ArchetypePreset {
  model: PricingModel;
  fixed: number;
  recurring: number;
  recurringPeriod: RecurringPeriod;
  equityPct: number;
  cost: number;
}

const ARCHETYPE_PRESETS: Record<Archetype, ArchetypePreset> = {
  empreendimento: {
    model: "mixed",
    fixed: 5000,
    recurring: 300,
    recurringPeriod: "monthly",
    equityPct: 0,
    cost: 0,
  },
  automacao: {
    model: "fixed",
    fixed: 15000,
    recurring: 0,
    recurringPeriod: "monthly",
    equityPct: 0,
    cost: 5000,
  },
  consultoria: {
    model: "recurring",
    fixed: 0,
    recurring: 3000,
    recurringPeriod: "monthly",
    equityPct: 0,
    cost: 0,
  },
  hibrido: {
    model: "mixed",
    fixed: 0,
    recurring: 0,
    recurringPeriod: "monthly",
    equityPct: 0,
    cost: 0,
  },
};

interface Props {
  study: StudyOption;
  existing: StudyPricingWithJoins | null;
  onClose: () => void;
  onSaved: (p: any) => void;
}

export function PricingForm({ study, existing, onClose, onSaved }: Props) {
  const [archetype, setArchetype] = useState<Archetype>(existing?.archetype || "empreendimento");
  const [model, setModel] = useState<PricingModel>(existing?.pricing_model || "fixed");
  const [fixed, setFixed] = useState(String(existing?.fixed_amount_brl ?? ""));
  const [recurring, setRecurring] = useState(String(existing?.recurring_amount_brl ?? ""));
  const [recurringPeriod, setRecurringPeriod] = useState<RecurringPeriod>(
    (existing?.recurring_period as RecurringPeriod) || "monthly"
  );
  const [equityPct, setEquityPct] = useState(String(existing?.equity_pct ?? ""));
  const [cost, setCost] = useState(String(existing?.estimated_cost_brl ?? ""));
  const [status, setStatus] = useState<PaymentStatus>(existing?.payment_status || "pending");
  const [installmentsCount, setInstallmentsCount] = useState<number>(
    Number(existing?.installments_count) || 1
  );
  const [firstInstallmentDate, setFirstInstallmentDate] = useState(
    existing?.first_installment_date || existing?.start_date || new Date().toISOString().slice(0, 10)
  );
  const [startDate, setStartDate] = useState(existing?.start_date || "");
  const [endDate, setEndDate] = useState(existing?.end_date || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Aplica os valores típicos do arquétipo (sugestão inicial, editável).
  // Só pré-preenche ao criar (sem registro existente) para não sobrescrever dados salvos.
  function selectArchetype(a: Archetype) {
    setArchetype(a);
    if (existing) return;
    const p = ARCHETYPE_PRESETS[a];
    setModel(p.model);
    setFixed(p.fixed ? String(p.fixed) : "");
    setRecurring(p.recurring ? String(p.recurring) : "");
    setRecurringPeriod(p.recurringPeriod);
    setEquityPct(p.equityPct ? String(p.equityPct) : "");
    setCost(p.cost ? String(p.cost) : "");
  }

  function parseN(v: string) {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }

  const fixedN = parseN(fixed);
  const recN = parseN(recurring);
  const costN = parseN(cost);
  const recYear = recN * (recurringPeriod === "monthly" ? 12 : recurringPeriod === "quarterly" ? 4 : 1);
  const tcv = fixedN + recYear;
  const margin = tcv > 0 ? ((tcv - costN) / tcv) * 100 : 0;

  async function save() {
    setError(null);
    // Validação: o modelo de cobrança precisa de pelo menos um valor coerente.
    if ((model === "fixed" || model === "mixed") && fixedN <= 0 && recN <= 0) {
      setError("Informe um valor fixo ou recorrente maior que zero");
      return;
    }
    if (model === "recurring" && recN <= 0) {
      setError("Informe um valor recorrente maior que zero");
      return;
    }
    if (model === "equity" && parseN(equityPct) <= 0) {
      setError("Informe o percentual de equity");
      return;
    }
    setSaving(true);
    const payload = {
      study_id: study.id,
      archetype,
      pricing_model: model,
      fixed_amount_brl: fixedN,
      recurring_amount_brl: recN,
      recurring_period: model === "recurring" || model === "mixed" ? recurringPeriod : null,
      equity_pct: parseN(equityPct),
      estimated_cost_brl: costN,
      payment_status: status,
      installments_count: installmentsCount,
      first_installment_date: firstInstallmentDate || null,
      start_date: startDate || null,
      end_date: endDate || null,
      notes: notes || null,
    };
    try {
      const res = await fetch("/api/finance/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      onSaved(data.pricing);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const target = e.target as HTMLElement;
    const isTextarea = target.tagName === "TEXTAREA";
    if (e.key === "Enter" && (!isTextarea || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!saving) void save();
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6,18,42,0.6)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 720,
          maxHeight: "92vh",
          overflow: "auto",
          boxShadow: "0 24px 60px -20px rgba(10,31,68,0.4)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--ink-mute)",
              }}
            >
              Precificação · {study.category}
            </div>
            <h2 style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: "var(--navy)" }}>
              {study.title}
            </h2>
            {study.client_name && (
              <div style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 2 }}>
                {study.client_name}
              </div>
            )}
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ fontSize: 12 }}>
            ✕
          </button>
        </div>

        <div style={{ display: "grid", gap: 14, marginTop: 18 }} onKeyDown={onKeyDown}>
          <Field label="Arquétipo do negócio">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {(Object.keys(ARCHETYPE_LABELS) as Archetype[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => selectArchetype(a)}
                  style={{
                    padding: "10px 8px",
                    fontSize: 12,
                    fontWeight: 700,
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    background: archetype === a ? "var(--navy)" : "white",
                    color: archetype === a ? "white" : "var(--ink-soft)",
                    cursor: "pointer",
                  }}
                >
                  {ARCHETYPE_LABELS[a]}
                </button>
              ))}
            </div>
            <Hint>
              {archetype === "empreendimento" &&
                "Equity play. Defensabilidade futura via produto/marca."}
              {archetype === "automacao" && "Produtizar serviço. Margem via repetição/processo."}
              {archetype === "consultoria" &&
                "Conhecimento por assinatura. Defensabilidade via relacionamento."}
              {archetype === "hibrido" && "Combina dois ou mais modelos."}
            </Hint>
          </Field>

          <Field label="Modelo de cobrança">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {(["fixed", "recurring", "equity", "mixed"] as PricingModel[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  style={{
                    padding: "8px 6px",
                    fontSize: 12,
                    fontWeight: 700,
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    background: model === m ? "var(--cyan-soft, #cffafe)" : "white",
                    color: model === m ? "var(--navy)" : "var(--ink-soft)",
                    cursor: "pointer",
                  }}
                >
                  {m === "fixed"
                    ? "Fixo"
                    : m === "recurring"
                    ? "Recorrente"
                    : m === "equity"
                    ? "Equity"
                    : "Misto"}
                </button>
              ))}
            </div>
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(model === "fixed" || model === "mixed") && (
              <Field label="Valor fixo (R$)">
                <input value={fixed} onChange={(e) => setFixed(e.target.value)} style={inputStyle} />
              </Field>
            )}
            {(model === "recurring" || model === "mixed") && (
              <>
                <Field label="Valor recorrente (R$)">
                  <input
                    value={recurring}
                    onChange={(e) => setRecurring(e.target.value)}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Período recorrente">
                  <select
                    value={recurringPeriod}
                    onChange={(e) => setRecurringPeriod(e.target.value as RecurringPeriod)}
                    style={inputStyle}
                  >
                    <option value="monthly">Mensal</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="yearly">Anual</option>
                  </select>
                </Field>
              </>
            )}
            {(model === "equity" || model === "mixed") && (
              <Field label="Equity (%)">
                <input
                  value={equityPct}
                  onChange={(e) => setEquityPct(e.target.value)}
                  placeholder="ex: 5"
                  style={inputStyle}
                />
              </Field>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label="Parcelas">
              <select
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                style={inputStyle}
              >
                <option value={1}>À vista</option>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24, 36].map((n) => (
                  <option key={n} value={n}>
                    {n}x
                  </option>
                ))}
              </select>
            </Field>
            <Field label="1ª parcela em">
              <input
                type="date"
                value={firstInstallmentDate}
                onChange={(e) => setFirstInstallmentDate(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Custo estimado (R$)">
              <input value={cost} onChange={(e) => setCost(e.target.value)} style={inputStyle} />
            </Field>
          </div>
          {installmentsCount > 1 && fixedN > 0 && (
            <div
              style={{
                fontSize: 12,
                color: "var(--ink-soft)",
                padding: "8px 12px",
                background: "#f1f5f9",
                borderRadius: 8,
                fontFamily: "var(--font-mono)",
              }}
            >
              {installmentsCount}x de aprox. {formatBRL(fixedN / installmentsCount)} (mensais, a
              partir de{" "}
              {firstInstallmentDate
                ? new Date(firstInstallmentDate + "T00:00:00").toLocaleDateString("pt-BR")
                : "—"}
              )
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                style={inputStyle}
              >
                {(Object.keys(STATUS_LABELS) as PaymentStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Início">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Fim">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Observações">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              style={{ ...inputStyle, fontFamily: "var(--font-sans)", resize: "vertical" }}
            />
          </Field>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid var(--line)",
              borderRadius: 10,
              padding: 14,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            <Stat label="TCV (estim. 12m)" value={formatBRL(tcv)} />
            <Stat label="Custo" value={formatBRL(costN)} />
            <Stat
              label="Margem"
              value={`${margin.toFixed(1)}%`}
              color={margin >= 50 ? "#10b981" : margin >= 20 ? "#f59e0b" : "#ef4444"}
            />
          </div>

          {error && <div style={{ fontSize: 13, color: "var(--danger)" }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" onClick={save} disabled={saving}>
              {saving ? "Salvando..." : "Salvar precificação"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-mute)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-mute)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 900,
          color: color || "var(--navy)",
          fontFamily: "var(--font-mono)",
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 6, fontStyle: "italic" }}>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid var(--line)",
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "var(--font-mono)",
};
