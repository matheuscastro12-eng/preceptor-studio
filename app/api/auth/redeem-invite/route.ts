import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { token, userId } = await req.json();
    if (typeof token !== "string" || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }
    const admin = createSupabaseServiceClient();
    const { data: invite, error: invErr } = await admin
      .from("invites")
      .select("token, role, team_key, used_at, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (invErr) throw invErr;
    if (!invite) {
      return NextResponse.json({ error: "Convite inválido" }, { status: 404 });
    }
    if (invite.used_at) {
      return NextResponse.json({ error: "Convite já usado" }, { status: 409 });
    }
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "Convite expirado" }, { status: 410 });
    }

    const { error: updErr } = await admin
      .from("profiles")
      .update({ role: invite.role, team_key: invite.team_key })
      .eq("id", userId);
    if (updErr) throw updErr;

    const { error: markErr } = await admin
      .from("invites")
      .update({ used_by: userId, used_at: new Date().toISOString() })
      .eq("token", token);
    if (markErr) throw markErr;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro interno" },
      { status: 500 }
    );
  }
}
