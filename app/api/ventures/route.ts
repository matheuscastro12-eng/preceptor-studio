import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { requireUser } from "@/lib/apiAuth";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

// POST /api/ventures  -> cria uma venture nova
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const body = (await req.json()) as {
      name?: string;
      client_id?: string | null;
      lead_id?: string | null;
      stage?: string;
      layer?: string | null;
    };
    const name = (body.name || "").trim();
    if (!name) return apiError(new Error("Nome é obrigatório"), 400);

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("ventures")
      .insert({
        name,
        client_id: body.client_id ?? null,
        lead_id: body.lead_id ?? null,
        stage: body.stage ?? "lead",
        layer: body.layer ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ venture: data });
  } catch (e) {
    return apiError(e);
  }
}
