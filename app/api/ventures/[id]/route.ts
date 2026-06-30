import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { requireUser } from "@/lib/apiAuth";
import { VENTURE_STAGES } from "@/lib/ventures";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

// Campos que a UI pode atualizar diretamente.
const PATCHABLE = new Set([
  "name",
  "stage",
  "health",
  "layer",
  "owner_team_key",
  "mrr_brl",
  "stripe_subscription_id",
  "equity_pct",
  "fair_value_brl",
  "equity_status",
  "notes",
  "client_id",
  "lead_id",
]);

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("ventures")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return apiError(new Error("Venture não encontrada"), 404);
    return NextResponse.json({ venture: data });
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const update: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (PATCHABLE.has(k)) update[k] = v;
    }
    if (update.stage && !VENTURE_STAGES.includes(update.stage as never)) {
      return apiError(new Error("Estágio inválido"), 400);
    }
    if (Object.keys(update).length === 0) {
      return apiError(new Error("Nada para atualizar"), 400);
    }
    const supabase = createSupabaseServiceClient();

    // Para registrar mudança de estágio na timeline, lê o estágio anterior.
    let prevStage: string | null = null;
    if (typeof update.stage === "string") {
      const { data: cur } = await supabase
        .from("ventures")
        .select("stage")
        .eq("id", params.id)
        .maybeSingle();
      prevStage = (cur?.stage as string) ?? null;
    }

    const { data, error } = await supabase
      .from("ventures")
      .update(update)
      .eq("id", params.id)
      .select("*")
      .single();
    if (error) throw error;

    // Best-effort: registra o evento de estágio. Nunca derruba o PATCH.
    if (typeof update.stage === "string" && prevStage && prevStage !== update.stage) {
      try {
        await supabase.from("venture_events").insert({
          venture_id: params.id,
          type: "estagio",
          title: `Estágio: ${prevStage} para ${update.stage}`,
        });
      } catch {
        /* ignora */
      }
    }

    return NextResponse.json({ venture: data });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("ventures").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
