// Corte da v4: três perguntas da copy v3, respostas condensadas.
const PERGUNTAS = [
  {
    q: "Minha empresa não é de logística nem de clínica. Serve?",
    a: "Serve se o trabalho tem regra: documento que alguém digita, conferência que alguém faz na mão, mensagem que alguém responde do mesmo jeito todo dia.",
  },
  {
    q: "Preciso trocar o meu sistema?",
    a: "Não. O agente trabalha no ERP, na planilha ou no WhatsApp que você já usa. Quando o sistema tem API, a ligação é por ela. Quando não tem, pela tela ou pelo e-mail.",
  },
  {
    q: "E se a IA errar?",
    a: "Ela só segue sozinha onde a regra é fechada e você autorizou. O resto passa por uma pessoa da sua equipe antes de virar documento, baixa ou resposta.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="lp2-section lp2-faq">
      <div className="lp2-container lp2-faq__grid">
        <h2 className="lp2-rotulo lp2-faq__rotulo" data-rv>
          FAQ
        </h2>
        <div className="lp2-faq__lista" data-rv style={{ "--rv-d": "120ms" } as React.CSSProperties}>
          {PERGUNTAS.map((p) => (
            <details key={p.q} className="lp2-faq__item">
              <summary className="lp2-faq__q">
                <span>{p.q}</span>
                <span className="lp2-faq__icone" aria-hidden="true">
                  +
                </span>
              </summary>
              <div className="lp2-faq__a">
                <p>{p.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
