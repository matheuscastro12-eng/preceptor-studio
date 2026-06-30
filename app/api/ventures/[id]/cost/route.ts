import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { requireUser } from "@/lib/apiAuth";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

const COST_TYPES = new Set(["ia_anthropic", "infra", "saas", "freelance", "outro"]);

// POST /api/ventures/:id/cost  -> lança um custo na venture
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const body = (await req.json()) as {
      cost_type?: string;
      amount_brl?: number;
      study_id?: string | null;
      model?: string | null;
      description?: string | null;
      incurred_at?: string;
    };
    const amount = Number(body.amount_brl);
    if (!Number.isFinite(amount) || amount <= 0) {
      return apiError(new Error("Informe um valor válido"), 400);
    }
    const costType = body.cost_type && COST_TYPES.has(body.cost_type) ? body.cost_type : "outro";
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("cost_entries")
      .insert({
        venture_id: params.id,
        cost_type: costType,
        amount_brl: amount,
        study_id: body.study_id ?? null,
        model: body.model ?? null,
        description: body.description ?? null,
        incurred_at: body.incurred_at || new Date().toISOString().slice(0, 10),
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ entry: data });
  } catch (e) {
    return apiError(e);
  }
}
