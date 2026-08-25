import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

const COLUMNS: { title: string; items: FooterLink[]; mono?: boolean }[] = [
  {
    title: "Estúdio",
    items: [
      { label: "Resultados", href: "/#resultados" },
      { label: "Como sustentamos", href: "/#como" },
      { label: "Contato", href: "/#contato" },
    ],
  },
  {
    title: "Segmentos",
    items: [
      { label: "Logística e Transportes", href: "/transporte" },
      { label: "Agro", href: "/agro" },
      { label: "Clínicas e Medicina", href: "/clinicas" },
    ],
  },
  {
    title: "Contato",
    mono: true,
    items: [
      { label: "+55 35 99919-1919", href: "https://wa.me/5535999191919" },
      { label: "+55 35 98703-5957", href: "https://wa.me/5535987035957" },
      { label: "thiago@ospreceptores.com", href: "mailto:thiago@ospreceptores.com" },
      { label: "Itajubá, MG", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      id="estudio"
      style={{ borderTop: "1px solid var(--line)", padding: "72px 0 36px" }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1.1fr 1.1fr",
            gap: 40,
            marginBottom: 56,
          }}
          className="mkt-footer-grid"
        >
          <div>
            <div style={{ marginBottom: 20 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-horizontal.png"
                alt="PRECEPTOR!"
                style={{ height: 28, width: "auto", display: "block" }}
              />
            </div>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: 14.5,
                lineHeight: 1.6,
                margin: 0,
                maxWidth: 380,
              }}
            >
              Uma equipe de Engenharia de Processos e uma frente de
              Inteligência Artificial Aplicada, no mesmo nível. A tecnologia é
              o caminho, o destino são as pessoas.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <span className="overline" style={{ color: "var(--teal-ink)" }}>
                {col.title}
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
                {col.items.map((i) => (
                  <li
                    key={i.label}
                    style={{
                      fontSize: 14,
                      fontFamily: col.mono
                        ? "var(--font-mono)"
                        : "var(--font-sans)",
                      fontWeight: 500,
                    }}
                  >
                    <a
                      href={i.href}
                      style={{
                        color: "var(--ink-soft)",
                        textDecoration: "none",
                        transition: "color 140ms",
                      }}
                    >
                      {i.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
              color: "var(--ink-mute)",
              letterSpacing: "0.08em",
            }}
          >
            © 2026 PRECEPTOR! Studio · Itajubá, MG
          </span>
          <div
            style={{
              display: "flex",
              gap: 22,
              fontSize: 12,
            }}
          >
            <Link href="/termos" rel="nofollow" style={{ color: "var(--ink-soft)" }}>
              Termos
            </Link>
            <Link href="/privacidade" rel="nofollow" style={{ color: "var(--ink-soft)" }}>
              Privacidade
            </Link>
            <Link href="/privacidade#lgpd" rel="nofollow" style={{ color: "var(--ink-soft)" }}>
              LGPD
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
