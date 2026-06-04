import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["page_view", "diagnostic_view", "diagnostic_start"]);

function getIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  return real ? real.trim() : null;
}

function clip(v: unknown, max = 300): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

// Endpoint publico de tracking de funil. Best-effort: nunca falha pro cliente.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const eventType = String(body.event_type || "");
    if (!ALLOWED.has(eventType)) {
      return new NextResponse(null, { status: 204 });
    }
    const supabase = createSupabaseServiceClient();
    await supabase.from("funnel_events").insert({
      session_id: clip(body.session_id, 80),
      event_type: eventType,
      path: clip(body.path, 200),
      utm_source: clip(body.utm_source, 120),
      utm_medium: clip(body.utm_medium, 120),
      utm_campaign: clip(body.utm_campaign, 160),
      utm_content: clip(body.utm_content, 160),
      utm_term: clip(body.utm_term, 160),
      referrer: clip(body.referrer, 300),
      ip: getIp(req),
      user_agent: clip(req.headers.get("user-agent"), 300),
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    // Tracking nunca pode 500. Sempre 204.
    return new NextResponse(null, { status: 204 });
  }
}
