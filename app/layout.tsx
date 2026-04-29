import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Preceptor! Studio",
  description: "Plataforma interna de geração de Estudos Estratégicos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-ink">{children}</body>
    </html>
  );
}
