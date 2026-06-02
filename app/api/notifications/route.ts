import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;

    const list = (data ?? []) as Array<Record<string, unknown>>;
    const unread_count = list.reduce((acc, n) => {
      const readBy = Array.isArray(n.read_by) ? (n.read_by as string[]) : [];
      return acc + (readBy.includes(user.id) ? 0 : 1);
    }, 0);
    return NextResponse.json({ notifications: list, unread_count });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
