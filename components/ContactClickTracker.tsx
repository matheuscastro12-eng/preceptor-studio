"use client";

import { useEffect } from "react";
import { classifyContactHref, ctaLabel } from "@/lib/contactLinks";
import { fbqTrack, newEventId, readFbCookies } from "@/lib/metaEvents";
import { trackFunnel } from "@/lib/funnelTrack";

/*
 * Mede cliques nos links de WhatsApp (wa.me) e Instagram do site.
 * Sempre: contagem própria sem cookie/ID (/api/public/track) e GA4 em Consent Mode.
 * Só após o "Aceitar" (LGPD): Meta Pixel e CAPI.
 * Dispara: Meta Pixel "Contact" (com eventID), GA4 "contact_click" e o mesmo
 * evento via CAPI (/api/public/contact-event), deduplicado pelo eventID.
 * Para rotular um CTA, use data-cta="hero_whatsapp" no <a>.
 */
export function ContactClickTracker({ granted }: { granted: boolean }) {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const destino = classifyContactHref(a.getAttribute("href"));
      if (!destino) return;
      const label = ctaLabel(a.dataset.cta, a.textContent);
      trackFunnel("contact_click", { cta_label: label, destination: destino });
      const eventId = newEventId();
      const params = { content_name: label, content_category: destino };

      if (granted) fbqTrack("Contact", params, eventId);

      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      try {
        w.gtag?.("event", "contact_click", {
          cta_label: label,
          destination: destino,
          page_path: window.location.pathname,
          transport_type: "beacon",
        });
      } catch {
        // GA nunca derruba a UI.
      }

      if (!granted) return;
      try {
        const { fbp, fbc } = readFbCookies();
        const body = JSON.stringify({
          event_id: eventId,
          cta_label: label,
          destination: destino,
          fbp,
          fbc,
          event_source_url: window.location.href,
          ads_consent: true,
        });
        const blob = new Blob([body], { type: "application/json" });
        if (!navigator.sendBeacon?.("/api/public/contact-event", blob)) {
          void fetch("/api/public/contact-event", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
        }
      } catch {
        // best-effort
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [granted]);
  return null;
}
