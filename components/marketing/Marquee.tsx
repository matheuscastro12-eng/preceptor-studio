export function Marquee() {
  const items = [
    "Engenharia real",
    "Estudo estratégico",
    "Execução em sprints",
    "Diagnóstico técnico",
    "Setores regulados",
    "Plano que dá pra executar",
    "Venture Studio brasileiro",
  ];
  const row = [...items, ...items];
  return (
    <div className="mkt-marquee">
      <div className="mkt-marquee__row">
        {row.map((s, i) => (
          <span key={i} className="mkt-marquee__item">
            <span className="dia" />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
