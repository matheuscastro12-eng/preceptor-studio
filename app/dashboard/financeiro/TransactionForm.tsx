"use client";

import { useState } from "react";
import type {
  FinanceCategory,
  TransactionWithJoins,
  TransactionKind,
  PaymentMethod,
  RecurringPeriod,
} from "@/lib/finance";

interface StudyOption {
  id: string;
  title: string;
  client_name: string | null;
}

interface Props {
  existing: TransactionWithJoins | null;
  categories: FinanceCategory[];
  studies: StudyOption[];
  onClose: () => void;
  onSaved: (t: any) => void;
}

export function TransactionForm({ existing, categories, studies, onClose, onSaved }: Props) {
  const [kind, setKind] = useState<TransactionKind>(existing?.kind || "inflow");
  const [amount, setAmount] = useState(String(existing?.amount_brl ?? ""));
  const [description, setDescription] = useState(existing?.description || "");
  const [categoryId, setCategoryId] = useState(existing?.category_id || "");
  const [studyId, setStudyId] = useState(existing?.study_id || "");
  const [occurredAt, setOccurredAt] = useState(
    existing?.occurred_at || new Date().toISOString().slice(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(
    (existing?.payment_method as PaymentMethod) || ""
  );
  const [isRecurring, setIsRecurring] = useState(Boolean(existing?.is_recurring));
  const [recurringPeriod, setRecurringPeriod] = useState<RecurringPeriod>(
    (existing?.recurring_period as RecurringPeriod) || "monthly"
  );
  const [notes, setNotes] = useState(existing?.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCats = categories.filter((c) =>
    kind === "inflow" ? c.kind === "revenue" : c.kind === "expense"
  );

  async function save() {
    setError(null);
    const amt = Number(amount.replace(",", "."));
    if (!Number.isFinite(amt) || amt < 0) {
      setError("Valor inválido");
      return;
    }
    if (!description.trim()) {
      setError("Descrição obrigatória");
      return;
    }
    setSaving(true);
    const payload = {
      kind,
      amount_brl: amt,
      description: description.trim(),
      category_id: categoryId || null,
      study_id: studyId || null,
      occurred_at: occurredAt,
      payment_method: paymentMethod || null,
      is_recurring: isRecurring,
      recurring_period: isRecurring ? recurringPeriod : null,
      notes: notes || null,
    };
    try {
      const res = existing
        ? await fetch(`/api/finance/transactions/${existing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/finance/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      onSaved(data.transaction);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} title={existing ? "Editar transação" : "Nova transação"}>
      <div style={{ display: "grid", gap: 12 }}>
        <Field label="Tipo">
          <div style={{ display: "flex", gap: 4 }}>
            {(["inflow", "outflow"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  background: kind === k ? (k === "inflow" ? "#10b981" : "#ef4444") : "white",
                  color: kind === k ? "white" : "var(--ink-soft)",
                  cursor: "pointer",
                }}
              >
                {k === "inflow" ? "Entrada (+)" : "Saída (−)"}
              </button>
            ))}
          </div>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <Field label="Valor (R$)">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              type="text"
              inputMode="decimal"
              style={inputStyle}
            />
          </Field>
          <Field label="Data">
            <input
              type="date"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="Descrição">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Pagamento parcela 1 do estudo"
            style={inputStyle}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Categoria">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={inputStyle}
            >
              <option value="">— sem categoria —</option>
              {filteredCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estudo (opcional)">
            <select value={studyId} onChange={(e) => setStudyId(e.target.value)} style={inputStyle}>
              <option value="">— sem estudo —</option>
              {studies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} {s.client_name ? `· ${s.client_name}` : ""}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Forma de pagamento">
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            style={inputStyle}
          >
            <option value="">—</option>
            <option value="pix">PIX</option>
            <option value="boleto">Boleto</option>
            <option value="cartao">Cartão</option>
            <option value="transferencia">Transferência</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="outro">Outro</option>
          </select>
        </Field>

        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
          <input
            type="checkbox"
            id="recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          <label htmlFor="recurring" style={{ color: "var(--ink-soft)" }}>
            Recorrente
          </label>
          {isRecurring && (
            <select
              value={recurringPeriod}
              onChange={(e) => setRecurringPeriod(e.target.value as RecurringPeriod)}
              style={{ ...inputStyle, marginLeft: 12, width: "auto" }}
            >
              <option value="monthly">Mensal</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </select>
          )}
        </div>

        <Field label="Observações">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            style={{ ...inputStyle, fontFamily: "var(--font-sans)", resize: "vertical" }}
          />
        </Field>

        {error && <div style={{ fontSize: 13, color: "var(--danger)" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={save} disabled={saving}>
            {saving ? "Salvando..." : existing ? "Atualizar" : "Criar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
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
          maxWidth: 600,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 24px 60px -20px rgba(10,31,68,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--navy)" }}>{title}</h2>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ fontSize: 12 }}>
            ✕
          </button>
        </div>
        {children}
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid var(--line)",
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "var(--font-mono)",
};
