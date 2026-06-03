import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const auth = getServerSupabase();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    if (!q) {
      return NextResponse.json({ studies: [], leads: [], clients: [], tasks: [] });
    }
    const pattern = `%${q.replace(/[%_]/g, "")}%`;

    const supabase = createSupabaseServiceClient();
    const [studiesRes, leadsRes, clientsRes, tasksRes] = await Promise.all([
      supabase
        .from("studies")
        .select("id, title, category, status, client:clients(name)")
        .ilike("title", pattern)
        .limit(5),
      supabase
        .from("leads")
        .select("id, name, email, status, company")
        .or(`name.ilike.${pattern},email.ilike.${pattern}`)
        .limit(5),
      supabase
        .from("clients")
        .select("id, name, email")
        .or(`name.ilike.${pattern},email.ilike.${pattern}`)
        .limit(5),
      supabase
        .from("tasks")
        .select("id, title, study_id, status, sprint")
        .ilike("title", pattern)
        .limit(5),
    ]);

    return NextResponse.json({
      studies: studiesRes.data || [],
      leads: leadsRes.data || [],
      clients: clientsRes.data || [],
      tasks: tasksRes.data || [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
