import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";
import { callGemini, extractJSON } from "@/lib/gemini";
import {
  LEAD_TO_STUDY_SYSTEM_PROMPT,
  buildLeadToStudyUserPrompt,
  buildLeadToStudyFallback,
  normalizeLeadStudyContext,
  type LeadStudyContext,
} from "@/prompts/leadToStudy";
import type { DiagnosticAnswers } from "@/lib/diagnosticScore";

export const maxDuration = 30;

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

interface DiagnosticInternal {
  recommendation?: string;
  recommendationReason?: string;
  bucket?: string;
  headline?: string;
  nextSteps?: Array<{ title?: string; body?: string }>;
  strategicQuestions?: string[];
}

// POST /api/leads/[id]/study-context
// Lê o diagnóstico do lead e devolve um briefing inicial de estudo (best-effort).
// Requer usuário autenticado. Nunca derruba o fluxo: se o Gemini falhar, devolve
// um fallback determinístico com status 200.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = getServerSupabase();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return apiError("Não autenticado", 401);

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, name, company, category, summary_line, diagnostic_answers"
      )
      .eq("id", params.id)
      .single();
    if (error) throw error;

    const lead = data as {
      id: string;
      name: string;
      company: string | null;
      category: string | null;
      summary_line: string | null;
      diagnostic_answers: Record<string, unknown> | null;
    };

    const rawAnswers = (lead.diagnostic_answers ?? {}) as Record<string, unknown>;
    const internal = (rawAnswers.__internal ?? null) as DiagnosticInternal | null;
    // Remove os campos meta para mandar só as 11 respostas ao modelo.
    const answers: DiagnosticAnswers = {};
    const DIAGNOSTIC_KEYS: Array<keyof DiagnosticAnswers> = [
      "ideia",
      "problema",
      "cliente",
      "mercado_tamanho",
      "demanda",
      "receita",
      "execucao",
      "capital",
      "diferencial",
      "regulacao",
      "urgencia",
    ];
    for (const key of DIAGNOSTIC_KEYS) {
      const v = rawAnswers[key];
      if (typeof v === "string") answers[key] = v;
    }

    const fallback: LeadStudyContext = buildLeadToStudyFallback({
      company: lead.company,
      name: lead.name,
      category: lead.category,
      summaryLine: lead.summary_line,
    });

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ context: fallback, source: "fallback" });
    }

    try {
      const userPrompt = buildLeadToStudyUserPrompt({
        answers,
        internal,
        category: lead.category,
        company: lead.company,
        name: lead.name,
      });
      const res = await callGemini(
        LEAD_TO_STUDY_SYSTEM_PROMPT,
        userPrompt,
        apiKey,
        {
          temperature: 0.5,
          maxOutputTokens: 1500,
          thinking: false,
          primaryTimeoutMs: 25000,
          fallbackTimeoutMs: 25000,
        }
      );
      const parsed = extractJSON(res.content || "");
      const context = normalizeLeadStudyContext(parsed, fallback);
      return NextResponse.json({ context, source: "gemini" });
    } catch {
      // Best-effort: nunca derruba o fluxo de criar estudo.
      return NextResponse.json({ context: fallback, source: "fallback" });
    }
  } catch (err) {
    return apiError(err, 404);
  }
}
