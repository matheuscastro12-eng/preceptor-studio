import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getServerSupabase();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const url = new URL(req.url);
    const section = url.searchParams.get("section");

    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("study_comments")
      .select("*")
      .eq("study_id", params.id)
      .order("created_at", { ascending: true });
    if (section) query = query.eq("section", section);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ comments: data || [] });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getServerSupabase();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = (await req.json()) as {
      section?: string | null;
      body?: string;
      parent_id?: string | null;
      anchor?: string | null;
    };
    if (!body.body || !body.body.trim()) {
      return NextResponse.json({ error: "body obrigatório" }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", user.id)
      .maybeSingle();
    const authorName =
      (profile?.name as string | undefined) ||
      (profile?.email as string | undefined) ||
      user.email ||
      "Studio";

    const insert: Record<string, unknown> = {
      study_id: params.id,
      section: body.section ?? null,
      anchor: body.anchor ?? null,
      body: body.body.trim(),
      author_id: user.id,
      author_name: authorName,
      parent_id: body.parent_id ?? null,
    };

    const { data, error } = await supabase
      .from("study_comments")
      .insert(insert)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ comment: data });
  } catch (error) {
    return apiError(error);
  }
}
