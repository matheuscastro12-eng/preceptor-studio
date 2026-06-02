// ════════════════════════════════════════════════════════════════════════════
// PRECEPTOR! Studio — Lead scoring comercial (determinístico, sem IA)
// ════════════════════════════════════════════════════════════════════════════
//
// computeLeadPriority: nota 0-100 que combina o diagnostic_score com sinais
// comerciais reais (capital declarado, tamanho de mercado, pedido de contato,
// recência). Roda no servidor, sem chamada de modelo. Resultado clampado 0-100.
//
// computeEstimatedValue: valor potencial do deal (R$) usado no pipeline
// ponderado. Heurística por capital declarado a partir de uma base de ticket.

import type { Lead, LeadCategory } from "@/lib/leads";

/** Subconjunto de Lead que o scorer precisa (facilita testes/reuso). */
export interface ScorableLead {
  diagnostic_score: number | null;
  diagnostic_answers: Record<string, unknown> | null | undefined;
  requested_contact_at?: string | null;
  created_at?: string | null;
  category?: LeadCategory | string | null;
}

function clampInt(n: number, min = 0, max = 100): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Lê uma resposta do diagnóstico de forma segura como string. */
function readAnswer(
  answers: Record<string, unknown> | null | undefined,
  key: string
): string | null {
  if (!answers || typeof answers !== "object") return null;
  const v = (answers as Record<string, unknown>)[key];
  return typeof v === "string" ? v : null;
}

// ─── Pesos das faixas de capital declarado (diagnostic_answers.capital) ──────
// Sinaliza capacidade de pagar e tamanho do contrato.
const CAPITAL_SCORE: Record<string, number> = {
  "Mais de R$ 500k": 100,
  "R$ 100k a 500k": 80,
  "R$ 20k a 100k": 55,
  "Menos de R$ 20k": 30,
  "Ainda captando": 40,
};

// ─── Pesos do tamanho de mercado (diagnostic_answers.mercado_tamanho) ────────
const MERCADO_SCORE: Record<string, number> = {
  "Mais de 1 milhão": 100,
  "100 mil a 1 milhão": 80,
  "10 mil a 100 mil": 60,
  "Menos de 10 mil": 35,
  "Ainda não sei medir": 30,
};

function capitalScore(answers: ScorableLead["diagnostic_answers"]): number {
  const raw = readAnswer(answers, "capital");
  if (raw && raw in CAPITAL_SCORE) return CAPITAL_SCORE[raw];
  return 40; // neutro quando não declarado
}

function mercadoScore(answers: ScorableLead["diagnostic_answers"]): number {
  const raw = readAnswer(answers, "mercado_tamanho");
  if (raw && raw in MERCADO_SCORE) return MERCADO_SCORE[raw];
  return 35; // neutro quando não declarado
}

/**
 * Prioridade comercial 0-100.
 *
 * Fórmula determinística:
 *   ponderado = diagnostic_score * 0.45
 *             + capitalScore     * 0.20
 *             + mercadoScore     * 0.15
 *   bônus pedido de contato  = +15 (fixo) se requested_contact_at != null
 *   bônus recência           = +10 se criado < 48h, senão +5 se < 7 dias
 *   resultado = clamp(ponderado + bônus, 0, 100)
 *
 * Os pesos 0.45/0.20/0.15 somam 0.80; o restante (0.20) fica reservado para os
 * bônus de intenção (contato) e recência, que somam até +25 antes do clamp.
 */
export function computeLeadPriority(lead: ScorableLead): number {
  const diag = typeof lead.diagnostic_score === "number" ? lead.diagnostic_score : 0;
  const cap = capitalScore(lead.diagnostic_answers);
  const merc = mercadoScore(lead.diagnostic_answers);

  let score = diag * 0.45 + cap * 0.2 + merc * 0.15;

  if (lead.requested_contact_at) score += 15;

  if (lead.created_at) {
    const ageMs = Date.now() - new Date(lead.created_at).getTime();
    if (Number.isFinite(ageMs) && ageMs >= 0) {
      if (ageMs < 48 * 60 * 60 * 1000) score += 10;
      else if (ageMs < 7 * 24 * 60 * 60 * 1000) score += 5;
    }
  }

  return clampInt(score);
}

// ─── Estimated value (R$) ────────────────────────────────────────────────────
// Heurística: base de R$ 12.000 (estudo estratégico + execução leve, ticket
// típico de um primeiro projeto no PRECEPTOR!) multiplicada por um fator de
// capital declarado, que aproxima o tamanho do contrato que o cliente comporta.
const ESTIMATED_VALUE_BASE = 12000;

const CAPITAL_MULTIPLIER: Record<string, number> = {
  "Mais de R$ 500k": 3,
  "R$ 100k a 500k": 2,
  "R$ 20k a 100k": 1.3,
  "Menos de R$ 20k": 0.7,
  "Ainda captando": 0.9,
};

/**
 * Valor potencial do deal em R$ para o pipeline ponderado.
 *
 * estimated_value = ESTIMATED_VALUE_BASE * fatorDeCapital
 *
 * Sem capital declarado usa fator 1 (= base). Arredondado para inteiro de R$.
 */
export function computeEstimatedValue(lead: ScorableLead): number {
  const raw = readAnswer(lead.diagnostic_answers, "capital");
  const factor = raw && raw in CAPITAL_MULTIPLIER ? CAPITAL_MULTIPLIER[raw] : 1;
  return Math.round(ESTIMATED_VALUE_BASE * factor);
}

/** Cor da prioridade na UI: >=75 verde, 50-74 cyan, 25-49 amber, <25 slate. */
export function priorityColor(score: number | null | undefined): string {
  if (typeof score !== "number") return "#94A3B8";
  if (score >= 75) return "#10B981";
  if (score >= 50) return "#3BC8CF";
  if (score >= 25) return "#F59E0B";
  return "#94A3B8";
}

/** Lead completo: tipa o helper para o uso comum com a row do banco. */
export function computeLeadScores(lead: Lead): {
  priority_score: number;
  estimated_value: number;
} {
  return {
    priority_score: computeLeadPriority(lead),
    estimated_value: computeEstimatedValue(lead),
  };
}
