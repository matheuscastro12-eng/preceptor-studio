"use client";

import { Chrome } from "./Chrome";
import { Sparkle, CircleRing, DoubleCircle, MeshTexture } from "@/components/Ornaments";

const PHASES = [
  "Lendo as 11 respostas",
  "Avaliando 5 eixos",
  "Gerando plano de 90 dias",
  "Calculando benchmark do setor",
];

const PHASE_DURATION = 1.6; // segundos por fase
const CYCLE = PHASES.length * PHASE_DURATION; // total do ciclo

export function LoadingScreen({ onHome }: { onHome: () => void }) {
  return (
    <div className="screen screen--dark" data-screen-label="03b Loading">
      <Chrome onHome={onHome} cta="Voltar à home" onCta={onHome} inset />

      <MeshTexture style={{ opacity: 0.25 }} />
      <Sparkle size={28} style={{ top: 110, left: 64 }} />
      <Sparkle size={14} style={{ top: 170, left: 150, opacity: 0.6 }} />
      <DoubleCircle size={140} style={{ top: 80, right: 70, opacity: 0.35 }} />
      <CircleRing size={120} dashed style={{ bottom: 160, right: 50, opacity: 0.45 }} />
      <Sparkle size={20} style={{ bottom: 220, left: 90, opacity: 0.55 }} />

      <style>{`
        @keyframes diag-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes diag-phase {
          0%, 100% { opacity: 0; transform: translateY(4px); }
          8%, 22% { opacity: 1; transform: translateY(0); }
          30% { opacity: 0; transform: translateY(-4px); }
        }
        @keyframes diag-bullet {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          8%, 22% { opacity: 1; transform: scale(1.05); }
          30% { opacity: 0.25; transform: scale(0.85); }
        }
        .diag-spin {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 4px solid rgba(82,225,231,0.18);
          border-top-color: var(--cyan);
          animation: diag-spin 1.1s linear infinite;
        }
        .diag-phase {
          opacity: 0;
          animation: diag-phase ${CYCLE}s ease-in-out infinite;
        }
        .diag-phase__bullet {
          animation: diag-bullet ${CYCLE}s ease-in-out infinite;
        }
      `}</style>

      <div
        className="padx"
        style={{
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          position: "relative",
          zIndex: 1,
          paddingTop: 40,
          paddingBottom: 80,
          textAlign: "center",
        }}
      >
        <div className="diag-spin" aria-hidden />

        <div>
          <span className="eyebrow" style={{ color: "var(--cyan)" }}>
            Analisando sua tese
          </span>
          <h1
            className="display-md"
            style={{
              marginTop: 14,
              color: "#fff",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              maxWidth: 720,
            }}
          >
            Estamos <span className="it">lendo</span>{" "}
            <span className="cyan">suas respostas.</span>
          </h1>
          <p
            className="lead"
            style={{
              marginTop: 12,
              color: "rgba(255,255,255,0.7)",
              maxWidth: 520,
              marginInline: "auto",
            }}
          >
            O modelo está analisando o que você escreveu, ponderando contra teses similares e
            montando o plano de 90 dias.
          </p>
        </div>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "20px 0 0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: "100%",
            maxWidth: 420,
            position: "relative",
            minHeight: 180,
          }}
          aria-live="polite"
        >
          {PHASES.map((phase, idx) => (
            <li
              key={phase}
              className="diag-phase"
              style={{
                animationDelay: `${idx * PHASE_DURATION}s`,
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(82,225,231,0.25)",
                borderRadius: 14,
                color: "#fff",
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                justifyContent: "center",
              }}
            >
              <span
                className="diag-phase__bullet"
                aria-hidden
                style={{
                  display: "inline-block",
                  color: "var(--cyan)",
                  fontSize: 14,
                  animationDelay: `${idx * PHASE_DURATION}s`,
                }}
              >
                ◆
              </span>
              <span>{phase}</span>
            </li>
          ))}
        </ul>

        <p
          style={{
            marginTop: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          isso leva 10 a 15 segundos
        </p>
      </div>
    </div>
  );
}
