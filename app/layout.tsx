import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { ConsentManager } from "@/components/ConsentManager";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://preceptorstudio.com"),
  title: {
    default: "PRECEPTOR! Studio",
    template: "%s · PRECEPTOR!",
  },
  description:
    "Empresa brasileira de engenharia de processos que usa Inteligência Artificial como ferramenta. Faça o diagnóstico grátis da sua operação.",
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
    <html lang="pt-BR" className={GeistSans.variable}>
      <body className="bg-slate-50 text-ink">
        {/* GA4 e Meta Pixel só carregam após consentimento (LGPD). A variável da
            Geist fica no <html> para o banner usar a fonte da landing. */}
        <ConsentManager />
        {children}
      </body>
    </html>
  );
}
