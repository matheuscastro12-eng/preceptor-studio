import { Marca } from "./Marca";
import { ProblemaVisual } from "./ProblemaVisual";

const DORES = [
  {
    titulo: "Documento digitado um por um.",
    texto: "A nota chega por e-mail e alguém digita o CT-e.",
  },
  {
    titulo: "Conferência na mão.",
    texto: "O extrato vai para a planilha e alguém confere linha por linha.",
  },
  {
    titulo: "Mensagem que espera.",
    texto: "O WhatsApp da recepção lota antes das nove.",
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

        <ol className="lp2-dores lp2-dores--linhas">
          {DORES.map((d, i) => (
            <li
              key={d.titulo}
              className="lp2-dores__item"
              data-rv
              style={{ "--rv-d": `${i * 120}ms` } as React.CSSProperties}
            >
              <span className="lp2-dores__num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p>
                <strong className="lp2-dores__titulo">{d.titulo}</strong> {d.texto}
              </p>
            </li>
          ))}
        </ol>

        {/* PENDENTE copy v3 (pendência 8): bloco "Voz do cliente" fica fora até
            existirem 2 a 3 frases reais de clientes, anônimas e autorizadas. */}
      </div>
    </section>
  );
}
