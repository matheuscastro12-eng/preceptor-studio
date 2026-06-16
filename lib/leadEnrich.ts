// ════════════════════════════════════════════════════════════════════════════
// PRECEPTOR! Studio — Enriquecimento comercial de leads
// ════════════════════════════════════════════════════════════════════════════
//
// Junta scoring determinístico (leadScore) com o resumo em 1 frase (Gemini).
// Usado pela rota pública do diagnóstico (best-effort), pelo recompute em massa
// e pela regeneração manual de resumo.

import { callGemini } from "@/lib/gemini";
import {
  computeEstimatedValue,
  computeLeadPriority,
  type ScorableLead,
} from "@/lib/leadScore";
import {
  LEAD_SUMMARY_SYSTEM_PROMPT,
  buildLeadSummaryFallback,
  buildLeadSummaryUserPrompt,
  normalizeLeadSummary,
} from "@/prompts/leadSummary";
import type { DiagnosticAnswers } from "@/lib/diagnosticScore";
import type { LeadCategory } from "@/lib/leads";

export interface LeadScoreFields {
  priority_score: number;
  estimated_value: number;
}

export function computeScoreFields(lead: ScorableLead): LeadScoreFields {
  return {
    priority_score: computeLeadPriority(lead),
    estimated_value: computeEstimatedValue(lead),
  };
}

interface SummaryInput {
  answers: DiagnosticAnswers;
  category: LeadCategory | string | null;
  score: number | null;
  company: string | null;
  requestedContact: boolean;
}

/**
 * Gera a summary_line via Gemini Flash; cai para o fallback determinístico se
 * a chave estiver ausente, a chamada falhar ou o output vier vazio.
 */
export async function generateLeadSummary(input: SummaryInput): Promise<string> {
  const fallback = buildLeadSummaryFallback(input);
  const apiKey = (process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY);
  if (!apiKey) return fallback;
  try {
    const userPrompt = buildLeadSummaryUserPrompt(input);
    const res = await callGemini(LEAD_SUMMARY_SYSTEM_PROMPT, userPrompt, apiKey, {
      temperature: 0.4,
      maxOutputTokens: 256,
      thinking: false,
      primaryTimeoutMs: 20000,
      fallbackTimeoutMs: 20000,
    });
    const line = normalizeLeadSummary(res.content || "");
    return line || fallback;
  } catch {
    return fallback;
  }
}
