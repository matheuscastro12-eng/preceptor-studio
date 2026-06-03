import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { requireUser } from "@/lib/apiAuth";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

// POST /api/finance/installments/[id]/pay
// Marca parcela como paga, cria uma transaction inflow e atualiza paid_amount do pricing.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const { id } = await ctx.params;
    const input = await req.json().catch(() => ({} as any));
    const sb = createSupabaseServiceClient();

    // Pega a parcela
    const { data: inst, error: errInst } = await sb
      .from("pricing_installments")
      .select("*, pricing:study_pricing(*), study:studies(id, title, client_id)")
      .eq("id", id)
      .single();
    if (errInst || !inst) throw errInst || new Error("Parcela não encontrada");
    if (inst.status === "paid") {
      return NextResponse.json({ installment: inst, transaction: null, alreadyPaid: true });
    }

    const paidAt = input.paid_at || new Date().toISOString().slice(0, 10);
    const paymentMethod = input.payment_method || null;
    const description =
      input.description ||
      `Parcela ${inst.installment_number}/${inst.total_installments} · ${inst.study?.title || "estudo"}`;

    // Cria transação
    const { data: tx, error: errTx } = await sb
      .from("transactions")
      .insert({
        kind: "inflow",
        amount_brl: Number(inst.amount_brl) || 0,
        description,
        category_id: input.category_id || null,
        study_id: inst.study_id,
        client_id: inst.study?.client_id || null,
        occurred_at: paidAt,
        payment_method: paymentMethod,
        is_recurring: false,
        recurring_period: null,
        notes: input.notes || null,
      })
      .select("*")
      .single();
    if (errTx) throw errTx;

    // Atualiza a parcela
    const { data: updated, error: errUpd } = await sb
      .from("pricing_installments")
      .update({
        status: "paid",
        paid_at: paidAt,
        transaction_id: tx.id,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (errUpd) throw errUpd;

    // Atualiza paid_amount + payment_status do pricing
    const pricingId = inst.pricing_id;
    const { data: allInst } = await sb
      .from("pricing_installments")
      .select("amount_brl, status")
      .eq("pricing_id", pricingId);
    const paidSum = (allInst || [])
      .filter((i: any) => i.status === "paid")
      .reduce((acc: number, i: any) => acc + Number(i.amount_brl), 0);
    const totalSum = (allInst || []).reduce((acc: number, i: any) => acc + Number(i.amount_brl), 0);
    const status =
      paidSum >= totalSum - 0.01 ? "paid" : paidSum > 0 ? "partial" : "pending";
    await sb
      .from("study_pricing")
      .update({ paid_amount_brl: paidSum, payment_status: status })
      .eq("id", pricingId);

    return NextResponse.json({ installment: updated, transaction: tx });
  } catch (e) {
    return apiError(e);
  }
}

// DELETE /api/finance/installments/[id]/pay
// Reverte: marca como pending e remove a transação criada.
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const { id } = await ctx.params;
    const sb = createSupabaseServiceClient();
    const { data: inst, error } = await sb
      .from("pricing_installments")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !inst) throw error || new Error("Parcela não encontrada");

    if (inst.transaction_id) {
      await sb.from("transactions").delete().eq("id", inst.transaction_id);
    }
    const { data: updated, error: errUpd } = await sb
      .from("pricing_installments")
      .update({ status: "pending", paid_at: null, transaction_id: null })
      .eq("id", id)
      .select("*")
      .single();
    if (errUpd) throw errUpd;

    // Recalcula pricing
    const { data: allInst } = await sb
      .from("pricing_installments")
      .select("amount_brl, status")
      .eq("pricing_id", inst.pricing_id);
    const paidSum = (allInst || [])
      .filter((i: any) => i.status === "paid")
      .reduce((acc: number, i: any) => acc + Number(i.amount_brl), 0);
    const totalSum = (allInst || []).reduce((acc: number, i: any) => acc + Number(i.amount_brl), 0);
    const status =
      paidSum >= totalSum - 0.01 && totalSum > 0
        ? "paid"
        : paidSum > 0
        ? "partial"
        : "pending";
    await sb
      .from("study_pricing")
      .update({ paid_amount_brl: paidSum, payment_status: status })
      .eq("id", inst.pricing_id);

    return NextResponse.json({ installment: updated });
  } catch (e) {
    return apiError(e);
  }
}
