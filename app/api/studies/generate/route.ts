import { NextRequest, NextResponse } from "next/server";
import { getQuestions } from "@/lib/questions";
import {
  buildClientStudySystemPrompt,
  buildClientStudyUserPrompt,
} from "@/prompts/clientStudy";
import {
  callGemini,
  extractScores,
  extractInsights,
  GEMINI_MODEL_NAME,
} from "@/lib/gemini";
import { computeOverall } from "@/lib/scoreColors";
import { enforceRateLimit } from "@/lib/rateLimit";

export const maxDuration = 60;

// ETAPA 1 — Apenas o Estudo do Cliente (com scores e insights).
// As demais etapas (brand, comercial, tese, cronograma) viram chamadas separadas.
export async function POST(req: NextRequest) {
  // Cap de custo da geração por IA (rota já exige auth via middleware).
  const limited = await enforceRateLimit(req, "generate_study", 30, 1);
  if (limited) return limited;
  try {
    const { category, answers, clientName, sectorContext } = await req.json();

    if (!category || !answers) {
      return NextResponse.json(
        { error: "category e answers são obrigatórios" },
        { status: 400 }
      );
    }

    const apiKey = (process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY);
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY não configurada no servidor" },
        { status: 500 }
      );
    }

    const questions = getQuestions(category);

    // Contexto setorial vindo do template. Aceita do body (sectorContext) ou,
    // como fallback, embutido nas respostas (answers.__sector_context) para não
    // depender de mudança no fluxo do questionário.
    const sector =
      (sectorContext as Record<string, unknown> | null | undefined) ||
      (answers && typeof answers.__sector_context === "object"
        ? (answers.__sector_context as Record<string, unknown>)
        : null);

    const clientResult = await callGemini(
      buildClientStudySystemPrompt(category),
      buildClientStudyUserPrompt(
        questions,
        answers,
        clientName,
        sector as
          | {
              context_notes?: string;
              suggested_questions?: string[];
              common_risks?: string[];
            }
          | null
      ),
      apiKey,
      { thinking: false }
    );

    const insights = extractInsights(clientResult.content);
    const client = extractScores(insights.md);

    if (!client.md) {
      return NextResponse.json(
        { error: "Estudo do cliente vazio", raw: clientResult.content?.slice(0, 400) },
        { status: 500 }
      );
    }

    if (client.scores && typeof client.scores === "object") {
      try {
        const overall = computeOverall({
          mercado: client.scores.mercado,
          execucao: client.scores.execucao,
          diferenciacao: client.scores.diferenciacao,
          modelo_receita: client.scores.modelo_receita,
          risco_regulatorio: client.scores.risco_regulatorio,
        });
        client.scores.overall = overall;
      } catch {}
    }

    return NextResponse.json({
      success: true,
      output_md: client.md,
      insights_chave: insights.insights || [],
      scores: { client_facing: client.scores },
      metadata: {
        model: GEMINI_MODEL_NAME,
        client_usage: clientResult.usage,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Erro na geração:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno" },
      { status: 500 }
    );
  }
}
