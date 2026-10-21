// Tracking de funil client-side (interno, alimenta o CRM).
// Captura UTMs, gclid e fbclid (guarda 90 dias) e dispara eventos de topo
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

const LS_ATTR = "ps_attr";
const ATTR_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const UTM_KEYS: (keyof Utms)[] = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const CLICK_KEYS = ["gclid", "fbclid"] as const;

export type Attribution = Utms & { gclid?: string; fbclid?: string; landing_page?: string; referrer?: string };

function safeLocal(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

// Le UTMs, gclid e fbclid da URL. Se vierem, guarda por 90 dias (com a pagina
// de entrada e o referrer daquele acesso). Sem parametros na URL, reusa o guardado.
function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const ls = safeLocal();
  const p = new URLSearchParams(window.location.search);
  const fromUrl: Attribution = {};
  let has = false;
  for (const k of [...UTM_KEYS, ...CLICK_KEYS]) {
    const v = p.get(k);
    if (v) { fromUrl[k] = v.slice(0, 300); has = true; }
  }
  if (has) {
    fromUrl.landing_page = window.location.pathname;
    fromUrl.referrer = document.referrer || undefined;
    try { ls?.setItem(LS_ATTR, JSON.stringify({ at: Date.now(), v: fromUrl })); } catch {}
    try { safeSession()?.setItem(SS_UTM, JSON.stringify(fromUrl)); } catch {}
    return fromUrl;
  }
  try {
    const raw = ls?.getItem(LS_ATTR);
    if (raw) {
      const { at, v } = JSON.parse(raw) as { at: number; v: Attribution };
      if (Date.now() - at < ATTR_TTL_MS) return v;
      ls?.removeItem(LS_ATTR);
    }
  } catch {}
  try {
    return JSON.parse(safeSession()?.getItem(SS_UTM) || "{}") as Attribution;
  } catch {
    return {};
  }
}

function captureUtms(): Utms {
  const a = captureAttribution();
  const out: Utms = {};
  for (const k of UTM_KEYS) if (a[k]) out[k] = a[k];
  return out;
}

export function getStoredUtms(): Utms {
  return captureUtms();
}

export function getAttribution(): Attribution {
  const a = captureAttribution();
  if (typeof window === "undefined") return a;
  return {
    ...a,
    landing_page: a.landing_page ?? window.location.pathname,
    referrer: a.referrer ?? (document.referrer || undefined),
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
