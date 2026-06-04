// Helpers client-side para eventos do Meta Pixel.
// O Pixel base (init + PageView) vive em app/layout.tsx; aqui ficam os eventos de funil.
// Cada Lead recebe um event_id para deduplicar com o evento server-side (CAPI).

type FbqParams = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function fbqTrack(event: string, params?: FbqParams, eventId?: string): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    if (eventId) window.fbq("track", event, params || {}, { eventID: eventId });
    else window.fbq("track", event, params || {});
  } catch {
    // Pixel nunca pode derrubar a UI.
  }
}

export function newEventId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // ignora
  }
  return "ev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
}

// _fbp e _fbc melhoram MUITO o match quality da CAPI. Se veio fbclid na URL e o
// cookie _fbc ainda nao existe, montamos o fbc no formato esperado pelo Meta.
export function readFbCookies(): { fbp?: string; fbc?: string } {
  const fbp = readCookie("_fbp");
  let fbc = readCookie("_fbc");
  if (!fbc && typeof window !== "undefined") {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) fbc = "fb.1." + Date.now() + "." + fbclid;
  }
  return { fbp, fbc };
}
