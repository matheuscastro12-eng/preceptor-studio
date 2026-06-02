import type { Metadata } from "next";
import "./marketing.css";

const SITE_URL = "https://preceptor-studio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PRECEPTOR! Venture Studio",
    template: "%s · PRECEPTOR!",
  },
  description:
    "Venture Studio brasileiro que constrói produtos digitais e soluções de IA com engenharia humana, em camadas. Diagnóstico técnico e empreendedor grátis.",
  keywords: [
    "venture studio",
    "ai factory",
    "diagnóstico técnico",
    "estudo estratégico",
    "b2b brasil",
    "produtos digitais",
    "engenharia humana",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "PRECEPTOR! Venture Studio",
    title: "PRECEPTOR! Venture Studio",
    description:
      "Construímos produtos digitais e soluções de IA com engenharia humana, em camadas. Diagnóstico técnico e empreendedor grátis.",
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
    title: "PRECEPTOR! Venture Studio",
    description:
      "Engenharia real. Resultados concretos. Venture Studio B2B com diagnóstico grátis.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/icon", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="marketing-shell">{children}</div>;
}
