import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { ObrigadoConversion } from "@/components/marketing/ObrigadoConversion";

export const metadata: Metadata = {
  title: "Recebemos seu cadastro · Começar o negócio",
  description: "Cadastro recebido.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/obrigado/comecar" },
};

export default function ObrigadoComecarPage() {
  return (
    <>
      <Nav />
      <ObrigadoConversion action="comecar" />
      <main
        style={{
          minHeight: "62vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
        }}
      >
        <div style={{ maxWidth: 560, textAlign: "center" }}>
          <span className="eyebrow" style={{ color: "var(--cyan-deep, #3BC8CF)" }}>
            Venture Studio
          </span>
          <h1
            style={{
              marginTop: 16,
              fontFamily: "var(--font-sans)",
              fontWeight: 900,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              letterSpacing: "-0.025em",
              color: "var(--navy, #0A1F44)",
              lineHeight: 1.08,
            }}
          >
            Recebemos o seu cadastro. ✅
          </h1>
          <p
            style={{
              marginTop: 16,
              fontSize: 16,
              color: "var(--ink-soft, #475569)",
              lineHeight: 1.6,
            }}
          >
            O time entra em contato para dar o próximo passo e tirar a sua ideia do
            papel. Enquanto isso, dá uma olhada em como a gente constrói.
          </p>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/" className="mkt-btn mkt-btn--cyan mkt-btn--lg">
              Voltar pro início
              <span className="mkt-btn__icon" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
