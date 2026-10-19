"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CTA_TEXTO } from "./CtaLink";

const ANCORAS = [
  { href: "#metodo", label: "Como funciona" },
  { href: "#servicos", label: "Serviços" },
  { href: "#exemplos", label: "Exemplos" },
  { href: "#faq", label: "FAQ" },
];

/*
 * Nav da home: some ao rolar para baixo e volta ao rolar para cima. O fio
 * inferior aparece depois de 8px de rolagem. Não esconde com o menu aberto.
 */
export function HomeNav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
    if (open) setHidden(false);
  }, [open]);

  useEffect(() => {
    let raf = 0;
    lastY.current = window.scrollY;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      const delta = y - lastY.current;
      if (!openRef.current && Math.abs(delta) > 4) {
        setHidden(delta > 0 && y > 96);
      }
      lastY.current = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <a href="#conteudo" className="lp2-skip">
        Pular para o conteúdo
      </a>
      <header
        className={`lp2-nav${hidden ? " is-hidden" : ""}${scrolled ? " is-scrolled" : ""}${
          open ? " is-open" : ""
        }`}
        onFocus={() => setHidden(false)}
      >
        <div className="lp2-container lp2-nav__bar">
          <Link href="/" className="lp2-nav__logo" aria-label="PRECEPTOR! Studio, página inicial">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-horizontal.png" alt="PRECEPTOR!" width={480} height={120} />
          </Link>

          <nav className="lp2-nav__links" aria-label="Seções da página">
            <ul>
              {ANCORAS.map((a) => (
                <li key={a.href}>
                  <a href={a.href}>{a.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <a href="#contato" className="lp2-nav__cta">
            {CTA_TEXTO} <span aria-hidden="true">→</span>
          </a>

          <button
            type="button"
            className="lp2-nav__toggle"
            aria-expanded={open}
            aria-controls="lp2-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="lp2-nav__toggle-txt">{open ? "Fechar" : "Menu"}</span>
            <span className="lp2-nav__toggle-icon" aria-hidden="true" />
          </button>
        </div>

        <nav id="lp2-menu" className="lp2-nav__menu" aria-label="Menu" hidden={!open}>
          <ul className="lp2-container">
            {ANCORAS.map((a) => (
              <li key={a.href}>
                <a href={a.href} onClick={close}>
                  {a.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#contato" onClick={close} className="lp2-nav__menu-cta">
                {CTA_TEXTO} <span aria-hidden="true">→</span>
              </a>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
