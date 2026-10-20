/*
 * Grafo de workflow do hero: a nota entra, os campos são lidos, o agente
 * confere contra as regras e o resultado sai em dois ramos (conferido vai ao
 * ERP, exceção vai para a equipe). Pacotes de dados correm pelas arestas
 * (SVG animateMotion). Dados de demonstração; decorativo.
 */

type No = { id: string; x: number; y: number; w: number; h: number; tag: string; titulo: string; sub: string; tom?: "agente" | "ok" | "exc" };

const NOS: No[] = [
  { id: "a", x: 16, y: 24, w: 196, h: 70, tag: "GATILHO", titulo: "Novo e-mail", sub: "NF-e 4821 · anexo PDF" },
  { id: "b", x: 16, y: 170, w: 196, h: 70, tag: "LEITURA", titulo: "Extrair campos", sub: "volumes · peso · CFOP" },
  { id: "c", x: 250, y: 140, w: 196, h: 130, tag: "AGENTE DE IA", titulo: "Conferir regras", sub: "romaneio × nota × pedido", tom: "agente" },
  { id: "d", x: 484, y: 70, w: 160, h: 70, tag: "SAÍDA", titulo: "ERP atualizado", sub: "4 conferidos", tom: "ok" },
  { id: "e", x: 484, y: 270, w: 160, h: 70, tag: "REVISÃO", titulo: "Equipe aprova", sub: "1 exceção", tom: "exc" },
];

const ARESTAS = [
  { id: "ab", d: "M114 94 L114 170" },
  { id: "bc", d: "M212 205 C 232 205, 232 205, 250 205" },
  { id: "cd", d: "M446 180 C 466 180, 460 105, 484 105" },
  { id: "ce", d: "M446 235 C 466 235, 460 305, 484 305", exc: true },
];

export function GrafoAgente() {
  return (
    <figure className="gf" aria-hidden="true">
      <div className="gf__barra">
        <span className="gf__pontos"><i /><i /><i /></span>
        <span className="gf__nome">workflow · conferência de CT-e</span>
        <span className="gf__status"><b /> rodando</span>
      </div>
      <svg viewBox="0 0 660 360" className="gf__svg">
        <defs>
          <linearGradient id="gf-aresta" x1="0" x2="1">
            <stop offset="0" stopColor="#3BCACE" stopOpacity="0.15" />
            <stop offset="1" stopColor="#3BCACE" stopOpacity="0.6" />
          </linearGradient>
          <filter id="gf-brilho" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {ARESTAS.map((a) => (
          <g key={a.id}>
            <path id={`gf-${a.id}`} d={a.d} className={`gf-aresta${a.exc ? " gf-aresta--exc" : ""}`} />
            {[0, 1].map((k) => (
              <g key={k}>
                <circle r="5" className={`gf-pacote-brilho${a.exc ? " is-exc" : ""}`} filter="url(#gf-brilho)">
                  <animateMotion dur={a.exc ? "3.2s" : "1.8s"} begin={`${k * (a.exc ? 1.6 : 0.9)}s`} repeatCount="indefinite">
                    <mpath href={`#gf-${a.id}`} />
                  </animateMotion>
                </circle>
                <circle r="2.6" className={`gf-pacote${a.exc ? " is-exc" : ""}`}>
                  <animateMotion dur={a.exc ? "3.2s" : "1.8s"} begin={`${k * (a.exc ? 1.6 : 0.9)}s`} repeatCount="indefinite">
                    <mpath href={`#gf-${a.id}`} />
                  </animateMotion>
                </circle>
              </g>
            ))}
          </g>
        ))}

        {NOS.map((n) => (
          <g key={n.id} className={`gf-no${n.tom ? ` gf-no--${n.tom}` : ""}`}>
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="12" />
            <text x={n.x + 14} y={n.y + 22} className="gf-tag">{n.tag}</text>
            <text x={n.x + 14} y={n.y + 44} className="gf-titulo">{n.titulo}</text>
            <text x={n.x + 14} y={n.y + 62} className="gf-sub">{n.sub}</text>
            {n.tom === "agente" ? (
              <>
                <rect x={n.x + 14} y={n.y + 82} width="78" height="26" rx="13" className="gf-chip" />
                <text x={n.x + 53} y={n.y + 99} textAnchor="middle" className="gf-chip-txt">12 regras</text>
                <rect x={n.x + 100} y={n.y + 82} width="82" height="26" rx="13" className="gf-chip" />
                <text x={n.x + 141} y={n.y + 99} textAnchor="middle" className="gf-chip-txt">humano ✓</text>
              </>
            ) : null}
          </g>
        ))}
      </svg>
      <div className="gf__log">
        <span>› exceção encaminhada: CFOP do destino não confere</span>
        <span className="gf__demo">demonstração</span>
      </div>
    </figure>
  );
}
