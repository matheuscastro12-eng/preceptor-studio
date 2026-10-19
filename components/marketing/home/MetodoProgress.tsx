"use client";

import { useEffect, useRef } from "react";

/*
 * Linha vertical do Método: a escala Y acompanha o quanto da lista de passos
 * já cruzou 60% da altura da tela. Cada passo [data-step] que cruza essa
 * linha ganha .is-active.
 */
export function MetodoProgress({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const fill = fillRef.current;
    if (!wrap || !fill) return;
    const steps = Array.from(wrap.querySelectorAll<HTMLElement>("[data-step]"));
    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const mark = vh * 0.6;
      const rect = wrap.getBoundingClientRect();
      const p = rect.height > 0 ? (mark - rect.top) / rect.height : 0;
      const clamped = Math.max(0, Math.min(1, p));
      fill.style.transform = `scaleY(${clamped})`;
      for (const step of steps) {
        const top = step.getBoundingClientRect().top;
        step.classList.toggle("is-active", top < mark);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    wrap.classList.add("is-tracking");
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className="lp2-metodo__passos">
      <span className="lp2-metodo__trilho" aria-hidden="true">
        <span ref={fillRef} className="lp2-metodo__fill" />
      </span>
      {children}
    </div>
  );
}
