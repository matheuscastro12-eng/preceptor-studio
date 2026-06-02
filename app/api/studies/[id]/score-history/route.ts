import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getServerSupabase();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("study_score_history")
      .select("id, overall, axes, note, source, created_at")
      .eq("study_id", params.id)
      .order("created_at", { ascending: true });
    if (error) throw error;

    return NextResponse.json({ history: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
