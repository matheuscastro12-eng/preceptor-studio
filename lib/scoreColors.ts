export const SCORE_COLORS = {
  forte: { bg: "#10B981", text: "#FFFFFF", soft: "#D1FAE5", label: "Forte", border: "#10B981" },
  bom: { bg: "#52E1E7", text: "#0A1F44", soft: "#CFFAFE", label: "Promissor", border: "#52E1E7" },
  alerta: { bg: "#F59E0B", text: "#FFFFFF", soft: "#FEF3C7", label: "Em desenvolvimento", border: "#F59E0B" },
  fraco: { bg: "#E11D48", text: "#FFFFFF", soft: "#FEE2E2", label: "Desafiador", border: "#E11D48" },
} as const;

export type ScoreColor = (typeof SCORE_COLORS)[keyof typeof SCORE_COLORS];

export function getScoreColor(value: number): ScoreColor {
  if (value >= 75) return SCORE_COLORS.forte;
  if (value >= 50) return SCORE_COLORS.bom;
  if (value >= 25) return SCORE_COLORS.alerta;
  return SCORE_COLORS.fraco;
}

// Para escalas invertidas (risco — quanto maior pior)
export function getRiskColor(value: number): ScoreColor {
  if (value <= 25) return SCORE_COLORS.forte;
  if (value <= 50) return SCORE_COLORS.bom;
  if (value <= 75) return SCORE_COLORS.alerta;
  return SCORE_COLORS.fraco;
}

export function getRiskLabel(value: number) {
  if (value <= 25) return "Baixo";
  if (value <= 50) return "Moderado";
  if (value <= 75) return "Elevado";
  return "Crítico";
}

export const RECOMMENDATION_COLORS = {
  ENTRAR: { bg: "#10B981", text: "#FFFFFF", label: "ENTRAR", sub: "Recomenda-se entrada como sócia" },
  OBSERVAR: { bg: "#52E1E7", text: "#0A1F44", label: "OBSERVAR", sub: "Sinais positivos com dúvidas a validar em 60-90 dias" },
  NAO_ENTRAR: { bg: "#E11D48", text: "#FFFFFF", label: "NÃO ENTRAR", sub: "Não recomendamos entrada como sócia neste momento" },
} as const;

export type RecommendationKey = keyof typeof RECOMMENDATION_COLORS;

// Pesos do score geral (Estudo do Cliente)
export const SCORE_WEIGHTS = {
  mercado: 0.25,
  execucao: 0.2,
  diferenciacao: 0.25,
  modelo_receita: 0.2,
  risco_regulatorio: 0.1,
} as const;

export function computeOverall(scores: {
  mercado: number;
  execucao: number;
  diferenciacao: number;
  modelo_receita: number;
  risco_regulatorio: number;
}): number {
  return Math.round(
    scores.mercado * SCORE_WEIGHTS.mercado +
      scores.execucao * SCORE_WEIGHTS.execucao +
      scores.diferenciacao * SCORE_WEIGHTS.diferenciacao +
      scores.modelo_receita * SCORE_WEIGHTS.modelo_receita +
      scores.risco_regulatorio * SCORE_WEIGHTS.risco_regulatorio
  );
}

export function recommendationFromScore(overall: number): RecommendationKey {
  if (overall >= 75) return "ENTRAR";
  if (overall >= 50) return "OBSERVAR";
  return "NAO_ENTRAR";
}
