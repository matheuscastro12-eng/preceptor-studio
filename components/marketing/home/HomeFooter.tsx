import Link from "next/link";

export function HomeFooter() {
  const ano = new Date().getFullYear();
  return (
    <footer className="lp2-footer">
      <div className="lp2-container">
        <Link href="/" className="lp2-footer__logo" aria-label="PRECEPTOR! Studio, página inicial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-horizontal.png" alt="PRECEPTOR!" width={480} height={120} />
        </Link>
        <p className="lp2-footer__assinatura">Primeiro o processo, depois a IA.</p>
        <p className="lp2-footer__texto">
          Funciona no ERP, na planilha ou no WhatsApp que você já usa, e no TMS, no caso da logística.
          Integração por API quando existe; quando não, pela tela ou pelo e-mail. Dados pessoais
          tratados conforme a LGPD.
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
              <a href="#contato">Contato</a>
            </li>
            <li>
              {/* copy v3, pendência 22: "Entrar no OPERA" sai do menu e fica no rodapé. */}
              <Link href="/opera">Entrar no OPERA</Link>
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
