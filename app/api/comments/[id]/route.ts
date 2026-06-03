import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

async function getRoleAndUser() {
  const auth = getServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { user: null, role: null };
  const supabase = createSupabaseServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return { user, role: (profile?.role as string | undefined) || "member" };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, role } = await getRoleAndUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = (await req.json()) as { resolved?: boolean; body?: string };
    const supabase = createSupabaseServiceClient();

    const { data: existing, error: fetchErr } = await supabase
      .from("study_comments")
      .select("author_id")
      .eq("id", params.id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 });

    const isAuthor = existing.author_id === user.id;
    const isOwner = role === "owner" || role === "admin";
    if (!isAuthor && !isOwner) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const patch: Record<string, unknown> = {};
    if (typeof body.resolved === "boolean") {
      patch.resolved_at = body.resolved ? new Date().toISOString() : null;
    }
    if (typeof body.body === "string" && body.body.trim()) {
      patch.body = body.body.trim();
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("study_comments")
      .update(patch)
      .eq("id", params.id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ comment: data });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, role } = await getRoleAndUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const supabase = createSupabaseServiceClient();
    const { data: existing } = await supabase
      .from("study_comments")
      .select("author_id")
      .eq("id", params.id)
      .maybeSingle();
    if (!existing) return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 });

    const isAuthor = existing.author_id === user.id;
    const isOwner = role === "owner" || role === "admin";
    if (!isAuthor && !isOwner) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { error } = await supabase
      .from("study_comments")
      .delete()
      .eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
