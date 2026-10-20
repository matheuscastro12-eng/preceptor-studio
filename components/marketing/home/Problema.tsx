import { Marca } from "./Marca";
import { CabecaSecao } from "./CabecaSecao";
import { ProblemaVisual } from "./ProblemaVisual";

const DORES = [
  {
    icone: "documento",
    tom: "#F1ECFF",
    titulo: "Documento digitado um por um.",
    texto: "A nota chega por e-mail e alguém digita o CT-e.",
  },
  {
    icone: "lupa",
    tom: "#E3F1FF",
    titulo: "Conferência na mão.",
    texto: "O extrato vai para a planilha e alguém confere linha por linha.",
  },
  {
    icone: "mensagem",
    tom: "#DFF7F7",
    titulo: "Mensagem que espera.",
    texto: "O WhatsApp da recepção lota antes das nove.",
  },
];

export function Problema() {
  return (
    <section id="problema" className="lp2-section lp2-problema">
      <div className="lp2-container">
        <CabecaSecao
          selo="Onde o dia some"
          titulo={
            <>
              Sua equipe passa o dia copiando de <Marca>uma tela para outra</Marca>.
            </>
          }
          nota="soa familiar?"
        />

        <ProblemaVisual />

        <ol className="lp4-cards">
          {DORES.map((d, i) => (
            <li
              key={d.titulo}
              className="lp4-card"
              data-rv
              style={{ "--rv-d": `${i * 120}ms`, "--tom": d.tom } as React.CSSProperties}
            >
              <span className="cd-ficha__num" aria-hidden="true">{i + 1}.</span>
              <p>
                <strong className="lp4-card__titulo">{d.titulo}</strong> {d.texto}
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
