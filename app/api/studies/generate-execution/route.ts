import { NextRequest, NextResponse } from "next/server";
import {
  buildExecutionPlanSystemPrompt,
  buildExecutionPlanUserPrompt,
} from "@/prompts/executionPlan";
import { callGemini, extractJSON } from "@/lib/gemini";

export const maxDuration = 60;

// ETAPA 3 — Cronograma JSON estruturado.
export async function POST(req: NextRequest) {
  try {
    const { category, clientName, title, studyMd, brandMd, commercialMd } = await req.json();
    if (!category || !studyMd) {
      return NextResponse.json(
        { error: "category e studyMd são obrigatórios" },
        { status: 400 }
      );
    }
    const apiKey = (process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY);
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const result = await callGemini(
      buildExecutionPlanSystemPrompt(category),
      buildExecutionPlanUserPrompt(studyMd, brandMd || "", commercialMd || "", clientName, title),
      apiKey,
      { temperature: 0.4, thinking: false }
    );

    const plan = extractJSON(result.content) || { error: "JSON não pôde ser parseado", sprints: [] };

    return NextResponse.json({
      success: true,
      execution_plan: plan,
      metadata: { plan_usage: result.usage, generated_at: new Date().toISOString() },
    });
  } catch (err: any) {
    console.error("Erro na execution:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno" },
      { status: 500 }
    );
  }
}
