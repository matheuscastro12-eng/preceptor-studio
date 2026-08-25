import { Reveal } from "./Reveal";

const ITEMS = [
  {
    n: "01",
    title: "Mapa da operação",
    body: "O processo desenhado de ponta a ponta, com etapas, donos, sistemas e os pontos onde a operação perde dinheiro.",
  },
  {
    n: "02",
    title: "Processo redesenhado",
    body: "O fluxo novo, sem as etapas que não geram valor e com responsável definido para cada parte.",
  },
  {
    n: "03",
    title: "Automação em produção",
    body: "Agentes de IA, integrações entre sistemas e rotinas automáticas rodando na operação real.",
  },
  {
    n: "04",
    title: "Painel de indicadores",
    body: "O antes e o depois em número: tempo por etapa, custo, erro e volume, visíveis toda semana.",
  },
  {
    n: "05",
    title: "Operação assistida",
    body: "Acompanhamento depois da entrega, com ajustes no processo conforme a operação cresce.",
  },
];

export function DeliverablesSection() {
  return (
    <section id="entregas" className="section">
      <div className="container">
        <Reveal>
          <div className="mkt-sec-head">
            <div>
              <span className="eyebrow">O que entregamos</span>
              <h2 className="mkt-h2" style={{ marginTop: 20 }}>
                Cinco entregas que fazem
                <br />
                <span className="bang">a IA virar resultado</span>
              </h2>
            </div>
            <p className="mkt-lead">
              Cada entrega responde uma pergunta que custa caro errar: o que
              automatizar, em que ordem e quanto isso devolve para a operação.
            </p>
          </div>
        </Reveal>

        <div className="mkt-spec">
          {ITEMS.map((item, i) => (
            <Reveal key={item.n} delay={i * 70}>
              <div className="mkt-spec__row">
                <span className="mkt-spec__num">/ {item.n}</span>
                <h3 className="mkt-spec__title">{item.title}</h3>
                <p className="mkt-spec__body">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
