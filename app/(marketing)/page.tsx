import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { Marquee } from "@/components/marketing/Marquee";
import { HowSection } from "@/components/marketing/HowSection";
import { DeliverablesSection } from "@/components/marketing/DeliverablesSection";
import { SectorsSection } from "@/components/marketing/SectorsSection";
import { StatsSection } from "@/components/marketing/StatsSection";
import { CTASection } from "@/components/marketing/CTASection";
import { Footer } from "@/components/marketing/Footer";

const SITE_URL = "https://preceptor-studio.vercel.app";

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PRECEPTOR! Venture Studio",
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  description:
    "Venture Studio brasileiro que constrói produtos digitais e soluções de IA com engenharia humana, em camadas.",
  founder: {
    "@type": "Person",
    name: "Luciano",
  },
  sameAs: [],
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "studio@preceptor.com.br",
      contactType: "customer support",
      areaServed: "BR",
      availableLanguage: ["pt-BR"],
    },
  ],
};

const BREADCRUMB_JSONLD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Início",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Diagnóstico",
      item: `${SITE_URL}/diagnostico`,
    },
  ],
};

export default function MarketingHome() {
  return (
    <div className="site">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSONLD) }}
      />
      <Nav />
      <Hero />
      <Marquee />
      <HowSection />
      <DeliverablesSection />
      <SectorsSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
