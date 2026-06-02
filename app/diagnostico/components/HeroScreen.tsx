"use client";

import { Chrome } from "./Chrome";
import {
  Sparkle,
  CircleRing,
  DoubleCircle,
  SwoopLine,
  MeshTexture,
  MiniDiamond,
} from "@/components/Ornaments";
import { ScoreDonut } from "@/components/ScoreDonut";

export function HeroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="screen" data-screen-label="01 Hero">
      <Chrome onHome={onStart} cta="Fazer diagnóstico" onCta={onStart} inset />
      <div className="hero-grid">
        <HeroLeft onStart={onStart} />
        <HeroRight />
      </div>
      <HeroFootnote />
    </div>
  );
}

function HeroLeft({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="padx"
      style={{ display: "flex", flexDirection: "column", gap: 28, padding: "32px 56px 64px" }}
    >
      <span className="chip">
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "var(--cyan-deep)",
            boxShadow: "0 0 0 4px rgba(82,225,231,0.18)",
          }}
        />
        Diagnóstico grátis, sem login
      </span>

      <h1 className="display" style={{ marginTop: 4 }}>
        <span className="navy">Engenharia real,</span>
        <br />
        <span className="it">resultados</span>
        <br />
        <span className="cyan">concretos.</span>
      </h1>

      <p className="lead">
        Responda poucas perguntas e veja onde a sua tese está forte e onde
        está exposta. Score na hora e os pontos prioritários pra atacar
        primeiro. Sem login, sem custo.
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
        <button type="button" className="btn-pill btn-pill--primary" onClick={onStart}>
          Fazer diagnóstico grátis
          <span className="btn-pill__icon">→</span>
        </button>
        <button type="button" className="btn-pill btn-pill--ghost">
          Ver como funciona
          <span className="btn-pill__icon">▶</span>
        </button>
      </div>

      <div style={{ marginTop: "auto", paddingTop: 32 }}>
        <div className="avatars">
          <div className="avatars__stack" aria-hidden="true">
            <div style={{ background: "linear-gradient(135deg,#52E1E7,#3BC8CF)" }} />
            <div style={{ background: "linear-gradient(135deg,#5D57EB,#B964FF)" }} />
            <div style={{ background: "linear-gradient(135deg,#0A1F44,#1B2F5C)" }} />
            <div style={{ background: "linear-gradient(135deg,#10B981,#3BC8CF)" }} />
          </div>
          <div className="avatars__meta">
            <span className="avatars__count">247 fundadores</span>
            <span className="avatars__label">já usaram o diagnóstico esta semana</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroRight() {
  return (
    <div className="hero-right">
      <MeshTexture />
      <Sparkle size={28} style={{ top: 56, left: 36 }} />
      <Sparkle size={14} style={{ top: 90, left: 110, opacity: 0.7 }} />
      <DoubleCircle size={120} style={{ top: 30, right: 30, opacity: 0.5 }} />
      <SwoopLine
        width={280}
        height={160}
        style={{ bottom: 120, left: -30, opacity: 0.6, color: "var(--cyan)" }}
      />
      <Sparkle size={36} style={{ bottom: 56, right: 64 }} />
      <CircleRing size={84} dashed style={{ bottom: 32, left: 56 }} />

      <div
        style={{
          position: "absolute",
          top: "52%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-3deg)",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: 22,
          padding: 20,
          width: 320,
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
            Seu score
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            v01 · preview
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <ScoreDonut value={72} size={120} strokeWidth={9} light />
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 900,
                fontSize: 26,
                color: "var(--cyan)",
                letterSpacing: "-0.025em",
              }}
            >
              Promissor
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 12.5,
                lineHeight: 1.5,
                margin: "6px 0 0",
                maxWidth: 170,
              }}
            >
              Sinais positivos em mercado e modelo.
            </p>
          </div>
        </div>
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {[
            { l: "Mercado", v: 78 },
            { l: "Execução", v: 56 },
            { l: "Modelo", v: 74 },
            { l: "Regulatório", v: 62 },
          ].map((x) => (
            <div
              key={x.l}
              style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}
            >
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
                  fontSize: 16,
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
          bottom: 36,
          right: 36,
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
        IA Claude por baixo, engenharia humana por cima
      </div>
    </div>
  );
}

function HeroFootnote() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 56px 26px",
        borderTop: "1px solid rgba(15,23,41,0.05)",
        color: "var(--ink-mute)",
        fontSize: 12,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
          v0.1 · público
        </span>
        <span style={{ width: 1, height: 12, background: "rgba(15,23,41,0.1)" }} />
        <span>LGPD compliant, dados criptografados em trânsito</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: "var(--ink-soft)",
          fontWeight: 600,
        }}
      >
        {["Saúde", "Educação", "Jurídico", "Tech"].map((label) => (
          <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <MiniDiamond size={10} color="var(--cyan-deep)" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
