import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { FunnelTracker } from "@/components/FunnelTracker";
import "./marketing.css";

/* Geist em títulos e corpo (as variáveis --font-display/--font-body apontam
   para ela em marketing.css). Sem monoespaçada na landing. */

const SITE_URL = "https://preceptorstudio.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PRECEPTOR! Studio · IA aplicada a processos",
    template: "%s · PRECEPTOR!",
  },
  description:
    "Antes de automatizar, a gente conserta o processo. Engenharia de Processos e Inteligência Artificial aplicada, com resultado medido em produção.",
  keywords: [
    "ia aplicada",
    "automação de processos",
    "agentes de ia",
    "engenharia de processos",
    "automação com ia",
    "b2b brasil",
    "diagnóstico de operação",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "PRECEPTOR! Studio",
    title: "PRECEPTOR! Studio · IA aplicada a processos",
    description:
      "Antes de automatizar, a gente conserta o processo. Diagnóstico, redesenho e automação com IA, com resultado medido em produção.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PRECEPTOR! Studio · IA aplicada a processos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PRECEPTOR! Studio · IA aplicada a processos",
    description:
      "Processo primeiro, Inteligência Artificial depois. Automação que se paga, medida em produção.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`marketing-shell ${GeistSans.variable}`}>
      <FunnelTracker />
      {children}
    </div>
  );
}
