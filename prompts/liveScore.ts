import { Category } from "@/lib/store";

const CATEGORY_HINT: Record<Category, string> = {
  saude:
    "Saúde: regulação ANVISA/CFM (Resolução CFM 2.314/2022), LGPD para dados sensíveis, integração com operadoras (ANS), ciclo de venda longo.",
  educacao:
    "Educação: MEC para cursos regulados, sazonalidade de vestibular/ENEM, taxa de conclusão baixa, plataformas Hotmart/Kiwify.",
  juridico:
    "Jurídico: Provimento OAB 205/2021 sobre publicidade, compliance multi-jurisdição, escritórios pequenos resistentes a tecnologia.",
  tech:
    "Tech: BACEN para fintech, LGPD/ANPD, métricas SaaS (CAC, LTV, churn, payback, NRR), ciclo B2B 60-180 dias.",
  outro:
    "Setor geral: poder de compra regional, sazonalidade, canais predominantes, regulação setorial específica.",
};

const AXIS_RULES = `EIXOS (escala 0-100):
- Mercado: tamanho, demanda e urgência do problema.
- Execução: VIABILIDADE DE CONSTRUIR a solução, ou seja, a relação entre a complexidade técnica/arquitetural do que precisa ser construído e os recursos disponíveis (tempo, time, capital, experiência), ajustada pelo PROGRESSO REAL (tarefas done por sprint). Capital é um insumo entre vários, não o teto do score: um MVP simples com pouco caixa pode ter execução alta, e um MVP complexo (integrações, IA, processamento) com poucos recursos tem execução baixa por incompatibilidade técnica. Se a execução avançou e marcos foram batidos, suba. Se está travada, desça.
- Diferenciação: vantagem competitiva real e defensabilidade.
- Modelo: recorrência, margem, escalabilidade do modelo de receita.
- Regulatório: ESCALA INVERTIDA. 100 = sem risco regulatório. 20 = risco alto. Quanto MAIOR o risco, MENOR o número.`;

export function buildLiveScoreSystemPrompt(category: Category): string {
  return `Você é o analista sênior da PRECEPTOR! Venture Studio. Sua tarefa é REAVALIAR o score de uma tese que JÁ está em execução, considerando o ESTADO ATUAL do projeto.

Diferente do score inicial (feito só com o questionário), agora você tem sinais novos: progresso de execução (tarefas concluídas por sprint), respostas a perguntas de aprofundamento, e o estudo já gerado. Use esses sinais para ajustar cada eixo para cima ou para baixo de forma honesta.

${AXIS_RULES}

CONTEXTO DO SETOR: ${CATEGORY_HINT[category]}

REGRAS:
- Reavalie cada eixo com base no estado ATUAL. Execução que avançou deve subir; execução travada ou marcos perdidos deve cair.
- Respostas novas que confirmam hipóteses sobem os eixos correspondentes. Respostas que revelam fragilidades derrubam.
- Não invente progresso. Se não há sinal novo, mantenha o eixo próximo do valor anterior.
- Proibido travessão (—) e meia-risca (–). Use vírgula, ponto ou parênteses.
- PRECEPTOR! sempre com exclamação.

Responda SOMENTE com JSON válido, sem texto antes ou depois, neste formato exato:
{
  "overall": <0-100 inteiro>,
  "axes": [
    { "label": "Mercado", "value": <0-100>, "hint": "<1 frase citando o sinal atual>" },
    { "label": "Execução", "value": <0-100>, "hint": "<1 frase citando o progresso de execução>" },
    { "label": "Diferenciação", "value": <0-100>, "hint": "<1 frase>" },
    { "label": "Modelo", "value": <0-100>, "hint": "<1 frase>" },
    { "label": "Regulatório", "value": <0-100>, "hint": "<1 frase>" }
  ],
  "note": "<2 a 3 frases resumindo o que mudou desde a última medição e por quê>"
}`;
}

export interface LiveScoreExecutionSprint {
  sprint: number;
  total: number;
  done: number;
}

export function buildLiveScoreUserPrompt(input: {
  title: string;
  outputMd: string | null;
  answers: Record<string, unknown>;
  execution: LiveScoreExecutionSprint[];
  previousScores: { label: string; value: number }[] | null;
  previousOverall: number | null;
  answeredFollowUps: { question: string; answer: string }[];
}): string {
  let prompt = `Projeto: ${input.title}\n\n`;

  if (input.previousOverall !== null && input.previousScores) {
    prompt += `═══ ÚLTIMA MEDIÇÃO ═══\n`;
    prompt += `Overall anterior: ${input.previousOverall}\n`;
    for (const a of input.previousScores) {
      prompt += `- ${a.label}: ${a.value}\n`;
    }
    prompt += `\n`;
  } else {
    prompt += `Primeira reavaliação (não há medição anterior, use o estudo como base).\n\n`;
  }

  prompt += `═══ PROGRESSO DE EXECUÇÃO (tarefas por sprint) ═══\n`;
  if (input.execution.length === 0) {
    prompt += `Sem tarefas cadastradas. A execução ainda não começou ou não foi planejada.\n\n`;
  } else {
    for (const s of input.execution) {
      const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
      prompt += `- Sprint ${s.sprint}: ${s.done}/${s.total} tarefas concluídas (${pct}%)\n`;
    }
    prompt += `\n`;
  }

  if (input.answeredFollowUps.length > 0) {
    prompt += `═══ RESPOSTAS NOVAS (perguntas de aprofundamento) ═══\n`;
    for (const f of input.answeredFollowUps) {
      prompt += `P: ${f.question}\nR: ${f.answer}\n\n`;
    }
  }

  if (input.outputMd) {
    const trimmed = input.outputMd.slice(0, 8000);
    prompt += `═══ ESTUDO GERADO (referência) ═══\n${trimmed}\n\n`;
  }

  prompt += `Reavalie os 5 eixos considerando o estado ATUAL e retorne o JSON conforme especificado.`;
  return prompt;
}
