"use client";

import { useEffect } from "react";
import { fbqTrack } from "@/lib/metaEvents";

// Dispara o evento de conversão no Meta Pixel quando a página de obrigado carrega.
// Cada ação usa um content_name diferente (comecar / automacao), e o PageView
// automático (layout) já marca a URL, então dá pra medir por URL ou por evento.
export function ObrigadoConversion({ action }: { action: "comecar" | "automacao" }) {
  useEffect(() => {
    fbqTrack("Lead", { content_name: action });
  }, [action]);
  return null;
}
