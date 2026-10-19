import Link from "next/link";
import type { ComponentType } from "react";
import { CtaLink, CTA_MICROCOPY } from "./CtaLink";
import { HeroScene } from "./HeroScene";
import { Marca } from "./Marca";
import { MockLogistica } from "./MockLogistica";
import { MockFinanceiro } from "./MockFinanceiro";
import { MockClinica } from "./MockClinica";

type Frente = {
  frente: string;
  exemplo: string;
  mock: ComponentType;
  link?: { href: string; texto: string };
};

const FRENTES: Frente[] = [
  {
    frente: "LOGÍSTICA",
    exemplo: "CT-e pronto para conferir",
    mock: MockLogistica,
    link: { href: "/transporte", texto: "Ver como funciona em logística" },
  },
  {
    frente: "FINANCEIRO / BACK-OFFICE",
    exemplo: "Extrato conciliado com prova",
    // PENDENTE copy v3 (pendência 20): link do financeiro entra quando a rota existir.
    mock: MockFinanceiro,
  },
  {
    frente: "CLÍNICAS",
    exemplo: "WhatsApp da recepção em dia",
    mock: MockClinica,
    link: { href: "/medicina", texto: "Ver como funciona em clínicas" },
  },
];

export function Hero() {
  return (
    <section id="topo" className="lp2-section lp2-hero lp2-grain">
      <div className="lp2-container">
        <div className="lp2-hero__grid">
          <div className="lp2-hero__copy">
            <h1 className="lp2-h1">
              <span className="lp2-h1__line">
                <span className="lp2-h1__txt" style={{ "--in-d": "0ms" } as React.CSSProperties}>
                  O documento chega.
                </span>
              </span>{" "}
              <span className="lp2-h1__line">
                <span className="lp2-h1__txt" style={{ "--in-d": "140ms" } as React.CSSProperties}>
                  A conferência fica pronta.
                </span>
              </span>{" "}
              <span className="lp2-h1__line">
                <span className="lp2-h1__txt" style={{ "--in-d": "280ms" } as React.CSSProperties}>
                  Sua equipe <Marca>só aprova.</Marca>
                </span>
              </span>
            </h1>
            <p className="lp2-lead lp2-hero__in" style={{ "--in-d": "440ms" } as React.CSSProperties}>
              Primeiro a gente desenha o processo com quem faz o trabalho, depois põe um agente de IA
              na parte repetitiva: documentos, conferências e mensagens.
            </p>
            <div className="lp2-cta-wrap lp2-hero__in" style={{ "--in-d": "560ms" } as React.CSSProperties}>
              <CtaLink />
              <p className="lp2-micro">{CTA_MICROCOPY}</p>
            </div>
          </div>
          <div className="lp2-hero__scene lp2-hero__in" style={{ "--in-d": "300ms" } as React.CSSProperties}>
            <HeroScene />
          </div>
        </div>

        <ul className="lp2-verticais__grid lp2-hero__frentes">
          {FRENTES.map((f, i) => {
            const Mock = f.mock;
            return (
              <li
                key={f.frente}
                className="lp2-verticais__cel"
                data-rv
                style={{ "--rv-d": `${i * 120}ms` } as React.CSSProperties}
              >
                <div className="lp2-vertical">
                  <Mock />
                  <p className="lp2-rotulo lp2-hero__frente">
                    {f.frente} · {f.exemplo}
                  </p>
                  {f.link ? (
                    <Link href={f.link.href} className="lp2-textlink">
                      {f.link.texto} <span aria-hidden="true">→</span>
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
