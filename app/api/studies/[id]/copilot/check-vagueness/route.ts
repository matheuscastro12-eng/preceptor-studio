import { NextRequest, NextResponse } from "next/server";
import { callGemini, extractJSON } from "@/lib/gemini";
import { getServerSupabase } from "@/lib/supabase/server";
import { buildVaguenessPrompt } from "@/prompts/copilot";

export const maxDuration = 30;

interface Body {
  question_id?: string;
  question_text?: string;
  answer?: string;
}

interface VaguenessResult {
  vague: boolean;
  why: string | null;
}

export async function POST(
  req: NextRequest,
  _ctx: { params: { id: string } }
) {
  try {
    const auth = getServerSupabase();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const apiKey = (process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY);
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

    const { system, user: userPrompt } = buildVaguenessPrompt(
      questionText,
      answer
    );

    const result = await callGemini(system, userPrompt, apiKey, {
      temperature: 0.4,
      maxOutputTokens: 400,
      thinking: false,
    });

    const parsed = extractJSON(result.content) as {
      vague?: unknown;
      why?: unknown;
    } | null;

    const payload: VaguenessResult = {
      vague: parsed?.vague === true,
      why:
        typeof parsed?.why === "string" && parsed.why.trim().length > 0
          ? parsed.why.trim().replace(/[—–]/g, "")
          : null,
    };

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
