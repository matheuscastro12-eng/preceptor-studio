import { Marca } from "./Marca";

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
 * Mini fluxo dentro do passo 2 (decoração): o agente prepara e a pessoa da
 * equipe aprova. O nó humano é o único em teal. O texto real do passo já diz
 * isso, então tudo aqui é aria-hidden.
 */
function FluxoInterno() {
  return (
    <div className="lp2-fluxo__interno" aria-hidden="true">
      <span className="lp2-fluxo__chip">Agente prepara</span>
      <span className="lp2-fluxo__aresta lp2-fluxo__aresta--interna">
        <span className="lp2-fluxo__trilho">
          <span className="lp2-fluxo__pacote" />
        </span>
      </span>
      <span className="lp2-fluxo__chip lp2-fluxo__chip--humano">
        <span className="lp2-fluxo__chip-rot">Passo humano</span>
        <span className="lp2-fluxo__chip-visto">✓</span>
        Equipe aprova
      </span>
    </div>
  );
}

/*
 * Método como fluxo de nós (n8n): o <ol> é o conteúdo; portas, arestas,
 * pacotes, faixa PILOTO e o mini fluxo do passo 2 são decoração aria-hidden.
 * Arestas horizontais no desktop, verticais no celular. A faixa PILOTO cobre
 * os passos 2 e 3: o diagnóstico vem antes do piloto.
 */
export function Metodo() {
  return (
    <section id="metodo" className="lp2-section lp2-soft lp2-fluxo">
      <div className="lp2-container">
        <header className="lp2-head" data-rv>
          <p className="lp2-rotulo">COMO FUNCIONA</p>
          <h2 className="lp2-h2">
            Primeiro o processo, <Marca>depois a IA</Marca>.
          </h2>
        </header>

        <div className="lp2-fluxo__canvas" data-rv="bg">
          <span className="lp2-fluxo__piloto" aria-hidden="true">
            <span className="lp2-fluxo__piloto-linha" />
            <span className="lp2-fluxo__piloto-txt">PILOTO</span>
          </span>
          <ol className="lp2-fluxo__nos">
            {PASSOS.map((p, i) => (
              <li
                key={p.nome}
                className={`lp2-fluxo__no lp2-fluxo__no--${i + 1}`}
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="lp2-fluxo__porta lp2-fluxo__porta--in" aria-hidden="true" />
                <span className="lp2-fluxo__porta lp2-fluxo__porta--out" aria-hidden="true" />
                {i < PASSOS.length - 1 && (
                  <span className="lp2-fluxo__aresta lp2-fluxo__aresta--entre" aria-hidden="true">
                    <span className="lp2-fluxo__trilho">
                      <span className="lp2-fluxo__pacote" />
                    </span>
                  </span>
                )}
                <span className="lp2-fluxo__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="lp2-h3">{p.nome}</h3>
                <p className="lp2-rotulo lp2-fluxo__quando">{p.quando}</p>
                <p className="lp2-fluxo__texto">{p.texto}</p>
                {i === 1 && <FluxoInterno />}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
