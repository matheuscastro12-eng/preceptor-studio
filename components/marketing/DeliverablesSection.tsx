import { Sparkle, CircleRing, DoubleCircle, MiniDiamond } from "./MarketingShared";

const ITEMS = [
  {
    n: "01",
    title: "Estudo do Cliente",
    body: "Quem é o cliente que paga, quanto paga e por quê. Cinco eixos pontuados e a recomendação do próximo passo pra faturar.",
  },
  {
    n: "02",
    title: "Brand brief",
    body: "Identidade, voz, paleta e princípios. Pronto pro designer executar sem achismo.",
  },
  {
    n: "03",
    title: "Plano comercial",
    body: "Canal, pricing, motion de vendas e o plano dos primeiros 100 leads. Como o negócio começa a entrar dinheiro.",
  },
  {
    n: "04",
    title: "Cronograma de execução",
    body: "12 semanas em sprints quinzenais, vira quadro de tarefas com responsáveis no dia 1.",
  },
  {
    n: "05",
    title: "Diagnóstico contínuo",
    body: "O score acompanha o negócio durante a obra. Sinal que muda, muda o plano, pra você não jogar dinheiro fora.",
  },
];

export function DeliverablesSection() {
  return (
    <section
      id="entregas"
      className="section section--dark"
      data-screen-label="03 Entregas"
    >
      <Sparkle size={28} style={{ top: 64, left: 40 }} />
      <CircleRing size={120} dashed style={{ bottom: 80, right: 56 }} />
      <DoubleCircle size={130} style={{ top: 80, right: 32, opacity: 0.4 }} />

      <div className="container" style={{ position: "relative" }}>
        <div className="mkt-sec-head">
          <div>
            <span className="eyebrow">O que entregamos</span>
            <h2 className="mkt-h2" style={{ marginTop: 18 }}>
              Cinco documentos
              <br />
              que dizem <span className="it">se o negócio</span> dá dinheiro.
            </h2>
          </div>
          <p className="mkt-lead">
            A base concreta pra você decidir onde colocar o seu dinheiro. Cada
            documento responde uma pergunta que custa caro errar.
          </p>
        </div>

        <div className="mkt-deliv-card">
          {ITEMS.map((item) => (
            <div key={item.n} className="mkt-deliv-row">
              <span className="mkt-deliv-row__num">{item.n}</span>
              <div className="mkt-deliv-row__body">
                <h3 className="mkt-deliv-row__title">{item.title}</h3>
                <p className="mkt-deliv-row__desc">{item.body}</p>
              </div>
              <span className="mkt-deliv-row__mark" aria-hidden="true">
                <MiniDiamond size={9} color="var(--cyan)" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
