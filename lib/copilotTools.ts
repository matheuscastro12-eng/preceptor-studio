// Ferramentas read-only do copiloto do studio. O Claude chama estas funções
// (tool-use) para responder sobre os dados reais. Nunca expõe SQL livre.
import {
  listVentures,
  studioHeader,
  getVentureDetail,
  revenueByLayer,
} from "@/lib/ventures";
import { getHotLeads, getFinanceSummary } from "@/lib/dashboardData";
import { getMarginByStudy } from "@/lib/financeAnalytics";

export const COPILOT_TOOLS = [
  {
    name: "studio_overview",
    description:
      "Números gerais do studio: caixa do mês, MRR, pipeline aberto, portfólio de equity e os totais agregados de receita, custo de IA, custo de horas e margem das ventures.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "list_ventures",
    description:
      "Lista as ventures com métricas por venture (estágio, cliente, receita realizada, MRR, custo de IA, margem, horas). Pode filtrar por estágio.",
    input_schema: {
      type: "object",
      properties: {
        stage: {
          type: "string",
          description:
            "estágio opcional: lead, diagnostico, estudo, proposta, onboarding, execucao, manutencao, equity, encerrada",
        },
      },
    },
  },
  {
    name: "venture_detail",
    description:
      "Detalhe de uma venture pelo nome (busca aproximada): métricas, estudos vinculados e eventos recentes da timeline.",
    input_schema: {
      type: "object",
      properties: { name: { type: "string", description: "nome da venture ou do cliente" } },
      required: ["name"],
    },
  },
  {
    name: "hot_leads",
    description: "Leads quentes ordenados por prioridade (nome, empresa, score, resumo).",
    input_schema: { type: "object", properties: { limit: { type: "number" } } },
  },
  {
    name: "revenue_by_layer",
    description: "Receita, MRR e margem agregados por camada (estudo, execução, manutenção).",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "finance_summary",
    description:
      "Resumo financeiro do studio: receita fechada, deals em aberto e margem por estudo (top 10).",
    input_schema: { type: "object", properties: {} },
  },
];

export async function runCopilotTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "studio_overview": {
      const rows = await listVentures();
      const h = await studioHeader(rows);
      const tot = rows.reduce(
        (a, v) => ({
          receita: a.receita + v.metrics.receita_realizada,
          custo_ia: a.custo_ia + v.metrics.custo_ia,
          custo_horas: a.custo_horas + v.metrics.custo_horas,
          margem: a.margem + v.metrics.margem,
          horas: a.horas + v.metrics.horas,
        }),
        { receita: 0, custo_ia: 0, custo_horas: 0, margem: 0, horas: 0 }
      );
      return { ...h, ventures_total: rows.length, totais: tot };
    }
    case "list_ventures": {
      const rows = await listVentures();
      const stage = typeof input?.stage === "string" ? input.stage : null;
      const filtered = stage ? rows.filter((v) => v.stage === stage) : rows;
      return filtered.map((v) => ({
        nome: v.name,
        cliente: v.client_name,
        estagio: v.stage,
        saude: v.health,
        receita: v.metrics.receita_realizada,
        mrr: v.metrics.mrr,
        custo_ia: v.metrics.custo_ia,
        custo_ia_estimado: v.metrics.custo_ia_estimado,
        margem: v.metrics.margem,
        horas: v.metrics.horas,
      }));
    }
    case "venture_detail": {
      const rows = await listVentures();
      const q = String(input?.name || "").toLowerCase().trim();
      const row =
        rows.find((v) => v.name.toLowerCase().includes(q)) ||
        rows.find((v) => (v.client_name || "").toLowerCase().includes(q));
      if (!row) return { erro: "Venture não encontrada", nomes_disponiveis: rows.map((r) => r.name) };
      const d = await getVentureDetail(row.id);
      if (!d) return { erro: "Venture não encontrada" };
      return {
        nome: d.venture.name,
        cliente: d.venture.client_name,
        estagio: d.venture.stage,
        saude: d.venture.health,
        metricas: d.venture.metrics,
        estudos: d.studies.map((s) => s.title),
        timeline: d.timeline.slice(0, 10),
      };
    }
    case "hot_leads": {
      const limit = typeof input?.limit === "number" ? input.limit : 8;
      const leads = await getHotLeads(limit);
      return leads.map((l) => ({ nome: l.name, empresa: l.company, score: l.priority_score, resumo: l.summary_line }));
    }
    case "revenue_by_layer": {
      const rows = await listVentures();
      return revenueByLayer(rows);
    }
    case "finance_summary": {
      const [s, margins] = await Promise.all([getFinanceSummary(), getMarginByStudy()]);
      return { ...s, margem_por_estudo: margins.slice(0, 10) };
    }
    default:
      return { erro: `Ferramenta desconhecida: ${name}` };
  }
}
