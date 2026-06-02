import { NextRequest, NextResponse } from "next/server";
import { callGemini, extractJSON } from "@/lib/gemini";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";
import { buildAdjacentTopicsPrompt } from "@/prompts/copilot";
import type { Category } from "@/lib/questions";

export const maxDuration = 30;

interface Body {
  question_id?: string;
  question_text?: string;
  answer?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getServerSupabase();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as Body;
    const answer = (body.answer || "").trim();
    const questionText = (body.question_text || "").trim();
    if (!answer || !questionText) {
      return NextResponse.json(
        { error: "question_text e answer são obrigatórios" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();
    const { data: study } = await supabase
      .from("studies")
      .select("category")
      .eq("id", params.id)
      .maybeSingle();

    const category = ((study?.category as Category) || "outro") as Category;

    const { system, user: userPrompt } = buildAdjacentTopicsPrompt(
      category,
      questionText,
      answer
    );

    const result = await callGemini(system, userPrompt, apiKey, {
      temperature: 0.6,
      maxOutputTokens: 400,
      thinking: false,
    });

    const parsed = extractJSON(result.content) as { topics?: unknown } | null;
    const rawTopics = Array.isArray(parsed?.topics) ? parsed!.topics : [];
    const topics: string[] = rawTopics
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.trim().replace(/[—–]/g, "").replace(/^[\-\*\d\.\)\s]+/, ""))
      .slice(0, 3);

    return NextResponse.json({ topics });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
