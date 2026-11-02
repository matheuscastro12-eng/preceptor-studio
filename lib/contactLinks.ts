// Classifica links de contato (WhatsApp / Instagram) para os eventos de clique.
// Puro e sem DOM: testado em tests/contactLinks.test.ts.

export type ContactDestino = "whatsapp_comercial" | "whatsapp_automacao" | "instagram";

const WA: Record<string, ContactDestino> = {
  "5535999191919": "whatsapp_comercial",
  "5535987035957": "whatsapp_automacao",
};

export function classifyContactHref(href: string | null | undefined): ContactDestino | null {
  if (!href) return null;
  let url: URL;
  try {
    url = new URL(href, "https://www.preceptorstudio.com");
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host === "wa.me") {
    const num = url.pathname.replace(/\D/g, "");
    return WA[num] ?? null;
  }
  if (host === "api.whatsapp.com") {
    const num = (url.searchParams.get("phone") || "").replace(/\D/g, "");
    return WA[num] ?? null;
  }
  if (host === "instagram.com") {
    const user = url.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    return user === "preceptorstudio" ? "instagram" : null;
  }
  return null;
}

/** Rótulo curto do CTA: data-cta tem prioridade; senão o texto do link (máx. 60). */
export function ctaLabel(dataCta: string | null | undefined, text: string | null | undefined): string {
  const raw = (dataCta || text || "").replace(/\s+/g, " ").trim();
  return raw ? raw.slice(0, 60) : "sem_rotulo";
}
