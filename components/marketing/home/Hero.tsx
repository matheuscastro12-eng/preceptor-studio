import Link from "next/link";
import type { ComponentType } from "react";
import { CtaLink, CTA_MICROCOPY } from "./CtaLink";
import { AppPreview } from "./AppPreview";
import { Operacao3D } from "./Operacao3D";
import { MockLogistica } from "./MockLogistica";
import { MockFinanceiro } from "./MockFinanceiro";
import { MockClinica } from "./MockClinica";

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
        <div className="o3-hero">
          <div className="o3-hero__texto">
            <h1 className="lp2-h1 o3-hero__titulo">
              O documento chega. A conferência fica pronta. <em>Sua equipe só aprova.</em>
            </h1>
            <p className="lp2-lead o3-hero__lead lp2-hero__in" style={{ "--in-d": "150ms" } as React.CSSProperties}>
              Primeiro a gente desenha o processo com quem faz o trabalho, depois põe um agente de IA
              na parte repetitiva: documentos, conferências e mensagens.
            </p>
            <div className="sb-hero__ctas lp2-hero__in" style={{ "--in-d": "250ms" } as React.CSSProperties}>
              <CtaLink />
              <a href="#metodo" className="sb-btn-sec">Como funciona</a>
            </div>
            <p className="lp2-micro">{CTA_MICROCOPY}</p>
          </div>
          <div className="o3-hero__obj lp2-hero__in" style={{ "--in-d": "200ms" } as React.CSSProperties}>
            <Operacao3D />
          </div>
        </div>

        <ul className="o3-setores" aria-label="Setores atendidos">
          <li>Logística</li>
          <li>Financeiro</li>
          <li>Clínicas</li>
          <li>Agro</li>
          <li>Back-office</li>
        </ul>

        <div className="sb-palco lp2-hero__in" style={{ "--in-d": "350ms" } as React.CSSProperties}>
          <AppPreview />
        </div>

        <p className="lp4-nota lp4-frentes__nota" data-rv>
          Onde já dá para começar
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
