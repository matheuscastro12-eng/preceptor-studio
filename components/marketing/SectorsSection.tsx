import { MeshTexture, Sparkle, CircleRing } from "./MarketingShared";

const SECTORS = [
  {
    tag: "Saúde",
    title: "Telemed, regtech clínica, software para operadoras",
    note: "LGPD + CFM 2.314/22 endereçados desde o brief.",
  },
  {
    tag: "Educação",
    title: "Edtech, plataformas de ensino e certificações",
    note: "Conteúdo profissionalizante e formação corporativa.",
  },
  {
    tag: "Jurídico",
    title: "Lawtech, automação de contratos, compliance",
    note: "Software para escritórios e departamentos in-house.",
  },
  {
    tag: "Tech",
    title: "SaaS B2B, infra, dev tools, AI nativo",
    note: "Times de produto que precisam virar tese investível.",
  },
];

export function SectorsSection() {
  return (
    <section id="setores" className="section" data-screen-label="04 Setores">
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 56,
            alignItems: "end",
            marginBottom: 56,
          }}
        >
          <div>
            <span className="eyebrow">Para quem</span>
            <h2 className="mkt-h2" style={{ marginTop: 18 }}>
              Quatro setores onde a regulação,
              <br />
              <span className="it">o jargão técnico</span> e o canal já fazem
              parte do desenho.
            </h2>
          </div>
          <p className="mkt-lead">
            Quatro setores onde a gente conhece a regra do jogo e o que faz o
            negócio dar dinheiro.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          {SECTORS.map((s, i) => (
            <SectorCard key={s.tag} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SectorCard({
  tag,
  title,
  note,
  index,
}: {
  tag: string;
  title: string;
  note: string;
  index: number;
}) {
  return (
    <article
      className="mkt-card"
      style={{
        padding: 0,
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        overflow: "hidden",
        minHeight: 220,
      }}
    >
      <div
        style={{ padding: 28, display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--ink-mute)",
              letterSpacing: "0.08em",
            }}
          >
            0{index + 1}
          </span>
          <span
            className="mkt-chip"
            style={{
              background: "rgba(93,87,235,0.08)",
              borderColor: "rgba(93,87,235,0.2)",
              color: "var(--blue)",
            }}
          >
            {tag}
          </span>
        </div>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            fontSize: 22,
            color: "var(--navy)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            color: "var(--ink-soft)",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {note}
        </p>
      </div>
      <div
        style={{
          position: "relative",
          background: "linear-gradient(160deg, #0F2A55 0%, #06122A 100%)",
          overflow: "hidden",
          borderTopRightRadius: 18,
          borderBottomRightRadius: 18,
        }}
      >
        <MeshTexture />
        <Sparkle size={20} style={{ top: 24, right: 22 }} />
        <CircleRing size={70} dashed style={{ bottom: -10, left: -10 }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 900,
              fontSize: 64,
              color: "rgba(82,225,231,0.18)",
              letterSpacing: "-0.04em",
            }}
          >
            {tag[0]}
          </span>
        </div>
      </div>
    </article>
  );
}
