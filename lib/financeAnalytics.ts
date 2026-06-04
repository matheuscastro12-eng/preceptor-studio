import { createSupabaseServiceClient } from "@/lib/supabase";
import {
  fetchPricings,
  fetchTransactions,
  monthlyRecurringValue,
  pricingTotalContractValue,
  type InstallmentWithJoins,
  type StudyPricingWithJoins,
} from "@/lib/finance";

// ─── Helpers ────────────────────────────────────────────────────────────────

const num = (v: unknown): number => Number(v) || 0;

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addMonthsUTC(base: Date, n: number): Date {
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + n, 1));
}

// Lê parcelas de forma best-effort. Se a tabela não existir (404) ou der erro,
// retorna lista vazia, nunca lança.
async function safeFetchInstallments(): Promise<InstallmentWithJoins[]> {
  try {
    const sb = createSupabaseServiceClient();
    const { data, error } = await sb
      .from("pricing_installments")
      .select("*, study:studies(id,title,client:clients(id,name))")
      .order("due_date", { ascending: true });
    if (error) throw error;
    const rows = (data as Array<Record<string, unknown>>) || [];
    return rows.map((r) => {
      const study = r.study as { id: string; title: string; client?: { name?: string } | null } | null;
      return {
        ...(r as unknown as InstallmentWithJoins),
        study: study
          ? { id: study.id, title: study.title, client_name: study.client?.name ?? null }
          : null,
      };
    });
  } catch {
    return [];
  }
}

// ─── Tipos de retorno ─────────────────────────────────────────────────────────

export interface CashflowMonth {
  month: string; // YYYY-MM
  expected_inflow: number;
  expected_outflow: number;
  net: number;
}

export interface RevenueVsCostMonth {
  month: string; // YYYY-MM
  inflow: number;
  outflow: number;
}

export interface StudyMargin {
  pricing_id: string;
  study_id: string;
  study_title: string;
  client_name: string | null;
  tcv: number;
  estimated_cost: number;
  margin_brl: number;
  margin_pct: number;
  has_equity: boolean;
}

export interface InstallmentAlert {
  id: string;
  study_title: string;
  client_name: string | null;
  due_date: string;
  amount_brl: number;
  installment_number: number;
  total_installments: number;
  days: number; // dias até/desde o vencimento (negativo = vencida)
}

export interface InstallmentAlerts {
  overdue: InstallmentAlert[];
  overdue_total: number;
  upcoming: InstallmentAlert[];
  upcoming_total: number;
}

// ─── 1. Projeção de fluxo de caixa ────────────────────────────────────────────

export async function getCashflowProjection(months = 6): Promise<CashflowMonth[]> {
  try {
    const [pricings, installments] = await Promise.all([
      fetchPricings(),
      safeFetchInstallments(),
    ]);

    const base = new Date();
    const buckets = new Map<string, { inflow: number; outflow: number }>();
    for (let i = 0; i < months; i++) {
      buckets.set(monthKey(addMonthsUTC(base, i)), { inflow: 0, outflow: 0 });
    }

    // Receita prevista: parcelas pendentes/atrasadas com vencimento no mês.
    for (const inst of installments) {
      if (inst.status !== "pending" && inst.status !== "overdue") continue;
      const k = inst.due_date.slice(0, 7);
      const b = buckets.get(k);
      if (b) b.inflow += num(inst.amount_brl);
    }

    // Receita recorrente ativa: MRR somado a cada mês da janela.
    const mrr = pricings.reduce((acc, p) => acc + monthlyRecurringValue(p), 0);

    // Custo estimado distribuído linearmente ao longo da janela.
    const totalCost = pricings.reduce((acc, p) => acc + num(p.estimated_cost_brl), 0);
    const monthlyCost = months > 0 ? totalCost / months : 0;

    for (const [, b] of buckets) {
      b.inflow += mrr;
      b.outflow += monthlyCost;
    }

    return Array.from(buckets.entries()).map(([month, b]) => ({
      month,
      expected_inflow: b.inflow,
      expected_outflow: b.outflow,
      net: b.inflow - b.outflow,
    }));
  } catch {
    return [];
  }
}

// ─── 2. Receita vs custo realizados ───────────────────────────────────────────

export async function getRevenueVsCost(months = 6): Promise<RevenueVsCostMonth[]> {
  try {
    const txs = await fetchTransactions({});
    const base = new Date();
    const buckets = new Map<string, { inflow: number; outflow: number }>();
    for (let i = months - 1; i >= 0; i--) {
      buckets.set(monthKey(addMonthsUTC(base, -i)), { inflow: 0, outflow: 0 });
    }
    for (const t of txs) {
      const k = t.occurred_at.slice(0, 7);
      const b = buckets.get(k);
      if (!b) continue;
      if (t.kind === "inflow") b.inflow += num(t.amount_brl);
      else b.outflow += num(t.amount_brl);
    }
    return Array.from(buckets.entries()).map(([month, b]) => ({
      month,
      inflow: b.inflow,
      outflow: b.outflow,
    }));
  } catch {
    return [];
  }
}

// ─── 3. Margem por estudo ─────────────────────────────────────────────────────

export async function getMarginByStudy(): Promise<StudyMargin[]> {
  try {
    const pricings = await fetchPricings();
    const rows: StudyMargin[] = pricings.map((p: StudyPricingWithJoins) => {
      const tcv = pricingTotalContractValue(p);
      const estimated_cost = num(p.estimated_cost_brl);
      const margin_brl = tcv - estimated_cost;
      const margin_pct = tcv > 0 ? (margin_brl / tcv) * 100 : 0;
      return {
        pricing_id: p.id,
        study_id: p.study_id,
        study_title: p.study?.title ?? "Estudo sem título",
        client_name: p.study?.client_name ?? null,
        tcv,
        estimated_cost,
        margin_brl,
        margin_pct,
        has_equity: num(p.equity_pct) > 0,
      };
    });
    return rows.sort((a, b) => b.margin_brl - a.margin_brl);
  } catch {
    return [];
  }
}

// ─── 4. Alertas de parcelas ───────────────────────────────────────────────────

export async function getInstallmentAlerts(): Promise<InstallmentAlerts> {
  const empty: InstallmentAlerts = {
    overdue: [],
    overdue_total: 0,
    upcoming: [],
    upcoming_total: 0,
  };
  try {
    const installments = await safeFetchInstallments();
    const today = todayISO();
    const todayMs = new Date(today + "T00:00:00").getTime();
    const in30 = new Date();
    in30.setUTCDate(in30.getUTCDate() + 30);
    const in30ISO = in30.toISOString().slice(0, 10);

    const open = installments.filter(
      (i) => i.status === "pending" || i.status === "overdue"
    );

    const toAlert = (i: InstallmentWithJoins): InstallmentAlert => {
      const dueMs = new Date(i.due_date + "T00:00:00").getTime();
      return {
        id: i.id,
        study_title: i.study?.title ?? "Estudo",
        client_name: i.study?.client_name ?? null,
        due_date: i.due_date,
        amount_brl: num(i.amount_brl),
        installment_number: i.installment_number,
        total_installments: i.total_installments,
        days: Math.round((dueMs - todayMs) / 86_400_000),
      };
    };

    const overdue = open
      .filter((i) => i.due_date < today)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .map(toAlert);
    const upcoming = open
      .filter((i) => i.due_date >= today && i.due_date <= in30ISO)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .map(toAlert);

    return {
      overdue,
      overdue_total: overdue.reduce((acc, i) => acc + i.amount_brl, 0),
      upcoming,
      upcoming_total: upcoming.reduce((acc, i) => acc + i.amount_brl, 0),
    };
  } catch {
    return empty;
  }
}

// ─── Bundle para a página ─────────────────────────────────────────────────────

export interface FinanceAnalytics {
  cashflow: CashflowMonth[];
  revenueVsCost: RevenueVsCostMonth[];
  marginByStudy: StudyMargin[];
  alerts: InstallmentAlerts;
}

export async function getFinanceAnalytics(): Promise<FinanceAnalytics> {
  const [cashflow, revenueVsCost, marginByStudy, alerts] = await Promise.all([
    getCashflowProjection(6),
    getRevenueVsCost(6),
    getMarginByStudy(),
    getInstallmentAlerts(),
  ]);
  return { cashflow, revenueVsCost, marginByStudy, alerts };
}
