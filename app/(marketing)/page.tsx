import type { Metadata } from "next";
import { mono } from "@/components/marketing/home/fonts";
import { RevealObserver } from "@/components/marketing/home/RevealObserver";
import { HomeNav } from "@/components/marketing/home/HomeNav";
import { Hero } from "@/components/marketing/home/Hero";
import { FaixaProva } from "@/components/marketing/home/FaixaProva";
import { Metodo } from "@/components/marketing/home/Metodo";
import { Exemplos } from "@/components/marketing/home/Exemplos";
import { Faq } from "@/components/marketing/home/Faq";
import { Contato } from "@/components/marketing/home/Contato";
import { HomeFooter } from "@/components/marketing/home/HomeFooter";
import "../../components/marketing/home/home.css";
import "../../components/marketing/home/visuais-hero.css";
import "../../components/marketing/home/visuais-metodo.css";
import "../../components/marketing/home/visuais-prova.css";

const SITE_URL = "https://preceptorstudio.com";
const TITLE = "PRECEPTOR! Studio | Agentes de IA que sua equipe aprova";
const DESCRIPTION =
  "Documentos, conferências e mensagens prontos para sua equipe aprovar. Primeiro o processo, depois um agente de IA. Comece com um diagnóstico de 30 min.";

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
    <div className={`lp2 ${mono.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
      />
      <RevealObserver />
      <HomeNav />
      <main id="conteudo">
        <Hero />
        <FaixaProva />
        <Metodo />
        <Exemplos />
        <Faq />
        <Contato />
      </main>
      <HomeFooter />
    </div>
  );
}
