import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

function apiError(error: unknown, status = 500) {
  return NextResponse.json({ error: error instanceof Error ? error.message : "Erro interno" }, { status });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("study_id", params.id)
      .order("sprint", { ascending: true })
      .order("order_index", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ tasks: data || [] });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const input = await req.json();
    const supabase = createSupabaseServiceClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        ...input,
        study_id: params.id,
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ task: data });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const input = await req.json();
    const tasks = Array.isArray(input.tasks) ? input.tasks : [];
    const supabase = createSupabaseServiceClient();
    const now = new Date().toISOString();

    const { error: deleteError } = await supabase.from("tasks").delete().eq("study_id", params.id);
    if (deleteError) throw deleteError;

    if (tasks.length === 0) return NextResponse.json({ tasks: [] });

    const { data, error } = await supabase
      .from("tasks")
      .insert(
        tasks.map((task: any) => ({
          ...task,
          study_id: params.id,
          created_at: now,
          updated_at: now,
        }))
      )
      .select("*");

    if (error) throw error;
    return NextResponse.json({ tasks: data || [] });
  } catch (error) {
    return apiError(error);
  }
}
