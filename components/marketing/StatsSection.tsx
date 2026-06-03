const STATS = [
  { v: "14", l: "ideias diagnosticadas", note: "este ano" },
  { v: "5", l: "documentos por estudo", note: "todo cliente" },
  { v: "12 sem.", l: "execução média", note: "primeiro ciclo" },
  { v: "100%", l: "engenharia humana", note: "código revisado" },
];

export function StatsSection() {
  return (
    <section className="section section--sm" data-screen-label="05 Números">
      <div className="container">
        <div
          className="mkt-card"
          style={{
            padding: "40px 32px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
            alignItems: "stretch",
            borderRadius: 20,
            background:
              "linear-gradient(135deg, rgba(82,225,231,0.06), rgba(93,87,235,0.06))",
            border: "1px solid rgba(82,225,231,0.16)",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.l}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                paddingLeft: i === 0 ? 0 : 24,
                borderLeft: i === 0 ? "none" : "1px solid rgba(15,23,41,0.06)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 900,
                  fontSize: 44,
                  color: "var(--navy)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {s.v}
              </span>
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--navy)" }}>
                {s.l}
              </span>
              <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                {s.note}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
