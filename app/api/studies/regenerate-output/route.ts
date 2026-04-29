import { NextRequest, NextResponse } from "next/server";
import {
  buildBrandBriefSystemPrompt,
  buildBrandBriefUserPrompt,
} from "@/prompts/brandBrief";
import {
  buildCommercialPlanSystemPrompt,
  buildCommercialPlanUserPrompt,
} from "@/prompts/commercialPlan";
import { callGemini } from "@/lib/gemini";

export const maxDuration = 120;

type OutputType = "brand" | "commercial";

export async function POST(req: NextRequest) {
  try {
    const { outputType, category, studyMd, clientName, title } = await req.json();

    if (!outputType || !studyMd || !category) {
      return NextResponse.json(
        { error: "outputType, category e studyMd são obrigatórios" },
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

    let systemPrompt = "";
    let userPrompt = "";

    if (outputType === "brand") {
      systemPrompt = buildBrandBriefSystemPrompt(category);
      userPrompt = buildBrandBriefUserPrompt(studyMd, clientName, title);
    } else if (outputType === "commercial") {
      systemPrompt = buildCommercialPlanSystemPrompt(category);
      userPrompt = buildCommercialPlanUserPrompt(studyMd, clientName, title);
    } else {
      return NextResponse.json(
        { error: `Tipo de output inválido: ${outputType}` },
        { status: 400 }
      );
    }

    const result = await callGemini(systemPrompt, userPrompt, apiKey);

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
