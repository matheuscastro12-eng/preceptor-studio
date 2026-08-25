import Link from "next/link";
import { Reveal } from "./Reveal";

const SEGMENTS = [
  {
    n: "01",
    tag: "Logística e Transportes",
    href: "/transporte",
    body: "Torre de controle, documentação de carga, ocorrências e atendimento a motorista com menos papel e menos telefone.",
  },
  {
    n: "02",
    tag: "Agro",
    href: "/agro",
    body: "Controle de insumos, laudos, relatórios de campo e integração entre fazenda, escritório e cooperativa num fluxo único.",
  },
  {
    n: "03",
    tag: "Medicina",
    href: "/clinicas",
    body: "Agendamento, triagem de pacientes, laudos e faturamento de convênio com menos trabalho manual da equipe.",
  },
];

export function SegmentsSection() {
  return (
    <section id="segmentos" className="section">
      <div className="container">
        <Reveal>
          <div className="mkt-sec-head">
            <div>
              <span className="eyebrow">Segmentos que atendemos</span>
              <h2 className="mkt-h2" style={{ marginTop: 20 }}>
                Operações de verdade,
                <br />
                com processo pesado no <span className="bang">dia a dia</span>
              </h2>
            </div>
            <p className="mkt-lead">
              Trabalhamos com segmentos onde o processo é o coração do negócio
              e cada hora de retrabalho custa caro.
            </p>
          </div>
        </Reveal>

        <div className="mkt-rows">
          {SEGMENTS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <Link
                href={s.href}
                className="mkt-row"
                style={{ textDecoration: "none" }}
                aria-label={`Ver a página de ${s.tag}`}
              >
                <span className="mkt-bang" aria-hidden="true" />
                <h3 className="mkt-row__title">{s.tag}</h3>
                <p className="mkt-row__body">{s.body}</p>
                <span className="mkt-row__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
