/*
 * Grade 10×10 ao lado do "Cerca de 99%": 99 células preenchem em sequência e
 * uma fica só com contorno. O atraso de cada célula segue a curva do CountUp
 * (1,2 s, ease-out cúbico), então a grade enche no ritmo do número.
 */
const DURACAO = 1200;

const CELULAS = Array.from({ length: 100 }, (_, i) =>
  i < 99 ? Math.round(DURACAO * (1 - Math.cbrt(1 - (i + 1) / 99))) : -1
);

export function ProvaGrade() {
  return (
    <div className="lp2-prova__grade" aria-hidden="true">
      {CELULAS.map((d, i) =>
        d < 0 ? (
          <span key={i} className="lp2-prova__cel lp2-prova__cel--vazia" />
        ) : (
          <span key={i} className="lp2-prova__cel" style={{ "--d": `${d}ms` } as React.CSSProperties} />
        )
      )}
    </div>
  );
}
