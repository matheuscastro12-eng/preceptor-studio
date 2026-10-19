const PERGUNTAS = [
  {
    q: "Minha empresa não é de logística nem de clínica. Serve?",
    a: "Serve se o trabalho tem regra: documento que alguém digita, conferência que alguém faz na mão, mensagem que alguém responde do mesmo jeito todo dia. O diagnóstico de 30 min mostra se o seu processo é um desses.",
  },
  {
    q: "Preciso trocar o meu sistema?",
    a: "Não. O agente trabalha no ERP, na planilha ou no WhatsApp que você já usa, e no TMS, no caso da logística. Quando o sistema tem API, a ligação é por ela. Quando não tem, pela tela ou pelo e-mail.",
  },
  {
    q: "E se a IA errar?",
    a: "Ela só segue sozinha onde a regra é fechada e você autorizou. O resto passa por uma pessoa da sua equipe antes de virar documento, baixa ou resposta. Quando algo não bate, o caso para e vai para alguém decidir.",
  },
  // PENDENTE copy v3 (pendência 1): pergunta "Quanto custa?" fica fora até
  // preço e modelo de cobrança serem confirmados.
  {
    q: "Quanto tempo leva?",
    a: "O diagnóstico leva 30 minutos. O piloto leva de 2 a 4 semanas, num processo só. No fim, você tem o número medido contra a linha de base.",
  },
  // PENDENTE copy v3 (pendência 16): pergunta "Como ficam os meus dados?" fica
  // fora até a frase sobre os dados ser confirmada.
  {
    q: "O agente substitui a minha equipe?",
    a: "Ele fica com a parte repetitiva: digitar, conferir, responder a mesma pergunta. Sua equipe continua decidindo e aprovando, e ganha tempo para o que pede critério.",
  },
  {
    q: "Funciona para clínica? E os dados de pacientes?",
    a: "Funciona na parte administrativa: dúvidas, horários de atendimento, organização das conversas. O agente usa o WhatsApp oficial e fica longe de orientação de saúde. Retorno a contato só acontece com consentimento, como pede a LGPD. Dado de saúde tem proteção especial na lei, e só entra o que o processo exige, com as regras que a clínica definir.",
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
