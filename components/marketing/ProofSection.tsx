import { Reveal } from "./Reveal";

const CASES = [
  {
    tag: "Transportadora",
    rule: "A regra: cada canhoto confere com o pedido antes de faturar.",
    result:
      "A conferência que ocupava duas pessoas o dia inteiro passou a rodar sozinha. O time só vê as exceções.",
    metric: "60 horas devolvidas por mês",
  },
  {
    tag: "Agroindústria",
    rule: "A regra: todo laudo de campo segue o padrão da cooperativa.",
    result:
      "O relatório que levava dias entre fazenda e escritório passou a sair em minutos, no padrão exigido.",
    metric: "De dias para minutos",
  },
  {
    tag: "Clínica",
    rule: "A regra: cada guia de convênio tem código, prazo e anexo certos.",
    result:
      "O faturamento passou a conferir as guias antes do envio. As glosas caíram e a recepção parou de retrabalhar.",
    metric: "Menos glosa, menos retrabalho",
  },
];

export function ProofSection() {
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div style={{ maxWidth: 780, marginBottom: 64 }}>
            <span className="eyebrow">A prova</span>
            <h2 className="mkt-h2" style={{ marginTop: 20 }}>
              Vão te dizer que não dá, que precisa de humano.
              <br />
              <span className="cyan">
                Se tem regra, dá pra ensinar a{" "}
                <span className="bang">máquina</span>
              </span>
            </h2>
            <p className="mkt-lead" style={{ marginTop: 20, maxWidth: 640 }}>
              Toda operação tem regras particulares: o jeito certo de conferir,
              o padrão do laudo, a exceção que só o time conhece. É exatamente
              isso que a gente documenta e ensina à automação. O que tem regra,
              roda sozinho. O que exige critério, fica com gente.
            </p>
          </div>
        </Reveal>

        <div className="mkt-grid-3">
          {CASES.map((c, i) => (
            <Reveal key={c.tag} delay={i * 100}>
              <article
                style={{
                  paddingTop: 20,
                  borderTop: "2px solid var(--navy)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  height: "100%",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--teal-ink)",
                  }}
                >
                  {c.tag}
                </span>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: 15,
                    lineHeight: 1.5,
                    color: "var(--navy)",
                  }}
                >
                  {c.rule}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14.5,
                    lineHeight: 1.65,
                    color: "var(--ink-soft)",
                  }}
                >
                  {c.result}
                </p>
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 12,
                    fontFamily: "var(--font-head)",
                    fontWeight: 640,
                    fontSize: 17,
                    letterSpacing: "-0.015em",
                    color: "var(--navy)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: "var(--teal)",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                  {c.metric}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
