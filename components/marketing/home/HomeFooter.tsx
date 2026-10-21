import Link from "next/link";
import { CookiePrefsButton } from "@/components/ConsentManager";

export function HomeFooter() {
  const ano = new Date().getFullYear();
  return (
    <footer className="lp2-footer">
      <div className="mb-wrap">
        <Link href="/" className="lp2-footer__logo" aria-label="PRECEPTOR! Studio, página inicial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-horizontal.png" alt="PRECEPTOR!" width={480} height={120} />
        </Link>
        <p className="lp2-footer__assinatura">
          A tecnologia é o caminho.
          <br />
          O destino são as <span className="mb-ponto">pessoas.</span>
        </p>
        <nav aria-label="Rodapé" className="lp2-footer__nav">
          <ul>
            <li>
              <Link href="/privacidade">Privacidade</Link>
            </li>
            <li>
              <Link href="/termos">Termos</Link>
            </li>
            <li>
              <Link href="/privacidade#lgpd">LGPD</Link>
            </li>
            <li>
              <CookiePrefsButton className="lp2-footer__cookies" />
            </li>
            <li>
              <Link href="/#contato">Contato</Link>
            </li>
          </ul>
        </nav>
        <p className="lp2-footer__copy">
          © {ano} PRECEPTOR! Studio
        </p>
      </div>
    </footer>
  );
}
