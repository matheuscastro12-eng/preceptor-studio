import { Marca } from "./Marca";

const GRUPOS = [
  {
    grupo: "PARA QUALQUER OPERAÇÃO",
    itens: [
      {
        nome: "Mapeamento de processo.",
        texto:
          "Você vê no papel como o trabalho acontece hoje, onde trava e o que vale automatizar primeiro.",
      },
      {
        nome: "Captação e retomada de contatos.",
        texto:
          "Faz o primeiro contato com quem chegou pelo anúncio, registra de onde ele veio e retoma quem parou de responder, só com consentimento. Depois passa para a sua equipe.",
      },
    ],
  },
  {
    grupo: "LOGÍSTICA",
    itens: [
      {
        nome: "Agente de IA que emite o CT-e.",
        texto:
          "Lê a NF-e que chega por e-mail, confere com a ordem de carregamento e prepara CT-e, CIOT e MDF-e. Sua equipe aprova antes de emitir. Se algo não bate, o caso vai para uma pessoa.",
      },
      {
        // Risco listado no plano (copy v3, pendência 15): serviço sem resultado em operação publicado.
        nome: "Rotas e ocorrências.",
        texto:
          "Monta as rotas do dia respeitando peso, cubagem, valor de carga e jornada, e explica por que cada entrega ficou de fora. Junta WhatsApp, e-mail e ocorrências do TMS no card de cada nota e sugere a resposta. O programador e o operador decidem.",
      },
    ],
  },
  {
    grupo: "FINANCEIRO / BACK-OFFICE",
    itens: [
      {
        nome: "Conciliação financeira automática.",
        texto:
          "Cruza o extrato bancário com os títulos em aberto no ERP e propõe cada baixa com a prova. A baixa só acontece com confirmação, salvo nas regras que você autorizar.",
      },
      {
        nome: "Painéis e controles sob medida.",
        texto:
          "Painel de caixa e resultado, controles de RH e telas simples que mostram o que o agente fez e o que espera a sua aprovação.",
      },
    ],
  },
  {
    grupo: "CLÍNICAS",
    itens: [
      {
        nome: "Agente de IA no WhatsApp da recepção.",
        texto:
          "Atende no WhatsApp oficial, responde dúvidas administrativas e separa as conversas por assunto e por médico. A recepção aprova. O agente fica longe de orientação de saúde.",
      },
    ],
  },
];

export function Servicos() {
  return (
    <section id="servicos" className="lp2-section lp2-servicos">
      <div className="lp2-container">
        <header className="lp2-head" data-rv>
          <p className="lp2-rotulo">SERVIÇOS</p>
          <h2 className="lp2-h2">
            <Marca>Um processo por vez</Marca>, com alguém da sua equipe aprovando.
          </h2>
        </header>

        <div className="lp2-indice">
          {GRUPOS.map((g) => (
            <div key={g.grupo} className="lp2-indice__grupo" data-rv>
              <h3 className="lp2-rotulo lp2-indice__titulo">{g.grupo}</h3>
              <ul className="lp2-indice__itens">
                {g.itens.map((it) => (
                  <li key={it.nome} className="lp2-indice__item">
                    <h4 className="lp2-h3">{it.nome}</h4>
                    <p>{it.texto}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
