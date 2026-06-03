import { MiniDiamond } from "./MarketingShared";

export function HowSection() {
  return (
    <section id="como" className="section" data-screen-label="02 Como">
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 1fr",
            gap: 56,
            alignItems: "end",
          }}
        >
          <div>
            <span className="eyebrow">Tem uma ideia · Venture Studio</span>
            <h2 className="mkt-h2" style={{ marginTop: 18 }}>
              Da ideia ao
              <br />
              <span className="cyan">negócio que fatura.</span>
            </h2>
          </div>
          <p className="mkt-lead">
            Primeiro a gente descobre se o negócio dá dinheiro: o problema, quem
            paga, quanto paga. Depois constrói o produto, com engenheiro sênior
            no comando do começo ao fim.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginTop: 56,
          }}
        >
          <ProcessCard
            n="01"
            title="Sonar do negócio"
            tagline="O retrato honesto da sua ideia."
            body="Você responde um questionário guiado e a gente devolve onde a sua ideia ganha dinheiro e onde ela sangra. Mercado, cliente que paga, modelo de receita e o plano dos primeiros 12 meses. Pronto em até 5 dias úteis."
          />
          <ProcessCard
            n="02"
            title="Execução completa"
            tagline="Do plano ao primeiro cliente pagante."
            body="Marca, plano comercial e cronograma viram um quadro de execução no primeiro dia. A partir daí a gente constrói em sprints quinzenais, com time sênior dedicado ao seu empreendimento, do primeiro commit à entrega."
            accent
          />
        </div>
      </div>
    </section>
  );
}

function ProcessCard({
  n,
  title,
  tagline,
  body,
  tags,
  accent,
}: {
  n: string;
  title: string;
  tagline: string;
  body: string;
  tags?: string[];
  accent?: boolean;
}) {
  return (
    <article
      className="mkt-card"
      style={{
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minHeight: 320,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-mute)",
            fontWeight: 600,
            letterSpacing: "0.08em",
          }}
        >
          step {n}
        </span>
        {accent && <span className="mkt-chip">camada seguinte</span>}
      </div>
      <h3
        style={{
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontWeight: 900,
          fontSize: 30,
          color: "var(--navy)",
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          color: accent ? "var(--cyan-deep)" : "var(--blue)",
          fontWeight: 600,
          fontSize: 15.5,
          letterSpacing: "-0.011em",
        }}
      >
        {tagline}
      </p>
      <p
        style={{
          margin: 0,
          color: "var(--ink-soft)",
          fontSize: 14.5,
          lineHeight: 1.6,
        }}
      >
        {body}
      </p>
      {tags && tags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: "auto",
          }}
        >
          {tags.map((t) => (
            <span
              key={t}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink-soft)",
                border: "1px solid rgba(15,23,41,0.08)",
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              <MiniDiamond size={7} color="var(--cyan-deep)" />
              {t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
