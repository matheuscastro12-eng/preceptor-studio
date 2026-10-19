import { CtaLink, CTA_MICROCOPY } from "./CtaLink";
import { HeroScene } from "./HeroScene";
import { Marca } from "./Marca";

const FRENTES = [
  { frente: "LOGÍSTICA", exemplo: "CT-e pronto para conferir" },
  { frente: "FINANCEIRO / BACK-OFFICE", exemplo: "Extrato conciliado com prova" },
  { frente: "CLÍNICAS", exemplo: "WhatsApp da recepção em dia" },
];

export function Hero() {
  return (
    <section id="topo" className="lp2-section lp2-hero lp2-grain">
      <div className="lp2-container">
        <div className="lp2-hero__grid">
          <div className="lp2-hero__copy">
            <p className="lp2-rotulo lp2-hero__in" style={{ "--in-d": "0ms" } as React.CSSProperties}>
              PRIMEIRO O PROCESSO
            </p>
            <h1 className="lp2-h1">
              <span className="lp2-h1__line">
                <span className="lp2-h1__txt" style={{ "--in-d": "80ms" } as React.CSSProperties}>
                  O documento chega.
                </span>
              </span>{" "}
              <span className="lp2-h1__line">
                <span className="lp2-h1__txt" style={{ "--in-d": "220ms" } as React.CSSProperties}>
                  A conferência fica pronta.
                </span>
              </span>{" "}
              <span className="lp2-h1__line">
                <span className="lp2-h1__txt" style={{ "--in-d": "360ms" } as React.CSSProperties}>
                  Sua equipe <Marca>só aprova.</Marca>
                </span>
              </span>
            </h1>
            <p className="lp2-lead lp2-hero__in" style={{ "--in-d": "520ms" } as React.CSSProperties}>
              Primeiro a gente desenha o processo com quem faz o trabalho, depois põe um agente de IA
              na parte repetitiva: documentos, conferências e mensagens. Cada saída passa pela sua
              equipe antes de seguir.
            </p>
            <div className="lp2-cta-wrap lp2-hero__in" style={{ "--in-d": "640ms" } as React.CSSProperties}>
              <CtaLink />
              <p className="lp2-micro">{CTA_MICROCOPY}</p>
            </div>
          </div>
          <div className="lp2-hero__scene lp2-hero__in" style={{ "--in-d": "300ms" } as React.CSSProperties}>
            <HeroScene />
          </div>
        </div>

        <ul className="lp2-frentes lp2-hero__in" style={{ "--in-d": "760ms" } as React.CSSProperties}>
          {FRENTES.map((f) => (
            <li key={f.frente} className="lp2-frentes__item">
              {f.frente} · {f.exemplo}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
