/*
 * Cena do hero (CSS puro, loop de 9s): o documento entra, as três linhas de
 * conferência ganham o visto uma a uma, a etiqueta "Aprovado" aparece e o
 * documento sai. Só barras abstratas, nada legível.
 *
 * Foto real de mesa de escritório (copy v3, seção 1) entra aqui quando for
 * produzida. Alt já definido na copy: "Mesa de escritório com pilha de papéis
 * e uma planilha aberta na tela, no fim do expediente."
 */
export function HeroScene() {
  return (
    <div className="lp2-scene" aria-hidden="true">
      <div className="lp2-scene__doc">
        <div className="lp2-scene__head">
          <span className="lp2-scene__bar lp2-scene__bar--title" />
          <span className="lp2-scene__bar lp2-scene__bar--sub" />
        </div>
        <div className="lp2-scene__block">
          <span className="lp2-scene__bar lp2-scene__bar--w90" />
          <span className="lp2-scene__bar lp2-scene__bar--w70" />
          <span className="lp2-scene__bar lp2-scene__bar--w80" />
        </div>
        <ul className="lp2-scene__checks">
          <li className="lp2-scene__row lp2-scene__row--a">
            <span className="lp2-scene__tick">✓</span>
            <span className="lp2-scene__bar lp2-scene__bar--w60" />
          </li>
          <li className="lp2-scene__row lp2-scene__row--b">
            <span className="lp2-scene__tick">✓</span>
            <span className="lp2-scene__bar lp2-scene__bar--w75" />
          </li>
          <li className="lp2-scene__row lp2-scene__row--c">
            <span className="lp2-scene__tick">✓</span>
            <span className="lp2-scene__bar lp2-scene__bar--w50" />
          </li>
        </ul>
        <span className="lp2-scene__stamp">Aprovado</span>
      </div>
    </div>
  );
}
