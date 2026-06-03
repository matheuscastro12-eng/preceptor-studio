import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getAuthedUser } from "@/lib/apiAuth";

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

// Confirma que o usuário está autenticado E que o estudo existe.
// (Modelo single-tenant: todos os membros do estúdio acessam todos os estudos.
//  Hook pronto para validação de workspace/ownership quando virar multi-tenant.)
async function guardStudyAccess(studyId: string) {
  const user = await getAuthedUser();
  if (!user) {
    return { ok: false as const, res: apiError("Não autenticado", 401) };
  }
  const admin = createSupabaseServiceClient();
  const { data: study, error } = await admin
    .from("studies")
    .select("id")
    .eq("id", studyId)
    .maybeSingle();
  if (error) return { ok: false as const, res: apiError(error) };
  if (!study) {
    return { ok: false as const, res: apiError("Estudo não encontrado", 404) };
  }
  return { ok: true as const, admin };
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await guardStudyAccess(params.id);
  if (!guard.ok) return guard.res;
  try {
    const { data, error } = await guard.admin
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
  const guard = await guardStudyAccess(params.id);
  if (!guard.ok) return guard.res;
  try {
    const body = (await req.json().catch(() => ({}))) as {
      client_email?: string;
      expires_in_days?: number;
    };
    const email = (body.client_email || "").trim().toLowerCase();
    if (!email) {
      return apiError(new Error("client_email é obrigatório"), 400);
    }
    const expiresAt = new Date(
      Date.now() + (body.expires_in_days ?? 90) * 24 * 60 * 60 * 1000
    ).toISOString();
    const { data, error } = await guard.admin
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
