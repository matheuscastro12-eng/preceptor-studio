import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";
import { callGemini } from "@/lib/gemini";
import {
  buildProposalSystemPrompt,
  buildProposalUserPrompt,
  type ProposalContext,
} from "@/prompts/commercialProposal";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

interface StudyRow {
  id: string;
  title: string;
  category: string;
  client_id: string | null;
  output_md: string | null;
  commercial_plan_md: string | null;
  brand_brief_md: string | null;
  scores: Record<string, unknown> | null;
  insights_chave: unknown[] | null;
  generation_metadata: Record<string, unknown> | null;
}

interface ClientRow {
  name: string | null;
  email: string | null;
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
      .map((i, idx) => `${idx + 1}. ${i.title || ""} ${i.body ? "· " + i.body : ""}`)
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

    const apiKey = (process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY);
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
        "id, title, category, client_id, output_md, commercial_plan_md, brand_brief_md, scores, insights_chave, generation_metadata"
      )
      .eq("id", params.id)
      .maybeSingle();
    if (studyErr) throw studyErr;
    if (!studyData) {
      return NextResponse.json({ error: "Estudo não encontrado" }, { status: 404 });
    }
    const study = studyData as StudyRow;

    let clientName: string | null = null;
    let clientEmail: string | null = null;
    if (study.client_id) {
      const { data: clientData } = await admin
        .from("clients")
        .select("name, email")
        .eq("id", study.client_id)
        .maybeSingle();
      const client = (clientData || null) as ClientRow | null;
      clientName = client?.name ?? null;
      clientEmail = client?.email ?? null;
    }

    const ctx: ProposalContext = {
      clientName,
      clientEmail,
      studyTitle: study.title,
      category: study.category,
      diagnosticSummary: summarizeDiagnostic(study),
      studyMd: study.output_md,
      commercialMd: study.commercial_plan_md,
      brandMd: study.brand_brief_md,
    };

    const result = await callGemini(
      buildProposalSystemPrompt(),
      buildProposalUserPrompt(ctx),
      apiKey,
      { temperature: 0.6, maxOutputTokens: 16384 }
    );

    const md = (result.content || "").trim();
    if (!md) {
      return NextResponse.json(
        { error: "Modelo não retornou conteúdo." },
        { status: 502 }
      );
    }

    const generatedAt = new Date().toISOString();

    const { data: versionData, error: versionErr } = await admin
      .from("output_versions")
      .insert({
        study_id: study.id,
        output_type: "artifact",
        content_md: md,
        metadata: {
          kind: "proposal",
          generated_at: generatedAt,
          model: result.model_used,
          generated_by: user.id,
        },
      })
      .select("id")
      .single();
    if (versionErr) throw versionErr;

    const nextMeta = {
      ...(study.generation_metadata || {}),
      last_proposal_md: md,
      last_proposal_at: generatedAt,
      last_proposal_version_id: (versionData as { id: string }).id,
    };

    await admin
      .from("studies")
      .update({
        generation_metadata: nextMeta,
        updated_at: new Date().toISOString(),
      })
      .eq("id", study.id);

    return NextResponse.json({
      md,
      version_id: (versionData as { id: string }).id,
      generated_at: generatedAt,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
