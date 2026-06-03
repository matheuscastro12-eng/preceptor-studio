"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
      </nav>
    </>
  );
}
