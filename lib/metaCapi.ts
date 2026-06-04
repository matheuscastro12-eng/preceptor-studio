// Meta Conversions API (CAPI) - evento Lead server-side.
// Recupera 20 a 40% dos eventos que o pixel do browser perde (iOS, cookies, adblock).
// Deduplicado com o evento do browser pelo mesmo event_id.
//
// Requer as variaveis de ambiente:
//   META_PIXEL_ID    (opcional, default 4342291746023127)
//   META_CAPI_TOKEN  (token de System User no Business Manager)
// Sem o token, vira no-op silencioso (nao quebra nada).

import crypto from "node:crypto";

const GRAPH = "https://graph.facebook.com/v19.0";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export interface MetaLeadInput {
  email?: string | null;
  phone?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  eventId?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  eventSourceUrl?: string | null;
  score?: number | null;
  category?: string | null;
}

export interface MetaCapiResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

export async function sendMetaLeadEvent(input: MetaLeadInput): Promise<MetaCapiResult> {
  const pixelId = process.env.META_PIXEL_ID || "4342291746023127";
  const token = process.env.META_CAPI_TOKEN;
  if (!token) return { ok: false, skipped: true, error: "META_CAPI_TOKEN ausente" };

  const userData: Record<string, unknown> = {};
  if (input.email) userData.em = [sha256(input.email)];
  if (input.phone) {
    const digits = input.phone.replace(/\D/g, "");
    if (digits) userData.ph = [sha256(digits)];
  }
  if (input.ip) userData.client_ip_address = input.ip;
  if (input.userAgent) userData.client_user_agent = input.userAgent;
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;

  const event: Record<string, unknown> = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    user_data: userData,
    custom_data: {
      content_name: "diagnostico",
      content_category: input.category || "geral",
      ...(typeof input.score === "number" ? { predicted_score: input.score } : {}),
    },
  };
  if (input.eventId) event.event_id = input.eventId;
  if (input.eventSourceUrl) event.event_source_url = input.eventSourceUrl;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(
      GRAPH + "/" + pixelId + "/events?access_token=" + encodeURIComponent(token),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [event] }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: "CAPI " + res.status + ": " + body.slice(0, 200) };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "erro desconhecido" };
  }
}
