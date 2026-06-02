import { NextRequest, NextResponse } from "next/server";
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
import { getQuestions } from "@/lib/questions";
import { recommendationFromScore } from "@/lib/scoreColors";
import { createSupabaseServiceClient } from "@/lib/supabase";

async function recordVersion(
  studyId: string | undefined,
  outputType: "brand" | "commercial" | "thesis",
  contentMd: string | null,
  metadata: Record<string, unknown>
) {
  if (!studyId || !contentMd) return;
  try {
    const supabase = createSupabaseServiceClient();
    await supabase.from("output_versions").insert({
      study_id: studyId,
      output_type: outputType,
      content_md: contentMd,
      metadata,
    });
  } catch (e) {
    console.error("Falha registrando versão do output:", e);
  }
}

export const maxDuration = 120;

type OutputType = "brand" | "commercial" | "thesis";

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

export async function POST(req: NextRequest) {
  try {
    const { outputType, category, studyMd, clientName, title, answers, studyId } = await req.json();

    if (!outputType || !studyMd || !category) {
      return NextResponse.json(
        { error: "outputType, category e studyMd sao obrigatorios" },
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

    let systemPrompt = "";
    let userPrompt = "";

    if (outputType === "brand") {
      systemPrompt = buildBrandBriefSystemPrompt(category);
      userPrompt = buildBrandBriefUserPrompt(studyMd, clientName, title);
    } else if (outputType === "commercial") {
      systemPrompt = buildCommercialPlanSystemPrompt(category);
      userPrompt = buildCommercialPlanUserPrompt(studyMd, clientName, title);
    } else if (outputType === "thesis") {
      const questions = getQuestions(category);
      systemPrompt = buildInternalThesisSystemPrompt(category);
      userPrompt = buildInternalThesisUserPrompt(
        questions,
        answers || {},
        studyMd,
        clientName
      );
    } else {
      return NextResponse.json(
        { error: `Tipo de output invalido: ${outputType}` },
        { status: 400 }
      );
    }

    const result = await callGemini(systemPrompt, userPrompt, apiKey, {
      thinking: outputType === "thesis",
    });

    if (outputType === "thesis") {
      const thesis = extractScores(result.content || "");
      const metadata = {
        thesis_usage: result.usage,
        thesis_model: result.model_used,
        generated_at: new Date().toISOString(),
      };
      await recordVersion(studyId, "thesis", thesis.md, metadata);
      return NextResponse.json({
        success: true,
        md: thesis.md,
        internal_scores: normalizeInternalScores(thesis.scores),
        metadata,
      });
    }

    await recordVersion(studyId, outputType as "brand" | "commercial", result.content, {
      model: result.model_used,
      usage: result.usage,
      generated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      md: result.content,
    });
  } catch (err: any) {
    console.error("Erro regenerando output:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno" },
      { status: 500 }
    );
  }
}
