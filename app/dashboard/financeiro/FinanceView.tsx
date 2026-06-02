"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ARCHETYPE_COLORS,
  ARCHETYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatBRL,
  monthlyRecurringValue,
  pricingExpectedMargin,
  pricingOpenReceivable,
  pricingTotalContractValue,
  type Archetype,
  type FinanceCategory,
  type FinanceSummary,
  type StudyPricingWithJoins,
  type TransactionWithJoins,
} from "@/lib/finance";
import { TransactionForm } from "./TransactionForm";
import { PricingForm } from "./PricingForm";

interface StudyOption {
  id: string;
  title: string;
  category: string;
  status: string;
  client_id: string | null;
  client_name: string | null;
}

type Tab = "overview" | "transactions" | "pricing" | "categories";

interface Props {
  summary: FinanceSummary;
  initialTransactions: TransactionWithJoins[];
  initialPricings: StudyPricingWithJoins[];
  categories: FinanceCategory[];
  studies: StudyOption[];
}

export function FinanceView({
  summary,
  initialTransactions,
  initialPricings,
  categories,
  studies,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [pricings, setPricings] = useState(initialPricings);
  const [showTxForm, setShowTxForm] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionWithJoins | null>(null);
  const [showPricingFor, setShowPricingFor] = useState<{
    study: StudyOption;
    existing: StudyPricingWithJoins | null;
  } | null>(null);

  function refresh() {
    router.refresh();
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <header style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
            marginBottom: 6,
          }}
        >
          Financeiro · Venture Studio
        </div>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: "-0.025em",
            color: "var(--navy)",
            margin: 0,
          }}
        >
          Caixa, precificação e P&L
        </h1>
        <p style={{ color: "var(--ink-soft)", marginTop: 6, fontSize: 14 }}>
          Visibilidade sobre receita por estudo, classificação empreendimento × automação, e fluxo
          de caixa do PRECEPTOR! Venture Studio.
        </p>
      </header>

      <KpiGrid summary={summary} />

      <nav
        style={{
          display: "flex",
          gap: 4,
          marginTop: 24,
          marginBottom: 20,
          borderBottom: "1px solid var(--line)",
        }}
      >
        {(
          [
            { k: "overview", l: "Visão geral" },
            { k: "transactions", l: `Transações (${transactions.length})` },
            { k: "pricing", l: `Precificação (${pricings.length})` },
            { k: "categories", l: `Categorias (${categories.length})` },
          ] as { k: Tab; l: string }[]
        ).map((t) => {
          const active = tab === t.k;
          return (
            <button
              key={t.k}
              type="button"
              onClick={() => setTab(t.k)}
              style={{
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 700,
                color: active ? "var(--navy)" : "var(--ink-soft)",
                background: "transparent",
                border: 0,
                borderBottom: active ? "2px solid var(--cyan)" : "2px solid transparent",
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {t.l}
            </button>
          );
        })}
      </nav>

      {tab === "overview" && <Overview summary={summary} pricings={pricings} />}
      {tab === "transactions" && (
        <TransactionsTab
          transactions={transactions}
          onNew={() => {
            setEditingTx(null);
            setShowTxForm(true);
          }}
          onEdit={(t) => {
            setEditingTx(t);
            setShowTxForm(true);
          }}
          onDelete={async (id) => {
            if (!confirm("Excluir esta transação?")) return;
            await fetch(`/api/finance/transactions/${id}`, { method: "DELETE" });
            setTransactions((prev) => prev.filter((t) => t.id !== id));
            refresh();
          }}
        />
      )}
      {tab === "pricing" && (
        <PricingTab
          pricings={pricings}
          studies={studies}
          onOpen={(study, existing) => setShowPricingFor({ study, existing })}
        />
      )}
      {tab === "categories" && <CategoriesTab categories={categories} onChanged={refresh} />}

      {showTxForm && (
        <TransactionForm
          existing={editingTx}
          categories={categories}
          studies={studies}
          onClose={() => {
            setShowTxForm(false);
            setEditingTx(null);
          }}
          onSaved={(tx) => {
            if (editingTx) {
              setTransactions((prev) => prev.map((p) => (p.id === tx.id ? { ...p, ...tx } : p)));
            } else {
              setTransactions((prev) => [tx as TransactionWithJoins, ...prev]);
            }
            setShowTxForm(false);
            setEditingTx(null);
            refresh();
          }}
        />
      )}

      {showPricingFor && (
        <PricingForm
          study={showPricingFor.study}
          existing={showPricingFor.existing}
          onClose={() => setShowPricingFor(null)}
          onSaved={(p) => {
            setPricings((prev) => {
              const idx = prev.findIndex((x) => x.study_id === p.study_id);
              if (idx >= 0) {
                const next = prev.slice();
                next[idx] = { ...next[idx], ...p };
                return next;
              }
              return [{ ...p, study: showPricingFor.study as any } as StudyPricingWithJoins, ...prev];
            });
            setShowPricingFor(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function KpiGrid({ summary }: { summary: FinanceSummary }) {
  const items = [
    { label: "Receita YTD", value: summary.revenue_ytd_brl, color: "#10b981" },
    { label: "Despesa YTD", value: summary.expense_ytd_brl, color: "#ef4444" },
    {
      label: "Net YTD",
      value: summary.net_ytd_brl,
      color: summary.net_ytd_brl >= 0 ? "#5d57eb" : "#ef4444",
    },
    { label: "MRR estimado", value: summary.mrr_brl, color: "#52e1e7" },
    { label: "A receber (AR)", value: summary.ar_open_brl, color: "#f59e0b" },
    {
      label: "Net 30 dias",
      value: summary.net_30d_brl,
      color: summary.net_30d_brl >= 0 ? "#5d57eb" : "#ef4444",
    },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
      }}
    >
      {items.map((it) => (
        <div
          key={it.label}
          className="surface"
          style={{ padding: 16, borderRadius: 12 }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--ink-mute)",
            }}
          >
            {it.label}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              marginTop: 6,
              color: it.color,
              letterSpacing: "-0.02em",
              fontFamily: "var(--font-sans)",
            }}
          >
            {formatBRL(it.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Overview({
  summary,
  pricings,
}: {
  summary: FinanceSummary;
  pricings: StudyPricingWithJoins[];
}) {
  const maxBar = Math.max(
    1,
    ...summary.monthly_series.flatMap((m) => [m.revenue_brl, m.expense_brl])
  );
  const totalContracted = pricings.reduce((acc, p) => acc + pricingTotalContractValue(p), 0);
  const totalCost = pricings.reduce((acc, p) => acc + Number(p.estimated_cost_brl), 0);
  const blendedMargin = totalContracted > 0 ? ((totalContracted - totalCost) / totalContracted) * 100 : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <div className="surface" style={{ padding: 20, borderRadius: 14 }}>
        <SectionTitle>Fluxo mensal (últimos 12 meses)</SectionTitle>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 200, marginTop: 16 }}>
          {summary.monthly_series.map((m) => {
            const rH = (m.revenue_brl / maxBar) * 180;
            const eH = (m.expense_brl / maxBar) * 180;
            return (
              <div
                key={m.month}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
                title={`${m.month}: receita ${formatBRL(m.revenue_brl)} · despesa ${formatBRL(
                  m.expense_brl
                )}`}
              >
                <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 180 }}>
                  <div
                    style={{
                      width: 10,
                      height: rH,
                      background: "#10b981",
                      borderRadius: 2,
                      minHeight: 1,
                    }}
                  />
                  <div
                    style={{
                      width: 10,
                      height: eH,
                      background: "#ef4444",
                      borderRadius: 2,
                      minHeight: 1,
                    }}
                  />
                </div>
                <div style={{ fontSize: 9, color: "var(--ink-mute)" }}>
                  {m.month.slice(5)}/{m.month.slice(2, 4)}
                </div>
              </div>
            );
          })}
        </div>
        <Legend
          items={[
            { label: "Receita", color: "#10b981" },
            { label: "Despesa", color: "#ef4444" },
          ]}
        />
      </div>

      <div className="surface" style={{ padding: 20, borderRadius: 14 }}>
        <SectionTitle>Receita por arquétipo</SectionTitle>
        {summary.archetype_breakdown.length === 0 ? (
          <Empty>Nenhum estudo precificado ainda.</Empty>
        ) : (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {summary.archetype_breakdown.map((a) => (
              <div key={a.archetype}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "var(--ink-soft)",
                    marginBottom: 4,
                  }}
                >
                  <span>
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: ARCHETYPE_COLORS[a.archetype],
                        marginRight: 6,
                      }}
                    />
                    {ARCHETYPE_LABELS[a.archetype]} · {a.count}
                  </span>
                  <strong style={{ color: "var(--navy)" }}>{formatBRL(a.revenue_brl)}</strong>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "var(--line)",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${
                        summary.archetype_breakdown.reduce((m, x) => Math.max(m, x.revenue_brl), 1) > 0
                          ? (a.revenue_brl /
                              summary.archetype_breakdown.reduce(
                                (m, x) => Math.max(m, x.revenue_brl),
                                1
                              )) *
                            100
                          : 0
                      }%`,
                      height: "100%",
                      background: ARCHETYPE_COLORS[a.archetype],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <SectionTitle>Pipeline contratado</SectionTitle>
          <Row label="TCV contratado" value={formatBRL(totalContracted)} />
          <Row label="Custo estimado" value={formatBRL(totalCost)} />
          <Row
            label="Margem mistura"
            value={`${blendedMargin.toFixed(1)}%`}
            valueColor={blendedMargin >= 50 ? "#10b981" : blendedMargin >= 20 ? "#f59e0b" : "#ef4444"}
          />
        </div>
      </div>

      <div className="surface" style={{ padding: 20, borderRadius: 14, gridColumn: "span 2" }}>
        <SectionTitle>Por categoria</SectionTitle>
        {summary.by_category.length === 0 ? (
          <Empty>Lance transações pra ver o breakdown por categoria.</Empty>
        ) : (
          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            {summary.by_category
              .slice()
              .sort((a, b) => b.total_brl - a.total_brl)
              .map((c, i) => (
                <div
                  key={`${c.category_id}-${i}`}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--line)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: c.color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--navy)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={c.name}
                    >
                      {c.name}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        color: c.kind === "revenue" ? "#10b981" : "#ef4444",
                      }}
                    >
                      {c.kind === "revenue" ? "Receita" : "Despesa"}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)" }}>
                    {formatBRL(c.total_brl)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionsTab({
  transactions,
  onNew,
  onEdit,
  onDelete,
}: {
  transactions: TransactionWithJoins[];
  onNew: () => void;
  onEdit: (t: TransactionWithJoins) => void;
  onDelete: (id: string) => void;
}) {
  const [filterKind, setFilterKind] = useState<"all" | "inflow" | "outflow">("all");
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filterKind !== "all" && t.kind !== filterKind) return false;
      if (
        search &&
        !`${t.description} ${t.notes || ""} ${t.study?.title || ""} ${t.client?.name || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [transactions, filterKind, search]);

  return (
    <div className="surface" style={{ padding: 20, borderRadius: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <input
          placeholder="Buscar descrição, estudo, cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 200,
            padding: "8px 12px",
            border: "1px solid var(--line)",
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        <div style={{ display: "flex", gap: 4 }}>
          {(["all", "inflow", "outflow"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilterKind(k)}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 700,
                border: "1px solid var(--line)",
                borderRadius: 6,
                background: filterKind === k ? "var(--navy)" : "white",
                color: filterKind === k ? "white" : "var(--ink-soft)",
                cursor: "pointer",
              }}
            >
              {k === "all" ? "Todos" : k === "inflow" ? "Entradas" : "Saídas"}
            </button>
          ))}
        </div>
        <button type="button" className="btn-primary" onClick={onNew} style={{ fontSize: 12 }}>
          + Nova transação
        </button>
      </div>

      {filtered.length === 0 ? (
        <Empty>Sem transações pelos filtros.</Empty>
      ) : (
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--ink-mute)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                <th style={th}>Data</th>
                <th style={th}>Tipo</th>
                <th style={th}>Descrição</th>
                <th style={th}>Categoria</th>
                <th style={th}>Estudo / Cliente</th>
                <th style={{ ...th, textAlign: "right" }}>Valor</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={td}>
                    {new Date(t.occurred_at + "T00:00:00").toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </td>
                  <td style={td}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: 4,
                        color: t.kind === "inflow" ? "#10b981" : "#ef4444",
                        background: t.kind === "inflow" ? "#d1fae5" : "#fee2e2",
                      }}
                    >
                      {t.kind === "inflow" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  <td style={{ ...td, fontWeight: 600, color: "var(--navy)" }}>{t.description}</td>
                  <td style={td}>
                    {t.category ? (
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: t.category.color + "22",
                          color: t.category.color,
                          fontWeight: 700,
                        }}
                      >
                        {t.category.name}
                      </span>
                    ) : (
                      <span style={{ color: "var(--ink-mute)" }}>—</span>
                    )}
                  </td>
                  <td style={td}>
                    {t.study ? (
                      <div style={{ fontSize: 12 }}>
                        <div style={{ fontWeight: 600, color: "var(--navy)" }}>{t.study.title}</div>
                        {t.client && (
                          <div style={{ color: "var(--ink-mute)", fontSize: 11 }}>
                            {t.client.name}
                          </div>
                        )}
                      </div>
                    ) : t.client ? (
                      <span style={{ fontSize: 12 }}>{t.client.name}</span>
                    ) : (
                      <span style={{ color: "var(--ink-mute)" }}>—</span>
                    )}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontWeight: 800,
                      color: t.kind === "inflow" ? "#10b981" : "#ef4444",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {t.kind === "inflow" ? "+" : "−"} {formatBRL(t.amount_brl)}
                  </td>
                  <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      type="button"
                      onClick={() => onEdit(t)}
                      className="btn-ghost"
                      style={{ fontSize: 11, padding: "4px 8px" }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(t.id)}
                      className="btn-ghost"
                      style={{ fontSize: 11, padding: "4px 8px", color: "var(--danger)" }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PricingTab({
  pricings,
  studies,
  onOpen,
}: {
  pricings: StudyPricingWithJoins[];
  studies: StudyOption[];
  onOpen: (study: StudyOption, existing: StudyPricingWithJoins | null) => void;
}) {
  const priceMap = useMemo(() => {
    const m = new Map<string, StudyPricingWithJoins>();
    for (const p of pricings) m.set(p.study_id, p);
    return m;
  }, [pricings]);

  const rows = studies.map((s) => ({ study: s, pricing: priceMap.get(s.id) || null }));

  return (
    <div className="surface" style={{ padding: 20, borderRadius: 14 }}>
      <div style={{ marginBottom: 14, color: "var(--ink-soft)", fontSize: 13 }}>
        Defina arquétipo e preço para cada estudo. Receita reconhecida vai pra transações ligadas
        ao estudo.
      </div>
      {rows.length === 0 ? (
        <Empty>Nenhum estudo cadastrado.</Empty>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {rows.map(({ study, pricing }) => (
            <div
              key={study.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr auto",
                gap: 12,
                alignItems: "center",
                padding: 12,
                border: "1px solid var(--line)",
                borderRadius: 10,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: 13 }}>
                  {study.title}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                  {study.client_name || "Sem cliente"} · {study.category}
                </div>
              </div>
              <div>
                {pricing ? (
                  <Chip color={ARCHETYPE_COLORS[pricing.archetype]}>
                    {ARCHETYPE_LABELS[pricing.archetype]}
                  </Chip>
                ) : (
                  <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>—</span>
                )}
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>
                {pricing ? formatBRL(pricingTotalContractValue(pricing)) : "—"}
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>
                {pricing ? `${pricingExpectedMargin(pricing).toFixed(0)}%` : "—"}
              </div>
              <div>
                {pricing ? (
                  <Chip color={STATUS_COLORS[pricing.payment_status]}>
                    {STATUS_LABELS[pricing.payment_status]}
                  </Chip>
                ) : (
                  <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>—</span>
                )}
              </div>
              <button
                type="button"
                className={pricing ? "btn-ghost" : "btn-primary"}
                onClick={() => onOpen(study, pricing)}
                style={{ fontSize: 12 }}
              >
                {pricing ? "Editar" : "Precificar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoriesTab({
  categories,
  onChanged,
}: {
  categories: FinanceCategory[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"revenue" | "expense">("revenue");
  const [color, setColor] = useState("#52e1e7");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/finance/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, kind, color }),
    });
    setName("");
    setSaving(false);
    onChanged();
  }

  const revenue = categories.filter((c) => c.kind === "revenue");
  const expense = categories.filter((c) => c.kind === "expense");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div className="surface" style={{ padding: 20, borderRadius: 14 }}>
        <SectionTitle>Receitas</SectionTitle>
        <CatList items={revenue} />
      </div>
      <div className="surface" style={{ padding: 20, borderRadius: 14 }}>
        <SectionTitle>Despesas</SectionTitle>
        <CatList items={expense} />
      </div>
      <div className="surface" style={{ padding: 20, borderRadius: 14, gridColumn: "span 2" }}>
        <SectionTitle>Adicionar categoria</SectionTitle>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--line)",
              borderRadius: 8,
              fontSize: 13,
              flex: 1,
              minWidth: 200,
            }}
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as any)}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--line)",
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            <option value="revenue">Receita</option>
            <option value="expense">Despesa</option>
          </select>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: 40, height: 38, border: "1px solid var(--line)", borderRadius: 8 }}
          />
          <button type="button" className="btn-primary" onClick={add} disabled={saving}>
            {saving ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CatList({ items }: { items: FinanceCategory[] }) {
  if (items.length === 0) return <Empty>Nenhuma categoria.</Empty>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
      {items.map((c) => (
        <div
          key={c.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            border: "1px solid var(--line)",
            borderRadius: 8,
          }}
        >
          <span style={{ width: 10, height: 10, background: c.color, borderRadius: 2 }} />
          <span style={{ fontSize: 13, color: "var(--navy)", flex: 1 }}>{c.name}</span>
          {c.is_default && (
            <span style={{ fontSize: 10, color: "var(--ink-mute)" }}>padrão</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── UI bits ────────────────────────────────────────────────────────────────

const th: React.CSSProperties = { padding: "10px 8px", fontWeight: 700 };
const td: React.CSSProperties = { padding: "10px 8px", verticalAlign: "middle" };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--ink-mute)",
      }}
    >
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 24, textAlign: "center", color: "var(--ink-mute)", fontSize: 13 }}>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
      <span style={{ color: "var(--ink-soft)" }}>{label}</span>
      <strong style={{ color: valueColor || "var(--navy)", fontFamily: "var(--font-mono)" }}>
        {value}
      </strong>
    </div>
  );
}

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 999,
        background: color + "22",
        color,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: "var(--ink-soft)" }}>
      {items.map((i) => (
        <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{ width: 8, height: 8, background: i.color, borderRadius: 2, display: "inline-block" }}
          />
          {i.label}
        </div>
      ))}
    </div>
  );
}
