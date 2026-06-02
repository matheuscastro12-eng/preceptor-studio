import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";
import { callGemini } from "@/lib/gemini";
import {
  buildQuickDraftSystemPrompt,
  buildQuickDraftUserPrompt,
  type QuickDraftContext,
} from "@/prompts/quickDraft";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

interface StudyRow {
  id: string;
  title: string;
  category: string;
  client_id: string | null;
  answers: Record<string, unknown> | null;
  output_md: string | null;
  scores: Record<string, unknown> | null;
  insights_chave: unknown[] | null;
  generation_metadata: Record<string, unknown> | null;
}

interface ClientRow {
  name: string | null;
}

function isInternalKey(key: string): boolean {
  return key.startsWith("__");
}

function formatAnswerValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(formatAnswerValue).filter(Boolean).join(", ");
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return String(value).trim();
}

function buildAnswersText(answers: Record<string, unknown> | null): {
  visible: string;
  notes: string;
} {
  if (!answers) return { visible: "", notes: "" };
  const visibleLines: string[] = [];
  const noteLines: string[] = [];
  const notesPayload = answers["__notes"];

  for (const [key, value] of Object.entries(answers)) {
    if (isInternalKey(key)) continue;
    const formatted = formatAnswerValue(value);
    if (!formatted) continue;
    visibleLines.push(`- ${key}: ${formatted}`);
  }

  if (notesPayload && typeof notesPayload === "object" && !Array.isArray(notesPayload)) {
    for (const [key, value] of Object.entries(notesPayload as Record<string, unknown>)) {
      const formatted = formatAnswerValue(value);
      if (!formatted) continue;
      noteLines.push(`- ${key}: ${formatted}`);
    }
  } else if (typeof notesPayload === "string" && notesPayload.trim()) {
    noteLines.push(notesPayload.trim());
  }

  return { visible: visibleLines.join("\n"), notes: noteLines.join("\n") };
}

function summarizeDiagnostic(study: StudyRow): string {
  const lines: string[] = [];
  const scores = study.scores as
    | {
        client_facing?: { overall?: number };
        internal?: { recommendation?: string; overall?: number };
      }
    | null;
  if (scores?.client_facing?.overall !== undefined) {
    lines.push(`Score cliente: ${scores.client_facing.overall}/100.`);
  }
  if (scores?.internal?.recommendation) {
    lines.push(`Recomendação interna: ${scores.internal.recommendation}.`);
  }
  if (Array.isArray(study.insights_chave) && study.insights_chave.length > 0) {
    const top = (study.insights_chave as Array<{ title?: string; body?: string }>)
      .slice(0, 4)
      .map((i, idx) => `${idx + 1}. ${i.title || ""}${i.body ? ": " + i.body : ""}`)
      .join("\n");
    lines.push("Insights-chave:\n" + top);
  }
  return lines.join("\n");
}

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const sb = getServerSupabase();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const admin = createSupabaseServiceClient();
    const { data: studyData, error: studyErr } = await admin
      .from("studies")
      .select(
        "id, title, category, client_id, answers, output_md, scores, insights_chave, generation_metadata"
      )
      .eq("id", params.id)
      .maybeSingle();
    if (studyErr) throw studyErr;
    if (!studyData) {
      return NextResponse.json({ error: "Estudo não encontrado" }, { status: 404 });
    }
    const study = studyData as StudyRow;

    let clientName: string | null = null;
    if (study.client_id) {
      const { data: clientData } = await admin
        .from("clients")
        .select("name")
        .eq("id", study.client_id)
        .maybeSingle();
      const client = (clientData || null) as ClientRow | null;
      clientName = client?.name ?? null;
    }

    const answers = buildAnswersText(study.answers);

    const ctx: QuickDraftContext = {
      studyTitle: study.title,
      clientName,
      category: study.category,
      answersText: answers.visible,
      internalNotesText: answers.notes,
      diagnosticSummary: summarizeDiagnostic(study),
      outputMd: study.output_md,
    };

    const result = await callGemini(
      buildQuickDraftSystemPrompt(),
      buildQuickDraftUserPrompt(ctx),
      apiKey,
      { temperature: 0.5, maxOutputTokens: 4096 }
    );

    const md = (result.content || "").trim();
    if (!md) {
      return NextResponse.json(
        { error: "Modelo não retornou conteúdo." },
        { status: 502 }
      );
    }

    const generatedAt = new Date().toISOString();
    const nextMeta = {
      ...(study.generation_metadata || {}),
      quick_draft_md: md,
      quick_draft_at: generatedAt,
      quick_draft_model: result.model_used,
    };

    const { error: updateErr } = await admin
      .from("studies")
      .update({
        generation_metadata: nextMeta,
        updated_at: new Date().toISOString(),
      })
      .eq("id", study.id);
    if (updateErr) throw updateErr;

    return NextResponse.json({ md, generated_at: generatedAt });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
