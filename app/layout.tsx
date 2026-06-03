import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://preceptorstudio.com"),
  title: {
    default: "PRECEPTOR! Venture Studio",
    template: "%s · PRECEPTOR!",
  },
  description:
    "Venture Studio brasileiro que constrói produtos digitais e soluções de IA com engenharia humana, em camadas. Faça o diagnóstico técnico e empreendedor grátis.",
  applicationName: "PRECEPTOR! Studio",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06122A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-ink">{children}</body>
    </html>
  );
}
