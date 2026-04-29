import { NextRequest, NextResponse } from "next/server";
import { getQuestions } from "@/lib/questions";
import {
  buildBrandBriefSystemPrompt,
  buildBrandBriefUserPrompt,
} from "@/prompts/brandBrief";
import {
  buildCommercialPlanSystemPrompt,
  buildCommercialPlanUserPrompt,
} from "@/prompts/commercialPlan";
import {
  buildInternalThesisSystemPrompt,
  buildInternalThesisUserPrompt,
} from "@/prompts/internalThesis";
import { callGemini, extractScores } from "@/lib/gemini";
import { recommendationFromScore } from "@/lib/scoreColors";

export const maxDuration = 60;

// ETAPA 2 — Brand + Commercial + Tese em paralelo, usando o estudo como contexto.
export async function POST(req: NextRequest) {
  try {
    const { category, answers, clientName, title, studyMd } = await req.json();
    if (!category || !studyMd) {
      return NextResponse.json(
        { error: "category e studyMd são obrigatórios" },
        { status: 400 }
      );
    }
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const questions = getQuestions(category);

    const [brandResult, commercialResult, thesisResult] = await Promise.all([
      callGemini(
        buildBrandBriefSystemPrompt(category),
        buildBrandBriefUserPrompt(studyMd, clientName, title),
        apiKey,
        { thinking: false }
      ).catch((e) => ({ content: "", usage: null, error: e.message } as any)),
      callGemini(
        buildCommercialPlanSystemPrompt(category),
        buildCommercialPlanUserPrompt(studyMd, clientName, title),
        apiKey,
        { thinking: false }
      ).catch((e) => ({ content: "", usage: null, error: e.message } as any)),
      callGemini(
        buildInternalThesisSystemPrompt(category),
        buildInternalThesisUserPrompt(questions, answers || {}, studyMd, clientName),
        apiKey,
        { thinking: true }
      ).catch((e) => ({ content: "", usage: null, error: e.message } as any)),
    ]);

    const thesis = extractScores(thesisResult.content || "");
    if (
      thesis.scores &&
      typeof thesis.scores === "object" &&
      typeof thesis.scores.overall === "number"
    ) {
      thesis.scores.recommendation = recommendationFromScore(thesis.scores.overall);
    }

    return NextResponse.json({
      success: true,
      brand_brief_md: brandResult.content || null,
      commercial_plan_md: commercialResult.content || null,
      internal_thesis_md: thesis.md,
      internal_scores: thesis.scores || null,
      metadata: {
        brand_usage: brandResult.usage,
        commercial_usage: commercialResult.usage,
        thesis_usage: thesisResult.usage,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Erro na supplementary:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno" },
      { status: 500 }
    );
  }
}
