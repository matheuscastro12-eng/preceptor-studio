import { NextRequest, NextResponse } from "next/server";
import {
  ARTIFACT_META,
  ArtifactType,
  buildArtifactSystemPrompt,
  buildArtifactUserPrompt,
} from "@/prompts/artifacts";
import { callGemini } from "@/lib/gemini";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { artifactType, category, studyMd, clientName, title } = await req.json();

    if (!artifactType || !studyMd || !category) {
      return NextResponse.json(
        { error: "artifactType, category e studyMd são obrigatórios" },
        { status: 400 }
      );
    }

    if (!ARTIFACT_META[artifactType as ArtifactType]) {
      return NextResponse.json(
        { error: `Tipo de artefato inválido: ${artifactType}` },
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

    const result = await callGemini(
      buildArtifactSystemPrompt(artifactType, category),
      buildArtifactUserPrompt(artifactType, studyMd, clientName, title),
      apiKey
    );

    const meta = ARTIFACT_META[artifactType as ArtifactType];
    return NextResponse.json({
      success: true,
      artifact: {
        md: result.content,
        label: meta.label,
        assignee: meta.assignee,
        error: null,
      },
    });
  } catch (err: any) {
    console.error("Erro regenerando artefato:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno" },
      { status: 500 }
    );
  }
}
