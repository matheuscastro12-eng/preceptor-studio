"use client";

import { useEffect, useRef, useState } from "react";
import { fbqTrack } from "@/lib/metaEvents";

// Indicador de seção: mostra "/ {label}" fixo na tela e atualiza conforme o
// usuário rola (com animação). Lê os data-screen-label das seções. Também
// dispara um evento no Meta Pixel a cada seção alcançada (uma vez), pra
// metrificar até onde o visitante desce na página.
export function ScreenIndicator() {
  const [label, setLabel] = useState<string>("");
  const fired = useRef<Set<string>>(new Set());

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-screen-label]")
    );
    if (els.length === 0 || typeof IntersectionObserver === "undefined") return;

    // A seção "ativa" é a que cruza a faixa central da viewport.
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const l = entry.target.getAttribute("data-screen-label") || "";
            if (!l) continue;
            setLabel(l);
            if (!fired.current.has(l)) {
              fired.current.add(l);
              fbqTrack("ViewContent", { content_name: "secao_landing", secao: l });
            }
          }
        }
      },
      // Seção ativa = aquela cujo topo já passou os 30% superiores da viewport
      // (padrão confiável: sempre há uma ativa enquanto se rola).
      { rootMargin: "-30% 0px -70% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  if (!label) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 20,
        bottom: 20,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 999,
        background: "rgba(6,18,42,0.72)",
        border: "1px solid rgba(82,225,231,0.35)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 12,
        letterSpacing: "0.08em",
        color: "#fff",
        boxShadow: "0 8px 24px -12px rgba(0,0,0,0.5)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <span style={{ color: "var(--cyan, #52E1E7)", fontWeight: 700 }}>/</span>
      {/* key reinicia a animação a cada troca de seção */}
      <span key={label} className="screen-indicator__label">
        {label}
      </span>
      <style>{`
        @keyframes screenIndicatorIn {
          from { opacity: 0; transform: translateY(6px); filter: blur(2px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .screen-indicator__label {
          display: inline-block;
          animation: screenIndicatorIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </div>
  );
}
