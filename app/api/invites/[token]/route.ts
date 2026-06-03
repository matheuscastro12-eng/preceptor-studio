import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

export async function DELETE(
  _req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError("Não autenticado", 401);
    const admin = createSupabaseServiceClient();
    const { data: me } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const role = (me?.role as string | undefined) ?? "member";
    if (role !== "owner" && role !== "admin") {
      return apiError("Acesso restrito", 403);
    }
    const { error } = await admin
      .from("invites")
      .update({ expires_at: new Date().toISOString() })
      .eq("token", params.token);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err);
  }
}
