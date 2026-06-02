import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export async function PATCH() {
  try {
    const supabase = getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    // Fetch via authed client so RLS scopes to visible notifications.
    const { data, error } = await supabase
      .from("notifications")
      .select("id, read_by")
      .limit(500);
    if (error) throw error;

    const svc = createSupabaseServiceClient();
    const updates = (data ?? [])
      .map((n) => {
        const readBy: string[] = Array.isArray(n.read_by) ? (n.read_by as string[]) : [];
        if (readBy.includes(user.id)) return null;
        readBy.push(user.id);
        return { id: n.id as string, read_by: readBy };
      })
      .filter((x): x is { id: string; read_by: string[] } => x !== null);

    for (const u of updates) {
      await svc.from("notifications").update({ read_by: u.read_by }).eq("id", u.id);
    }
    return NextResponse.json({ ok: true, updated: updates.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
