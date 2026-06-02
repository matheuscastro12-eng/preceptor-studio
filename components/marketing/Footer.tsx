import { Mark } from "./MarketingShared";

export function Footer() {
  return (
    <footer
      id="estudio"
      className="section section--dark"
      style={{ padding: "72px 0 36px" }}
      data-screen-label="07 Footer"
    >
      <div className="container" style={{ position: "relative" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 56,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <Mark size={18} />
              <span
                style={{
                  fontWeight: 900,
                  fontSize: 18,
                  letterSpacing: "-0.012em",
                  color: "#fff",
                }}
              >
                PRECEPTOR!
              </span>
              <span
                style={{
                  color: "var(--cyan)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                }}
              >
                Venture Studio
              </span>
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14.5,
                lineHeight: 1.55,
                margin: 0,
                maxWidth: 380,
              }}
            >
              Venture Studio brasileiro. Tiramos teses do papel e construímos
              produtos com engenharia de verdade, em camadas, com hipótese e
              medição em cada passo.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
              <span className="mkt-chip">São Paulo, BR</span>
              <span className="mkt-chip">Operação 2024</span>
            </div>
          </div>
          <FooterCol
            title="Estúdio"
            items={["Como construímos", "O que entregamos", "Setores", "Cases"]}
          />
          <FooterCol
            title="Diagnóstico"
            items={[
              "Fazer grátis",
              "Como funciona",
              "Diagnóstico completo",
              "Falar com especialista",
            ]}
          />
          <FooterCol
            title="Contato"
            items={[
              "studio@preceptor.com.br",
              "+55 11 99999 0000",
              "São Paulo, SP",
              "@preceptorstudio",
            ]}
            mono
          />
        </div>

        <div className="mkt-hr" />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 28,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.08em",
            }}
          >
            © 2026 PRECEPTOR! Venture Studio · CNPJ 00.000.000/0001-00
          </span>
          <div
            style={{
              display: "flex",
              gap: 22,
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <a href="#" rel="nofollow">Termos</a>
            <a href="#" rel="nofollow">Privacidade</a>
            <a href="#" rel="nofollow">LGPD</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
  mono,
}: {
  title: string;
  items: string[];
  mono?: boolean;
}) {
  return (
    <div>
      <span
        className="overline"
        style={{ color: "var(--cyan)", letterSpacing: "0.18em" }}
      >
        {title}
      </span>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "16px 0 0",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {items.map((i) => (
          <li
            key={i}
            style={{
              color: "rgba(255,255,255,0.78)",
              fontSize: 14,
              fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
              fontWeight: 500,
            }}
          >
            <a href="#" rel="nofollow" style={{ transition: "color 160ms" }}>
              {i}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
