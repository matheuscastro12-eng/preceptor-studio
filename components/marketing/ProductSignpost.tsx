const PATHS = [
  {
    eyebrow: "Tem uma ideia",
    title: "Venture Studio",
    href: "#como",
    label: "Ir para Venture Studio",
  },
  {
    eyebrow: "Já tem empresa",
    title: "Automação com IA",
    href: "#automacao",
    label: "Ir para Automação com IA",
  },
];

export function ProductSignpost() {
  return (
    <section className="mkt-signpost" aria-label="Dois caminhos">
      <div className="container">
        <span className="eyebrow">Dois caminhos</span>
        <p
          className="mkt-lead"
          style={{ marginTop: 12, maxWidth: 620 }}
        >
          A PRECEPTOR! resolve dois problemas. Comece por onde você está.
        </p>

        <div className="mkt-signpost__grid">
          {PATHS.map((p) => (
            <a
              key={p.href}
              href={p.href}
              className="mkt-card mkt-signpost__card"
              aria-label={p.label}
            >
              <span>
                <span className="mkt-signpost__eyebrow">{p.eyebrow}</span>
                <span className="mkt-signpost__title">{p.title}</span>
              </span>
              <span className="mkt-signpost__arrow" aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
