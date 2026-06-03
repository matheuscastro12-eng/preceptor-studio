import Link from "next/link";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { MiniDiamond } from "./MarketingShared";

export interface SectorPainPoint {
  title: string;
  body: string;
}

export interface SectorCase {
  title: string;
  summary: string;
  status: string;
}

export interface SectorPageProps {
  slug: string;
  label: string;
  eyebrow: string;
  headline: React.ReactNode;
  lead: string;
  method: string;
  painPoints: SectorPainPoint[];
  cases: SectorCase[];
}

export function SectorPage({
  label,
  eyebrow,
  headline,
  lead,
  method,
  painPoints,
  cases,
}: SectorPageProps) {
  return (
    <div className="site">
      <Nav />
      <section className="section" style={{ paddingTop: 72 }}>
        <div className="container">
          <div style={{ maxWidth: 820 }}>
            <span className="eyebrow">
              Setor · {label}
            </span>
            <h1
              className="mkt-display"
              style={{ marginTop: 18, fontSize: "clamp(2.4rem, 4.8vw, 4.4rem)" }}
            >
              {headline}
            </h1>
            <p className="mkt-lead" style={{ marginTop: 22 }}>
              {lead}
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                href="/diagnostico?start=1"
                className="mkt-btn mkt-btn--primary mkt-btn--lg"
              >
                Fazer diagnóstico grátis
                <span className="mkt-btn__icon" aria-hidden="true">→</span>
              </Link>
              <Link href="/insights" className="mkt-btn mkt-btn--ghost mkt-btn--lg">
                Ler insights do estúdio
                <span className="mkt-btn__icon" aria-hidden="true">→</span>
              </Link>
            </div>
            <p style={{ marginTop: 14, fontSize: 13, color: "var(--ink-mute)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
              {eyebrow}
            </p>
          </div>
        </div>
      </section>

      <section className="section section--sm">
        <div className="container">
          <span className="eyebrow">Dor que a gente vê</span>
          <h2 className="mkt-h2" style={{ marginTop: 14 }}>
            O que repete em quase toda tese de <span className="cyan">{label}</span>.
          </h2>
          <div className="mkt-sector-grid" style={{ marginTop: 40 }}>
            {painPoints.map((p) => (
              <article key={p.title} className="mkt-card mkt-sector-card">
                <MiniDiamond size={10} color="var(--cyan-deep)" />
                <h3 className="mkt-sector-card__title">{p.title}</h3>
                <p className="mkt-sector-card__body">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--sm">
        <div className="container">
          <div className="mkt-sector-method">
            <div>
              <span className="eyebrow">Como construímos pra você</span>
              <h2 className="mkt-h2" style={{ marginTop: 14 }}>
                Método com lente <span className="cyan">{label.toLowerCase()}</span>.
              </h2>
            </div>
            <p className="mkt-lead">{method}</p>
          </div>
        </div>
      </section>

      <section className="section section--sm">
        <div className="container">
          <span className="eyebrow">Cases</span>
          <h2 className="mkt-h2" style={{ marginTop: 14 }}>
            Em produção.
          </h2>
          <div className="mkt-sector-grid" style={{ marginTop: 40 }}>
            {cases.map((c) => (
              <article key={c.title} className="mkt-card mkt-sector-card">
                <span className="mkt-chip">{c.status}</span>
                <h3 className="mkt-sector-card__title" style={{ marginTop: 14 }}>
                  {c.title}
                </h3>
                <p className="mkt-sector-card__body">{c.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container" style={{ textAlign: "center" }}>
          <span className="eyebrow eyebrow--cyan">Próximo passo</span>
          <h2 className="mkt-h2" style={{ marginTop: 14 }}>
            Roda o diagnóstico técnico grátis.
          </h2>
          <p className="mkt-lead" style={{ margin: "20px auto 0", textAlign: "center" }}>
            8 minutos. Devolve score por eixo, leitura honesta da tese e
            recomendação clara de próximos passos.
          </p>
          <div style={{ marginTop: 32, display: "inline-flex" }}>
            <Link
              href="/diagnostico?start=1"
              className="mkt-btn mkt-btn--cyan mkt-btn--lg"
            >
              Fazer diagnóstico técnico grátis
              <span className="mkt-btn__icon" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
