import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { regenerateInstallments, type StudyPricing } from "@/lib/finance";
import { requireUser } from "@/lib/apiAuth";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const { id } = await ctx.params;
    const input = await req.json();
    const patch: Record<string, any> = {};
    const num = (k: string) => {
      if (input[k] !== undefined) patch[k] = Number(input[k]) || 0;
    };
    const str = (k: string) => {
      if (input[k] !== undefined) patch[k] = input[k] === "" ? null : input[k];
    };
    [
      "fixed_amount_brl",
      "recurring_amount_brl",
      "equity_pct",
      "estimated_cost_brl",
      "paid_amount_brl",
    ].forEach(num);
    [
      "archetype",
      "pricing_model",
      "recurring_period",
      "payment_status",
      "start_date",
      "end_date",
      "first_installment_date",
      "notes",
    ].forEach(str);
    if (input.installments_count !== undefined) {
      patch.installments_count = Math.max(1, Math.min(36, Number(input.installments_count) || 1));
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("study_pricing")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;

    // Regenera parcelas se mudou valor, parcelas ou data
    const triggersRegen =
      input.fixed_amount_brl !== undefined ||
      input.installments_count !== undefined ||
      input.first_installment_date !== undefined ||
      input.start_date !== undefined;
    if (triggersRegen) {
      try {
        await regenerateInstallments(data as StudyPricing);
      } catch (e) {
        console.error("Falha ao regenerar parcelas:", e);
      }
    }
    return NextResponse.json({ pricing: data });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const { id } = await ctx.params;
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("study_pricing").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return apiError(e);
  }
}
