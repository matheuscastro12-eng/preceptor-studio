"use client";

import { useEffect, useRef, useState } from "react";
import { fbqTrack } from "@/lib/metaEvents";

// Indicador de seção: badge fixo "/ {label}" que muda conforme o scroll, com
// animação. Calcula a seção ativa por posição (scroll handler), o que é bem
// mais confiável que IntersectionObserver com band estreito. Também dispara um
// evento no Pixel por seção alcançada (uma vez), pra metrificar o scroll.
export function ScreenIndicator() {
  const [label, setLabel] = useState<string>("");
  const fired = useRef<Set<string>>(new Set());
  const raf = useRef<number | null>(null);

  useEffect(() => {
    function compute() {
      raf.current = null;
      const els = Array.from(
        document.querySelectorAll<HTMLElement>("[data-screen-label]")
      );
      if (els.length === 0) return;
      const line = window.innerHeight * 0.35; // linha de referência (35% do topo)
      let active = "";
      let bestTop = -Infinity;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        // seção cujo topo já passou a linha; pega a mais próxima da linha.
        if (r.top <= line && r.top > bestTop) {
          bestTop = r.top;
          active = el.getAttribute("data-screen-label") || "";
        }
      }
      // antes da primeira seção cruzar a linha, usa a primeira da página.
      if (!active) active = els[0].getAttribute("data-screen-label") || "";
      if (!active) return;
      setLabel((prev) => (prev === active ? prev : active));
      if (!fired.current.has(active)) {
        fired.current.add(active);
        fbqTrack("ViewContent", { content_name: "secao_landing", secao: active });
      }
    }

    function onScroll() {
      if (raf.current != null) return;
      raf.current = requestAnimationFrame(compute);
    }

    compute(); // estado inicial
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, []);

  if (!label) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 20,
        bottom: 20,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 15px",
        borderRadius: 999,
        background: "rgba(6,18,42,0.78)",
        border: "1px solid rgba(82,225,231,0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 12.5,
        letterSpacing: "0.08em",
        color: "#fff",
        boxShadow: "0 8px 24px -12px rgba(0,0,0,0.55)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <span style={{ color: "var(--cyan, #52E1E7)", fontWeight: 700 }}>/</span>
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
          animation: screenIndicatorIn 0.32s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </div>
  );
}
