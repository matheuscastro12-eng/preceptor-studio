import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      signed_by_name?: string;
      signed_by_email?: string;
    };
    const name = (body.signed_by_name || "").trim();
    const email = (body.signed_by_email || "").trim().toLowerCase();
    if (!name || !email) {
      return apiError(new Error("Nome e email são obrigatórios"), 400);
    }
    const supabase = createSupabaseServiceClient();

    const { data: tokenRow, error: tokenErr } = await supabase
      .from("client_portal_tokens")
      .select("token, study_id, expires_at")
      .eq("token", params.token)
      .maybeSingle();
    if (tokenErr) throw tokenErr;
    if (!tokenRow) {
      return apiError(new Error("Token inválido"), 404);
    }
    if (
      tokenRow.expires_at &&
      new Date(tokenRow.expires_at).getTime() < Date.now()
    ) {
      return apiError(new Error("Token expirado"), 410);
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

    const { data, error } = await supabase
      .from("nda_signatures")
      .insert({
        study_id: tokenRow.study_id,
        signed_by_name: name,
        signed_by_email: email,
        ip,
        user_agent: userAgent,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ signature: data });
  } catch (e) {
    return apiError(e);
  }
}
