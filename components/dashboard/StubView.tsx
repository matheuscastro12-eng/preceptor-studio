import Link from "next/link";

export function StubView({
  title,
  sub,
}: {
  title: string;
  sub: string;
}) {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="h-page">{title}</h1>
          <p className="sub">{sub}</p>
        </div>
        <Link className="ds-btn ds-btn-ghost" href="/dashboard">
          ← Voltar
        </Link>
      </div>
      <div className="ds-card" style={{ padding: 56, textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "var(--slate-100)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            color: "var(--ink-mute)",
            fontSize: 22,
          }}
        >
          ○
        </div>
        <h3
          style={{
            margin: 0,
            fontWeight: 800,
            color: "var(--navy)",
            fontSize: 18,
          }}
        >
          Em construção
        </h3>
        <p
          style={{
            color: "var(--ink-soft)",
            margin: "6px 0 0",
            fontSize: 13,
          }}
        >
          Esta seção entra na próxima sprint do estúdio.
        </p>
      </div>
    </div>
  );
}
