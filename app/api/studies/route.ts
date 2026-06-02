import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

function apiError(error: unknown, status = 500) {
  return NextResponse.json({ error: error instanceof Error ? error.message : "Erro interno" }, { status });
}

export async function GET() {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("studies")
      .select("*, client:clients(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ studies: data || [] });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const input = await req.json();
    const supabase = createSupabaseServiceClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("studies")
      .insert({
        client_id: input.client_id || null,
        title: String(input.title || "").trim(),
        category: input.category,
        status: input.status || "questionnaire",
        answers: {},
        output_md: null,
        output_html: null,
        brand_brief_md: null,
        commercial_plan_md: null,
        internal_thesis_md: null,
        insights_chave: [],
        scores: {},
        artifacts: {},
        generation_metadata: {},
        created_at: now,
        updated_at: now,
        completed_at: null,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ study: data });
  } catch (error) {
    return apiError(error);
  }
}
