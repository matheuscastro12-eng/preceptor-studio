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

export const maxDuration = 120;

const INTERNAL_RECOMMENDATION = {
  ENTRAR: "entrar",
  OBSERVAR: "observar",
  NAO_ENTRAR: "nao_entrar",
} as const;

function normalizeInternalRecommendation(value: unknown, overall?: number) {
  const fallback =
    typeof overall === "number"
      ? recommendationFromScore(overall)
      : "OBSERVAR";
  const raw = String(value || fallback)
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace("NÃO", "NAO");

  if (raw === "ENTRAR" || raw === "OBSERVAR" || raw === "NAO_ENTRAR") {
    return INTERNAL_RECOMMENDATION[raw];
  }

  return INTERNAL_RECOMMENDATION[fallback];
}

function normalizeInternalScores(scores: any) {
  if (!scores || typeof scores !== "object") return null;
  const overall = typeof scores.overall === "number" ? scores.overall : undefined;
  return {
    ...scores,
    recommendation: normalizeInternalRecommendation(scores.recommendation, overall),
  };
}

// ETAPA 2: Brand + Commercial + Tese em paralelo, usando o estudo como contexto.
export async function POST(req: NextRequest) {
  try {
    const { category, answers, clientName, title, studyMd } = await req.json();
    if (!category || !studyMd) {
      return NextResponse.json(
        { error: "category e studyMd sao obrigatorios" },
        { status: 400 }
      );
    }
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY nao configurada" },
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
    const internalScores = normalizeInternalScores(thesis.scores);

    // Se as TRÊS gerações falharam, não finja sucesso: o cliente recebeu nada.
    const allFailed =
      !brandResult.content && !commercialResult.content && !thesisResult.content;
    if (allFailed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Não foi possível gerar Marca, Comercial nem Tese. Tente regenerar em alguns instantes.",
          errors: {
            brand: brandResult.error || null,
            commercial: commercialResult.error || null,
            thesis: thesisResult.error || null,
          },
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      brand_brief_md: brandResult.content || null,
      commercial_plan_md: commercialResult.content || null,
      internal_thesis_md: thesis.md || null,
      internal_scores: internalScores,
      metadata: {
        brand_usage: brandResult.usage,
        commercial_usage: commercialResult.usage,
        thesis_usage: thesisResult.usage,
        errors: {
          brand: brandResult.error || null,
          commercial: commercialResult.error || null,
          thesis: thesisResult.error || null,
        },
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
