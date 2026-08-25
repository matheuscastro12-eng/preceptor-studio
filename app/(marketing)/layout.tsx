import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { FunnelTracker } from "@/components/FunnelTracker";
import "./marketing.css";

/* Display: Bricolage Grotesque, grotesco com personalidade que conversa com
   o peso do wordmark PRECEPTOR!. Corpo: Instrument Sans. */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const SITE_URL = "https://preceptorstudio.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PRECEPTOR! Studio · IA aplicada a processos",
    template: "%s · PRECEPTOR!",
  },
  description:
    "Antes de automatizar, a gente conserta o processo. Diagnóstico, redesenho e automação com IA, com resultado medido em produção. Diagnóstico grátis da operação.",
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
      "Processo primeiro, IA depois. Automação que se paga, com diagnóstico grátis da operação.",
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
    <div className={`marketing-shell ${display.variable} ${body.variable}`}>
      <FunnelTracker />
      {children}
    </div>
  );
}
