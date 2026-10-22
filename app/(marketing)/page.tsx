import type { Metadata } from "next";
import { mao } from "@/components/marketing/home/fonte-mao";
import { RevealObserver } from "@/components/marketing/home/RevealObserver";
import { MbHome, MbNav } from "@/components/marketing/home/MbHome";
import { HomeFooter } from "@/components/marketing/home/HomeFooter";
import "../../components/marketing/home/home.css";
import "../../components/marketing/home/visuais-problema-prova.css";
import "../../components/marketing/home/visuais-mockups.css";
import "../../components/marketing/home/app-preview.css";
import "../../components/marketing/home/mobbin.css";

const SITE_URL = "https://preceptorstudio.com";
const TITLE = "Agentes de IA sob medida para operações | PRECEPTOR! Studio";
const DESCRIPTION =
  "Agente de IA feito para o seu processo: lê documentos, confere e responde no sistema que você já usa. Sua equipe só aprova. Diagnóstico de 30 min.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "PRECEPTOR! Studio",
    title: TITLE,
    description: DESCRIPTION,
    // Imagem OG a refazer na identidade v2 (copy v3, pendência 23).
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PRECEPTOR! Studio",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/p-mark-teal.png`,
  description: DESCRIPTION,
  foundingDate: "2026",
  // Endereço mantido do JSON-LD atual (copy v3, pendência 21: decidir se fica).
  address: {
    "@type": "PostalAddress",
    addressLocality: "Itajubá",
    addressRegion: "MG",
    addressCountry: "BR",
  },
  sameAs: ["https://instagram.com/preceptorstudio"],
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "thiago@ospreceptores.com",
      telephone: "+5535999191919",
      contactType: "customer support",
      areaServed: "BR",
      availableLanguage: ["pt-BR"],
    },
    {
      "@type": "ContactPoint",
      email: "thiago@ospreceptores.com",
      telephone: "+5535987035957",
      contactType: "customer support",
      areaServed: "BR",
      availableLanguage: ["pt-BR"],
    },
  ],
};

export default function MarketingHome() {
  return (
    <div className={`lp2 ${mao.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
      />
      <RevealObserver />
      <MbNav />
      <MbHome />
      <HomeFooter />
    </div>
  );
}
