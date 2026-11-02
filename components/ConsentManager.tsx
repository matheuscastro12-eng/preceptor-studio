"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { ContactClickTracker } from "@/components/ContactClickTracker";
import { consentModeState } from "@/lib/consent";

/*
 * Consentimento de cookies (LGPD): o Meta Pixel só carrega depois do "Aceitar".
 * O GA4 carrega sempre em Consent Mode v2 (tudo "denied" até o aceite, sem cookie). A escolha fica no localStorage; sem escolha, o banner aparece.
 * Para reabrir o banner (ex.: link no rodapé), dispare
 * window.dispatchEvent(new Event("preceptor:consent-open")).
 */

const META_PIXEL_ID = "4342291746023127";
const GA_ID = "G-1B7CCZ2YYK";
const KEY = "preceptor_consent";

type Choice = "granted" | "denied";

function readChoice(): Choice | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function saveChoice(c: Choice) {
  try {
    window.localStorage.setItem(KEY, c);
  } catch {
    // Sem storage, a escolha vale só para esta visita.
  }
}

export function ConsentManager() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = readChoice();
    setChoice(c);
    setOpen(c === null);
    const reopen = () => setOpen(true);
    window.addEventListener("preceptor:consent-open", reopen);
    return () => window.removeEventListener("preceptor:consent-open", reopen);
  }, []);

  function decide(c: Choice) {
    saveChoice(c);
    setOpen(false);
    // Revogar exige recarregar para descarregar os scripts já injetados.
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    try {
      w.gtag?.("consent", "update", consentModeState(c === "granted"));
    } catch {
      // ignora
    }
    if (choice === "granted" && c === "denied") window.location.reload();
    setChoice(c);
  }

  return (
    <>
      {/* Google Consent Mode v2: gtag sempre carrega, tudo "denied" até o aceite.
          Antes do aceite o Google recebe só pings sem cookie (sem _ga). */}
      <Script id="ga-consent-default" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
try{if(localStorage.getItem('preceptor_consent')==='granted'){gtag('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});}}catch(e){}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <ContactClickTracker granted={choice === "granted"} />
      {choice === "granted" && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
          </Script>
        </>
      )}

      {open && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Preferências de cookies"
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-5 text-slate-700 shadow-[0_12px_40px_-12px_rgba(0,3,61,0.35)] sm:inset-x-6"
        >
          <p className="m-0 text-sm leading-relaxed">
            Usamos cookies de análise e anúncios (Google Analytics e Meta) para
            medir o site. Eles só são ativados se você aceitar.{" "}
            <a href="/privacidade" className="font-medium text-[#00033D] underline underline-offset-2">
              Ler a política de privacidade
            </a>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => decide("granted")}
              className="rounded-full bg-[#00033D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#010226] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3BCACE]"
            >
              Aceitar cookies
            </button>
            <button
              type="button"
              onClick={() => decide("denied")}
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-[#00033D] hover:border-[#00033D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3BCACE]"
            >
              Recusar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function CookiePrefsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("preceptor:consent-open"))}
    >
      Cookies
    </button>
  );
}
