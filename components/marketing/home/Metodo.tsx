import { Marca } from "./Marca";

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

/*
 * Mini desenhos do diagrama. A mesma linha conta o processo: embolada no
 * diagnóstico, reta e em trechos no redesenho, com portões de aprovação na IA
 * aplicada e, na medição, duas barras (linha de base e depois), sem números.
 */
const SVG = {
  viewBox: "0 0 160 56",
  className: "lp2-mdiag__fig",
  "aria-hidden": true,
  focusable: false,
} as const;

function FigDiagnostico() {
  return (
    <svg {...SVG}>
      <path
        className="lp2-mdiag__traco lp2-mdiag__traco--draw"
        pathLength={1}
        d="M4 34 C 22 34, 30 10, 46 16 S 52 46, 38 40 S 50 8, 70 22 S 84 50, 98 34 S 86 10, 106 18 S 122 44, 132 30 S 146 28, 156 28"
      />
      <circle className="lp2-mdiag__alvo" cx="98" cy="34" r="8" />
      <circle className="lp2-mdiag__ponto" cx="98" cy="34" r="3.5" />
    </svg>
  );
}

function FigRedesenho() {
  const trechos = [4, 44, 84, 124];
  return (
    <svg {...SVG}>
      {trechos.map((x, i) => (
        <g key={x} className="lp2-mdiag__trecho" style={{ "--k": i } as React.CSSProperties}>
          <line className="lp2-mdiag__traco" x1={x} y1="22" x2={x + 32} y2="22" />
          <line className="lp2-mdiag__regra" x1={x} y1="34" x2={x + 24} y2="34" />
          <line className="lp2-mdiag__regra" x1={x} y1="42" x2={x + 16} y2="42" />
        </g>
      ))}
    </svg>
  );
}

function FigIa() {
  const portoes = [48, 88, 128];
  return (
    <svg {...SVG}>
      <line className="lp2-mdiag__traco" x1="4" y1="28" x2="156" y2="28" />
      {portoes.map((x, i) => (
        <g key={x} className="lp2-mdiag__portao" style={{ "--k": i } as React.CSSProperties}>
          <rect className="lp2-mdiag__portao-luz" x={x - 4} y="19" width="8" height="18" />
          <rect className="lp2-mdiag__portao-borda" x={x - 4} y="19" width="8" height="18" />
        </g>
      ))}
      <circle className="lp2-mdiag__pulso" cx="156" cy="28" r="3.5" />
    </svg>
  );
}

function FigMedicao() {
  return (
    <svg {...SVG}>
      <rect className="lp2-mdiag__barra lp2-mdiag__barra--base" x="4" y="14" width="148" height="10" />
      <rect className="lp2-mdiag__barra lp2-mdiag__barra--depois" x="4" y="32" width="120" height="10" />
      <line className="lp2-mdiag__ref" x1="152" y1="8" x2="152" y2="48" />
    </svg>
  );
}

const FIGURAS = [FigDiagnostico, FigRedesenho, FigIa, FigMedicao];

/*
 * Diagrama do método: o <ol> é o conteúdo (texto real); nós, conectores, faixa
 * do piloto e desenhos são decoração aria-hidden. Quatro colunas com conector
 * horizontal no desktop, pilha com conector vertical no celular. A faixa
 * PILOTO cobre os passos 2 a 4: o diagnóstico vem antes do piloto.
 */
export function Metodo() {
  return (
    <section id="metodo" className="lp2-section lp2-soft lp2-mdiag">
      <div className="lp2-container">
        <header className="lp2-head" data-rv>
          <p className="lp2-rotulo">COMO FUNCIONA</p>
          <h2 className="lp2-h2">
            Primeiro o processo, <Marca>depois a IA</Marca>.
          </h2>
        </header>

        <ol className="lp2-mdiag__lista">
          {PASSOS.map((p, i) => {
            const Fig = FIGURAS[i];
            return (
              <li
                key={p.nome}
                className={`lp2-mdiag__passo lp2-mdiag__passo--${i + 1}`}
                data-rv="bg"
                style={{ "--i": i } as React.CSSProperties}
              >
                {i === 1 && (
                  <span className="lp2-mdiag__piloto" aria-hidden="true">
                    <span className="lp2-mdiag__piloto-linha" />
                    <span className="lp2-mdiag__piloto-txt">PILOTO</span>
                  </span>
                )}
                <span className="lp2-mdiag__no" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="lp2-mdiag__corpo">
                  <Fig />
                  <h3 className="lp2-h3">{p.nome}</h3>
                  <p className="lp2-rotulo lp2-mdiag__quando">{p.quando}</p>
                  <p className="lp2-mdiag__texto">{p.texto}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
