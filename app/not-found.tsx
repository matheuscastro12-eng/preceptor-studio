import Link from "next/link";
import "./(marketing)/marketing.css";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { MeshTexture, Sparkle, CircleRing, MiniDiamond } from "@/components/marketing/MarketingShared";

export const metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="marketing-shell">
      <div className="site">
        <Nav />
        <section className="section" style={{ paddingTop: 56 }}>
          <div className="container">
            <div
              className="mkt-card"
              style={{
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(160deg, #0F2A55 0%, #06122A 100%)",
                color: "#fff",
                padding: "64px 56px",
                borderRadius: 28,
                border: "1px solid rgba(82,225,231,0.2)",
                minHeight: 360,
              }}
            >
              <MeshTexture />
              <Sparkle size={28} style={{ top: 56, left: 40 }} />
              <CircleRing size={120} dashed style={{ bottom: 40, right: 56 }} />
              <div style={{ position: "relative", maxWidth: 560 }}>
                <span
                  className="eyebrow"
                  style={{ color: "var(--cyan)" }}
                >
                  404 , fora do mapa
                </span>
                <h1
                  className="mkt-h2"
                  style={{ marginTop: 18, color: "#fff", marginBottom: 16 }}
                >
                  Essa página <span className="cyan">saiu do mapa.</span>
                </h1>
                <p
                  className="mkt-lead"
                  style={{ color: "rgba(255,255,255,0.72)", maxWidth: 460 }}
                >
                  Pode ter sido movida, renomeada ou nunca ter existido. Volte
                  para a home ou faça o diagnóstico grátis.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 14,
                    marginTop: 28,
                  }}
                >
                  <Link
                    href="/"
                    className="mkt-btn mkt-btn--cyan mkt-btn--lg"
                    aria-label="Voltar para a home"
                  >
                    Voltar para a home
                    <span className="mkt-btn__icon" aria-hidden="true">→</span>
                  </Link>
                  <Link
                    href="/diagnostico"
                    className="mkt-btn mkt-btn--ghost mkt-btn--lg"
                    aria-label="Fazer diagnóstico grátis"
                  >
                    Fazer diagnóstico
                    <span className="mkt-btn__icon" aria-hidden="true">→</span>
                  </Link>
                </div>
                <div
                  style={{
                    marginTop: 36,
                    display: "flex",
                    gap: 14,
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 12,
                  }}
                >
                  <MiniDiamond size={9} color="var(--cyan)" />
                  <span>PRECEPTOR! Venture Studio</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}
