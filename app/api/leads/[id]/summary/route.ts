import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";
import { generateLeadSummary } from "@/lib/leadEnrich";
import type { DiagnosticAnswers } from "@/lib/diagnosticScore";
import type { Lead } from "@/lib/leads";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

// Regenera manualmente a summary_line de um lead. Requer usuário autenticado.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = getServerSupabase();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return apiError("Não autenticado", 401);

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, diagnostic_score, diagnostic_answers, category, company, requested_contact_at"
      )
      .eq("id", params.id)
      .single();
    if (error) throw error;
    const lead = data as Pick<
      Lead,
      | "id"
      | "diagnostic_score"
      | "diagnostic_answers"
      | "category"
      | "company"
      | "requested_contact_at"
    >;

    const summary_line = await generateLeadSummary({
      answers: (lead.diagnostic_answers ?? {}) as DiagnosticAnswers,
      category: lead.category,
      score: lead.diagnostic_score,
      company: lead.company,
      requestedContact: Boolean(lead.requested_contact_at),
    });

    const { data: updated, error: upErr } = await supabase
      .from("leads")
      .update({ summary_line })
      .eq("id", params.id)
      .select("*")
      .single();
    if (upErr) throw upErr;

    return NextResponse.json({ lead: updated, summary_line });
  } catch (err) {
    return apiError(err);
  }
}
