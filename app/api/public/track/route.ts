import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { buildTrackRow } from "@/lib/trackRow";

export const dynamic = "force-dynamic";

function getIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  return real ? real.trim() : null;
}

// Endpoint publico de tracking de funil. Best-effort: nunca falha pro cliente.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const row = buildTrackRow(body, { ip: getIp(req), userAgent: req.headers.get("user-agent") });
    if (!row) return new NextResponse(null, { status: 204 });
    const supabase = createSupabaseServiceClient();
    await supabase.from("funnel_events").insert(row);
    return new NextResponse(null, { status: 204 });
  } catch {
    // Tracking nunca pode 500. Sempre 204.
    return new NextResponse(null, { status: 204 });
  }
}
