import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { DiagnosticApp } from "./DiagnosticApp";
import { createSupabaseServiceClient } from "@/lib/supabase";
import "./diag-theme.css";

const diagHead = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-diag-head",
  display: "swap",
});

const diagBody = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-diag-body",
  display: "swap",
});

export const dynamic = "force-dynamic";

async function loadCalcomUrl(): Promise<string | null> {
  try {
    const admin = createSupabaseServiceClient();
    const { data } = await admin
      .from("workspace_settings")
      .select("calcom_url")
      .eq("id", "default")
      .maybeSingle();
    const row = (data || null) as { calcom_url: string | null } | null;
    const value = row?.calcom_url?.trim();
    return value ? value : null;
  } catch {
    return null;
  }
}

const SITE_URL = "https://preceptorstudio.com";

export const metadata: Metadata = {
  title: "Diagnóstico PRECEPTOR! Studio",
  description:
    "Descubra onde a IA se paga na sua operação. Score na hora, os pontos onde o processo perde tempo e dinheiro, e por onde a automação deveria começar. Sem login.",
  alternates: { canonical: "/diagnostico" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_URL}/diagnostico`,
    siteName: "PRECEPTOR! Studio",
    title: "Diagnóstico da operação · PRECEPTOR! Studio",
    description:
      "Poucos minutos, sem login. Score da sua operação na hora e por onde a automação deveria começar.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PRECEPTOR! Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diagnóstico da operação · PRECEPTOR! Studio",
    description:
      "Poucos minutos, sem login. Score da sua operação na hora e por onde a automação deveria começar.",
    images: ["/opengraph-image"],
  },
};

const WEBPAGE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Diagnóstico PRECEPTOR! Studio",
  url: `${SITE_URL}/diagnostico`,
  description:
    "Diagnóstico de operação da PRECEPTOR! Studio. Poucos minutos, score na hora e por onde a automação se paga primeiro.",
  inLanguage: "pt-BR",
  isPartOf: {
    "@type": "WebSite",
    name: "PRECEPTOR! Studio",
    url: SITE_URL,
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Diagnóstico",
        item: `${SITE_URL}/diagnostico`,
      },
    ],
  },
};

export default async function DiagnosticoPage() {
  const calcomUrl = await loadCalcomUrl();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBPAGE_JSONLD) }}
      />
      <div className={`diag-v2 ${diagHead.variable} ${diagBody.variable}`}>
        <DiagnosticApp calcomUrl={calcomUrl} />
      </div>
    </>
  );
}
