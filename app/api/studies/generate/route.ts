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

export const maxDuration = 60;

// ETAPA 1 — Apenas o Estudo do Cliente (com scores e insights).
// As demais etapas (brand, comercial, tese, cronograma) viram chamadas separadas.
export async function POST(req: NextRequest) {
  try {
    const { category, answers, clientName } = await req.json();

    if (!category || !answers) {
      return NextResponse.json(
        { error: "category e answers são obrigatórios" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY não configurada no servidor" },
        { status: 500 }
      );
    }

    const questions = getQuestions(category);

    const clientResult = await callGemini(
      buildClientStudySystemPrompt(category),
      buildClientStudyUserPrompt(questions, answers, clientName),
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
