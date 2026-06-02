import Link from "next/link";
import { MeshTexture, Sparkle, DoubleCircle, CircleRing } from "./MarketingShared";

export function CTASection() {
  return (
    <section className="section" data-screen-label="06 CTA">
      <div className="container">
        <div
          style={{
            position: "relative",
            background: "linear-gradient(160deg, #0F2A55 0%, #06122A 70%)",
            borderRadius: 28,
            overflow: "hidden",
            padding: "64px 56px",
            color: "#fff",
            border: "1px solid rgba(82,225,231,0.2)",
          }}
        >
          <MeshTexture />
          <Sparkle size={28} style={{ top: 56, left: 40 }} />
          <Sparkle size={14} style={{ top: 100, left: 90, opacity: 0.6 }} />
          <DoubleCircle size={140} style={{ top: 40, right: 40, opacity: 0.4 }} />
          <CircleRing size={100} dashed style={{ bottom: 32, right: 200 }} />
          <Sparkle size={22} style={{ bottom: 56, right: 80 }} />

          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gap: 56,
              alignItems: "center",
            }}
          >
            <div>
              <span className="eyebrow">Antes de tudo, o diagnóstico</span>
              <h2 className="mkt-h2" style={{ marginTop: 18, color: "#fff" }}>
                Faça o diagnóstico técnico e <span className="cyan">empreendedor</span>{" "}
                da sua ideia, de graça.
              </h2>
              <p
                className="mkt-lead"
                style={{
                  color: "rgba(255,255,255,0.72)",
                  marginTop: 18,
                  maxWidth: 540,
                }}
              >
                11 perguntas rápidas, sem login. Você recebe o score da sua
                tese na hora e dois pontos prioritários pra atacar. A entrada é
                livre. O estudo completo, pago, sai em 5 a 7 dias.
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
                  href="/diagnostico?start=1"
                  className="mkt-btn mkt-btn--cyan mkt-btn--lg"
                  aria-label="Fazer diagnóstico grátis"
                >
                  Fazer diagnóstico grátis
                  <span className="mkt-btn__icon" aria-hidden="true">→</span>
                </Link>
                <a
                  href="mailto:studio@preceptor.com.br?subject=Conversa%20sobre%20tese"
                  className="mkt-btn mkt-btn--ghost mkt-btn--lg"
                  aria-label="Falar com um especialista por email"
                >
                  Falar com um especialista
                  <span className="mkt-btn__icon" aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                position: "relative",
              }}
            >
              {[
                "11 perguntas rápidas, sem login",
                "Score de 0 a 100 nos 5 eixos da sua tese",
                "Dois pontos prioritários pra atacar primeiro",
                "Convite opcional para conversar com o time",
              ].map((t, i) => (
                <li
                  key={i}
                  style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(82,225,231,0.12)",
                      border: "1px solid rgba(82,225,231,0.3)",
                      color: "var(--cyan)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    0{i + 1}
                  </span>
                  <span
                    style={{
                      color: "#fff",
                      fontSize: 15,
                      lineHeight: 1.4,
                      fontWeight: 500,
                    }}
                  >
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
