import type { Metadata } from "next";
import { DiagnosticApp } from "./DiagnosticApp";
import { createSupabaseServiceClient } from "@/lib/supabase";

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

const SITE_URL = "https://preceptor-studio.vercel.app";

export const metadata: Metadata = {
  title: "Diagnóstico PRECEPTOR! Studio",
  description:
    "Faça o diagnóstico técnico e empreendedor da sua ideia em poucos minutos. Score da sua tese na hora e os pontos prioritários pra atacar, sem login.",
  alternates: { canonical: "/diagnostico" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_URL}/diagnostico`,
    siteName: "PRECEPTOR! Venture Studio",
    title: "Diagnóstico técnico e empreendedor · PRECEPTOR! Studio",
    description:
      "Poucos minutos, sem login. Score da sua tese na hora e os pontos prioritários pra atacar primeiro.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PRECEPTOR! Venture Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diagnóstico técnico e empreendedor · PRECEPTOR! Studio",
    description:
      "Poucos minutos, sem login. Score da sua tese na hora e os pontos prioritários pra atacar.",
    images: ["/opengraph-image"],
  },
};

const WEBPAGE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Diagnóstico PRECEPTOR! Studio",
  url: `${SITE_URL}/diagnostico`,
  description:
    "Diagnóstico técnico e empreendedor gratuito da PRECEPTOR! Studio. Poucos minutos, score da sua tese na hora e os pontos prioritários pra atacar.",
  inLanguage: "pt-BR",
  isPartOf: {
    "@type": "WebSite",
    name: "PRECEPTOR! Venture Studio",
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
      <DiagnosticApp calcomUrl={calcomUrl} />
    </>
  );
}
