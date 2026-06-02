import { Sparkle, CircleRing, DoubleCircle, MiniDiamond } from "./MarketingShared";

export function DeliverablesSection() {
  return (
    <section
      id="entregas"
      className="section section--dark"
      data-screen-label="03 Entregas"
    >
      <Sparkle size={28} style={{ top: 64, left: 40 }} />
      <CircleRing size={120} dashed style={{ bottom: 80, right: 56 }} />
      <DoubleCircle size={130} style={{ top: 80, right: 32, opacity: 0.4 }} />

      <div className="container" style={{ position: "relative" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 1fr",
            gap: 56,
            alignItems: "end",
            marginBottom: 56,
          }}
        >
          <div>
            <span className="eyebrow">O que entregamos</span>
            <h2 className="mkt-h2" style={{ marginTop: 18 }}>
              5 documentos
              <br />
              <span className="it">que não são</span> deck.
            </h2>
          </div>
          <p className="mkt-lead">
            Cada estudo sai com cinco saídas concretas. Marcas, planos, sprints. O
            que entra no Drive do cliente vira ferramenta de decisão para os
            próximos 12 meses.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 18,
          }}
        >
          <Deliv
            n="01"
            title="Estudo do Cliente"
            body="Diagnóstico técnico e empreendedor com 5 eixos pontuados, 2 insights priorizados e uma recomendação clara de próximos passos."
            big
          />
          <Deliv
            n="02"
            title="Brand brief"
            body="Identidade, voz, lockup, paleta e princípios. Pronto para o designer executar."
          />
          <Deliv
            n="03"
            title="Plano comercial"
            body="Canal, pricing, motion de vendas e plano para os primeiros 100 leads."
          />
          <Deliv
            n="04"
            title="Cronograma de execução"
            body="12 semanas em sprints quinzenais, vira Kanban com responsáveis no dia 1."
          />
          <Deliv
            n="05"
            title="Diagnóstico contínuo"
            body="O score acompanha a tese durante a execução. Sinais que mudam, mudam o plano em sprint."
            big
          />
        </div>
      </div>
    </section>
  );
}

function Deliv({
  n,
  title,
  body,
  big,
}: {
  n: string;
  title: string;
  body: string;
  big?: boolean;
}) {
  return (
    <article
      className="mkt-card mkt-card--dark"
      style={{
        gridColumn: big ? "span 7" : "span 5",
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 200,
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
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(82,225,231,0.12)",
            border: "1px solid rgba(82,225,231,0.3)",
            color: "var(--cyan)",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {n}
        </span>
        <MiniDiamond size={9} color="var(--cyan)" />
      </div>
      <h3
        style={{
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontWeight: 800,
          fontSize: 24,
          letterSpacing: "-0.02em",
          color: "#fff",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          color: "rgba(255,255,255,0.72)",
          fontSize: 14.5,
          lineHeight: 1.55,
        }}
      >
        {body}
      </p>
    </article>
  );
}
