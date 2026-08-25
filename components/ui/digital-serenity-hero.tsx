"use client";

import React, { useEffect, useRef, useState } from "react";
import { HeroCta } from "@/components/marketing/HeroCta";

/*
 * Hero "Digital Serenity": canvas navy com grid desenhado, palavras que
 * aparecem uma a uma, gradiente que segue o mouse e ripples no clique.
 * Efeitos de mouse sao relativos ao container, entao nada vaza pra pagina.
 */

type Ripple = { id: number; x: number; y: number };

function W({
  d,
  children,
  className,
}: {
  d: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`word-animate ${className ?? ""}`} data-delay={d}>
      {children}
    </span>
  );
}

const pageStyles = `
  .ds-hero .word-animate { display: inline-block; opacity: 0; margin: 0 0.12em; transition: color 0.3s ease, transform 0.3s ease; }
  .ds-hero .word-animate:hover { color: #9FE7E9; transform: translateY(-2px); }
  @keyframes ds-word-appear { 0% { opacity: 0; transform: translateY(30px) scale(0.8); filter: blur(10px); } 50% { opacity: 0.8; transform: translateY(10px) scale(0.95); filter: blur(2px); } 100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
  @keyframes ds-grid-draw { 0% { stroke-dashoffset: 1000; opacity: 0; } 50% { opacity: 0.3; } 100% { stroke-dashoffset: 0; opacity: 0.15; } }
  @keyframes ds-pulse-glow { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.1); } }
  .ds-hero .grid-line { stroke: #3BCACE; stroke-width: 0.5; opacity: 0; stroke-dasharray: 5 5; stroke-dashoffset: 1000; animation: ds-grid-draw 2s ease-out forwards; }
  .ds-hero .detail-dot { fill: #3BCACE; opacity: 0; animation: ds-pulse-glow 3s ease-in-out infinite; }
  .ds-hero .corner-element { position: absolute; width: 36px; height: 36px; border: 1px solid rgba(59, 202, 206, 0.3); opacity: 0; animation: ds-word-appear 1s ease-out forwards; }
  .ds-hero .corner-dot { position: absolute; width: 8px; height: 8px; border-radius: 999px; background: #3BCACE; opacity: 0.5; }
  .ds-hero .floating-dot { position: absolute; width: 2px; height: 2px; background: #9FE7E9; border-radius: 50%; opacity: 0; animation: ds-float 4s ease-in-out infinite; }
  @keyframes ds-float { 0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; } 25% { transform: translateY(-10px) translateX(5px); opacity: 0.6; } 50% { transform: translateY(-5px) translateX(-3px); opacity: 0.4; } 75% { transform: translateY(-15px) translateX(7px); opacity: 0.8; } }
  .ds-hero .ripple-effect { position: absolute; width: 4px; height: 4px; background: rgba(59, 202, 206, 0.6); border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none; animation: ds-pulse-glow 1s ease-out forwards; z-index: 50; }
  .ds-hero .ds-underline { position: relative; }
  .ds-hero .ds-underline::after { content: ""; position: absolute; bottom: -8px; left: 0; width: 0; height: 1px; background: linear-gradient(90deg, transparent, #3BCACE, transparent); animation: ds-underline-grow 2s ease-out forwards; animation-delay: 2.4s; }
  @keyframes ds-underline-grow { to { width: 100%; } }
  .ds-hero .ds-mouse-gradient { position: absolute; pointer-events: none; border-radius: 9999px; background-image: radial-gradient(circle, rgba(59, 202, 206, 0.09), rgba(59, 202, 206, 0.04), transparent 70%); transform: translate(-50%, -50%); will-change: left, top, opacity; transition: left 70ms linear, top 70ms linear, opacity 300ms ease-out; }
  .ds-hero .ds-fade-in { opacity: 0; animation: ds-word-appear 1s ease-out forwards; }
  .ds-hero .ds-eyebrow { font-family: var(--font-mono); font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.28em; color: #3BCACE; }
  .ds-hero .ds-line { height: 1px; width: 56px; margin: 0 auto; background: linear-gradient(90deg, transparent, #3BCACE, transparent); opacity: 0.5; }
  .ds-hero .mkt-btn--cyan { background: #ffffff; color: #00033D; }
  .ds-hero .mkt-btn--cyan:hover { background: #EAF9FA; }
  .ds-hero .mkt-btn--cyan .mkt-btn__icon { background: #3BCACE; color: #00033D; }
  .ds-hero .ds-h1 { font-family: var(--font-head); font-weight: 650; letter-spacing: -0.03em; }
  .ds-hero .ds-h1-sub { font-family: var(--font-head); font-weight: 400; letter-spacing: -0.015em; }
  .ds-hero .ds-dot { display: inline-block; width: 0.16em; height: 0.16em; border-radius: 999px; background: #3BCACE; margin-left: 0.06em; }
  @media (prefers-reduced-motion: reduce) {
    .ds-hero .word-animate, .ds-hero .ds-fade-in, .ds-hero .corner-element { opacity: 1 !important; animation: none !important; }
    .ds-hero .grid-line { animation: none !important; opacity: 0.15; stroke-dashoffset: 0; }
    .ds-hero .floating-dot, .ds-hero .detail-dot { animation: none !important; opacity: 0.25; }
  }
`;

export default function DigitalSerenityHero() {
  const rootRef = useRef<HTMLElement>(null);
  const [mouseGradient, setMouseGradient] = useState({
    left: "0px",
    top: "0px",
    opacity: 0,
  });
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Palavras aparecem uma a uma conforme o data-delay.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const timeoutId = setTimeout(() => {
      root.querySelectorAll<HTMLElement>(".word-animate").forEach((word) => {
        const delay = parseInt(word.getAttribute("data-delay") || "0", 10);
        setTimeout(() => {
          word.style.animation = "ds-word-appear 0.8s ease-out forwards";
        }, delay);
      });
    }, 400);
    return () => clearTimeout(timeoutId);
  }, []);

  // Pontos flutuantes comecam depois da entrada do texto.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const dots = root.querySelectorAll<HTMLElement>(".floating-dot");
    const timeoutId = setTimeout(() => {
      dots.forEach((el, index) => {
        setTimeout(() => {
          el.style.animationPlayState = "running";
          el.style.opacity = "";
        }, index * 150);
      });
    }, 2600);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      setMouseGradient({
        left: `${e.clientX - rect.left}px`,
        top: `${e.clientY - rect.top}px`,
        opacity: 1,
      });
    };
    const handleMouseLeave = () =>
      setMouseGradient((prev) => ({ ...prev, opacity: 0 }));
    const handleClick = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const newRipple: Ripple = {
        id: Date.now(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setRipples((prev) => [...prev, newRipple]);
      setTimeout(
        () => setRipples((prev) => prev.filter((r) => r.id !== newRipple.id)),
        1000
      );
    };

    root.addEventListener("mousemove", handleMouseMove);
    root.addEventListener("mouseleave", handleMouseLeave);
    root.addEventListener("click", handleClick);
    return () => {
      root.removeEventListener("mousemove", handleMouseMove);
      root.removeEventListener("mouseleave", handleMouseLeave);
      root.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <main id="main" data-screen-label="01 Hero">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <section
        ref={rootRef}
        className="ds-hero relative overflow-hidden text-white"
        style={{
          minHeight: "min(86vh, 820px)",
          background:
            "radial-gradient(ellipse 70% 55% at 30% 0%, rgba(59, 202, 206, 0.10), transparent 60%), linear-gradient(165deg, #00033D 0%, #010226 100%)",
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="dsHeroGrid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(59, 202, 206, 0.06)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dsHeroGrid)" />
          <line x1="0" y1="18%" x2="100%" y2="18%" className="grid-line" style={{ animationDelay: "0.5s" }} />
          <line x1="0" y1="82%" x2="100%" y2="82%" className="grid-line" style={{ animationDelay: "1s" }} />
          <line x1="15%" y1="0" x2="15%" y2="100%" className="grid-line" style={{ animationDelay: "1.5s" }} />
          <line x1="85%" y1="0" x2="85%" y2="100%" className="grid-line" style={{ animationDelay: "2s" }} />
          <circle cx="15%" cy="18%" r="2" className="detail-dot" style={{ animationDelay: "3s" }} />
          <circle cx="85%" cy="18%" r="2" className="detail-dot" style={{ animationDelay: "3.2s" }} />
          <circle cx="15%" cy="82%" r="2" className="detail-dot" style={{ animationDelay: "3.4s" }} />
          <circle cx="85%" cy="82%" r="2" className="detail-dot" style={{ animationDelay: "3.6s" }} />
        </svg>

        <div className="corner-element" style={{ top: 24, left: 24, animationDelay: "3.8s" }}>
          <span className="corner-dot" style={{ top: 0, left: 0 }} />
        </div>
        <div className="corner-element" style={{ top: 24, right: 24, animationDelay: "4s" }}>
          <span className="corner-dot" style={{ top: 0, right: 0 }} />
        </div>
        <div className="corner-element" style={{ bottom: 24, left: 24, animationDelay: "4.2s" }}>
          <span className="corner-dot" style={{ bottom: 0, left: 0 }} />
        </div>
        <div className="corner-element" style={{ bottom: 24, right: 24, animationDelay: "4.4s" }}>
          <span className="corner-dot" style={{ bottom: 0, right: 0 }} />
        </div>

        <div className="floating-dot" style={{ top: "28%", left: "12%", animationDelay: "0.5s", animationPlayState: "paused" }} />
        <div className="floating-dot" style={{ top: "62%", left: "88%", animationDelay: "1s", animationPlayState: "paused" }} />
        <div className="floating-dot" style={{ top: "42%", left: "8%", animationDelay: "1.5s", animationPlayState: "paused" }} />
        <div className="floating-dot" style={{ top: "74%", left: "92%", animationDelay: "2s", animationPlayState: "paused" }} />

        <div
          className="relative z-10 flex flex-col items-center justify-between gap-10 px-6 py-12 sm:px-10 md:px-16 md:py-16"
          style={{ minHeight: "min(86vh, 820px)" }}
        >
          <div className="text-center">
            <h2 className="ds-eyebrow">
              <W d={0}>Preceptor</W>
              <W d={200}>Studio</W>
              <span className="mx-2 opacity-40">·</span>
              <W d={450}>IA</W>
              <W d={600}>aplicada</W>
              <W d={750}>a</W>
              <W d={900}>processos</W>
            </h2>
            <div className="ds-line mt-4" />
          </div>

          <div className="relative mx-auto max-w-4xl text-center">
            <h1 className="ds-underline text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
              <div className="ds-h1 mb-3 md:mb-5">
                <W d={1100}>Primeiro</W>
                <W d={1250}>o</W>
                <W d={1400} className="text-[#3BCACE]">processo,</W>
              </div>
              <div className="ds-h1-sub text-2xl leading-relaxed text-slate-200 sm:text-3xl md:text-4xl">
                <W d={1700}>depois</W>
                <W d={1850}>a</W>
                <W d={2000}>Inteligência</W>
                <W d={2200}>
                  Artificial<span className="ds-dot" aria-hidden="true" />
                </W>
              </div>
            </h1>

            <p
              className="ds-fade-in mx-auto mt-8 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base"
              style={{ animationDelay: "2.6s" }}
            >
              Automatizar um processo errado só faz o erro acontecer mais
              rápido. A gente redesenha o fluxo, coloca a automação em produção
              em semanas e devolve horas e margem pra sua operação.
            </p>

            <div
              className="ds-fade-in mt-9 flex flex-wrap items-center justify-center gap-4"
              style={{ animationDelay: "3s" }}
            >
              <HeroCta />
              <a
                href="#resultados"
                className="mkt-btn mkt-btn--ghost"
                aria-label="Ver resultados"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
              >
                Ver resultados
                <span
                  className="mkt-btn__icon"
                  aria-hidden="true"
                  style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
                >
                  →
                </span>
              </a>
            </div>
          </div>

          <div className="text-center">
            <div className="ds-line mb-4" />
            <h2 className="ds-eyebrow" style={{ color: "rgba(255,255,255,0.55)" }}>
              <W d={2900}>Diagnóstico.</W>
              <W d={3100}>Redesenho.</W>
              <W d={3300}>IA</W>
              <W d={3450}>aplicada.</W>
              <W d={3650}>Medição.</W>
            </h2>
          </div>
        </div>

        <div
          className="ds-mouse-gradient h-60 w-60 blur-xl sm:h-80 sm:w-80 sm:blur-2xl md:h-96 md:w-96 md:blur-3xl"
          style={{
            left: mouseGradient.left,
            top: mouseGradient.top,
            opacity: mouseGradient.opacity,
          }}
        />

        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="ripple-effect"
            style={{ left: `${ripple.x}px`, top: `${ripple.y}px` }}
          />
        ))}
      </section>
    </main>
  );
}
