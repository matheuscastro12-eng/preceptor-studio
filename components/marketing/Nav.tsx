import Link from "next/link";
import { Mark } from "./MarketingShared";

export function Nav() {
  return (
    <>
      <a href="#main" className="mkt-skip-link">
        Pular para o conteúdo
      </a>
      <nav className="mkt-nav" aria-label="Principal">
        <Link href="/" className="mkt-nav__logo" aria-label="PRECEPTOR! Venture Studio — Início">
          <Mark size={16} />
          <span className="mkt-nav__word">PRECEPTOR!</span>
          <span className="mkt-nav__sub">Venture Studio</span>
        </Link>
        <div className="mkt-nav__links">
          <a href="#como">Como construímos</a>
          <a href="#entregas">O que entregamos</a>
          <a href="#setores">Setores</a>
          <a href="#estudio">Estúdio</a>
        </div>
        <Link
          href="/diagnostico?start=1"
          className="mkt-nav__cta"
          aria-label="Fazer diagnóstico grátis"
        >
          Diagnóstico grátis
          <span className="ic" aria-hidden="true">→</span>
        </Link>
      </nav>
    </>
  );
}
