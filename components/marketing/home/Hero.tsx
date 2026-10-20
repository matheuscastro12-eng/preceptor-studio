import Link from "next/link";
import type { ComponentType } from "react";
import { CtaLink, CTA_MICROCOPY } from "./CtaLink";
import { HeroScene } from "./HeroScene";
import { MockLogistica } from "./MockLogistica";
import { MockFinanceiro } from "./MockFinanceiro";
import { MockClinica } from "./MockClinica";
import { Polaroids } from "./Polaroids";
import { Icone3D } from "./Icone3D";

type Frente = {
  icone: string;
  tom: string;
  frente: string;
  exemplo: string;
  mock: ComponentType;
  link?: { href: string; texto: string };
};

const FRENTES: Frente[] = [
  {
    icone: "caminhao",
    tom: "#E3F1FF",
    frente: "LOGÍSTICA",
    exemplo: "CT-e pronto para conferir",
    mock: MockLogistica,
    link: { href: "/transporte", texto: "Ver como funciona em logística" },
  },
  {
    icone: "dinheiro",
    tom: "#FFF4D6",
    frente: "FINANCEIRO / BACK-OFFICE",
    exemplo: "Extrato conciliado com prova",
    // PENDENTE copy v3 (pendência 20): link do financeiro entra quando a rota existir.
    mock: MockFinanceiro,
  },
  {
    icone: "estetoscopio",
    tom: "#FFE9EC",
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
        <div className="lp4-hero">
          <p className="lp4-hero__selo lp2-hero__in" style={{ "--in-d": "0ms" } as React.CSSProperties}>
            <span aria-hidden="true" />
            Agentes de IA para operações
          </p>
          <h1 className="lp2-h1 lp4-hero__titulo">
            <span className="lp2-h1__line">
              <span className="lp2-h1__txt" style={{ "--in-d": "80ms" } as React.CSSProperties}>
                O documento chega.
              </span>
            </span>{" "}
            <span className="lp2-h1__line">
              <span className="lp2-h1__txt" style={{ "--in-d": "200ms" } as React.CSSProperties}>
                A conferência fica pronta.
              </span>
            </span>{" "}
            <span className="lp2-h1__line">
              <span className="lp2-h1__txt" style={{ "--in-d": "320ms" } as React.CSSProperties}>
                Sua equipe <span className="lp4-rabisco">só aprova.<Rabisco /></span>
              </span>
            </span>
          </h1>
          <p className="lp2-lead lp4-hero__lead lp2-hero__in" style={{ "--in-d": "440ms" } as React.CSSProperties}>
            Primeiro a gente desenha o processo com quem faz o trabalho, depois põe um agente de IA
            na parte repetitiva: documentos, conferências e mensagens.
          </p>
          <div className="lp4-hero__ctas lp2-hero__in" style={{ "--in-d": "560ms" } as React.CSSProperties}>
            <CtaLink />
            <a href="#metodo" className="lp4-ghost">
              Ver como funciona
            </a>
          </div>
          <p className="lp2-micro lp4-hero__micro lp2-hero__in" style={{ "--in-d": "620ms" } as React.CSSProperties}>
            {CTA_MICROCOPY}
          </p>
        </div>

        <div className="lp4-palco">
          <Polaroids />
          <div className="lp4-palco__cena lp2-hero__in" style={{ "--in-d": "500ms" } as React.CSSProperties}>
            <HeroScene />
          </div>
        </div>

        <p className="lp4-nota lp4-frentes__nota" data-rv>
          onde já dá pra começar ↓
        </p>
        <ul className="lp2-verticais__grid lp2-hero__frentes">
          {FRENTES.map((f, i) => {
            const Mock = f.mock;
            return (
              <li
                key={f.frente}
                className="lp2-verticais__cel"
                data-rv
                style={{ "--rv-d": `${i * 120}ms`, "--tom": f.tom } as React.CSSProperties}
              >
                <div className="lp2-vertical lp4-vert">
                  <Mock />
                  <Icone3D nome={f.icone} tamanho={64} className="lp4-vert__ic" />
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

/* Sublinhado à mão sob "só aprova." (SVG que se desenha na entrada). */
function Rabisco() {
  return (
    <svg className="lp4-rabisco__svg" viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true">
      <path d="M3 13 C 60 4, 120 3, 170 7 S 260 14, 297 6" pathLength={1} />
    </svg>
  );
}
