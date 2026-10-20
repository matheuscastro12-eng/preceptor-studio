/*
 * Fluxograma do hero, desenhado "à mão" (filtro #rabisco + traços que se
 * desenham em sequência). Em cima, o processo de hoje com o gargalo
 * circulado; embaixo, o mesmo processo com o agente e o carimbo.
 * Decorativo: o título do hero carrega o sentido.
 */

type Caixa = { x: number; y: number; w: number; texto: string; tom?: "agente" | "gargalo" };

const HOJE: Caixa[] = [
  { x: 10, y: 60, w: 118, texto: "e-mail chega" },
  { x: 168, y: 60, w: 124, texto: "alguém digita", tom: "gargalo" },
  { x: 332, y: 60, w: 128, texto: "alguém confere", tom: "gargalo" },
  { x: 500, y: 60, w: 86, texto: "aprova" },
];

const COM_AGENTE: Caixa[] = [
  { x: 10, y: 300, w: 118, texto: "e-mail chega" },
  { x: 168, y: 300, w: 292, texto: "agente digita e confere", tom: "agente" },
  { x: 500, y: 300, w: 86, texto: "aprova ✓" },
];

const H = 52;

function Caixas({ itens, d0 }: { itens: Caixa[]; d0: number }) {
  return (
    <>
      {itens.map((c, i) => (
        <g key={c.texto + c.x} className={`cf-caixa${c.tom ? ` cf-caixa--${c.tom}` : ""}`} style={{ "--d": `${d0 + i * 0.35}s` } as React.CSSProperties}>
          <rect x={c.x} y={c.y} width={c.w} height={H} rx="6" pathLength={1} />
          <text x={c.x + c.w / 2} y={c.y + H / 2 + 7} textAnchor="middle">
            {c.texto}
          </text>
          {i < itens.length - 1 ? (
            <path
              className="cf-seta"
              pathLength={1}
              d={`M${c.x + c.w + 6} ${c.y + H / 2} L${itens[i + 1].x - 8} ${c.y + H / 2} m-8 -6 l8 6 l-8 6`}
            />
          ) : null}
        </g>
      ))}
    </>
  );
}

export function CadernoFluxo() {
  return (
    <figure className="cf" aria-hidden="true">
      <svg viewBox="0 0 600 420" className="cf__svg">
        <defs>
          <filter id="rabisco" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="r" />
            <feDisplacementMap in="SourceGraphic" in2="r" scale="2.6" />
          </filter>
        </defs>

        <g filter="url(#rabisco)">
          <text x="10" y="36" className="cf-rotulo">hoje:</text>
          <Caixas itens={HOJE} d0={0.3} />

          {/* Gargalo circulado em vermelho + anotação */}
          <ellipse className="cf-circulo" cx="314" cy="86" rx="168" ry="50" pathLength={1} />
          <path className="cf-circulo cf-circulo--2" pathLength={1} d="M150 92 C 170 140, 290 152, 470 120" />
          <text x="420" y="184" className="cf-nota cf-nota--vermelha">aqui o dia some!</text>

          {/* Seta para baixo */}
          <path className="cf-seta cf-seta--baixo" pathLength={1} d="M300 200 C 296 230, 304 250, 300 276 m-7 -9 l7 9 l7 -9" />
          <text x="10" y="276" className="cf-rotulo cf-rotulo--teal">com agente:</text>

          <Caixas itens={COM_AGENTE} d0={2.6} />
          <text x="314" y="388" className="cf-nota">sua equipe só olha as exceções</text>
        </g>
      </svg>
      <span className="cf-carimbo">Conferido</span>
    </figure>
  );
}
