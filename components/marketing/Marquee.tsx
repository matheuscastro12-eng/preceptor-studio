export function Marquee() {
  const items = [
    "Menos pitch, mais produto",
    "Da ideia ao faturamento",
    "Diagnóstico do negócio",
    "Validar antes de investir",
    "Empreender com método",
    "Setores regulados",
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
