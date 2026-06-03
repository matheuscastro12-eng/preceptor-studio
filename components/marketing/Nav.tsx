"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mark } from "./MarketingShared";

// Links roteados (SPA, com indicador ativo). Hash anchors ficam como <a> por causa do scroll.
const ROUTED_LINKS = [
  { href: "/produtos", label: "Produtos" },
  { href: "/insights", label: "Insights" },
];

const ANCHOR_LINKS = [
  { href: "/#como", label: "Como funciona" },
  { href: "/#setores", label: "Setores" },
];

export function Nav() {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = useState(false);

  // Fecha o menu mobile ao trocar de rota.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <a href="#main" className="mkt-skip-link">
        Pular para o conteúdo
      </a>
      <nav className="mkt-nav" aria-label="Principal">
        <Link
          href="/"
          className="mkt-nav__logo"
          aria-label="PRECEPTOR! Venture Studio — Início"
        >
          <Mark size={16} />
          <span className="mkt-nav__word">PRECEPTOR!</span>
          <span className="mkt-nav__sub">Venture Studio</span>
        </Link>
        <div className="mkt-nav__links">
          {ROUTED_LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                style={{
                  position: "relative",
                  padding: "6px 10px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  isolation: "isolate",
                  color: active ? "var(--navy, #0A1F44)" : undefined,
                  fontWeight: active ? 700 : undefined,
                }}
              >
                {active && (
                  <motion.span
                    layoutId="mkt-nav-pill"
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 999,
                      background: "rgba(15, 23, 41, 0.06)",
                      zIndex: -1,
                    }}
                    transition={{ type: "spring", stiffness: 480, damping: 40 }}
                  />
                )}
                <span style={{ position: "relative" }}>{l.label}</span>
              </Link>
            );
          })}
          {ANCHOR_LINKS.map((l) => (
            <a key={l.href} href={l.href} style={{ padding: "6px 10px" }}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="mkt-nav__actions">
          <Link
            href="/diagnostico?start=1"
            className="mkt-nav__cta"
            aria-label="Fazer diagnóstico grátis"
          >
            Diagnóstico grátis
            <span className="ic" aria-hidden="true">
              →
            </span>
          </Link>
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
          {ROUTED_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              aria-current={isActive(l.href) ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {ANCHOR_LINKS.map((l) => (
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
