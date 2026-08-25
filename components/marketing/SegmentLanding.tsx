import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Reveal } from "./Reveal";

export interface SegmentContent {
  eyebrow: string;
  title: [string, string];
  lead: string;
  pains: { title: string; body: string }[];
  automations: { title: string; body: string }[];
  results: { v: string; l: string }[];
  ctaLine: string;
}

export function SegmentLanding({ content }: { content: SegmentContent }) {
  return (
    <div className="site">
      <Nav />

      {/* Hero navy do segmento */}
      <main
        id="main"
        className="section--dark"
        style={{ padding: "96px 0 88px", position: "relative", overflow: "hidden" }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "linear-gradient(rgba(59, 202, 206, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 202, 206, 0.04) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse 90% 80% at 50% 20%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 80% at 50% 20%, black 40%, transparent 100%)",
          }}
        />
        <div className="container" style={{ position: "relative" }}>
          <span className="eyebrow">{content.eyebrow}</span>
          <h1
            className="mkt-display"
            style={{ marginTop: 20, color: "#fff", maxWidth: 760 }}
          >
            {content.title[0]}
            <br />
            <span style={{ color: "var(--teal)" }}>
              {content.title[1].split(" ").slice(0, -1).join(" ")}{" "}
              <span className="bang">{content.title[1].split(" ").at(-1)}</span>
            </span>
          </h1>
          <p
            className="mkt-lead"
            style={{ marginTop: 22, color: "rgba(255,255,255,0.75)", maxWidth: 560 }}
          >
            {content.lead}
          </p>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 32 }}
          >
            <a
              href="https://wa.me/5535999191919?text=Ol%C3%A1!%20Quero%20falar%20sobre%20a%20opera%C3%A7%C3%A3o%20da%20minha%20empresa."
              target="_blank"
              rel="noopener noreferrer"
              className="mkt-btn mkt-btn--lg"
              style={{ background: "#fff", color: "var(--navy)" }}
            >
              Falar sobre a minha operação
              <span className="mkt-btn__icon" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>
      </main>

      {/* Dores */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="mkt-sec-head">
              <div>
                <span className="eyebrow">Onde dói</span>
                <h2 className="mkt-h2" style={{ marginTop: 20 }}>
                  A rotina que o seu time
                  <br />
                  conhece <span className="bang">de cor</span>
                </h2>
              </div>
              <p className="mkt-lead">
                Cada uma dessas dores tem regra por trás. E o que tem regra, a
                gente ensina a máquina a fazer.
              </p>
            </div>
          </Reveal>
          <div className="mkt-grid-2" style={{ gap: 40 }}>
            {content.pains.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <div
                  style={{
                    paddingTop: 20,
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontFamily: "var(--font-head)",
                      fontWeight: 640,
                      fontSize: 18,
                      letterSpacing: "-0.018em",
                      color: "var(--navy)",
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14.5,
                      lineHeight: 1.65,
                      color: "var(--ink-soft)",
                    }}
                  >
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* O que passa a rodar sozinho */}
      <section className="section section--soft">
        <div className="container">
          <Reveal>
            <div className="mkt-sec-head">
              <div>
                <span className="eyebrow">O que entregamos</span>
                <h2 className="mkt-h2" style={{ marginTop: 20 }}>
                  O que passa a rodar
                  <br />
                  sem toque <span className="bang">humano</span>
                </h2>
              </div>
              <p className="mkt-lead">
                Automação em produção, medida em painel. O time entra só onde
                exige critério.
              </p>
            </div>
          </Reveal>
          <div className="mkt-spec">
            {content.automations.map((a, i) => (
              <Reveal key={a.title} delay={i * 70}>
                <div className="mkt-spec__row">
                  <span className="mkt-spec__num">/ 0{i + 1}</span>
                  <h3 className="mkt-spec__title">{a.title}</h3>
                  <p className="mkt-spec__body">{a.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div
              className="mkt-grid-3"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 40,
              }}
            >
              {content.results.map((r) => (
                <div
                  key={r.l}
                  style={{ paddingTop: 20, borderTop: "2px solid var(--navy)" }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-head)",
                      fontWeight: 650,
                      fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                      letterSpacing: "-0.025em",
                      lineHeight: 1.05,
                      color: "var(--navy)",
                    }}
                  >
                    {r.v}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 14.5,
                      lineHeight: 1.55,
                      color: "var(--ink-soft)",
                    }}
                  >
                    {r.l}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div
              style={{
                marginTop: 72,
                padding: "40px 44px",
                borderRadius: 20,
                background: "var(--navy)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-head)",
                  fontWeight: 640,
                  fontSize: "clamp(1.2rem, 2vw, 1.5rem)",
                  letterSpacing: "-0.02em",
                  color: "#fff",
                  maxWidth: 560,
                }}
              >
                {content.ctaLine}
              </p>
              <a
                href="https://wa.me/5535999191919?text=Ol%C3%A1!%20Quero%20falar%20com%20a%20equipe%20sobre%20a%20minha%20opera%C3%A7%C3%A3o."
                target="_blank"
                rel="noopener noreferrer"
                className="mkt-btn mkt-btn--lg"
                style={{ background: "#fff", color: "var(--navy)", flexShrink: 0 }}
              >
                Falar com a equipe
                <span className="mkt-btn__icon" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
