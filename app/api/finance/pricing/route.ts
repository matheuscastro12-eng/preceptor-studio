import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { fetchPricings, regenerateInstallments, type StudyPricing } from "@/lib/finance";
import { requireUser } from "@/lib/apiAuth";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

export async function GET() {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const data = await fetchPricings();
    return NextResponse.json({ pricings: data });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const input = await req.json();
    if (!input.study_id) return apiError(new Error("study_id obrigatório"), 400);

    const supabase = createSupabaseServiceClient();
    const installmentsCount = Math.max(1, Math.min(36, Number(input.installments_count) || 1));
    const payload = {
      study_id: String(input.study_id),
      archetype: input.archetype || "empreendimento",
      pricing_model: input.pricing_model || "fixed",
      fixed_amount_brl: Number(input.fixed_amount_brl) || 0,
      recurring_amount_brl: Number(input.recurring_amount_brl) || 0,
      recurring_period: input.recurring_period || null,
      equity_pct: Number(input.equity_pct) || 0,
      estimated_cost_brl: Number(input.estimated_cost_brl) || 0,
      payment_status: input.payment_status || "pending",
      paid_amount_brl: Number(input.paid_amount_brl) || 0,
      installments_count: installmentsCount,
      first_installment_date: input.first_installment_date || input.start_date || null,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      notes: input.notes || null,
    };

    // Upsert por study_id (unique)
    const { data, error } = await supabase
      .from("study_pricing")
      .upsert(payload, { onConflict: "study_id" })
      .select("*")
      .single();
    if (error) throw error;

    // Regenera parcelas (mantém pagas, recria pendentes)
    try {
      await regenerateInstallments(data as StudyPricing);
    } catch (e) {
      console.error("Falha ao regenerar parcelas:", e);
    }

    return NextResponse.json({ pricing: data });
  } catch (e) {
    return apiError(e);
  }
}
