"use client";

import { useEffect } from "react";
import { trackFunnel } from "@/lib/funnelTrack";

// Dispara page_view (e captura UTMs) ao montar. Vai no layout do marketing.
export function FunnelTracker() {
  useEffect(() => {
    trackFunnel("page_view");
  }, []);
  return null;
}
