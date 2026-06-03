import { createSupabaseServiceClient } from "@/lib/supabase";
import type { Lead } from "@/lib/leads";
import type {
  Assignee,
  Category,
  StudyStatus,
  StudyWithClient,
  TaskStatus,
} from "@/lib/store";

export interface StudyRow extends StudyWithClient {
  // alias so views can use `client_name`
  client_name?: string;
}

export async function fetchStudies(): Promise<StudyWithClient[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("studies")
      .select("*, client:clients(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as StudyWithClient[]) || [];
  } catch {
    return [];
  }
}

export async function fetchLeads(): Promise<Lead[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Lead[]) || [];
  } catch {
    return [];
  }
}

export interface DashboardCounts {
  totalStudies: number;
  completed: number;
  generating: number;
  totalLeads: number;
  newLeads: number;
  avgScore: number;
}

export function studyOverall(s: StudyWithClient): number | null {
  const v = s.scores?.client_facing?.overall;
  return typeof v === "number" ? v : null;
}

export function summarize(
  studies: StudyWithClient[],
  leads: Lead[]
): DashboardCounts {
  const completed = studies.filter((s) => s.status === "completed").length;
  const generating = studies.filter((s) => s.status === "generating").length;
  const withScore = studies
    .map((s) => studyOverall(s))
    .filter((v): v is number => v !== null);
  const avgScore =
    withScore.length > 0
      ? Math.round(withScore.reduce((a, b) => a + b, 0) / withScore.length)
      : 0;
  return {
    totalStudies: studies.length,
    completed,
    generating,
    totalLeads: leads.length,
    newLeads: leads.filter((l) => l.status === "novo").length,
    avgScore,
  };
}

export function leadRecommendation(
  score: number | null | undefined
): "ENTRAR" | "OBSERVAR" | "NAO_ENTRAR" | null {
  if (typeof score !== "number") return null;
  if (score >= 75) return "ENTRAR";
  if (score >= 50) return "OBSERVAR";
  return "NAO_ENTRAR";
}

// ─── Tasks aggregations (cronograma + execução) ──────────────────────

export interface TaskRow {
  id: string;
  study_id: string;
  sprint: number;
  title: string;
  description: string | null;
  assignee: Assignee | null;
  estimated_hours: number | null;
  status: TaskStatus;
  order_index: number;
  milestone: boolean;
  depends_on: unknown[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StudySummary {
  id: string;
  title: string;
  category: Category;
  status: StudyStatus;
  created_at: string;
  client_name: string | null;
}

export interface StudyWithTasks {
  study: StudySummary;
  tasks: TaskRow[];
}

export interface TaskWithStudy extends TaskRow {
  study_title: string;
  study_category: Category;
}

const ACTIVE_STUDY_STATUSES: StudyStatus[] = ["questionnaire", "completed"];

function toStudySummary(row: {
  id: string;
  title: string;
  category: Category;
  status: StudyStatus;
  created_at: string;
  client?: { name?: string | null } | null;
}): StudySummary {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    status: row.status,
    created_at: row.created_at,
    client_name: row.client?.name ?? null,
  };
}

export async function getActiveStudiesWithTasks(): Promise<StudyWithTasks[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data: studies, error: studiesErr } = await supabase
      .from("studies")
      .select("id, title, category, status, created_at, client:clients(name)")
      .in("status", ACTIVE_STUDY_STATUSES)
      .order("created_at", { ascending: true });
    if (studiesErr) throw studiesErr;
    const studyList = (studies ?? []) as Array<{
      id: string;
      title: string;
      category: Category;
      status: StudyStatus;
      created_at: string;
      client?: { name?: string | null } | null;
    }>;
    if (studyList.length === 0) return [];

    const ids = studyList.map((s) => s.id);
    const { data: tasks, error: tasksErr } = await supabase
      .from("tasks")
      .select("*")
      .in("study_id", ids)
      .order("sprint", { ascending: true })
      .order("order_index", { ascending: true })
      .limit(2000);
    if (tasksErr) throw tasksErr;

    const taskList = (tasks ?? []) as TaskRow[];
    const byStudy = new Map<string, TaskRow[]>();
    for (const t of taskList) {
      const arr = byStudy.get(t.study_id) ?? [];
      arr.push(t);
      byStudy.set(t.study_id, arr);
    }
    return studyList.map((s) => ({
      study: toStudySummary(s),
      tasks: byStudy.get(s.id) ?? [],
    }));
  } catch {
    return [];
  }
}

export async function getAllOpenTasks(): Promise<TaskWithStudy[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data: studies, error: studiesErr } = await supabase
      .from("studies")
      .select("id, title, category, status")
      .in("status", ACTIVE_STUDY_STATUSES);
    if (studiesErr) throw studiesErr;
    const studyList = (studies ?? []) as Array<{
      id: string;
      title: string;
      category: Category;
      status: StudyStatus;
    }>;
    if (studyList.length === 0) return [];
    const meta = new Map<string, { title: string; category: Category }>();
    for (const s of studyList) {
      meta.set(s.id, { title: s.title, category: s.category });
    }
    const ids = studyList.map((s) => s.id);
    const { data: tasks, error: tasksErr } = await supabase
      .from("tasks")
      .select("*")
      .in("study_id", ids)
      .order("sprint", { ascending: true })
      .order("order_index", { ascending: true })
      .limit(200);
    if (tasksErr) throw tasksErr;
    const taskList = (tasks ?? []) as TaskRow[];
    return taskList
      .filter((t) => meta.has(t.study_id))
      .map((t) => {
        const m = meta.get(t.study_id)!;
        return {
          ...t,
          study_title: m.title,
          study_category: m.category,
        };
      });
  } catch {
    return [];
  }
}

// ─── A/B testing aggregation ────────────────────────────────────────────────

interface AbEventRow {
  experiment: string;
  variant: string;
  event_type: string;
}

export interface AbVariantResult {
  variant: string;
  impressions: number;
  clicks: number;
  ctr: number; // 0-100, percentage
  isWinner: boolean;
}

export interface AbExperimentResult {
  experiment: string;
  variants: AbVariantResult[];
  totalImpressions: number;
  totalClicks: number;
  hasEnoughData: boolean; // winner only meaningful when a variant has >= 30 impressions
}

const AB_WINNER_MIN_IMPRESSIONS = 30;

export async function getAbResults(): Promise<AbExperimentResult[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("ab_events")
      .select("experiment, variant, event_type");
    if (error) throw error;

    const rows = (data as AbEventRow[]) || [];

    // experiment -> variant -> { impressions, clicks }
    const byExperiment = new Map<
      string,
      Map<string, { impressions: number; clicks: number }>
    >();

    for (const row of rows) {
      if (!row.experiment || !row.variant) continue;
      let variants = byExperiment.get(row.experiment);
      if (!variants) {
        variants = new Map();
        byExperiment.set(row.experiment, variants);
      }
      let counts = variants.get(row.variant);
      if (!counts) {
        counts = { impressions: 0, clicks: 0 };
        variants.set(row.variant, counts);
      }
      if (row.event_type === "impression") counts.impressions += 1;
      else if (row.event_type === "click") counts.clicks += 1;
    }

    const results: AbExperimentResult[] = [];

    for (const [experiment, variantMap] of byExperiment) {
      const variants: AbVariantResult[] = [...variantMap.entries()]
        .map(([variant, counts]) => ({
          variant,
          impressions: counts.impressions,
          clicks: counts.clicks,
          ctr:
            counts.impressions > 0
              ? (counts.clicks / counts.impressions) * 100
              : 0,
          isWinner: false,
        }))
        .sort((a, b) => a.variant.localeCompare(b.variant));

      // Winner: highest CTR among variants with enough impressions.
      const eligible = variants.filter(
        (v) => v.impressions >= AB_WINNER_MIN_IMPRESSIONS
      );
      let hasEnoughData = false;
      if (eligible.length > 0) {
        const best = eligible.reduce((acc, v) => (v.ctr > acc.ctr ? v : acc));
        // Only crown a winner if it has a strictly higher CTR than the rest.
        const tied = eligible.filter((v) => v.ctr === best.ctr).length > 1;
        if (!tied) {
          best.isWinner = true;
          hasEnoughData = true;
        } else {
          hasEnoughData = true;
        }
      }

      results.push({
        experiment,
        variants,
        totalImpressions: variants.reduce((s, v) => s + v.impressions, 0),
        totalClicks: variants.reduce((s, v) => s + v.clicks, 0),
        hasEnoughData,
      });
    }

    return results.sort((a, b) => a.experiment.localeCompare(b.experiment));
  } catch {
    return [];
  }
}

// ─── Revenue intelligence ────────────────────────────────────────────────
// Premissas (documentadas no relatório e aqui):
// - Probabilidade por estágio (deal não fechado): novo=10%, contatado=25%,
//   qualificado=45%, proposta=70%. Ganho=100% e perdido=0% não entram no
//   pipeline ponderado.
// - MRR projetado: soma do estimated_value dos leads ganhos dividido por 12
//   (premissa de um contrato anual amortizado em 12 meses).

const STAGE_PROBABILITY: Record<string, number> = {
  novo: 0.1,
  contatado: 0.25,
  qualificado: 0.45,
  proposta: 0.7,
};

export interface RevenueMetrics {
  weightedPipeline: number;
  projectedMrr: number;
  averageTicket: number;
  conversionRate: number;
  closedValue: number;
  funnel: Array<{ stage: string; value: number }>;
}

export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  const empty: RevenueMetrics = {
    weightedPipeline: 0,
    projectedMrr: 0,
    averageTicket: 0,
    conversionRate: 0,
    closedValue: 0,
    funnel: [],
  };
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("leads")
      .select("status, estimated_value");
    if (error) throw error;
    const rows = (data ?? []) as Array<{
      status: string;
      estimated_value: number | null;
    }>;

    let weightedPipeline = 0;
    const funnelMap: Record<string, number> = {
      novo: 0,
      contatado: 0,
      qualificado: 0,
      proposta: 0,
    };
    const wonValues: number[] = [];
    let wonCount = 0;
    let lostCount = 0;

    for (const r of rows) {
      const val = typeof r.estimated_value === "number" ? r.estimated_value : 0;
      if (r.status === "ganho") {
        wonCount += 1;
        if (val > 0) wonValues.push(val);
      } else if (r.status === "perdido") {
        lostCount += 1;
      } else if (r.status in STAGE_PROBABILITY) {
        weightedPipeline += val * STAGE_PROBABILITY[r.status];
        funnelMap[r.status] += val;
      }
    }

    const wonTotal = wonValues.reduce((a, b) => a + b, 0);
    const projectedMrr = Math.round(wonTotal / 12);

    let averageTicket = 0;
    if (wonValues.length > 0) {
      averageTicket = Math.round(wonTotal / wonValues.length);
    } else {
      const pipelineVals = rows
        .filter((r) => r.status in STAGE_PROBABILITY)
        .map((r) => (typeof r.estimated_value === "number" ? r.estimated_value : 0))
        .filter((v) => v > 0);
      averageTicket =
        pipelineVals.length > 0
          ? Math.round(pipelineVals.reduce((a, b) => a + b, 0) / pipelineVals.length)
          : 0;
    }

    const decided = wonCount + lostCount;
    const conversionRate = decided > 0 ? Math.round((wonCount / decided) * 100) : 0;

    return {
      weightedPipeline: Math.round(weightedPipeline),
      projectedMrr,
      averageTicket,
      conversionRate,
      closedValue: Math.round(wonTotal),
      funnel: [
        { stage: "novo", value: funnelMap.novo },
        { stage: "contatado", value: funnelMap.contatado },
        { stage: "qualificado", value: funnelMap.qualificado },
        { stage: "proposta", value: funnelMap.proposta },
      ],
    };
  } catch {
    return empty;
  }
}

export interface HotLead {
  id: string;
  name: string;
  company: string | null;
  priority_score: number | null;
  summary_line: string | null;
}

export async function getHotLeads(limit = 5): Promise<HotLead[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("leads")
      .select("id, name, company, priority_score, summary_line")
      .not("priority_score", "is", null)
      .order("priority_score", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as HotLead[];
  } catch {
    return [];
  }
}

// ─── Finance: deals table, revenue by month, studio summary ────────────────
// Probabilidade por estágio reaproveitada de STAGE_PROBABILITY. Ganho=100%.

export const STAGE_PROBABILITY_FULL: Record<string, number> = {
  novo: 0.1,
  contatado: 0.25,
  qualificado: 0.45,
  proposta: 0.7,
  ganho: 1,
  perdido: 0,
};

export function stageProbability(status: string): number {
  return STAGE_PROBABILITY_FULL[status] ?? 0;
}

export interface FinanceDeal {
  id: string;
  name: string;
  company: string | null;
  status: string;
  estimated_value: number;
  assignee: string | null;
  probability: number; // 0-1
  weighted: number; // estimated_value * probability
}

// Deals em estágios de alto valor (qualificado, proposta, ganho), maior valor primeiro.
export async function getFinanceDeals(): Promise<FinanceDeal[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("leads")
      .select("id, name, company, status, estimated_value, assignee")
      .in("status", ["qualificado", "proposta", "ganho"]);
    if (error) throw error;
    const rows = (data ?? []) as Array<{
      id: string;
      name: string;
      company: string | null;
      status: string;
      estimated_value: number | null;
      assignee: string | null;
    }>;
    return rows
      .map((r) => {
        const value =
          typeof r.estimated_value === "number" ? r.estimated_value : 0;
        const probability = stageProbability(r.status);
        return {
          id: r.id,
          name: r.name,
          company: r.company,
          status: r.status,
          estimated_value: value,
          assignee: r.assignee,
          probability,
          weighted: Math.round(value * probability),
        };
      })
      .sort((a, b) => b.estimated_value - a.estimated_value);
  } catch {
    return [];
  }
}

export interface MonthPoint {
  label: string; // ex: "jan"
  value: number; // valor R$ fechado no mês
  count: number; // deals fechados no mês
}

// Valor fechado (status='ganho') por mês nos últimos `months` meses.
export async function getRevenueByMonth(months = 6): Promise<MonthPoint[]> {
  const monthNames = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];
  const now = new Date();
  const buckets: MonthPoint[] = [];
  const keyToIndex = new Map<string, number>();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    keyToIndex.set(key, buckets.length);
    buckets.push({ label: monthNames[d.getMonth()], value: 0, count: 0 });
  }
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("leads")
      .select("status, estimated_value, qualified_at, updated_at, created_at")
      .eq("status", "ganho");
    if (error) throw error;
    const rows = (data ?? []) as Array<{
      estimated_value: number | null;
      qualified_at: string | null;
      updated_at: string | null;
      created_at: string;
    }>;
    for (const r of rows) {
      // Quando o deal foi fechado: usa qualified_at/updated_at se houver, senão created_at.
      const iso = r.qualified_at || r.updated_at || r.created_at;
      if (!iso) continue;
      const d = new Date(iso);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = keyToIndex.get(key);
      if (idx === undefined) continue;
      const val = typeof r.estimated_value === "number" ? r.estimated_value : 0;
      buckets[idx].value += val;
      buckets[idx].count += 1;
    }
    return buckets;
  } catch {
    return buckets;
  }
}

export interface FinanceSummary {
  closedRevenue: number; // soma estimated_value dos ganhos
  openDeals: number; // count novo/contatado/qualificado/proposta
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("leads")
      .select("status, estimated_value");
    if (error) throw error;
    const rows = (data ?? []) as Array<{
      status: string;
      estimated_value: number | null;
    }>;
    let closedRevenue = 0;
    let openDeals = 0;
    const openStatuses = new Set([
      "novo",
      "contatado",
      "qualificado",
      "proposta",
    ]);
    for (const r of rows) {
      const val = typeof r.estimated_value === "number" ? r.estimated_value : 0;
      if (r.status === "ganho") closedRevenue += val;
      else if (openStatuses.has(r.status)) openDeals += 1;
    }
    return { closedRevenue, openDeals };
  } catch {
    return { closedRevenue: 0, openDeals: 0 };
  }
}

// Formata em BRL completo (sem abreviação k), para tabelas onde precisão importa.
export function formatBRLFull(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatBRL(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    const rounded = k >= 100 ? Math.round(k) : Math.round(k * 10) / 10;
    return `R$ ${rounded}k`;
  }
  return `R$ ${Math.round(value)}`;
}

export function relativeDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 1) return "hoje";
  if (days < 2) return "1 dia";
  if (days < 30) return `${days}d`;
  return d.toLocaleDateString("pt-BR");
}
