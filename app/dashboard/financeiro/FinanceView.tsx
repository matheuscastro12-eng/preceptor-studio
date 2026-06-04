"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ARCHETYPE_COLORS,
  ARCHETYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatBRL,
  pricingExpectedMargin,
  pricingTotalContractValue,
  type Archetype,
  type FinanceCategory,
  type FinanceSummary,
  type StudyPricingWithJoins,
  type TransactionWithJoins,
} from "@/lib/finance";
import type { FinanceAnalytics } from "@/lib/financeAnalytics";
import { TransactionForm } from "./TransactionForm";
import { PricingForm } from "./PricingForm";
import {
  AlertCards,
  CashflowChart,
  MarginByStudyTable,
  RevenueVsCostChart,
} from "./FinanceCharts";

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
  analytics: FinanceAnalytics;
}

export function FinanceView({
  summary,
  initialTransactions,
  initialPricings,
  categories,
  studies,
  analytics,
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
    <div className="fin-page">
      <div className="page-head">
        <div>
          <div className="fin-eyebrow">Financeiro · PRECEPTOR! Venture Studio</div>
          <h1 className="fin-title">Financeiro</h1>
          <p className="sub">
            Caixa, precificação e P&amp;L: receita por estudo, projeção de fluxo e parcelas a
            receber.
          </p>
        </div>
        <div className="fin-head-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setTab("pricing")}
            style={{ fontSize: 13 }}
          >
            Precificar estudo
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setEditingTx(null);
              setShowTxForm(true);
            }}
            style={{ fontSize: 13 }}
          >
            + Novo lançamento
          </button>
        </div>
      </div>

      <KpiGroups summary={summary} />

      <nav className="fin-tabs">
        {(
          [
            { k: "overview", l: "Visão geral" },
            { k: "transactions", l: "Transações", n: transactions.length },
            { k: "pricing", l: "Precificação", n: pricings.length },
            { k: "categories", l: "Categorias", n: categories.length },
          ] as { k: Tab; l: string; n?: number }[]
        ).map((t) => {
          const active = tab === t.k;
          return (
            <button
              key={t.k}
              type="button"
              onClick={() => setTab(t.k)}
              className={"fin-tab" + (active ? " active" : "")}
            >
              {t.l}
              {typeof t.n === "number" && <span className="fin-tab__count">{t.n}</span>}
            </button>
          );
        })}
      </nav>

      {tab === "overview" && (
        <Overview
          summary={summary}
          pricings={pricings}
          analytics={analytics}
          onPayInstallment={async (id) => {
            const res = await fetch(`/api/finance/installments/${id}/pay`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
            });
            if (res.ok) refresh();
          }}
        />
      )}
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
          onDelete={async (pricingId) => {
            if (
              !confirm(
                "Excluir a precificação deste estudo? As parcelas pendentes serão removidas (as já pagas e a transação ficam preservadas no histórico)."
              )
            )
              return;
            const res = await fetch(`/api/finance/pricing/${pricingId}`, { method: "DELETE" });
            if (res.ok) {
              setPricings((prev) => prev.filter((p) => p.id !== pricingId));
              refresh();
            }
          }}
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

function KpiGroups({ summary }: { summary: FinanceSummary }) {
  const items: Array<{ label: string; value: number; accent: string; help: string }> = [
    {
      label: "Faturamento fechado",
      value: summary.revenue_ytd_brl,
      accent: "var(--success)",
      help: "Receita realizada (entradas) registrada neste ano.",
    },
    {
      label: "A receber",
      value: summary.ar_open_brl,
      accent: "var(--warning)",
      help: "Soma das parcelas pendentes ou atrasadas.",
    },
    {
      label: "Custo (YTD)",
      value: summary.expense_ytd_brl,
      accent: "var(--danger-rose)",
      help: "Despesa realizada (saídas) registrada neste ano.",
    },
    {
      label: "Margem (YTD)",
      value: summary.net_ytd_brl,
      accent: summary.net_ytd_brl >= 0 ? "var(--navy)" : "var(--danger-rose)",
      help: "Receita menos despesa realizada neste ano.",
    },
    {
      label: "Recorrente / MRR",
      value: summary.mrr_brl,
      accent: "var(--cyan-deep)",
      help: "Soma mensal das receitas recorrentes dos estudos ativos.",
    },
    {
      label: "Em aberto / atrasado",
      value: summary.ar_overdue_brl,
      accent: "var(--danger-rose)",
      help: "Parcelas pendentes com vencimento já passado.",
    },
  ];
  return (
    <div className="fin-kpis">
      {items.map((it) => (
        <div key={it.label} className="fin-kpi" title={it.help}>
          <div className="fin-kpi__bar" style={{ background: it.accent }} />
          <div className="fin-kpi__label">{it.label}</div>
          <div className="fin-kpi__value" style={{ color: it.accent }}>
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
  analytics,
  onPayInstallment,
}: {
  summary: FinanceSummary;
  pricings: StudyPricingWithJoins[];
  analytics: FinanceAnalytics;
  onPayInstallment: (id: string) => void;
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
      <div style={{ gridColumn: "span 2" }}>
        <AlertCards alerts={analytics.alerts} />
      </div>

      <div style={{ gridColumn: "span 2" }}>
        <CashflowChart data={analytics.cashflow} />
      </div>

      <div>
        <RevenueVsCostChart data={analytics.revenueVsCost} />
      </div>

      <div>
        <MarginByStudyTable data={analytics.marginByStudy} />
      </div>

      <div className="surface" style={{ padding: 20, borderRadius: 14, gridColumn: "span 2" }}>
        <SectionTitle>Próximas parcelas a receber</SectionTitle>
        {summary.upcoming_installments.length === 0 ? (
          <Empty>
            Nenhuma parcela pendente. Quando você precificar um estudo com parcelas, elas aparecem
            aqui.
          </Empty>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
            {summary.upcoming_installments.map((i) => (
              <div
                key={i.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto auto",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  background: i.due_date < new Date().toISOString().slice(0, 10) ? "#fef2f2" : "white",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--ink-mute)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new Date(i.due_date + "T00:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--navy)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {i.study?.title || "·"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                    {i.study?.client_name ? `${i.study.client_name} · ` : ""}Parcela{" "}
                    {i.installment_number}/{i.total_installments}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    color: "var(--navy)",
                  }}
                >
                  {formatBRL(i.amount_brl)}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: i.due_date < new Date().toISOString().slice(0, 10) ? "#fee2e2" : "#dbeafe",
                    color: i.due_date < new Date().toISOString().slice(0, 10) ? "#dc2626" : "#1e40af",
                    textTransform: "uppercase",
                  }}
                >
                  {i.due_date < new Date().toISOString().slice(0, 10) ? "Atrasada" : "Pendente"}
                </span>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onPayInstallment(i.id)}
                  style={{ fontSize: 11, padding: "6px 10px" }}
                >
                  Marcar paga
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
            {summary.archetype_breakdown.map((a) => {
              const maxContracted = Math.max(
                1,
                ...summary.archetype_breakdown.map((x) => x.contracted_brl)
              );
              return (
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
                      {ARCHETYPE_LABELS[a.archetype]} · {a.count} estudo{a.count !== 1 ? "s" : ""}
                    </span>
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
                        width: `${(a.contracted_brl / maxContracted) * 100}%`,
                        height: "100%",
                        background: ARCHETYPE_COLORS[a.archetype],
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      marginTop: 4,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <span style={{ color: "var(--ink-mute)" }}>
                      contratado: <strong style={{ color: "var(--navy)" }}>{formatBRL(a.contracted_brl)}</strong>
                    </span>
                    <span style={{ color: "var(--ink-mute)" }}>
                      realizado: <strong style={{ color: "#10b981" }}>{formatBRL(a.realized_brl)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
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
                      <span style={{ color: "var(--ink-mute)" }}>·</span>
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
                      <span style={{ color: "var(--ink-mute)" }}>·</span>
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
  onDelete,
}: {
  pricings: StudyPricingWithJoins[];
  studies: StudyOption[];
  onOpen: (study: StudyOption, existing: StudyPricingWithJoins | null) => void;
  onDelete: (pricingId: string) => void;
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
                  <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>·</span>
                )}
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>
                {pricing ? formatBRL(pricingTotalContractValue(pricing)) : "·"}
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>
                {pricing ? `${pricingExpectedMargin(pricing).toFixed(0)}%` : "·"}
              </div>
              <div>
                {pricing ? (
                  <Chip color={STATUS_COLORS[pricing.payment_status]}>
                    {STATUS_LABELS[pricing.payment_status]}
                  </Chip>
                ) : (
                  <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>·</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  className={pricing ? "btn-ghost" : "btn-primary"}
                  onClick={() => onOpen(study, pricing)}
                  style={{ fontSize: 12 }}
                >
                  {pricing ? "Editar" : "Precificar"}
                </button>
                {pricing && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => onDelete(pricing.id)}
                    style={{ fontSize: 12, color: "var(--danger)" }}
                    title="Excluir precificação e parcelas pendentes"
                  >
                    Excluir
                  </button>
                )}
              </div>
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
