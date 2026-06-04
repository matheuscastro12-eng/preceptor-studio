import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import {
  makeResultFallback,
  makeResultWithGemini,
  type ClaudeGenerationMeta,
  type DiagnosticAnswers,
  type DiagnosticResult,
} from "@/lib/diagnosticScore";
import type { LeadCategory } from "@/lib/leads";
import { computeScoreFields, generateLeadSummary } from "@/lib/leadEnrich";
import { sendEmail, emailLayout, STUDIO_EMAIL } from "@/lib/email";
import { sendMetaLeadEvent } from "@/lib/metaCapi";

// O diagnóstico faz 2 chamadas Gemini (score + resumo) + e-mail: ~10-12s.
// Sem isto cai no timeout padrão da Vercel e pode dar 504 em produção.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_HITS = 3;
const RATE_LIMIT_WINDOW_HOURS = 24;
const ALLOWED_CATEGORIES: LeadCategory[] = ["saude", "educacao", "juridico", "tech", "outro"];

function getIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

interface SubmitPayload {
  answers: DiagnosticAnswers;
  contact: {
    nome: string;
    email: string;
    telefone?: string;
    empresa?: string;
  };
  category?: string;
  consent?: boolean;
  meta?: {
    event_id?: string;
    fbp?: string;
    fbc?: string;
    event_source_url?: string;
  };
}

export async function POST(req: NextRequest) {
  let payload: SubmitPayload;
  try {
    payload = (await req.json()) as SubmitPayload;
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const answers = payload.answers ?? {};
  const contact = payload.contact ?? { nome: "", email: "" };

  const name = String(contact.nome ?? "").trim();
  const email = String(contact.email ?? "").trim().toLowerCase();
  const phone = contact.telefone ? String(contact.telefone).trim() : null;
  const company = contact.empresa ? String(contact.empresa).trim() : null;

  if (!name) return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  if (payload.consent !== true)
    return NextResponse.json(
      { error: "É necessário aceitar a política de privacidade para continuar." },
      { status: 400 }
    );
  const consentAt = new Date().toISOString();

  const categoryRaw = payload.category ? String(payload.category) : null;
  const category =
    categoryRaw && (ALLOWED_CATEGORIES as string[]).includes(categoryRaw)
      ? (categoryRaw as LeadCategory)
      : null;

  const ip = getIp(req);
  const userAgent = req.headers.get("user-agent") ?? null;

  const supabase = createSupabaseServiceClient();

  // ─── Rate limit ───────────────────────────────────────────────────────
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
      await supabase
        .from("public_rate_limit")
        .insert({ ip, hits: 1, window_start: nowIso });
    }
  }

  // ─── Geração do diagnóstico ───────────────────────────────────────────
  // Caminho preferido: Gemini 2.5 Flash (rápido, barato). Fallback determinístico
  // se falhar ou se GOOGLE_API_KEY não estiver setado (ex: dev local sem chave).
  let result: DiagnosticResult;
  let meta: ClaudeGenerationMeta;

  const apiKey = process.env.GOOGLE_API_KEY;
  if (apiKey) {
    try {
      const out = await makeResultWithGemini(answers);
      result = out.result;
      meta = out.meta;
    } catch (err) {
      // Catch genérico: o usuário não pode receber 500 por causa da IA.
      result = makeResultFallback(answers);
      meta = {
        generated_by: "fallback",
        ms_elapsed: 0,
        error: err instanceof Error ? err.message : "unknown",
      };
    }
  } else {
    result = makeResultFallback(answers);
    meta = { generated_by: "fallback", ms_elapsed: 0, error: "missing GOOGLE_API_KEY" };
  }

  // ─── Insert lead ──────────────────────────────────────────────────────
  // Persistimos respostas + metadados internos (locked, recomendação, plano, etc.) em diagnostic_answers.
  // diagnostic_axes/insights mantêm os itens free (compat com CRM atual); o pacote completo fica em __internal.
  const answersWithMeta: Record<string, unknown> = {
    ...(answers as Record<string, unknown>),
    __internal: {
      recommendation: result.recommendation,
      recommendationReason: result.recommendationReason,
      bucket: result.bucket,
      headline: result.headline,
      nextSteps: result.nextSteps,
      strategicQuestions: result.strategicQuestions,
      benchmark: result.benchmark,
      lockedAxes: result.lockedAxes,
      lockedInsights: result.lockedInsights,
    },
    __meta: {
      generation_metadata: meta,
    },
  };

  const { data, error } = await supabase
    .from("leads")
    .insert({
      name,
      email,
      phone,
      company,
      category,
      source: "diagnostic_public",
      status: "novo",
      diagnostic_answers: answersWithMeta,
      diagnostic_score: result.overall,
      diagnostic_axes: result.axes,
      diagnostic_insights: result.insights,
      ip_address: ip !== "unknown" ? ip : null,
      user_agent: userAgent,
      consent_given_at: consentAt,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[diagnostic] erro ao inserir lead:", error);
    return NextResponse.json(
      { error: "Não conseguimos salvar sua resposta. Tente novamente." },
      { status: 500 }
    );
  }

  // ─── Enriquecimento comercial (best-effort) ───────────────────────────
  // Calcula priority_score + estimated_value e gera summary_line via Gemini.
  // Tudo num try/catch para NUNCA derrubar a resposta do diagnóstico público.
  try {
    const scoreFields = computeScoreFields({
      diagnostic_score: result.overall,
      diagnostic_answers: answers as Record<string, unknown>,
      requested_contact_at: null,
      created_at: new Date().toISOString(),
      category,
    });
    const summary_line = await generateLeadSummary({
      answers,
      category,
      score: result.overall,
      company,
      requestedContact: false,
    });
    await supabase
      .from("leads")
      .update({ ...scoreFields, summary_line })
      .eq("id", data.id);
  } catch {
    // Silencioso: enriquecimento é opcional. O recompute em massa cobre depois.
  }

  // ─── Meta CAPI: evento Lead server-side (best-effort, deduplicado) ─────
  // Mesmo event_id do browser (payload.meta) para o Meta nao contar 2x.
  try {
    await sendMetaLeadEvent({
      email,
      phone,
      ip: ip !== "unknown" ? ip : null,
      userAgent,
      eventId: payload.meta?.event_id ?? null,
      fbp: payload.meta?.fbp ?? null,
      fbc: payload.meta?.fbc ?? null,
      eventSourceUrl: payload.meta?.event_source_url ?? null,
      score: result.overall,
      category,
    });
  } catch {
    // Silencioso: CAPI e best-effort, nunca afeta a resposta do diagnostico.
  }

  // ─── Email do score pro lead (best-effort) ────────────────────────────
  // Nunca derruba a resposta: todo o bloco em try/catch.
  try {
    const axesRows = result.axes
      .map(
        (a) =>
          `<li style="margin:4px 0;"><strong style="color:#0A1F44;">${a.label}:</strong> ${a.value}/100</li>`
      )
      .join("");

    const insightsRows = result.insights
      .map(
        (ins) =>
          `<div style="margin:10px 0;padding:12px 14px;background:#F1F5F9;border-radius:10px;"><div style="font-weight:700;color:#0A1F44;font-size:14px;">${ins.label}</div><div style="margin-top:2px;font-size:14px;color:#475569;">${ins.body}</div></div>`
      )
      .join("");

    const firstName = name.split(" ")[0] || name;
    const bodyHtml = `
      <p style="margin:0 0 14px 0;">Ola ${firstName}, seu diagnostico PRECEPTOR! esta pronto.</p>
      <p style="margin:0 0 6px 0;font-size:18px;color:#0A1F44;"><strong>Score geral: ${result.overall}/100</strong> &middot; ${result.bucket}</p>
      <p style="margin:0 0 16px 0;">${result.headline}</p>
      <p style="margin:0 0 6px 0;font-weight:700;color:#0A1F44;">Seus 5 eixos</p>
      <ul style="margin:0 0 16px 0;padding-left:18px;">${axesRows}</ul>
      <p style="margin:0 0 6px 0;font-weight:700;color:#0A1F44;">O que ja conseguimos ver</p>
      ${insightsRows}
    `;

    const html = emailLayout({
      heading: `Seu score: ${result.overall}/100`,
      bodyHtml,
      ctaLabel: "Falar com um especialista",
      ctaUrl: `mailto:${STUDIO_EMAIL}`,
      footerNote:
        "Este e um recorte automatico. O diagnostico completo e trabalho de engenharia humana feito pelo nosso time.",
    });

    await sendEmail({
      to: email,
      subject: `Seu diagnóstico PRECEPTOR!: score ${result.overall}/100 (${result.bucket})`,
      html,
      replyTo: STUDIO_EMAIL,
    });
  } catch {
    // Silencioso: email e best-effort, nunca afeta a resposta do diagnostico.
  }

  return NextResponse.json({
    id: data.id,
    overall: result.overall,
    headline: result.headline,
    bucket: result.bucket,
    axes: result.axes,
    lockedAxes: result.lockedAxes,
    insights: result.insights,
    lockedInsights: result.lockedInsights,
    recommendation: result.recommendation,
    recommendationReason: result.recommendationReason,
    nextSteps: result.nextSteps,
    strategicQuestions: result.strategicQuestions,
    benchmark: result.benchmark,
  });
}
