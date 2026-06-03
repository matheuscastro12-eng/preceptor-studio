// ════════════════════════════════════════════════════════════════════════════
// PRECEPTOR! Studio — Lead (diagnóstico) para briefing inicial de estudo
// ════════════════════════════════════════════════════════════════════════════
//
// Lê as 11 respostas do diagnóstico público de um lead (+ a interpretação interna
// gerada pelo diagnóstico) e devolve um briefing inicial de estudo estratégico:
// título sugerido, categoria, resumo interpretativo, respostas pré-preenchidas
// para o questionário do estudo e perguntas em aberto.
//
// Saída: JSON estrito. PT-BR. Sem travessão nem meia-risca.

import type { DiagnosticAnswers } from "@/lib/diagnosticScore";

export type StudyCategory = "saude" | "educacao" | "juridico" | "tech" | "outro";

export interface LeadStudyContext {
  suggested_title: string;
  category: StudyCategory;
  context_summary: string;
  prefilled_answers: Record<string, string>;
  open_questions: string[];
}

const VALID_CATEGORIES: StudyCategory[] = [
  "saude",
  "educacao",
  "juridico",
  "tech",
  "outro",
];

export const LEAD_TO_STUDY_SYSTEM_PROMPT = `Você é analista do PRECEPTOR! que transforma as respostas de um diagnóstico público em um briefing inicial de estudo estratégico. Português do Brasil, factual e interpretativo.

O QUE VOCÊ RECEBE:
- As 11 respostas que o lead digitou no diagnóstico (ideia, problema, cliente, mercado, demanda, receita, execução, capital, diferencial, regulação, urgência).
- A interpretação interna que o diagnóstico já produziu (recomendação, headline, próximos passos, perguntas estratégicas).

O QUE VOCÊ PRODUZ:
Um briefing inicial que pré-preenche um estudo estratégico mais profundo. O analista que vai conduzir o estudo lê o seu briefing para entrar em contexto sem reler o formulário.

REGRAS DE INTERPRETAÇÃO:
- O context_summary é a SUA leitura do negócio, não uma cópia das respostas. Não escreva "o lead respondeu", "na pergunta sobre X", "conforme o diagnóstico". Forme uma tese própria.
- Interprete o que a combinação das respostas implica: o que entendemos da ideia, do problema, do cliente que paga, do modelo de receita e do risco dominante.
- Quando faltar informação, assuma uma hipótese explícita e curta. Não trave.

REGRAS DE SAÍDA (JSON estrito, nada fora do JSON):
{
  "suggested_title": "título curto e concreto do estudo, ex: 'Plataforma de teleconsulta para nutricionistas'",
  "category": "saude | educacao | juridico | tech | outro",
  "context_summary": "markdown de 4 a 6 parágrafos curtos, interpretativo, cobrindo ideia, problema, cliente que paga, modelo e risco dominante",
  "prefilled_answers": { "<question_id>": "valor sugerido em texto" },
  "open_questions": ["3 perguntas concretas que faltam responder para fechar o estudo"]
}

REGRAS DURAS:
- NÃO use travessão (—) nem meia-risca (–). Use vírgula, ponto, dois-pontos ou parênteses.
- Sempre que citar a marca, escreva PRECEPTOR! com a exclamação.
- category deve ser exatamente um de: saude, educacao, juridico, tech, outro.
- open_questions: exatamente 3 itens.
- prefilled_answers: preencha SOMENTE os question_id listados como mapeáveis abaixo, e apenas quando a resposta do diagnóstico der base clara. Deixe de fora o que você não conseguir inferir com segurança. Valores sempre em texto livre (1 a 2 frases), nunca invente opções de múltipla escolha.

QUESTION_ID MAPEÁVEIS (do questionário do estudo):
- ideia_resumo: descrição da ideia (o que é e o que faz).
- problema_principal: o problema que a solução resolve, em 1 ou 2 frases.
- cliente_tipo: descrição de quem é o cliente (texto livre, mesmo que o estudo use múltipla escolha depois).
- concorrentes: concorrentes citados, se houver.
- saude_especialidade: especialidade ou área da saúde, se a categoria for saude.
- outro_setor: setor, se a categoria for outro.

Retorne SOMENTE o objeto JSON, sem fences, sem comentários, sem texto antes ou depois.`;

const CATEGORY_LABEL: Record<string, string> = {
  saude: "Saúde",
  educacao: "Educação",
  juridico: "Jurídico",
  tech: "Tech",
  outro: "Outro setor",
};

interface InternalInterpretation {
  recommendation?: string;
  recommendationReason?: string;
  bucket?: string;
  headline?: string;
  nextSteps?: Array<{ title?: string; body?: string }>;
  strategicQuestions?: string[];
}

export interface LeadToStudyInput {
  answers: DiagnosticAnswers;
  internal: InternalInterpretation | null;
  category: string | null;
  company: string | null;
  name: string;
}

export function buildLeadToStudyUserPrompt(input: LeadToStudyInput): string {
  const a = input.answers ?? {};
  const lines: string[] = [];

  lines.push(`Nome do lead: ${input.name}`);
  if (input.company) lines.push(`Empresa: ${input.company}`);
  lines.push(
    `Categoria declarada: ${CATEGORY_LABEL[input.category ?? ""] ?? "não informada"}`
  );
  lines.push("");
  lines.push("RESPOSTAS DO DIAGNÓSTICO:");

  const fields: Array<[keyof DiagnosticAnswers, string]> = [
    ["ideia", "Ideia"],
    ["problema", "Problema"],
    ["cliente", "Cliente"],
    ["mercado_tamanho", "Tamanho de mercado"],
    ["demanda", "Sinais de demanda"],
    ["receita", "Modelo de receita"],
    ["execucao", "Clareza de execução"],
    ["capital", "Capital disponível"],
    ["diferencial", "Diferencial"],
    ["regulacao", "Regulação"],
    ["urgencia", "Urgência do problema"],
  ];
  for (const [key, label] of fields) {
    const v = a[key];
    if (typeof v === "string" && v.trim()) {
      lines.push(`- ${label}: ${v.trim().slice(0, 400)}`);
    }
  }

  const internal = input.internal;
  if (internal) {
    lines.push("");
    lines.push("INTERPRETAÇÃO INTERNA JÁ PRODUZIDA PELO DIAGNÓSTICO:");
    if (internal.bucket) lines.push(`- Faixa: ${internal.bucket}`);
    if (internal.recommendation)
      lines.push(`- Recomendação: ${internal.recommendation}`);
    if (internal.recommendationReason)
      lines.push(`- Motivo: ${internal.recommendationReason}`);
    if (internal.headline) lines.push(`- Leitura: ${internal.headline}`);
    if (Array.isArray(internal.nextSteps) && internal.nextSteps.length) {
      lines.push("- Próximos passos sugeridos:");
      for (const s of internal.nextSteps.slice(0, 3)) {
        if (s?.title) lines.push(`  - ${s.title}`);
      }
    }
    if (
      Array.isArray(internal.strategicQuestions) &&
      internal.strategicQuestions.length
    ) {
      lines.push("- Perguntas estratégicas já levantadas:");
      for (const q of internal.strategicQuestions.slice(0, 3)) {
        if (typeof q === "string" && q.trim()) lines.push(`  - ${q.trim()}`);
      }
    }
  }

  lines.push("");
  lines.push(
    "Produza o briefing inicial em JSON estrito seguindo as regras do prompt do sistema."
  );
  return lines.join("\n");
}

/** Fallback determinístico quando o Gemini falha, não há chave ou o JSON é inválido. */
export function buildLeadToStudyFallback(input: {
  company: string | null;
  name: string;
  category: string | null;
  summaryLine: string | null;
}): LeadStudyContext {
  const title =
    (input.company && input.company.trim()) ||
    `Estudo de ${input.name}`.trim();
  const category = normalizeCategory(input.category);
  const summary =
    input.summaryLine && input.summaryLine.trim()
      ? input.summaryLine.trim()
      : "Contexto do diagnóstico ainda não interpretado. Conduza o questionário para detalhar a tese.";
  return {
    suggested_title: title,
    category,
    context_summary: summary,
    prefilled_answers: {},
    open_questions: [],
  };
}

export function normalizeCategory(input: string | null | undefined): StudyCategory {
  if (typeof input === "string") {
    const v = input.toLowerCase().trim();
    if (VALID_CATEGORIES.includes(v as StudyCategory)) return v as StudyCategory;
  }
  return "outro";
}

const MAPPABLE_IDS = new Set([
  "ideia_resumo",
  "problema_principal",
  "cliente_tipo",
  "concorrentes",
  "saude_especialidade",
  "outro_setor",
]);

/** Valida e normaliza o JSON retornado pelo modelo, descartando campos inválidos. */
export function normalizeLeadStudyContext(
  raw: unknown,
  fallback: LeadStudyContext
): LeadStudyContext {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;

  const title =
    typeof r.suggested_title === "string" && r.suggested_title.trim()
      ? sanitizeText(r.suggested_title).slice(0, 160)
      : fallback.suggested_title;

  const category = normalizeCategory(
    typeof r.category === "string" ? r.category : fallback.category
  );

  const summary =
    typeof r.context_summary === "string" && r.context_summary.trim()
      ? sanitizeText(r.context_summary)
      : fallback.context_summary;

  const prefilled: Record<string, string> = {};
  if (r.prefilled_answers && typeof r.prefilled_answers === "object") {
    for (const [key, value] of Object.entries(
      r.prefilled_answers as Record<string, unknown>
    )) {
      if (MAPPABLE_IDS.has(key) && typeof value === "string" && value.trim()) {
        prefilled[key] = sanitizeText(value).slice(0, 600);
      }
    }
  }

  const openQuestions: string[] = Array.isArray(r.open_questions)
    ? r.open_questions
        .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
        .map((q) => sanitizeText(q).slice(0, 240))
        .slice(0, 3)
    : [];

  return {
    suggested_title: title,
    category,
    context_summary: summary,
    prefilled_answers: prefilled,
    open_questions: openQuestions,
  };
}

/** Remove travessão e meia-risca conforme regra de estilo da marca. */
function sanitizeText(s: string): string {
  return s.replace(/[—–]/g, ",").trim();
}
