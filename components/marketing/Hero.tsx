import {
  Sparkle,
  CircleRing,
  DoubleCircle,
  SwoopLine,
  MiniDiamond,
  MeshTexture,
  ScoreDonutMini,
} from "./MarketingShared";
import { HeroCta } from "./HeroCta";

export function Hero() {
  return (
    <main id="main" className="mkt-hero" data-screen-label="01 Hero">
      <div className="mkt-hero-grid">
        <div className="mkt-hero-left">
          <span className="mkt-chip">
            <span className="mkt-chip__dot" />
            Venture Studio brasileiro, em operação desde 2024
          </span>
          <h1 className="mkt-display">
            Engenharia real,
            <br />
            <span className="it">resultados</span>
            <br />
            <span className="cyan">concretos.</span>
          </h1>
          <p className="mkt-lead">
            Tiramos a sua ideia do papel e entregamos um plano que dá pra
            executar. Comece com um diagnóstico gratuito da sua tese. Se fizer
            sentido seguir, a gente desenha o estudo estratégico e toca a
            construção junto com você.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <HeroCta />
            <a
              href="#como"
              className="mkt-btn mkt-btn--ghost"
              aria-label="Ver como funciona"
            >
              Ver como funciona
              <span className="mkt-btn__icon" aria-hidden="true">→</span>
            </a>
          </div>
          <div style={{ marginTop: "auto", paddingTop: 28 }}>
            <div className="mkt-avatars">
              <div className="mkt-avatars__stack" aria-hidden="true">
                <div style={{ background: "linear-gradient(135deg,#52E1E7,#3BC8CF)" }} />
                <div style={{ background: "linear-gradient(135deg,#5D57EB,#B964FF)" }} />
                <div style={{ background: "linear-gradient(135deg,#0A1F44,#1B2F5C)" }} />
                <div style={{ background: "linear-gradient(135deg,#10B981,#3BC8CF)" }} />
                <div style={{ background: "linear-gradient(135deg,#F59E0B,#B964FF)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="mkt-avatars__count">14 teses</span>
                <span className="mkt-avatars__label">
                  construídas com engenharia humana este ano
                </span>
              </div>
            </div>
          </div>
        </div>

        <HeroRight />
      </div>

      <div className="mkt-hero-footnote">
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--ink-mute)",
              letterSpacing: "0.08em",
            }}
          >
            est. 2024 · São Paulo, BR
          </span>
          <span style={{ width: 1, height: 12, background: "rgba(15,23,41,0.1)" }} />
          <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>
            diagnóstico técnico e empreendedor, em camadas
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "var(--ink-soft)",
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          {["Saúde", "Educação", "Jurídico", "Tech"].map((s) => (
            <span
              key={s}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <MiniDiamond size={9} color="var(--cyan-deep)" />
              {s}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}

function HeroRight() {
  return (
    <div className="mkt-hero-right">
      <MeshTexture />
      <Sparkle size={28} style={{ top: 52, left: 36 }} />
      <Sparkle size={14} style={{ top: 90, left: 110, opacity: 0.7 }} />
      <DoubleCircle size={120} style={{ top: 30, right: 30, opacity: 0.5 }} />
      <SwoopLine width={300} height={170} style={{ bottom: 120, left: -20, opacity: 0.6 }} />
      <Sparkle size={36} style={{ bottom: 56, right: 60 }} />
      <CircleRing size={84} dashed style={{ bottom: 30, left: 56 }} />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-3deg)",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: 22,
          padding: 22,
          width: 360,
          maxWidth: "calc(100% - 80px)",
          boxShadow:
            "0 30px 60px -30px rgba(0,0,0,0.6), 0 0 0 1px rgba(82,225,231,0.18) inset",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--cyan)",
            }}
          >
            Estudo estratégico
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            amostra · v01
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ScoreDonutMini value={72} size={104} strokeWidth={9} light />
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 900,
                fontSize: 22,
                color: "var(--cyan)",
                letterSpacing: "-0.025em",
                lineHeight: 1,
              }}
            >
              Promissor
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 12,
                lineHeight: 1.5,
                margin: "6px 0 0",
                maxWidth: 200,
              }}
            >
              Sinais positivos em mercado e modelo. Diferenciação a validar.
            </p>
          </div>
        </div>
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
          {[
            { l: "Mercado", v: 78 },
            { l: "Execução", v: 56 },
            { l: "Modelo", v: 74 },
            { l: "Regul.", v: 62 },
          ].map((x) => (
            <div key={x.l} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {x.l}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#fff",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {x.v}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 30,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.12)",
          padding: "10px 14px",
          borderRadius: 999,
          color: "#fff",
          fontSize: 12.5,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: "var(--cyan)",
            boxShadow: "0 0 0 4px rgba(82,225,231,0.25)",
          }}
        />
        Análise inteligente, engenharia humana no comando
      </div>
    </div>
  );
}
