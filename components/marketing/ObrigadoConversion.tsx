"use client";

import { useEffect, useRef } from "react";
import { fbqTrack } from "@/lib/metaEvents";
import { takeLeadEventId } from "@/lib/leadEvent";

// Dispara o evento de conversão no Meta Pixel quando a página de obrigado carrega.
// Cada ação usa um content_name diferente (comecar / automacao), e o PageView
// automático (layout) já marca a URL, então dá pra medir por URL ou por evento.
export function ObrigadoConversion({ action }: { action: "comecar" | "automacao" }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    // Mesmo event_id enviado à CAPI pelo formulário (dedup). O Pixel pode
    // carregar depois do efeito; tenta por até ~5s.
    const eventId = action === "automacao" ? takeLeadEventId() : undefined;
    let tries = 0;
    const tick = () => {
      if (typeof window.fbq === "function") fbqTrack("Lead", { content_name: action }, eventId);
      else if (tries++ < 10) window.setTimeout(tick, 500);
    };
    tick();
  }, [action]);
  return null;
}
