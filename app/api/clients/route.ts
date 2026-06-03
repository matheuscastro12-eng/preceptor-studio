import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

function apiError(error: unknown, status = 500) {
  return NextResponse.json({ error: error instanceof Error ? error.message : "Erro interno" }, { status });
}

export async function POST(req: Request) {
  try {
    const input = await req.json();
    const supabase = createSupabaseServiceClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("clients")
      .insert({
        name: String(input.name || "").trim(),
        email: input.email || null,
        phone: input.phone || null,
        notes: input.notes || null,
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ client: data });
  } catch (error) {
    return apiError(error);
  }
}
