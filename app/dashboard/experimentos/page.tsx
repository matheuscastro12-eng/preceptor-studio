import {
  getAbResults,
  type AbExperimentResult,
  type AbVariantResult,
} from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

const EXPERIMENT_LABELS: Record<string, string> = {
  hero_cta: "CTA do hero (landing)",
};

const VARIANT_LABELS: Record<string, Record<string, string>> = {
  hero_cta: {
    A: "Fazer diagnóstico grátis",
    B: "Descobrir o score da minha ideia",
  },
};

function variantLabel(experiment: string, variant: string): string {
  return VARIANT_LABELS[experiment]?.[variant] ?? variant;
}

function experimentLabel(experiment: string): string {
  return EXPERIMENT_LABELS[experiment] ?? experiment;
}

export default async function ExperimentosPage() {
  const results = await getAbResults();

  return (
    <div className="page" data-screen-label="Experimentos">
      <div className="page-head">
        <div>
          <h1 className="h-page">Experimentos</h1>
          <p className="sub">
            Testes A/B do PRECEPTOR! Studio. CTR por variante e variante
            vencedora quando há dados suficientes.
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div
          className="ds-surface"
          style={{ padding: 28, color: "var(--ink-soft)", fontSize: 14 }}
        >
          Nenhum evento de experimento registrado ainda.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {results.map((exp) => (
            <ExperimentBlock key={exp.experiment} exp={exp} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExperimentBlock({ exp }: { exp: AbExperimentResult }) {
  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 12,
        }}
      >
        <div>
          <h2 className="h-section">{experimentLabel(exp.experiment)}</h2>
          <span
            className="tabular"
            style={{ fontSize: 11.5, color: "var(--ink-mute)" }}
          >
            {exp.experiment}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)" }} className="tabular">
          {exp.totalImpressions} impressões · {exp.totalClicks} cliques
        </div>
      </div>

      {!exp.hasEnoughData && (
        <p
          style={{
            fontSize: 12.5,
            color: "var(--ink-mute)",
            margin: "0 0 12px",
          }}
        >
          Dados insuficientes para apontar vencedora (mínimo de 30 impressões por
          variante).
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {exp.variants.map((v) => (
          <VariantCard key={v.variant} experiment={exp.experiment} v={v} />
        ))}
      </div>
    </section>
  );
}

function VariantCard({
  experiment,
  v,
}: {
  experiment: string;
  v: AbVariantResult;
}) {
  return (
    <div
      className="ds-surface"
      style={{
        padding: 18,
        position: "relative",
        borderColor: v.isWinner ? "var(--blue)" : undefined,
        boxShadow: v.isWinner
          ? "0 0 0 1px var(--blue), 0 6px 20px -10px rgba(43,92,255,0.35)"
          : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span className="overline">Variante {v.variant}</span>
        {v.isWinner && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#fff",
              background: "var(--blue)",
              padding: "3px 8px",
              borderRadius: 999,
            }}
          >
            Vencedora
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: 13.5,
          fontWeight: 600,
          color: "var(--ink)",
          marginBottom: 14,
          lineHeight: 1.35,
        }}
      >
        {variantLabel(experiment, v.variant)}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          marginBottom: 12,
        }}
      >
        <span
          className="tabular"
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: v.isWinner ? "var(--blue)" : "var(--navy)",
            lineHeight: 1,
          }}
        >
          {v.ctr.toFixed(1)}%
        </span>
        <span style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>CTR</span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 18,
          fontSize: 12,
          color: "var(--ink-soft)",
        }}
        className="tabular"
      >
        <span>
          <strong style={{ color: "var(--ink)" }}>{v.impressions}</strong>{" "}
          impressões
        </span>
        <span>
          <strong style={{ color: "var(--ink)" }}>{v.clicks}</strong> cliques
        </span>
      </div>
    </div>
  );
}
