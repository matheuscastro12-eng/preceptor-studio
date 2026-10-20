/*
 * Faixa de prova logo abaixo do hero (Vercel, Fractional): as frentes e o caso
 * anônimo da seção Exemplos. Sem logos e sem números.
 */
const FRENTES = [
  "Logística e transporte",
  "Financeiro e back-office",
  "Clínicas",
];

export function FaixaProva() {
  return (
    <section className="lp2-faixa" aria-label="Frentes e caso">
      <div className="lp2-container">
        <div className="lp2-faixa__grid" data-rv>
          <div className="lp2-faixa__item">
            <p className="lp2-rotulo">Frentes</p>
            <ul className="lp2-faixa__frentes">
              {FRENTES.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="lp2-faixa__item">
            <p className="lp2-rotulo">Caso anônimo</p>
            <p className="lp2-faixa__caso">
              Conciliação de recebimentos em um cliente de logística.{" "}
              <a href="#exemplos" className="lp2-textlink">
                Ver o caso <span aria-hidden="true">→</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
