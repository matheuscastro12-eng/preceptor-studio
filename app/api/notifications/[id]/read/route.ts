import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const svc = createSupabaseServiceClient();
    const { data: row, error: fetchErr } = await svc
      .from("notifications")
      .select("id, read_by")
      .eq("id", params.id)
      .single();
    if (fetchErr || !row) return NextResponse.json({ ok: true });

    const readBy: string[] = Array.isArray(row.read_by) ? (row.read_by as string[]) : [];
    if (!readBy.includes(user.id)) {
      readBy.push(user.id);
      await svc.from("notifications").update({ read_by: readBy }).eq("id", params.id);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
