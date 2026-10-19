import { Marca } from "./Marca";
import { MetodoProgress } from "./MetodoProgress";

const PASSOS = [
  {
    nome: "Diagnóstico.",
    quando: "30 min.",
    texto:
      "Você mostra como o processo roda hoje, com quem faz o trabalho na conversa. Sai com o passo a passo de hoje, o ponto onde o tempo se perde e uma meta possível para o piloto.",
  },
  {
    nome: "Redesenho.",
    quando: "Primeira semana do piloto.",
    texto:
      "As regras do seu negócio viram texto: as exceções, os clientes especiais e os limites. A gente mede como o processo está hoje para ter a linha de base.",
  },
  {
    nome: "IA aplicada.",
    quando: "Semanas seguintes do piloto.",
    texto:
      "O agente trabalha junto com a sua equipe. Cada saída é aprovada ou corrigida por uma pessoa, e tudo fica registrado.",
  },
  {
    nome: "Medição.",
    quando: "Última semana do piloto.",
    texto:
      "Você recebe a comparação com a linha de base num relatório de uma página. Com o número na mão, decide se o agente segue rodando.",
  },
];

export function Metodo() {
  return (
    <section id="metodo" className="lp2-section lp2-soft lp2-metodo">
      <div className="lp2-container lp2-metodo__grid">
        <header className="lp2-metodo__head" data-rv>
          <p className="lp2-rotulo">COMO FUNCIONA</p>
          <h2 className="lp2-h2">
            Primeiro o processo, <Marca>depois a IA</Marca>.
          </h2>
        </header>

        <MetodoProgress>
          <ol className="lp2-passos">
            {PASSOS.map((p, i) => (
              <li
                key={p.nome}
                className="lp2-passo"
                data-step
                data-rv
                style={{ "--rv-d": `${i * 80}ms` } as React.CSSProperties}
              >
                <span className="lp2-passo__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="lp2-passo__body">
                  <h3 className="lp2-h3">{p.nome}</h3>
                  <p className="lp2-rotulo lp2-passo__quando">{p.quando}</p>
                  <p>{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </MetodoProgress>
      </div>
    </section>
  );
}
