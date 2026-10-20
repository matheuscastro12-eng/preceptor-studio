import { CTA_MICROCOPY, CTA_TEXTO } from "./CtaLink";
import { HeroPalco } from "./HeroPalco";
import { Marca } from "./Marca";

/*
 * Hero "Agente em destaque" (Linear + Attio): título grande, uma linha de
 * apoio, CTA primário e "Ver como funciona"; abaixo, o palco com o agente
 * trabalhando nas três frentes.
 */
export function Hero() {
  return (
    <section id="topo" className="lp2-section lp2-hero">
      <div className="lp2-container">
        <h1 className="lp2-h1">
          <span className="lp2-h1__line">
            <span className="lp2-h1__txt" style={{ "--in-d": "0ms" } as React.CSSProperties}>
              O documento chega.
            </span>
          </span>{" "}
          <span className="lp2-h1__line">
            <span className="lp2-h1__txt" style={{ "--in-d": "120ms" } as React.CSSProperties}>
              A conferência fica pronta.
            </span>
          </span>{" "}
          <span className="lp2-h1__line">
            <span className="lp2-h1__txt" style={{ "--in-d": "240ms" } as React.CSSProperties}>
              Sua equipe <Marca>só aprova.</Marca>
            </span>
          </span>
        </h1>
        <p className="lp2-lead lp2-hero__in" style={{ "--in-d": "380ms" } as React.CSSProperties}>
          Primeiro a gente desenha o processo com quem faz o trabalho, depois põe um agente de IA na
          parte repetitiva.
        </p>
        <div className="lp2-hero__acoes lp2-hero__in" style={{ "--in-d": "480ms" } as React.CSSProperties}>
          <a href="#contato" className="lp2-btn lp2-btn--primario">
            {CTA_TEXTO} <span className="lp2-btn__seta" aria-hidden="true">→</span>
          </a>
          <a href="#metodo" className="lp2-btn lp2-btn--fantasma">
            Ver como funciona
          </a>
          <p className="lp2-micro">{CTA_MICROCOPY}</p>
        </div>

        <HeroPalco />
      </div>
    </section>
  );
}
