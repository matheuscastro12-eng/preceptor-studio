import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import type { LeadCategory } from "@/lib/leads";
import { computeScoreFields, generateLeadSummary } from "@/lib/leadEnrich";

// Formulário público de automação: insere lead no CRM (tabela leads).
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_HITS = 5;
const RATE_LIMIT_WINDOW_HOURS = 24;
const ALLOWED_CATEGORIES: LeadCategory[] = ["saude", "educacao", "juridico", "tech", "outro"];

function getIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

interface Payload {
  contact?: { nome?: string; email?: string; telefone?: string; empresa?: string };
  mensagem?: string;
  category?: string;
  consent?: boolean;
  attribution?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    landing_page?: string;
    referrer?: string;
  };
}

export async function POST(req: NextRequest) {
  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const contact = payload.contact ?? {};
  const name = String(contact.nome ?? "").trim();
  const email = String(contact.email ?? "").trim().toLowerCase();
  const phone = contact.telefone ? String(contact.telefone).trim() : null;
  const company = contact.empresa ? String(contact.empresa).trim() : null;
  const mensagem = payload.mensagem ? String(payload.mensagem).trim() : null;

  if (!name) return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  if (payload.consent !== true)
    return NextResponse.json(
      { error: "É necessário aceitar a política de privacidade para continuar." },
      { status: 400 }
    );

  const consentAt = new Date().toISOString();
  const attr = payload.attribution ?? {};
  const categoryRaw = payload.category ? String(payload.category) : null;
  const category =
    categoryRaw && (ALLOWED_CATEGORIES as string[]).includes(categoryRaw)
      ? (categoryRaw as LeadCategory)
      : null;

  const ip = getIp(req);
  const userAgent = req.headers.get("user-agent") ?? null;

  const supabase = createSupabaseServiceClient();

  // ─── Rate limit (mesma tabela do diagnóstico) ─────────────────────────
  if (ip !== "unknown") {
    const { data: rl } = await supabase
      .from("public_rate_limit")
      .select("ip, hits, window_start")
      .eq("ip", ip)
      .maybeSingle();
    const nowIso = new Date().toISOString();
    const windowMs = RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000;
    if (rl) {
      const elapsed = Date.now() - new Date(rl.window_start as string).getTime();
      if (elapsed > windowMs) {
        await supabase
          .from("public_rate_limit")
          .update({ hits: 1, window_start: nowIso })
          .eq("ip", ip);
      } else if ((rl.hits as number) >= RATE_LIMIT_HITS) {
        return NextResponse.json(
          { error: "Limite de envios atingido. Tente novamente em algumas horas." },
          { status: 429 }
        );
      } else {
        await supabase
          .from("public_rate_limit")
          .update({ hits: (rl.hits as number) + 1 })
          .eq("ip", ip);
      }
    } else {
      await supabase.from("public_rate_limit").insert({ ip, hits: 1, window_start: nowIso });
    }
  }

  // diagnostic_answers guarda o conteúdo do formulário para aparecer no CRM.
  const formAnswers: Record<string, unknown> = {
    __source_form: "automacao",
    mensagem: mensagem || null,
    setor: category,
  };

  const { data, error } = await supabase
    .from("leads")
    .insert({
      name,
      email,
      phone,
      company,
      category,
      source: "automacao",
      status: "novo",
      diagnostic_answers: formAnswers,
      notes: mensagem,
      ip_address: ip !== "unknown" ? ip : null,
      user_agent: userAgent,
      consent_given_at: consentAt,
      requested_contact_at: consentAt,
      utm_source: attr.utm_source ?? null,
      utm_medium: attr.utm_medium ?? null,
      utm_campaign: attr.utm_campaign ?? null,
      utm_content: attr.utm_content ?? null,
      utm_term: attr.utm_term ?? null,
      landing_page: attr.landing_page ?? null,
      referrer: attr.referrer ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[automation-lead] erro ao inserir lead:", error);
    return NextResponse.json(
      { error: "Não conseguimos enviar agora. Tente novamente." },
      { status: 500 }
    );
  }

  // ─── Enriquecimento comercial (best-effort) ───────────────────────────
  try {
    const scoreFields = computeScoreFields({
      diagnostic_score: null,
      diagnostic_answers: formAnswers,
      requested_contact_at: consentAt,
      created_at: consentAt,
      category,
    });
    const summary_line = await generateLeadSummary({
      answers: formAnswers as never,
      category,
      score: null,
      company,
      requestedContact: true,
    });
    await supabase.from("leads").update({ ...scoreFields, summary_line }).eq("id", data.id);
  } catch {
    // Silencioso: enriquecimento é opcional.
  }

  return NextResponse.json({ ok: true });
}
