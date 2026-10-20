/*
 * Objeto 3D do hero (CSS 3D isométrico, sem imagem): plataforma da operação
 * com a pilha de notas, o bloco do agente e as bandejas de saída. Folhas
 * viajam da pilha ao agente e dele às bandejas; chips de status flutuam com
 * linhas-guia (padrão Tractian). Dados de demonstração; decorativo.
 */

type Cx = { x: number; y: number; z?: number; w: number; d: number; h: number; c: string };

/* Caixa com as três faces visíveis na vista isométrica (topo, frente, lado). */
function Caixa({ x, y, z = 0, w, d, h, c }: Cx) {
  return (
    <div className={`o3-cx o3-cx--${c}`} style={{ "--x": `${x}px`, "--y": `${y}px`, "--z": `${z}px`, "--w": `${w}px`, "--d": `${d}px`, "--h": `${h}px` } as React.CSSProperties}>
      <i className="o3-f o3-f--topo" />
      <i className="o3-f o3-f--frente" />
      <i className="o3-f o3-f--lado" />
    </div>
  );
}

const PILHA = Array.from({ length: 9 }, (_, i) => i);
const CONFERIDOS = Array.from({ length: 4 }, (_, i) => i);

const CHIPS = [
  { cls: "a", tag: "Entrada", txt: "NF-e 4821 recebida" },
  { cls: "b", tag: "Agente", txt: "Conferindo · 12 regras", vivo: true },
  { cls: "c", tag: "Saída", txt: "4 conferidos → ERP", ok: true },
  { cls: "d", tag: "Revisão", txt: "1 exceção → equipe", exc: true },
];

export function Operacao3D() {
  return (
    <figure className="o3" aria-hidden="true">
      <div className="o3__cena">
        <div className="o3__plano">
          {/* Plataforma */}
          <Caixa x={0} y={0} w={420} d={420} h={18} c="base" />

          {/* Pilha de notas */}
          {PILHA.map((i) => (
            <Caixa key={i} x={40} y={60} z={18 + i * 7} w={110} d={140} h={5} c="folha" />
          ))}

          {/* Bloco do agente */}
          <Caixa x={175} y={150} z={18} w={110} d={110} h={96} c="agente" />
          <div className="o3-luz" style={{ "--x": "175px", "--y": "150px", "--z": "114px" } as React.CSSProperties} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="o3-marca" src="/brand/p-mark-teal.png" alt="" style={{ "--x": "175px", "--y": "150px", "--z": "116px" } as React.CSSProperties} />

          {/* Bandeja de conferidos */}
          <Caixa x={40} y={290} z={18} w={120} d={100} h={14} c="bandeja-ok" />
          {CONFERIDOS.map((i) => (
            <Caixa key={i} x={54} y={302} z={32 + i * 6} w={92} d={76} h={4} c="folha-ok" />
          ))}

          {/* Bandeja de exceção */}
          <Caixa x={300} y={280} z={18} w={100} d={110} h={14} c="bandeja-exc" />
          <Caixa x={312} y={292} z={32} w={76} d={86} h={4} c="folha-exc" />

          {/* Folhas em trânsito */}
          <div className="o3-voo o3-voo--1" />
          <div className="o3-voo o3-voo--2" />
          <div className="o3-voo o3-voo--3" />
        </div>
      </div>

      <svg className="o3__guias" viewBox="0 0 600 520" preserveAspectRatio="none">
        <path d="M110 110 L165 235" />
        <path d="M310 92 L318 185" />
        <path d="M120 440 L190 395" />
        <path d="M505 410 L470 300" />
      </svg>

      {CHIPS.map((c) => (
        <div key={c.cls} className={`o3-chip o3-chip--${c.cls}${c.ok ? " is-ok" : ""}${c.exc ? " is-exc" : ""}`}>
          <span className="o3-chip__tag">
            {c.vivo ? <b className="o3-chip__vivo" /> : null}
            {c.tag}
          </span>
          <span className="o3-chip__txt">{c.txt}</span>
        </div>
      ))}
    </figure>
  );
}
