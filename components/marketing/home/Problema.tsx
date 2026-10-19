import { Marca } from "./Marca";
import { ProblemaVisual } from "./ProblemaVisual";

const DORES = [
  {
    titulo: "Documento digitado um por um.",
    texto:
      "CT-e na logística, lançamento e cadastro no financeiro, cadastro de paciente na recepção da clínica. Retrabalho sempre que algo não bate.",
  },
  {
    titulo: "Conferência na mão.",
    texto:
      "Extrato contra ERP no financeiro, documento contra pedido na logística, agenda contra confirmações na clínica. Gente cruzando planilha todo dia, e você ainda sem saber o caixa do dia.",
  },
  {
    titulo: "Mensagem que espera.",
    texto:
      "WhatsApp da recepção lotado, cliente pedindo posição da entrega, cobrança que ninguém retoma. O contato esfria sem ninguém ver.",
  },
];

export function Problema() {
  return (
    <section id="problema" className="lp2-section lp2-problema">
      <div className="lp2-container">
        <header className="lp2-head" data-rv>
          <p className="lp2-rotulo">ONDE O DIA SOME</p>
          <h2 className="lp2-h2">
            Sua equipe passa o dia copiando de <Marca>uma tela para outra</Marca>.
          </h2>
        </header>

        <ProblemaVisual />

        <div className="lp2-problema__grid">
          <div className="lp2-problema__texto lp2-prose" data-rv style={{ "--rv-d": "120ms" } as React.CSSProperties}>
            <p>
              A nota chega por e-mail e alguém digita o CT-e. O extrato vai para a planilha e alguém
              confere linha por linha. O WhatsApp da recepção lota antes das nove.
            </p>
            <p>
              Comprar mais uma ferramenta não resolve. Automatizar um processo confuso só faz o erro
              acontecer mais rápido.
            </p>
            <p>
              Só que esse trabalho tem regra. E o que tem regra dá para ensinar à máquina, desde que o
              seu processo esteja claro antes.
            </p>
          </div>

          <ol className="lp2-dores">
            {DORES.map((d, i) => (
              <li
                key={d.titulo}
                className="lp2-dores__item"
                data-rv
                style={{ "--rv-d": `${120 + i * 120}ms` } as React.CSSProperties}
              >
                <span className="lp2-dores__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="lp2-h3">{d.titulo}</h3>
                  <p>{d.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* PENDENTE copy v3 (pendência 8): bloco "Voz do cliente" fica fora até
            existirem 2 a 3 frases reais de clientes, anônimas e autorizadas. */}
      </div>
    </section>
  );
}
