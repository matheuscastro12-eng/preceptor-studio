// Leitura do consentimento do banner (ConsentManager). Sem DOM: seguro no SSR.
export const CONSENT_KEY = "preceptor_consent";

export function hasAdsConsent(): boolean {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

/** Estados do Google Consent Mode v2 para a escolha do banner. */
export function consentModeState(granted: boolean) {
  const v = granted ? "granted" : "denied";
  return { ad_storage: v, analytics_storage: v, ad_user_data: v, ad_personalization: v } as const;
}

// Event ID do Lead: o formulário guarda, a página /obrigado reaproveita (dedup Pixel x CAPI).
export const LEAD_EID_KEY = "ps_lead_eid";
