import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

function apiError(error: unknown, status = 500) {
  const raw = error instanceof Error ? error.message : "Erro interno";
  let message = raw;
  let finalStatus = status;
  if (/relation .* does not exist|schema cache/i.test(raw)) {
    message =
      "Tabela client_portal_tokens não existe. Rode db/schema.sql no Supabase.";
    finalStatus = 503;
  }
  return NextResponse.json({ error: message }, { status: finalStatus });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("client_portal_tokens")
      .select("*")
      .eq("study_id", params.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ tokens: data || [] });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      client_email?: string;
      expires_in_days?: number;
    };
    const email = (body.client_email || "").trim().toLowerCase();
    if (!email) {
      return apiError(new Error("client_email é obrigatório"), 400);
    }
    const supabase = createSupabaseServiceClient();
    const expiresAt = new Date(
      Date.now() + (body.expires_in_days ?? 90) * 24 * 60 * 60 * 1000
    ).toISOString();
    const { data, error } = await supabase
      .from("client_portal_tokens")
      .insert({
        study_id: params.id,
        client_email: email,
        expires_at: expiresAt,
      })
      .select("*")
      .single();
    if (error) throw error;
    const { buildPublicUrl } = await import("@/lib/publicUrl");
    const url = buildPublicUrl(req, `/portal/${data.token}`);
    return NextResponse.json({ token: data.token, record: data, url });
  } catch (e) {
    return apiError(e);
  }
}
