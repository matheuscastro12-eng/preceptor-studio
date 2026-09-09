"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
const LINKS = [
  { href: "/#como", label: "O método" },
  { href: "/#segmentos", label: "Segmentos" },
  { href: "/#contato", label: "Contato" },
  { href: "/opera", label: "Entrar no OPERA" },
];

export function Nav() {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <a href="#main" className="mkt-skip-link">
        Pular para o conteúdo
      </a>
      <nav className="mkt-nav" aria-label="Principal">
        <Link
          href="/"
          className="mkt-nav__logo"
          aria-label="PRECEPTOR! Studio, página inicial"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-horizontal.png" alt="PRECEPTOR!" />
        </Link>
        <div className="mkt-nav__links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="mkt-nav__actions">
          <a
            href="https://wa.me/5535999191919?text=Ol%C3%A1!%20Quero%20falar%20sobre%20a%20opera%C3%A7%C3%A3o%20da%20minha%20empresa."
            target="_blank"
            rel="noopener noreferrer"
            className="mkt-nav__cta"
            aria-label="Entrar em contato pelo WhatsApp"
          >
            Entrar em contato
            <span className="ic" aria-hidden="true">
              →
            </span>
          </a>
          <button
            type="button"
            className="mkt-nav__burger"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="mkt-nav__mobile" role="menu">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              role="menuitem"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
