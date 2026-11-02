// Monta a linha de funnel_events. Sem consentimento: nada de IP, user-agent nem session_id.
export const ALLOWED_TRACK = new Set(["page_view", "diagnostic_view", "diagnostic_start", "contact_click"]);

export function clip(v: unknown, max = 300): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

export function buildTrackRow(
  body: Record<string, unknown>,
  ctx: { ip: string | null; userAgent: string | null }
): Record<string, unknown> | null {
  const eventType = String(body.event_type || "");
  if (!ALLOWED_TRACK.has(eventType)) return null;
  const consent = body.consent === true;
  let path = clip(body.path, 200);
  if (eventType === "contact_click") {
    const dest = clip(body.destination, 40);
    const label = clip(body.cta_label, 60);
    path = [path, dest, label].filter(Boolean).join(" | ").slice(0, 200) || null;
  }
  return {
    session_id: consent ? clip(body.session_id, 80) : null,
    event_type: eventType,
    path,
    utm_source: clip(body.utm_source, 120),
    utm_medium: clip(body.utm_medium, 120),
    utm_campaign: clip(body.utm_campaign, 160),
    utm_content: clip(body.utm_content, 160),
    utm_term: clip(body.utm_term, 160),
    referrer: clip(body.referrer, 300),
    ip: consent ? ctx.ip : null,
    user_agent: consent ? clip(ctx.userAgent, 300) : null,
  };
}
