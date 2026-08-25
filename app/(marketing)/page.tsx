import { Nav } from "@/components/marketing/Nav";
import DigitalSerenityHero from "@/components/ui/digital-serenity-hero";
import { ResultsSection } from "@/components/marketing/ResultsSection";
import { ProofSection } from "@/components/marketing/ProofSection";
import { SegmentsSection } from "@/components/marketing/SegmentsSection";
import { HowSection } from "@/components/marketing/HowSection";
import { AutomationSection } from "@/components/marketing/AutomationSection";
import { Footer } from "@/components/marketing/Footer";

const SITE_URL = "https://preceptorstudio.com";

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PRECEPTOR! Studio",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/p-mark-teal.png`,
  description:
    "Empresa brasileira de engenharia de processos que usa Inteligência Artificial como ferramenta. Diagnóstico, redesenho e automação medida em produção.",
  foundingDate: "2026",
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
    <div className="site">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
      />
      <Nav />
      <DigitalSerenityHero />
      <ResultsSection />
      <ProofSection />
      <SegmentsSection />
      <HowSection />
      <AutomationSection />
      <Footer />
    </div>
  );
}
