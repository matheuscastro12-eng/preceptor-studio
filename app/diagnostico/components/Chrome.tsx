"use client";

interface ChromeProps {
  onHome?: () => void;
  cta?: string;
  onCta?: () => void;
  inset?: boolean;
}

export function Chrome({ onHome, cta = "Fazer diagnóstico", onCta, inset }: ChromeProps) {
  return (
    <div className={`bar${inset ? " bar--inset" : ""}`}>
      <a
        href="#"
        className="bar__logo"
        onClick={(e) => {
          e.preventDefault();
          onHome?.();
        }}
      >
        <span className="mark" aria-hidden="true" />
        <span className="bar__word">PRECEPTOR!</span>
        <span className="bar__sub">Studio</span>
      </a>
      <nav className="bar__nav">
        <a href="#como" onClick={(e) => e.preventDefault()}>Como funciona</a>
        <a href="#estudio" onClick={(e) => e.preventDefault()}>Sobre o estúdio</a>
        <a href="#cases" onClick={(e) => e.preventDefault()}>Cases</a>
      </nav>
      <button type="button" className="btn-pill btn-pill--top" onClick={onCta}>
        {cta}
      </button>
    </div>
  );
}
