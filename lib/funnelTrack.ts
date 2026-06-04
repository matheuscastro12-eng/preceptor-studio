// Tracking de funil client-side (interno, alimenta o CRM).
// Captura UTMs no primeiro acesso (persiste na sessao) e dispara eventos de topo
// para /api/public/track. Fire-and-forget, nunca quebra a UI.

const SS_UTM = "ps_utm";
const SS_SID = "ps_sid";

export interface Utms {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

type FunnelEvent = "page_view" | "diagnostic_view" | "diagnostic_start";

function safeSession(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

function newId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // ignora
  }
  return "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getSessionId(): string {
  const ss = safeSession();
  if (!ss) return newId();
  let sid = ss.getItem(SS_SID);
  if (!sid) {
    sid = newId();
    try { ss.setItem(SS_SID, sid); } catch {}
  }
  return sid;
}

// Captura UTMs da URL no primeiro acesso e persiste. Depois reusa os guardados.
function captureUtms(): Utms {
  const ss = safeSession();
  const keys: (keyof Utms)[] = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  if (typeof window !== "undefined") {
    const p = new URLSearchParams(window.location.search);
    const fromUrl: Utms = {};
    let has = false;
    for (const k of keys) {
      const v = p.get(k);
      if (v) { fromUrl[k] = v; has = true; }
    }
    if (has) {
      try { ss?.setItem(SS_UTM, JSON.stringify(fromUrl)); } catch {}
      return fromUrl;
    }
  }
  try {
    return ss ? (JSON.parse(ss.getItem(SS_UTM) || "{}") as Utms) : {};
  } catch {
    return {};
  }
}

export function getStoredUtms(): Utms {
  return captureUtms();
}

export function getAttribution(): Utms & { landing_page?: string; referrer?: string } {
  const utms = captureUtms();
  if (typeof window === "undefined") return utms;
  return {
    ...utms,
    landing_page: window.location.pathname,
    referrer: document.referrer || undefined,
  };
}

export function trackFunnel(eventType: FunnelEvent): void {
  if (typeof window === "undefined") return;
  try {
    const utms = captureUtms();
    const body = JSON.stringify({
      session_id: getSessionId(),
      event_type: eventType,
      path: window.location.pathname,
      referrer: document.referrer || null,
      ...utms,
    });
    const url = "/api/public/track";
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    } else {
      fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch {
    // tracking nunca pode derrubar a pagina
  }
}
