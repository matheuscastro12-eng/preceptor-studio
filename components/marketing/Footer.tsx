import Link from "next/link";
import { Mark } from "./MarketingShared";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  items: FooterLink[];
  mono?: boolean;
}

// Colunas do meio para a landing de automação: cada item leva pra uma seção
// da própria página (URL própria por âncora).
const AUTOMACAO_COLUMNS: FooterColumn[] = [
  {
    title: "Automação",
    items: [
      { label: "O que entregamos", href: "/automacao#entregamos" },
      { label: "Onde se paga primeiro", href: "/automacao#possibilidades" },
      { label: "Como funciona", href: "/automacao#como-funciona" },
      { label: "Falar sobre automação", href: "/automacao#falar" },
    ],
  },
  {
    title: "Possibilidades",
    items: [
      { label: "Triagem no WhatsApp", href: "/automacao#possibilidades" },
      { label: "ERP + CRM integrados", href: "/automacao#possibilidades" },
      { label: "Cobrança automática", href: "/automacao#possibilidades" },
      { label: "Painéis e relatórios", href: "/automacao#possibilidades" },
    ],
  },
];

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: "Estúdio",
    items: [
      { label: "Como construímos", href: "/#como" },
      { label: "O que entregamos", href: "/#entregamos" },
      { label: "Setores", href: "/#setores" },
      { label: "Cases", href: "/#cases" },
    ],
  },
  {
    title: "Diagnóstico",
    items: [
      { label: "Fazer grátis", href: "/diagnostico?start=1" },
      { label: "Como funciona", href: "/diagnostico" },
      { label: "Diagnóstico completo", href: "/diagnostico" },
      { label: "Falar com especialista", href: "/diagnostico?start=1" },
    ],
  },
];

export function Footer({ variant = "default" }: { variant?: "default" | "automacao" }) {
  const columns = variant === "automacao" ? AUTOMACAO_COLUMNS : DEFAULT_COLUMNS;
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
              Venture Studio brasileiro. Tiramos o empreendimento do papel e
              construímos o negócio com engenharia de verdade, com hipótese e
              medição em cada passo.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
              <span className="mkt-chip">Itajubá, MG</span>
              <span className="mkt-chip">Operação 2026</span>
            </div>
          </div>
          {columns.map((col) => (
            <FooterCol key={col.title} title={col.title} items={col.items} />
          ))}
          <FooterCol
            title="Contato"
            items={[
              { label: "thiago@ospreceptores.com", href: "mailto:thiago@ospreceptores.com" },
              { label: "+55 35 98703 5957", href: "https://wa.me/5535987035957" },
              { label: "Itajubá, MG", href: "#" },
              { label: "@preceptorstudio", href: "#" },
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
            © 2026 PRECEPTOR! Venture Studio · Itajubá, MG
          </span>
          <div
            style={{
              display: "flex",
              gap: 22,
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <Link href="/termos" rel="nofollow">Termos</Link>
            <Link href="/privacidade" rel="nofollow">Privacidade</Link>
            <Link href="/privacidade#lgpd" rel="nofollow">LGPD</Link>
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
  items: FooterLink[];
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
            key={i.label}
            style={{
              color: "rgba(255,255,255,0.78)",
              fontSize: 14,
              fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
              fontWeight: 500,
            }}
          >
            <a href={i.href} rel="nofollow" style={{ transition: "color 160ms" }}>
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
