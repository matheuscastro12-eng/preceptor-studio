import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { fetchTransactions } from "@/lib/finance";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const data = await fetchTransactions({
      from: url.searchParams.get("from") || undefined,
      to: url.searchParams.get("to") || undefined,
      kind: (url.searchParams.get("kind") as any) || undefined,
      studyId: url.searchParams.get("study_id") || undefined,
      limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
    });
    return NextResponse.json({ transactions: data });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const input = await req.json();
    const kind = input.kind === "outflow" ? "outflow" : "inflow";
    const amount = Number(input.amount_brl);
    if (!Number.isFinite(amount) || amount < 0) {
      return apiError(new Error("amount_brl inválido"), 400);
    }
    const description = String(input.description || "").trim();
    if (!description) return apiError(new Error("description obrigatória"), 400);

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        kind,
        amount_brl: amount,
        description,
        category_id: input.category_id || null,
        study_id: input.study_id || null,
        client_id: input.client_id || null,
        occurred_at: input.occurred_at || new Date().toISOString().slice(0, 10),
        payment_method: input.payment_method || null,
        is_recurring: Boolean(input.is_recurring),
        recurring_period: input.is_recurring ? input.recurring_period || "monthly" : null,
        attachment_url: input.attachment_url || null,
        notes: input.notes || null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ transaction: data });
  } catch (e) {
    return apiError(e);
  }
}
