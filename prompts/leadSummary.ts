// ════════════════════════════════════════════════════════════════════════════
// PRECEPTOR! Studio — Resumo de lead em 1 frase (Gemini Flash)
// ════════════════════════════════════════════════════════════════════════════
//
// Gera uma frase curta para o time bater o olho e entender o lead na hora.
// Ex: "Operadora de saúde média, R$100-500k, score 72, quer SaaS de compliance.
//      Pediu contato."
//
// Output esperado: 1 frase, máx 140 chars, PT-BR, sem travessões.

import type { DiagnosticAnswers } from "@/lib/diagnosticScore";
import type { LeadCategory } from "@/lib/leads";

export const LEAD_SUMMARY_SYSTEM_PROMPT = `Você é analista comercial do PRECEPTOR! e resume um lead em uma única linha para o time bater o olho e entender quem é, sem abrir o detalhe. Português do Brasil, frio e factual.

REGRAS DE SAÍDA:
- Retorne SOMENTE a frase, sem aspas, sem markdown, sem prefixos.
- Uma única frase, no máximo 140 caracteres.
- NÃO use travessão nem meia-risca. Use vírgula, ponto ou parênteses.
- Inclua, nesta lógica: setor/segmento, porte ou faixa de capital, score do diagnóstico, e a intenção principal (o que a pessoa quer construir ou resolver).
- Se a pessoa pediu contato, termine com "Pediu contato.".
- Sem clichês de empreendedorismo. Linguagem concreta.
- Sempre que citar a marca, escreva PRECEPTOR! com exclamação.`;

interface LeadSummaryInput {
  answers: DiagnosticAnswers;
  category: LeadCategory | string | null;
  score: number | null;
  company: string | null;
  requestedContact: boolean;
}

const CATEGORY_LABEL: Record<string, string> = {
  saude: "Saúde",
  educacao: "Educação",
  juridico: "Jurídico",
  tech: "Tech",
  outro: "Outro setor",
};

function categoryLabel(cat: string | null): string {
  if (!cat) return "Setor não informado";
  return CATEGORY_LABEL[cat] ?? cat;
}

export function buildLeadSummaryUserPrompt(input: LeadSummaryInput): string {
  const a = input.answers ?? {};
  const lines: string[] = [];
  lines.push(`Setor declarado: ${categoryLabel(input.category as string | null)}`);
  if (input.company) lines.push(`Empresa: ${input.company}`);
  lines.push(`Score do diagnóstico: ${input.score ?? "sem score"}`);
  lines.push(`Pediu contato: ${input.requestedContact ? "sim" : "não"}`);
  lines.push("");
  lines.push("Respostas do diagnóstico:");
  const fields: Array<[keyof DiagnosticAnswers, string]> = [
    ["ideia", "Ideia"],
    ["problema", "Problema"],
    ["cliente", "Cliente"],
    ["mercado_tamanho", "Tamanho de mercado"],
    ["receita", "Modelo de receita"],
    ["capital", "Capital disponível"],
    ["diferencial", "Diferencial"],
    ["regulacao", "Regulação"],
  ];
  for (const [key, label] of fields) {
    const v = a[key];
    if (typeof v === "string" && v.trim()) {
      lines.push(`- ${label}: ${v.trim().slice(0, 200)}`);
    }
  }
  lines.push("");
  lines.push("Resuma este lead em uma frase para o time comercial.");
  return lines.join("\n");
}

/** Fallback determinístico quando o Gemini falha ou não há chave. */
export function buildLeadSummaryFallback(input: LeadSummaryInput): string {
  const setor = categoryLabel(input.category as string | null);
  const score =
    typeof input.score === "number" ? `score ${input.score}` : "sem score";
  const capital =
    typeof input.answers?.capital === "string" && input.answers.capital.trim()
      ? `capital ${input.answers.capital.trim()}`
      : "capital não informado";
  let line = `${setor}, ${score}, ${capital}.`;
  if (input.requestedContact) line += " Pediu contato.";
  return line.slice(0, 140);
}

/** Normaliza o output do modelo: tira aspas, fences e corta em 140 chars. */
export function normalizeLeadSummary(raw: string): string {
  const cleaned = raw
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[—–]/g, ",")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 140);
}
