import { Marca } from "./Marca";
import { CabecaSecao } from "./CabecaSecao";
import { Icone3D } from "./Icone3D";

const ICONES = ["lupa", "robo", "grafico"];
const TONS = ["#E3F1FF", "#F1ECFF", "#E6F8E1"];

const PASSOS = [
  {
    nome: "Diagnóstico.",
    quando: "30 min.",
    texto: "Você sai com o passo a passo de hoje e o ponto onde o tempo se perde.",
  },
  {
    nome: "IA aplicada.",
    quando: "Piloto de 2 a 4 semanas.",
    texto: "O agente trabalha junto com a sua equipe, e cada saída é aprovada ou corrigida por uma pessoa.",
  },
  {
    nome: "Medição.",
    quando: "Última semana do piloto.",
    texto: "Você recebe a comparação com a linha de base e decide se o agente segue rodando.",
  },
];

/*
 * Mini telas do diagrama (aria-hidden, dados de demonstração): o mapa do
 * processo com o gargalo marcado, a fila em que cada saída do agente passa
 * por uma pessoa, e a comparação com a linha de base (sem números).
 */
function FigDiagnostico() {
  const etapas = ["E-mail", "Digita", "Confere", "Fatura"];
  return (
    <div className="lp3-mini lp3-mapa" aria-hidden="true">
      {etapas.map((e, i) => (
        <span key={e} className={`lp3-mapa__no${i === 1 ? " is-gargalo" : ""}`}>
          {e}
        </span>
      ))}
      <span className="lp3-mapa__nota">o tempo some aqui</span>
    </div>
  );
}

function FigIa() {
  const linhas = [
    { t: "CT-e 0921", s: "aprovado" },
    { t: "CT-e 0922", s: "corrigido" },
    { t: "CT-e 0923", s: "aprovado" },
  ];
  return (
    <div className="lp3-mini lp3-revisao" aria-hidden="true">
      {linhas.map((l, i) => (
        <span key={l.t} className="lp3-revisao__l" style={{ "--k": i } as React.CSSProperties}>
          <span>{l.t}</span>
          <em className={l.s === "corrigido" ? "is-corr" : undefined}>{l.s}</em>
        </span>
      ))}
    </div>
  );
}

function FigMedicao() {
  return (
    <div className="lp3-mini lp3-medida" aria-hidden="true">
      <span className="lp3-medida__l">
        <span>Antes</span>
        <i className="lp3-medida__b lp3-medida__b--base" />
      </span>
      <span className="lp3-medida__l">
        <span>Com agente</span>
        <i className="lp3-medida__b lp3-medida__b--depois" />
      </span>
    </div>
  );
}

const FIGURAS = [FigDiagnostico, FigIa, FigMedicao];

/*
 * Diagrama do método: o <ol> é o conteúdo (texto real); nós, conectores, faixa
 * do piloto e desenhos são decoração aria-hidden. Três colunas com conector
 * horizontal no desktop, pilha com conector vertical no celular. A faixa
 * PILOTO cobre os passos 2 e 3: o diagnóstico vem antes do piloto.
 */
export function Metodo() {
  return (
    <section id="metodo" className="lp2-section lp2-soft lp2-mdiag">
      <div className="lp2-container">
        <CabecaSecao
          selo="Como funciona"
          titulo={
            <>
              Primeiro o processo, <Marca>depois a IA</Marca>.
            </>
          }
          nota="três passos, sem trocar de sistema"
        />

        <ol className="lp2-mdiag__lista">
          {PASSOS.map((p, i) => {
            const Fig = FIGURAS[i];
            return (
              <li
                key={p.nome}
                className={`lp2-mdiag__passo lp2-mdiag__passo--${i + 1}`}
                data-rv="bg"
                style={{ "--i": i, "--tom": TONS[i] } as React.CSSProperties}
              >
                {i === 1 && (
                  <span className="lp2-mdiag__piloto" aria-hidden="true">
                    <span className="lp2-mdiag__piloto-linha" />
                    <span className="lp2-mdiag__piloto-txt">PILOTO</span>
                  </span>
                )}
                <span className="lp2-mdiag__no lp4-no" aria-hidden="true">
                  <Icone3D nome={ICONES[i]} tamanho={44} />
                  <b>{String(i + 1).padStart(2, "0")}</b>
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
