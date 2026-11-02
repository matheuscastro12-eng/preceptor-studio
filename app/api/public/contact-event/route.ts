import { NextResponse } from "next/server";
import { sendMetaEvent } from "@/lib/metaCapi";

// Espelho server-side (CAPI) do clique em WhatsApp/Instagram.
// Só envia com consentimento de anúncios; deduplica pelo event_id do Pixel.
// Sem META_CAPI_TOKEN vira no-op. Sempre responde 204.

const DESTINOS = new Set(["whatsapp_comercial", "whatsapp_automacao", "instagram"]);

export async function POST(req: Request) {
  let p: Record<string, unknown> = {};
  try {
    p = (await req.json()) as Record<string, unknown>;
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  const str = (v: unknown, max = 200) => (typeof v === "string" && v ? v.slice(0, max) : null);
  const destino = str(p.destination, 40);
  if (p.ads_consent !== true || !destino || !DESTINOS.has(destino) || !str(p.event_id, 80)) {
    return new NextResponse(null, { status: 204 });
  }
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip");
  try {
    await sendMetaEvent({
      eventName: "Contact",
      eventId: str(p.event_id, 80),
      ip: ip || null,
      userAgent: req.headers.get("user-agent"),
      fbp: str(p.fbp),
      fbc: str(p.fbc),
      eventSourceUrl: str(p.event_source_url, 500),
      customData: { content_name: str(p.cta_label, 60) || "sem_rotulo", content_category: destino },
    });
  } catch {
    // best-effort
  }
  return new NextResponse(null, { status: 204 });
}
