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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-horizontal.png" alt="PRECEPTOR!" />
      </a>
      <nav className="bar__nav">
        <a href="/">Voltar ao site</a>
      </nav>
      <button type="button" className="btn-pill btn-pill--top" onClick={onCta}>
        {cta}
      </button>
    </div>
  );
}
