import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

function apiError(error: unknown, status = 500) {
  return NextResponse.json({ error: error instanceof Error ? error.message : "Erro interno" }, { status });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("studies")
      .select("*, client:clients(*)")
      .eq("id", params.id)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ study: data || null });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const patch = await req.json();
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("studies")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ study: data });
  } catch (error) {
    return apiError(error);
  }
}
