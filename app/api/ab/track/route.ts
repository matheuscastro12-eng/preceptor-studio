import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { enforceRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const VALID_EVENTS = new Set(["impression", "click"]);
const MAX_LEN = 120;

// Always returns { ok: true } so we never leak internals to the public front.
function ok() {
  return NextResponse.json({ ok: true });
}

function clean(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_LEN);
}

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "ab_track", 60, 1);
  if (limited) return limited;
  try {
    const body = (await req.json()) as Record<string, unknown>;

    const experiment = clean(body.experiment);
    const variant = clean(body.variant);
    const eventType = clean(body.event_type);
    const sessionId = clean(body.session_id);

    // Validate shape; silently drop malformed payloads.
    if (!experiment || !variant || !VALID_EVENTS.has(eventType)) {
      return ok();
    }

    const supabase = createSupabaseServiceClient();
    await supabase.from("ab_events").insert({
      experiment,
      variant,
      event_type: eventType,
      session_id: sessionId || null,
    });
  } catch {
    // Never surface errors to the public endpoint.
  }
  return ok();
}
