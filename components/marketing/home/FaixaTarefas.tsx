
/*
 * Faixa em movimento com tarefas que o agente assume. A lista aparece duas
 * vezes para o loop não ter emenda; a segunda cópia é aria-hidden.
 */
const TAREFAS = [
  { ic: "documento", t: "Digitar CT-e a partir da nota" },
  { ic: "dinheiro", t: "Conciliar extrato com títulos" },
  { ic: "mensagem", t: "Responder o WhatsApp da recepção" },
  { ic: "lupa", t: "Conferir canhoto contra pedido" },
  { ic: "grafico", t: "Montar o relatório do dia" },
  { ic: "arquivo", t: "Organizar laudos e anexos" },
  { ic: "recibo", t: "Lançar notas de despesa" },
  { ic: "pacote", t: "Atualizar status de entrega" },
];

function Lista({ oculta = false }: { oculta?: boolean }) {
  return (
    <ul className="lp4-faixa__lista" aria-hidden={oculta || undefined}>
      {TAREFAS.map((x) => (
        <li key={x.t} className="lp4-faixa__item">
          <span className="cd-check" aria-hidden="true" />
          {x.t}
        </li>
      ))}
    </ul>
  );
}

export function FaixaTarefas() {
  return (
    <section className="lp4-faixa" aria-label="Tarefas que o agente assume">
      <p className="lp4-nota lp4-faixa__nota">// o que o agente tira da mesa</p>
      <div className="lp4-faixa__trilho">
        <Lista />
        <Lista oculta />
      </div>
    </section>
  );
}
