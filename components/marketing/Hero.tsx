import {
  Sparkle,
  CircleRing,
  DoubleCircle,
  SwoopLine,
  MeshTexture,
} from "./MarketingShared";
import { HeroCta } from "./HeroCta";

export function Hero() {
  return (
    <main id="main" className="mkt-hero" data-screen-label="01 Hero">
      <div className="mkt-hero-grid">
        <div className="mkt-hero-left">
          <span className="mkt-chip">
            <span className="mkt-chip__dot" />
            Venture Studio para empreendedores, desde 2026
          </span>
          <h1 className="mkt-display">
            Da ideia
            <br />
            <span className="it">ao primeiro</span>
            <br />
            <span className="cyan">real.</span>
          </h1>
          <p className="mkt-lead">
            Empreender é arriscar dinheiro no escuro. A gente acende a luz:
            diagnóstico gratuito da sua ideia, um plano de como o negócio fatura
            e a construção do produto. Do empreendimento no papel ao primeiro
            real, sem queimar a sua grana à toa.
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
                <span className="mkt-avatars__count">14 empreendimentos</span>
                <span className="mkt-avatars__label">
                  tirados do papel com a gente este ano
                </span>
              </div>
            </div>
          </div>
        </div>

        <HeroRight />
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
          transform: "translate(-50%, -50%) rotate(-2.5deg)",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: 24,
          padding: "22px 22px 20px",
          width: 392,
          maxWidth: "calc(100% - 56px)",
          boxShadow:
            "0 40px 80px -36px rgba(0,0,0,0.6), 0 0 0 1px rgba(82,225,231,0.18) inset",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--cyan)",
            }}
          >
            Sonar do negócio
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            amostra · v01
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="9" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray="263.9"
              strokeDashoffset="73.9"
              transform="rotate(-90 50 50)"
            />
            <text x="50" y="51" textAnchor="middle" fontSize="29" fontWeight="900" fontFamily="Inter" fill="#fff">72</text>
            <text x="50" y="68" textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="2" fontFamily="Inter" fill="rgba(255,255,255,0.55)">/100</text>
          </svg>
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 900,
                fontSize: 24,
                color: "var(--cyan)",
                letterSpacing: "-0.025em",
                lineHeight: 1,
              }}
            >
              Promissor
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.72)",
                fontSize: 12.5,
                lineHeight: 1.5,
                margin: "7px 0 0",
                maxWidth: 220,
              }}
            >
              Mercado e modelo dão sinal. O custo de aquisição ainda é a
              incógnita que pode comer a margem.
            </p>
          </div>
        </div>

        <div
          style={{
            paddingTop: 14,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {[
            { l: "Mercado", v: 78, c: "#10B981" },
            { l: "Execução", v: 56, c: "#52E1E7" },
            { l: "Diferenciação", v: 60, c: "#52E1E7" },
            { l: "Modelo", v: 74, c: "#10B981" },
            { l: "Regulatório", v: 62, c: "#52E1E7" },
          ].map((x) => (
            <div
              key={x.l}
              style={{
                display: "grid",
                gridTemplateColumns: "92px 1fr 26px",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {x.l}
              </span>
              <span
                style={{
                  height: 6,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  display: "block",
                }}
              >
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    width: `${x.v}%`,
                    background: x.c,
                    borderRadius: 999,
                  }}
                />
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: 12,
                  color: x.c,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {x.v}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 15,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 13px",
            border: "1px dashed rgba(82,225,231,0.4)",
            borderRadius: 12,
            background: "rgba(6,18,42,0.35)",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "rgba(82,225,231,0.15)",
              color: "var(--cyan)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            ▣
          </span>
          <span
            style={{
              fontSize: 11,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <strong style={{ color: "#fff", fontWeight: 700 }}>
              Recomendação, plano de 90 dias e benchmark
            </strong>{" "}
            no diagnóstico completo.
          </span>
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
