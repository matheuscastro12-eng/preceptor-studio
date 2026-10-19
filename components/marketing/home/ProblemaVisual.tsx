/*
 * Visual antes/depois do Problema (CSS/SVG, loops de 9s pausados até entrar).
 * Antes: planilha, formulário e mensagens soltos; um bloquinho é copiado
 * célula a célula para o formulário, as mensagens empilham e uma célula não
 * bate. Depois: o documento passa pela conferência e para numa aprovação.
 * Só formas abstratas; o texto ao lado carrega o sentido.
 */

const LINHAS = [0, 1, 2, 3, 4, 5];
const COLUNAS = [0, 1, 2, 3];
const CEL_W = 47.5;
const CEL_H = 124 / 6;

export function ProblemaVisual() {
  return (
    <div className="lp2-antes-depois" data-rv aria-hidden="true">
      <div className="lp2-antes-depois__painel lp2-antes-depois__painel--antes">
        <p className="lp2-rotulo lp2-antes-depois__rotulo">ANTES</p>
        <div className="lp2-antes-depois__palco">
          <svg
            className="lp2-antes-depois__svg"
            viewBox="0 0 400 300"
            preserveAspectRatio="xMidYMid meet"
            focusable="false"
          >
            {/* Planilha */}
            <g transform="rotate(-1.5 121 98)">
              <rect className="lp2-ad-janela" x="16" y="18" width="210" height="160" rx="6" />
              <rect className="lp2-ad-titulo" x="26" y="25" width="60" height="6" rx="3" />
              <line className="lp2-ad-linha" x1="16" y1="38" x2="226" y2="38" />
              {LINHAS.map((r) =>
                COLUNAS.map((c) => (
                  <rect
                    key={`${r}-${c}`}
                    className="lp2-ad-cel"
                    x={26 + c * CEL_W}
                    y={46 + r * CEL_H}
                    width={CEL_W}
                    height={CEL_H}
                  />
                ))
              )}
              {LINHAS.map((r) =>
                COLUNAS.map((c) => (
                  <rect
                    key={`v-${r}-${c}`}
                    className="lp2-ad-valor"
                    x={33 + c * CEL_W}
                    y={54 + r * CEL_H}
                    width={c === 0 ? 30 : 22 + ((r + c) % 3) * 4}
                    height="5"
                    rx="2.5"
                  />
                ))
              )}
              <rect
                className="lp2-ad-erro"
                x={26 + 2 * CEL_W + 1}
                y={46 + 3 * CEL_H + 1}
                width={CEL_W - 2}
                height={CEL_H - 2}
                rx="2"
              />
            </g>

            {/* Formulário de sistema */}
            <g transform="rotate(1.2 315 115)">
              <rect className="lp2-ad-janela" x="246" y="40" width="138" height="150" rx="6" />
              <rect className="lp2-ad-titulo" x="256" y="47" width="48" height="6" rx="3" />
              <line className="lp2-ad-linha" x1="246" y1="60" x2="384" y2="60" />
              {[72, 108, 144].map((y) => (
                <g key={y}>
                  <rect className="lp2-ad-label" x="258" y={y} width="40" height="4" rx="2" />
                  <rect className="lp2-ad-campo" x="258" y={y + 8} width="114" height="18" rx="3" />
                </g>
              ))}
            </g>

            {/* Mensagens */}
            <g transform="rotate(-1 140 243)">
              <rect className="lp2-ad-janela" x="40" y="196" width="200" height="94" rx="6" />
              <rect className="lp2-ad-titulo" x="50" y="203" width="54" height="6" rx="3" />
              <circle className="lp2-ad-ponto" cx="226" cy="206" r="4" />
              <line className="lp2-ad-linha" x1="40" y1="216" x2="240" y2="216" />
              <rect className="lp2-ad-msg lp2-ad-msg--a" x="52" y="224" width="120" height="14" rx="7" />
              <rect className="lp2-ad-msg lp2-ad-msg--b" x="52" y="244" width="96" height="14" rx="7" />
              <rect className="lp2-ad-msg lp2-ad-msg--c" x="52" y="264" width="144" height="14" rx="7" />
            </g>

            {/* Bloquinhos copiados: base = já colados no formulário */}
            <rect className="lp2-ad-copia lp2-ad-copia--a" x="264" y="85" width="34" height="8" rx="2" />
            <rect className="lp2-ad-copia lp2-ad-copia--b" x="264" y="121" width="34" height="8" rx="2" />
            <rect className="lp2-ad-copia lp2-ad-copia--c" x="264" y="157" width="34" height="8" rx="2" />
          </svg>
        </div>
      </div>

      <div className="lp2-antes-depois__painel lp2-antes-depois__painel--depois">
        <p className="lp2-rotulo lp2-antes-depois__rotulo">DEPOIS</p>
        <div className="lp2-antes-depois__palco">
          <div className="lp2-antes-depois__fluxo">
            <div className="lp2-antes-depois__doc">
              <span className="lp2-antes-depois__bar lp2-antes-depois__bar--titulo" />
              <span className="lp2-antes-depois__bar lp2-antes-depois__bar--w60" />
              <span className="lp2-antes-depois__bar lp2-antes-depois__bar--w90" />
              <span className="lp2-antes-depois__bar lp2-antes-depois__bar--w75" />
              <span className="lp2-antes-depois__bar lp2-antes-depois__bar--w90" />
              <span className="lp2-antes-depois__bar lp2-antes-depois__bar--w60" />
            </div>

            <span className="lp2-antes-depois__con lp2-antes-depois__con--h" />

            <ul className="lp2-antes-depois__faixa">
              {["a", "b", "c", "d"].map((k) => (
                <li key={k} className={`lp2-antes-depois__linha lp2-antes-depois__linha--${k}`}>
                  <span className="lp2-antes-depois__bar" />
                  <span className="lp2-antes-depois__visto">✓</span>
                </li>
              ))}
            </ul>

            <span className="lp2-antes-depois__con lp2-antes-depois__con--v" />

            <div className="lp2-antes-depois__acao">
              <span className="lp2-antes-depois__botao">Aprovar</span>
              <span className="lp2-antes-depois__botao lp2-antes-depois__botao--ok">
                <span className="lp2-antes-depois__ok">✓</span> Aprovar
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
