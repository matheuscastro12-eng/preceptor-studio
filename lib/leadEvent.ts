import { hasAdsConsent, LEAD_EID_KEY } from "@/lib/consent";
import { newEventId, readFbCookies } from "@/lib/metaEvents";

/** Gera o event_id do Lead, guarda para a página /obrigado e devolve o bloco meta do payload. */
export function prepareLeadMeta() {
  const event_id = newEventId();
  try {
    window.sessionStorage.setItem(LEAD_EID_KEY, event_id);
  } catch {
    // ignora
  }
  const ads_consent = hasAdsConsent();
  const { fbp, fbc } = ads_consent ? readFbCookies() : { fbp: undefined, fbc: undefined };
  return { event_id, fbp, fbc, event_source_url: window.location.href, ads_consent };
}

/** Lê (uma vez) o event_id guardado pelo formulário. */
export function takeLeadEventId(): string | undefined {
  try {
    const v = window.sessionStorage.getItem(LEAD_EID_KEY) || undefined;
    window.sessionStorage.removeItem(LEAD_EID_KEY);
    return v;
  } catch {
    return undefined;
  }
}
