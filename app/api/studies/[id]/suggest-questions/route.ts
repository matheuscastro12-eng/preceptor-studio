import { NextRequest, NextResponse } from "next/server";
import { callGemini, extractJSON } from "@/lib/gemini";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  buildContinueStudySystemPrompt,
  buildContinueStudyUserPrompt,
} from "@/prompts/continueStudy";

export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getServerSupabase();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const apiKey = (process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY);
    if (!apiKey) {
      return NextResponse.json({ error: "GOOGLE_API_KEY não configurada" }, { status: 500 });
    }

    const supabase = createSupabaseServiceClient();
    const { data: study, error } = await supabase
      .from("studies")
      .select("id, category, output_md, internal_thesis_md, client:clients(name), generation_metadata")
      .eq("id", params.id)
      .maybeSingle();
    if (error) throw error;
    if (!study) return NextResponse.json({ error: "Estudo não encontrado" }, { status: 404 });
    if (!study.output_md) {
      return NextResponse.json(
        { error: "Estudo precisa estar gerado para sugerir perguntas." },
        { status: 400 }
      );
    }

    const clientName =
      (study.client && typeof study.client === "object" && "name" in study.client
        ? (study.client as { name?: string }).name
        : null) || null;

    const systemPrompt = buildContinueStudySystemPrompt(study.category);
    const userPrompt = buildContinueStudyUserPrompt(
      study.output_md as string,
      (study.internal_thesis_md as string | null) || null,
      clientName
    );

    const result = await callGemini(systemPrompt, userPrompt, apiKey, {
      temperature: 0.6,
      maxOutputTokens: 2048,
      thinking: false,
    });

    const parsed = extractJSON(result.content) as { questions?: unknown } | null;
    const rawQuestions = parsed && Array.isArray(parsed.questions) ? parsed.questions : [];
    const questions: string[] = rawQuestions
      .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
      .map((q) => q.trim())
      .slice(0, 3);

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "Não foi possível extrair perguntas do modelo." },
        { status: 502 }
      );
    }

    const existingMeta =
      (study.generation_metadata as Record<string, unknown> | null) || {};
    await supabase
      .from("studies")
      .update({
        generation_metadata: {
          ...existingMeta,
          next_round_questions: questions,
          next_round_generated_at: new Date().toISOString(),
        },
      })
      .eq("id", params.id);

    return NextResponse.json({ questions });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
