import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; version_id: string } }
) {
  try {
    const auth = getServerSupabase();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("output_versions")
      .select("*")
      .eq("study_id", params.id)
      .eq("id", params.version_id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Versão não encontrada" }, { status: 404 });
    return NextResponse.json({ version: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
