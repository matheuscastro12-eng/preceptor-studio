import { createSupabaseServiceClient } from "@/lib/supabase";

// ── Domínio da Venture ───────────────────────────────────────────────────────

export const VENTURE_STAGES = [
  "lead",
  "diagnostico",
  "estudo",
  "proposta",
  "onboarding",
  "execucao",
  "manutencao",
  "equity",
  "encerrada",
] as const;
export type VentureStage = (typeof VENTURE_STAGES)[number];

export const STAGE_LABEL: Record<VentureStage, string> = {
  lead: "Lead",
  diagnostico: "Diagnóstico",
  estudo: "Estudo",
  proposta: "Proposta",
  onboarding: "Onboarding",
  execucao: "Execução",
  manutencao: "Manutenção",
  equity: "Equity",
  encerrada: "Encerrada",
};

export type VentureHealth = "verde" | "amarelo" | "vermelho";
export type VentureLayer = "estudo" | "execucao" | "manutencao";
export type EquityStatus = "negociando" | "assinado" | "vesting" | "exit";

export interface Venture {
  id: string;
  client_id: string | null;
  lead_id: string | null;
  referred_by_venture_id: string | null;
  name: string;
  slug: string | null;
  stage: VentureStage;
  health: VentureHealth;
  layer: VentureLayer | null;
  owner_team_key: string | null;
  mrr_brl: number | null;
  stripe_subscription_id: string | null;
  equity_pct: number | null;
  fair_value_brl: number | null;
  equity_status: EquityStatus | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  venture_id: string;
  task_id: string | null;
  member_key: string | null;
  hours: number;
  hourly_cost_brl: number;
  entry_date: string;
  notes: string | null;
  created_at: string;
}

export interface CostEntry {
  id: string;
  venture_id: string;
  study_id: string | null;
  cost_type: "ia_anthropic" | "infra" | "saas" | "freelance" | "outro";
  amount_brl: number;
  tokens_in: number | null;
  tokens_out: number | null;
  model: string | null;
  description: string | null;
  incurred_at: string;
  created_at: string;
}

export interface VentureMetrics {
  receita_realizada: number; // soma de inflows ligados à venture
  mrr: number;
  horas: number;
  custo_horas: number;
  custo_ia: number; // de cost_entries ou, na ausência, estimado do generation_metadata
  custo_ia_estimado: boolean; // true se veio da estimativa (job ainda não rodou)
  custo_outros: number;
  margem: number; // receita_realizada - custo_horas - custo_ia - custo_outros
}

export interface VentureRow extends Venture {
  client_name: string | null;
  studies_count: number;
  metrics: VentureMetrics;
}

// ── Estimativa de custo de IA a partir do generation_metadata ───────────────
// O generation_metadata guarda objetos *_usage com input/output tokens. Sem
// custo em BRL pré-calculado, então estimamos com constantes ajustáveis até o
// job de cost_entries rodar. Tudo exposto para o dono calibrar.
export const USD_BRL = 5.5;
// Preço por milhão de tokens (USD), por família de modelo. Ajustável.
export const IA_PRICING_USD_PER_MTOK: Record<string, { in: number; out: number }> = {
  gemini: { in: 0.3, out: 2.5 }, // Gemini 2.5 Flash (estudos históricos)
  haiku: { in: 0.8, out: 4 },
  sonnet: { in: 3, out: 15 }, // Claude Sonnet 4.6 (atual)
};
const IA_DEFAULT_PRICING = { in: 1, out: 5 };

function pricingForModel(model: string | undefined) {
  const m = (model || "").toLowerCase();
  if (m.includes("gemini")) return IA_PRICING_USD_PER_MTOK.gemini;
  if (m.includes("haiku")) return IA_PRICING_USD_PER_MTOK.haiku;
  if (m.includes("sonnet") || m.includes("claude")) return IA_PRICING_USD_PER_MTOK.sonnet;
  return IA_DEFAULT_PRICING;
}

// Lê tokens tanto do formato Anthropic (input_tokens/output_tokens) quanto do
// Gemini (promptTokenCount/candidatesTokenCount/thoughtsTokenCount).
function tokensFromUsage(usage: unknown): { in: number; out: number } {
  if (!usage || typeof usage !== "object") return { in: 0, out: 0 };
  const u = usage as Record<string, unknown>;
  const inTok = Number(u.input_tokens ?? u.inputTokens ?? u.promptTokenCount ?? 0) || 0;
  const outTok =
    (Number(u.output_tokens ?? u.outputTokens ?? u.candidatesTokenCount ?? 0) || 0) +
    (Number(u.thoughtsTokenCount ?? 0) || 0);
  return { in: inTok, out: outTok };
}

export function estimateIaCostBRL(generationMetadata: unknown): number {
  if (!generationMetadata || typeof generationMetadata !== "object") return 0;
  const meta = generationMetadata as Record<string, unknown>;
  const price = pricingForModel(typeof meta.model === "string" ? meta.model : undefined);
  let inTok = 0;
  let outTok = 0;
  for (const [key, value] of Object.entries(meta)) {
    if (!key.toLowerCase().includes("usage")) continue;
    const t = tokensFromUsage(value);
    inTok += t.in;
    outTok += t.out;
  }
  const usd = (inTok / 1_000_000) * price.in + (outTok / 1_000_000) * price.out;
  return Math.round(usd * USD_BRL * 100) / 100;
}

// ── Leitura: lista de ventures com métricas ──────────────────────────────────

interface StudyLite {
  id: string;
  venture_id: string | null;
  client_id: string | null;
  generation_metadata: Record<string, unknown> | null;
}
interface TxLite {
  kind: "inflow" | "outflow";
  amount_brl: number;
  study_id: string | null;
  client_id: string | null;
  occurred_at: string;
}

function emptyMetrics(): VentureMetrics {
  return {
    receita_realizada: 0,
    mrr: 0,
    horas: 0,
    custo_horas: 0,
    custo_ia: 0,
    custo_ia_estimado: false,
    custo_outros: 0,
    margem: 0,
  };
}

export async function listVentures(): Promise<VentureRow[]> {
  try {
    const supabase = createSupabaseServiceClient();
    const [venturesRes, clientsRes, studiesRes, timeRes, costRes, txRes] =
      await Promise.all([
        supabase.from("ventures").select("*").order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name"),
        supabase.from("studies").select("id, venture_id, client_id, generation_metadata"),
        supabase.from("time_entries").select("venture_id, hours, hourly_cost_brl"),
        supabase.from("cost_entries").select("venture_id, cost_type, amount_brl"),
        supabase.from("transactions").select("kind, amount_brl, study_id, client_id, occurred_at"),
      ]);

    const ventures = (venturesRes.data as Venture[]) || [];
    const clients = (clientsRes.data as { id: string; name: string }[]) || [];
    const studies = (studiesRes.data as StudyLite[]) || [];
    const times = (timeRes.data as { venture_id: string; hours: number; hourly_cost_brl: number }[]) || [];
    const costs = (costRes.data as { venture_id: string; cost_type: string; amount_brl: number }[]) || [];
    const txs = (txRes.data as TxLite[]) || [];

    const clientName = new Map(clients.map((c) => [c.id, c.name]));

    // estudos por venture (para receita por study_id e estimativa de IA)
    const studyIdToVenture = new Map<string, string>();
    const iaEstimateByVenture = new Map<string, number>();
    const studiesCount = new Map<string, number>();
    for (const s of studies) {
      if (!s.venture_id) continue;
      studyIdToVenture.set(s.id, s.venture_id);
      studiesCount.set(s.venture_id, (studiesCount.get(s.venture_id) || 0) + 1);
      const est = estimateIaCostBRL(s.generation_metadata);
      iaEstimateByVenture.set(s.venture_id, (iaEstimateByVenture.get(s.venture_id) || 0) + est);
    }
    // client -> venture (para receita lançada por client_id)
    const clientToVenture = new Map<string, string>();
    for (const v of ventures) {
      if (v.client_id) clientToVenture.set(v.client_id, v.id);
    }

    const metrics = new Map<string, VentureMetrics>();
    for (const v of ventures) metrics.set(v.id, emptyMetrics());

    for (const t of times) {
      const m = metrics.get(t.venture_id);
      if (!m) continue;
      const h = Number(t.hours) || 0;
      m.horas += h;
      m.custo_horas += h * (Number(t.hourly_cost_brl) || 0);
    }

    const hasRealIa = new Set<string>();
    for (const c of costs) {
      const m = metrics.get(c.venture_id);
      if (!m) continue;
      const amt = Number(c.amount_brl) || 0;
      if (c.cost_type === "ia_anthropic") {
        m.custo_ia += amt;
        hasRealIa.add(c.venture_id);
      } else {
        m.custo_outros += amt;
      }
    }

    for (const tx of txs) {
      if (tx.kind !== "inflow") continue;
      let vid: string | undefined;
      if (tx.study_id) vid = studyIdToVenture.get(tx.study_id);
      if (!vid && tx.client_id) vid = clientToVenture.get(tx.client_id);
      if (!vid) continue;
      const m = metrics.get(vid);
      if (m) m.receita_realizada += Number(tx.amount_brl) || 0;
    }

    for (const v of ventures) {
      const m = metrics.get(v.id)!;
      m.mrr = Number(v.mrr_brl) || 0;
      // IA: usa cost_entries reais se houver; senão, estimativa do metadata.
      if (!hasRealIa.has(v.id)) {
        m.custo_ia = iaEstimateByVenture.get(v.id) || 0;
        m.custo_ia_estimado = m.custo_ia > 0;
      }
      m.margem =
        m.receita_realizada - m.custo_horas - m.custo_ia - m.custo_outros;
    }

    return ventures.map((v) => ({
      ...v,
      client_name: v.client_id ? clientName.get(v.client_id) ?? null : null,
      studies_count: studiesCount.get(v.id) || 0,
      metrics: metrics.get(v.id) || emptyMetrics(),
    }));
  } catch {
    return [];
  }
}

// ── Cabeçalho do studio (4 números) ──────────────────────────────────────────
export interface StudioHeader {
  caixa_mes: number; // inflow - outflow no mês corrente
  mrr_total: number;
  pipeline_aberto: number; // estimated_value de leads em aberto
  portfolio_equity: number; // soma de fair_value das ventures
}

export async function studioHeader(rows?: VentureRow[]): Promise<StudioHeader> {
  try {
    const supabase = createSupabaseServiceClient();
    const ventures = rows ?? (await listVentures());
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);

    const [txRes, leadsRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("kind, amount_brl, occurred_at")
        .gte("occurred_at", monthStart),
      supabase
        .from("leads")
        .select("estimated_value, status")
        .in("status", ["contatado", "qualificado", "proposta"]),
    ]);

    const txs = (txRes.data as { kind: string; amount_brl: number }[]) || [];
    let caixa = 0;
    for (const t of txs) {
      const amt = Number(t.amount_brl) || 0;
      caixa += t.kind === "inflow" ? amt : -amt;
    }

    const leads = (leadsRes.data as { estimated_value: number | null }[]) || [];
    const pipeline = leads.reduce((s, l) => s + (Number(l.estimated_value) || 0), 0);

    const mrr = ventures.reduce((s, v) => s + (Number(v.mrr_brl) || 0), 0);
    const equity = ventures.reduce((s, v) => s + (Number(v.fair_value_brl) || 0), 0);

    return {
      caixa_mes: caixa,
      mrr_total: mrr,
      pipeline_aberto: pipeline,
      portfolio_equity: equity,
    };
  } catch {
    return { caixa_mes: 0, mrr_total: 0, pipeline_aberto: 0, portfolio_equity: 0 };
  }
}

// ── Leitura: ficha completa de uma venture ───────────────────────────────────
export interface VentureStudyLite {
  id: string;
  title: string;
  status: string;
  created_at: string;
}
export interface VentureTaskLite {
  id: string;
  title: string;
  status: string;
  sprint: number;
  estimated_hours: number | null;
}
export interface VentureTxLite {
  id: string;
  kind: "inflow" | "outflow";
  amount_brl: number;
  description: string;
  occurred_at: string;
}

export interface VentureDetail {
  venture: VentureRow;
  studies: VentureStudyLite[];
  tasks: VentureTaskLite[];
  transactions: VentureTxLite[];
  timeEntries: TimeEntry[];
  costEntries: CostEntry[];
}

export async function getVentureDetail(id: string): Promise<VentureDetail | null> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data: vData, error } = await supabase
      .from("ventures")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !vData) return null;
    const venture = vData as Venture;

    const [studiesRes, tasksRes, timeRes, costRes] = await Promise.all([
      supabase
        .from("studies")
        .select("id, title, status, created_at, client_id, generation_metadata")
        .eq("venture_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("id, title, status, sprint, estimated_hours")
        .eq("venture_id", id)
        .order("sprint", { ascending: true }),
      supabase
        .from("time_entries")
        .select("*")
        .eq("venture_id", id)
        .order("entry_date", { ascending: false }),
      supabase
        .from("cost_entries")
        .select("*")
        .eq("venture_id", id)
        .order("incurred_at", { ascending: false }),
    ]);

    const studiesFull =
      (studiesRes.data as (StudyLite & { title: string; status: string; created_at: string })[]) || [];
    const studyIds = studiesFull.map((s) => s.id);

    // receita: inflows por study_id da venture OU por client_id da venture
    let txQuery = supabase
      .from("transactions")
      .select("id, kind, amount_brl, description, occurred_at, study_id, client_id")
      .order("occurred_at", { ascending: false });
    const { data: txAll } = await txQuery;
    const txs = ((txAll as (VentureTxLite & { study_id: string | null; client_id: string | null })[]) || [])
      .filter(
        (t) =>
          (t.study_id && studyIds.includes(t.study_id)) ||
          (venture.client_id && t.client_id === venture.client_id)
      );

    const timeEntries = (timeRes.data as TimeEntry[]) || [];
    const costEntries = (costRes.data as CostEntry[]) || [];

    // métricas (mesma lógica do list, escopo desta venture)
    const m = emptyMetrics();
    m.mrr = Number(venture.mrr_brl) || 0;
    for (const t of timeEntries) {
      const h = Number(t.hours) || 0;
      m.horas += h;
      m.custo_horas += h * (Number(t.hourly_cost_brl) || 0);
    }
    let hasRealIa = false;
    for (const c of costEntries) {
      const amt = Number(c.amount_brl) || 0;
      if (c.cost_type === "ia_anthropic") {
        m.custo_ia += amt;
        hasRealIa = true;
      } else {
        m.custo_outros += amt;
      }
    }
    if (!hasRealIa) {
      const est = studiesFull.reduce(
        (s, st) => s + estimateIaCostBRL(st.generation_metadata),
        0
      );
      m.custo_ia = est;
      m.custo_ia_estimado = est > 0;
    }
    for (const t of txs) {
      if (t.kind === "inflow") m.receita_realizada += Number(t.amount_brl) || 0;
    }
    m.margem = m.receita_realizada - m.custo_horas - m.custo_ia - m.custo_outros;

    const clientName = venture.client_id
      ? (
          await supabase
            .from("clients")
            .select("name")
            .eq("id", venture.client_id)
            .maybeSingle()
        ).data?.name ?? null
      : null;

    const ventureRow: VentureRow = {
      ...venture,
      client_name: clientName as string | null,
      studies_count: studiesFull.length,
      metrics: m,
    };

    return {
      venture: ventureRow,
      studies: studiesFull.map((s) => ({
        id: s.id,
        title: s.title,
        status: s.status,
        created_at: s.created_at,
      })),
      tasks: (tasksRes.data as VentureTaskLite[]) || [],
      transactions: txs.map((t) => ({
        id: t.id,
        kind: t.kind,
        amount_brl: t.amount_brl,
        description: t.description,
        occurred_at: t.occurred_at,
      })),
      timeEntries,
      costEntries,
    };
  } catch {
    return null;
  }
}

export function fmtBRL(n: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n || 0);
}
