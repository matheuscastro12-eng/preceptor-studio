import { createSupabaseServiceClient } from "@/lib/supabase";

export type Archetype = "empreendimento" | "automacao" | "consultoria" | "hibrido";
export type PricingModel = "fixed" | "recurring" | "equity" | "mixed";
export type RecurringPeriod = "monthly" | "quarterly" | "yearly";
export type PaymentStatus = "pending" | "partial" | "paid" | "overdue" | "cancelled";
export type TransactionKind = "inflow" | "outflow";
export type PaymentMethod = "pix" | "boleto" | "cartao" | "transferencia" | "dinheiro" | "outro";
export type CategoryKind = "revenue" | "expense";

export interface FinanceCategory {
  id: string;
  name: string;
  kind: CategoryKind;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface StudyPricing {
  id: string;
  study_id: string;
  archetype: Archetype;
  pricing_model: PricingModel;
  fixed_amount_brl: number;
  recurring_amount_brl: number;
  recurring_period: RecurringPeriod | null;
  equity_pct: number;
  estimated_cost_brl: number;
  payment_status: PaymentStatus;
  paid_amount_brl: number;
  installments_count: number;
  first_installment_date: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InstallmentStatus = "pending" | "paid" | "overdue" | "cancelled";

export interface PricingInstallment {
  id: string;
  pricing_id: string;
  study_id: string;
  installment_number: number;
  total_installments: number;
  due_date: string;
  amount_brl: number;
  status: InstallmentStatus;
  paid_at: string | null;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstallmentWithJoins extends PricingInstallment {
  pricing?: StudyPricing | null;
  study?: { id: string; title: string; client_name?: string | null } | null;
}

export interface Transaction {
  id: string;
  kind: TransactionKind;
  amount_brl: number;
  description: string;
  category_id: string | null;
  study_id: string | null;
  client_id: string | null;
  occurred_at: string;
  payment_method: PaymentMethod | null;
  is_recurring: boolean;
  recurring_period: RecurringPeriod | null;
  attachment_url: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithJoins extends Transaction {
  category?: FinanceCategory | null;
  study?: { id: string; title: string; category: string } | null;
  client?: { id: string; name: string } | null;
}

export interface StudyPricingWithJoins extends StudyPricing {
  study?: {
    id: string;
    title: string;
    category: string;
    status: string;
    client_id: string | null;
    client_name?: string | null;
  } | null;
}

export interface FinanceSummary {
  // Receita realizada (transações de entrada)
  revenue_total_brl: number;
  revenue_ytd_brl: number;
  revenue_30d_brl: number;

  // Despesa realizada (transações de saída)
  expense_total_brl: number;
  expense_ytd_brl: number;
  expense_30d_brl: number;

  // Resultado líquido
  net_total_brl: number;
  net_ytd_brl: number;
  net_30d_brl: number;

  // Receita contratada (soma dos pricings)
  contracted_total_brl: number;
  contracted_ytd_brl: number;

  // MRR estimado
  mrr_brl: number;

  // Parcelas em aberto (a receber)
  ar_open_brl: number;
  ar_next_30d_brl: number;
  ar_overdue_brl: number;

  // Breakdowns
  archetype_breakdown: Array<{
    archetype: Archetype;
    contracted_brl: number;
    realized_brl: number;
    count: number;
  }>;
  monthly_series: Array<{ month: string; revenue_brl: number; expense_brl: number }>;
  by_category: Array<{
    category_id: string | null;
    name: string;
    kind: CategoryKind;
    total_brl: number;
    color: string;
  }>;
  upcoming_installments: InstallmentWithJoins[];
}

// ─── Helpers de cálculo ─────────────────────────────────────────────────────

const PERIOD_TO_MONTHS: Record<RecurringPeriod, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

export function monthlyRecurringValue(pricing: StudyPricing): number {
  if (!pricing.recurring_amount_brl || !pricing.recurring_period) return 0;
  return pricing.recurring_amount_brl / PERIOD_TO_MONTHS[pricing.recurring_period];
}

export function pricingTotalContractValue(pricing: StudyPricing): number {
  // Estimativa de receita contratada (sem equity): fixed + 12 meses de recorrente.
  const recurringYear = monthlyRecurringValue(pricing) * 12;
  return Number(pricing.fixed_amount_brl) + recurringYear;
}

export function pricingExpectedMargin(pricing: StudyPricing): number {
  const tcv = pricingTotalContractValue(pricing);
  if (tcv <= 0) return 0;
  return ((tcv - Number(pricing.estimated_cost_brl)) / tcv) * 100;
}

export function pricingOpenReceivable(pricing: StudyPricing): number {
  // O que falta receber do fixed (recurring é tratado por transações futuras)
  const open = Number(pricing.fixed_amount_brl) - Number(pricing.paid_amount_brl);
  return open > 0 ? open : 0;
}

// ─── Fetchers ───────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<FinanceCategory[]> {
  try {
    const sb = createSupabaseServiceClient();
    const { data, error } = await sb
      .from("finance_categories")
      .select("*")
      .order("kind", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return (data as FinanceCategory[]) || [];
  } catch {
    return [];
  }
}

export async function fetchTransactions(opts?: {
  from?: string;
  to?: string;
  kind?: TransactionKind;
  studyId?: string;
  limit?: number;
}): Promise<TransactionWithJoins[]> {
  try {
    const sb = createSupabaseServiceClient();
    let q = sb
      .from("transactions")
      .select("*, category:finance_categories(*), study:studies(id,title,category), client:clients(id,name)")
      .order("occurred_at", { ascending: false })
      .order("created_at", { ascending: false });
    if (opts?.from) q = q.gte("occurred_at", opts.from);
    if (opts?.to) q = q.lte("occurred_at", opts.to);
    if (opts?.kind) q = q.eq("kind", opts.kind);
    if (opts?.studyId) q = q.eq("study_id", opts.studyId);
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) throw error;
    return (data as TransactionWithJoins[]) || [];
  } catch {
    return [];
  }
}

export async function fetchInstallments(opts?: {
  pricingId?: string;
  studyId?: string;
  status?: InstallmentStatus | InstallmentStatus[];
  dueBefore?: string;
  dueAfter?: string;
  limit?: number;
}): Promise<InstallmentWithJoins[]> {
  try {
    const sb = createSupabaseServiceClient();
    let q = sb
      .from("pricing_installments")
      .select("*, pricing:study_pricing(*), study:studies(id,title,client:clients(id,name))")
      .order("due_date", { ascending: true })
      .order("installment_number", { ascending: true });
    if (opts?.pricingId) q = q.eq("pricing_id", opts.pricingId);
    if (opts?.studyId) q = q.eq("study_id", opts.studyId);
    if (opts?.status) {
      if (Array.isArray(opts.status)) q = q.in("status", opts.status);
      else q = q.eq("status", opts.status);
    }
    if (opts?.dueBefore) q = q.lte("due_date", opts.dueBefore);
    if (opts?.dueAfter) q = q.gte("due_date", opts.dueAfter);
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) throw error;
    const rows = (data as any[]) || [];
    return rows.map((r) => ({
      ...r,
      study: r.study
        ? {
            id: r.study.id,
            title: r.study.title,
            client_name: r.study.client?.name ?? null,
          }
        : null,
    })) as InstallmentWithJoins[];
  } catch {
    return [];
  }
}

// Gera o cronograma de parcelas a partir do pricing.
// Atomicamente: apaga parcelas existentes não-pagas e cria novas.
// Mantém parcelas já pagas (não regenera o histórico).
export async function regenerateInstallments(pricing: StudyPricing): Promise<void> {
  const sb = createSupabaseServiceClient();

  // Busca parcelas existentes
  const { data: existing } = await sb
    .from("pricing_installments")
    .select("*")
    .eq("pricing_id", pricing.id);
  const paid = ((existing as PricingInstallment[]) || []).filter((i) => i.status === "paid");
  const paidSum = paid.reduce((acc, i) => acc + Number(i.amount_brl), 0);

  // Apaga as não-pagas
  await sb
    .from("pricing_installments")
    .delete()
    .eq("pricing_id", pricing.id)
    .neq("status", "paid");

  const total = Number(pricing.fixed_amount_brl) || 0;
  const count = Math.max(1, Number(pricing.installments_count) || 1);
  const remaining = Math.max(0, total - paidSum);

  if (remaining <= 0) return;

  const remainingCount = count - paid.length;
  if (remainingCount <= 0) return;

  const baseAmount = Math.floor((remaining / remainingCount) * 100) / 100;
  // Última parcela ajusta a sobra de centavos
  const totals: number[] = Array(remainingCount).fill(baseAmount);
  const usedSum = baseAmount * remainingCount;
  totals[totals.length - 1] = Number((remaining - baseAmount * (remainingCount - 1)).toFixed(2));

  const startISO = pricing.first_installment_date || pricing.start_date || new Date().toISOString().slice(0, 10);
  const start = new Date(startISO + "T00:00:00");

  const rows = totals.map((amt, idx) => {
    const d = new Date(start);
    d.setMonth(d.getMonth() + (paid.length + idx));
    return {
      pricing_id: pricing.id,
      study_id: pricing.study_id,
      installment_number: paid.length + idx + 1,
      total_installments: count,
      due_date: d.toISOString().slice(0, 10),
      amount_brl: amt,
      status: "pending" as const,
    };
  });

  if (rows.length > 0) {
    await sb.from("pricing_installments").insert(rows);
  }
}

export async function fetchPricings(): Promise<StudyPricingWithJoins[]> {
  try {
    const sb = createSupabaseServiceClient();
    const { data, error } = await sb
      .from("study_pricing")
      .select(
        "*, study:studies(id,title,category,status,client_id,client:clients(id,name))"
      )
      .order("updated_at", { ascending: false });
    if (error) throw error;
    const rows = (data as any[]) || [];
    return rows.map((r) => ({
      ...r,
      study: r.study
        ? {
            id: r.study.id,
            title: r.study.title,
            category: r.study.category,
            status: r.study.status,
            client_id: r.study.client_id,
            client_name: r.study.client?.name ?? null,
          }
        : null,
    })) as StudyPricingWithJoins[];
  } catch {
    return [];
  }
}

// ─── Summary agregado ───────────────────────────────────────────────────────

function startOfYearISO(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1)).toISOString().slice(0, 10);
}
function nDaysAgoISO(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export async function fetchSummary(): Promise<FinanceSummary> {
  const [txs, pricings, cats, allInstallments] = await Promise.all([
    fetchTransactions({}),
    fetchPricings(),
    fetchCategories(),
    fetchInstallments({}),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const ytdFrom = startOfYearISO();
  const d30From = nDaysAgoISO(30);
  const in30Days = (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 30);
    return d.toISOString().slice(0, 10);
  })();
  const num = (v: any) => Number(v) || 0;

  const sum = (rows: TransactionWithJoins[], kind: TransactionKind, fromISO?: string) =>
    rows
      .filter((t) => t.kind === kind && (!fromISO || t.occurred_at >= fromISO))
      .reduce((acc, t) => acc + num(t.amount_brl), 0);

  const revenue_total_brl = sum(txs, "inflow");
  const expense_total_brl = sum(txs, "outflow");
  const revenue_ytd_brl = sum(txs, "inflow", ytdFrom);
  const expense_ytd_brl = sum(txs, "outflow", ytdFrom);
  const revenue_30d_brl = sum(txs, "inflow", d30From);
  const expense_30d_brl = sum(txs, "outflow", d30From);

  // Receita contratada: soma do TCV de todos pricings
  const contracted_total_brl = pricings.reduce((acc, p) => acc + pricingTotalContractValue(p), 0);
  const contracted_ytd_brl = pricings
    .filter((p) => p.created_at >= ytdFrom)
    .reduce((acc, p) => acc + pricingTotalContractValue(p), 0);

  // MRR: soma das recurrings ativas
  const mrr_brl = pricings.reduce((acc, p) => acc + monthlyRecurringValue(p), 0);

  // AR aberto: soma das parcelas pendentes ou atrasadas
  const openInstallments = allInstallments.filter(
    (i) => i.status === "pending" || i.status === "overdue"
  );
  const ar_open_brl = openInstallments.reduce((acc, i) => acc + num(i.amount_brl), 0);
  const ar_overdue_brl = allInstallments
    .filter((i) => (i.status === "pending" || i.status === "overdue") && i.due_date < today)
    .reduce((acc, i) => acc + num(i.amount_brl), 0);
  const ar_next_30d_brl = allInstallments
    .filter(
      (i) =>
        (i.status === "pending" || i.status === "overdue") &&
        i.due_date >= today &&
        i.due_date <= in30Days
    )
    .reduce((acc, i) => acc + num(i.amount_brl), 0);

  // Próximas 10 parcelas (não pagas, ordenadas por vencimento)
  const upcoming_installments = openInstallments
    .filter((i) => i.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 10);

  // Breakdown por arquétipo: contratado vs realizado
  const studyToArchetype: Record<string, Archetype> = {};
  for (const p of pricings) studyToArchetype[p.study_id] = p.archetype;

  const archMap = new Map<Archetype, { contracted_brl: number; realized_brl: number; count: number }>();
  for (const p of pricings) {
    const a = p.archetype;
    if (!archMap.has(a)) archMap.set(a, { contracted_brl: 0, realized_brl: 0, count: 0 });
    const e = archMap.get(a)!;
    e.count += 1;
    e.contracted_brl += pricingTotalContractValue(p);
  }
  for (const t of txs) {
    if (t.kind !== "inflow" || !t.study_id) continue;
    const arche = studyToArchetype[t.study_id];
    if (!arche) continue;
    const e = archMap.get(arche);
    if (e) e.realized_brl += num(t.amount_brl);
  }
  const archetype_breakdown = Array.from(archMap.entries()).map(([archetype, v]) => ({
    archetype,
    contracted_brl: v.contracted_brl,
    realized_brl: v.realized_brl,
    count: v.count,
  }));

  // Série mensal (12 meses)
  const monthBuckets: Record<string, { revenue_brl: number; expense_brl: number }> = {};
  const nowDate = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth() - i, 1));
    const k = d.toISOString().slice(0, 7);
    monthBuckets[k] = { revenue_brl: 0, expense_brl: 0 };
  }
  for (const t of txs) {
    const k = t.occurred_at.slice(0, 7);
    if (!monthBuckets[k]) continue;
    if (t.kind === "inflow") monthBuckets[k].revenue_brl += num(t.amount_brl);
    else monthBuckets[k].expense_brl += num(t.amount_brl);
  }
  const monthly_series = Object.entries(monthBuckets).map(([month, v]) => ({
    month,
    revenue_brl: v.revenue_brl,
    expense_brl: v.expense_brl,
  }));

  // Breakdown por categoria
  const catMap = new Map<string, { name: string; kind: CategoryKind; total_brl: number; color: string }>();
  for (const c of cats) {
    catMap.set(c.id, { name: c.name, kind: c.kind, total_brl: 0, color: c.color });
  }
  const orphans = new Map<string, { name: string; kind: CategoryKind; total_brl: number; color: string }>();
  for (const t of txs) {
    const key = t.category_id;
    if (key && catMap.has(key)) {
      catMap.get(key)!.total_brl += num(t.amount_brl);
    } else {
      const k = t.kind === "inflow" ? "_other_revenue" : "_other_expense";
      if (!orphans.has(k))
        orphans.set(k, {
          name: t.kind === "inflow" ? "(sem categoria)" : "(sem categoria)",
          kind: t.kind === "inflow" ? "revenue" : "expense",
          total_brl: 0,
          color: "#cbd5e1",
        });
      orphans.get(k)!.total_brl += num(t.amount_brl);
    }
  }
  const by_category = [
    ...Array.from(catMap.entries()).map(([category_id, v]) => ({
      category_id,
      name: v.name,
      kind: v.kind,
      total_brl: v.total_brl,
      color: v.color,
    })),
    ...Array.from(orphans.values()).map((v) => ({
      category_id: null as string | null,
      name: v.name,
      kind: v.kind,
      total_brl: v.total_brl,
      color: v.color,
    })),
  ].filter((c) => c.total_brl > 0);

  return {
    revenue_total_brl,
    revenue_ytd_brl,
    revenue_30d_brl,
    expense_total_brl,
    expense_ytd_brl,
    expense_30d_brl,
    net_total_brl: revenue_total_brl - expense_total_brl,
    net_ytd_brl: revenue_ytd_brl - expense_ytd_brl,
    net_30d_brl: revenue_30d_brl - expense_30d_brl,
    contracted_total_brl,
    contracted_ytd_brl,
    mrr_brl,
    ar_open_brl,
    ar_next_30d_brl,
    ar_overdue_brl,
    archetype_breakdown,
    monthly_series,
    by_category,
    upcoming_installments,
  };
}

// ─── Formatters ─────────────────────────────────────────────────────────────

export function formatBRL(v: number | string | null | undefined): string {
  const n = Number(v) || 0;
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });
}

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  empreendimento: "Empreendimento",
  automacao: "Automação",
  consultoria: "Consultoria recorrente",
  hibrido: "Híbrido",
};

export const ARCHETYPE_COLORS: Record<Archetype, string> = {
  empreendimento: "#f59e0b",
  automacao: "#5d57eb",
  consultoria: "#52e1e7",
  hibrido: "#10b981",
};

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendente",
  partial: "Parcial",
  paid: "Pago",
  overdue: "Atrasado",
  cancelled: "Cancelado",
};

export const STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: "#94a3b8",
  partial: "#f59e0b",
  paid: "#10b981",
  overdue: "#ef4444",
  cancelled: "#64748b",
};
