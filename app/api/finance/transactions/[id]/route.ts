import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const input = await req.json();
    const patch: any = {};
    if (input.kind !== undefined) patch.kind = input.kind === "outflow" ? "outflow" : "inflow";
    if (input.amount_brl !== undefined) {
      const amount = Number(input.amount_brl);
      if (!Number.isFinite(amount) || amount < 0) return apiError(new Error("amount_brl inválido"), 400);
      patch.amount_brl = amount;
    }
    if (input.description !== undefined) patch.description = String(input.description).trim();
    if (input.category_id !== undefined) patch.category_id = input.category_id || null;
    if (input.study_id !== undefined) patch.study_id = input.study_id || null;
    if (input.client_id !== undefined) patch.client_id = input.client_id || null;
    if (input.occurred_at !== undefined) patch.occurred_at = input.occurred_at;
    if (input.payment_method !== undefined) patch.payment_method = input.payment_method || null;
    if (input.is_recurring !== undefined) patch.is_recurring = Boolean(input.is_recurring);
    if (input.recurring_period !== undefined) patch.recurring_period = input.recurring_period || null;
    if (input.attachment_url !== undefined) patch.attachment_url = input.attachment_url || null;
    if (input.notes !== undefined) patch.notes = input.notes || null;

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("transactions")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ transaction: data });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return apiError(e);
  }
}
