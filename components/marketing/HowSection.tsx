import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Diagnóstico",
    body: "Mapeamos o processo como ele acontece no dia a dia: onde o dado se perde, onde o time refaz trabalho e onde o cliente espera.",
  },
  {
    n: "02",
    title: "Redesenho",
    body: "Cortamos as etapas que não geram valor e definimos um dono para cada dado e cada decisão.",
  },
  {
    n: "03",
    title: "IA aplicada",
    body: "Agentes de IA, integrações e automações entram nos pontos onde o retorno pode ser medido.",
  },
  {
    n: "04",
    title: "Medição",
    body: "A automação vai para produção com painel de indicadores. O que o número mostrar, a gente ajusta.",
  },
];

export function HowSection() {
  return (
    <section id="como" className="section section--soft">
      <div className="container">
        <Reveal>
          <div className="mkt-sec-head">
            <div>
              <span className="eyebrow">O método</span>
              <h2 className="mkt-h2" style={{ marginTop: 20 }}>
                A IA entra depois
                <br />
                <span className="bang">da engenharia</span>
              </h2>
            </div>
            <p className="mkt-lead">
              Não começamos pela ferramenta. Primeiro entendemos como o
              trabalho acontece, cortamos o que não gera valor e só então
              aplicamos tecnologia.
            </p>
          </div>
        </Reveal>

        <div className="mkt-steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
              <div className="mkt-step">
                <span className="mkt-step__num">/ {s.n}</span>
                <h3 className="mkt-step__title">{s.title}</h3>
                <p className="mkt-step__body">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
