import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";
import { computeScoreFields } from "@/lib/leadEnrich";
import type { Lead } from "@/lib/leads";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

async function requireOwnerOrAdmin() {
  const supabase = getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, error: "Não autenticado" };
  const admin = createSupabaseServiceClient();
  const { data } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (data?.role as string | undefined) ?? "member";
  if (role !== "owner" && role !== "admin") {
    return { ok: false as const, status: 403, error: "Acesso restrito" };
  }
  return { ok: true as const, admin };
}

// Recalcula priority_score + estimated_value de TODOS os leads (retroativo).
// Não regenera summary_line (custa IA); use POST /api/leads/[id]/summary.
export async function POST() {
  const auth = await requireOwnerOrAdmin();
  if (!auth.ok) return apiError(auth.error, auth.status);
  try {
    const { data, error } = await auth.admin
      .from("leads")
      .select(
        "id, diagnostic_score, diagnostic_answers, requested_contact_at, created_at, category"
      );
    if (error) throw error;
    const leads = (data ?? []) as Array<Pick<
      Lead,
      | "id"
      | "diagnostic_score"
      | "diagnostic_answers"
      | "requested_contact_at"
      | "created_at"
      | "category"
    >>;

    let updated = 0;
    for (const lead of leads) {
      const fields = computeScoreFields({
        diagnostic_score: lead.diagnostic_score,
        diagnostic_answers: lead.diagnostic_answers,
        requested_contact_at: lead.requested_contact_at,
        created_at: lead.created_at,
        category: lead.category,
      });
      const { error: upErr } = await auth.admin
        .from("leads")
        .update(fields)
        .eq("id", lead.id);
      if (!upErr) updated += 1;
    }

    return NextResponse.json({ ok: true, total: leads.length, updated });
  } catch (err) {
    return apiError(err);
  }
}
