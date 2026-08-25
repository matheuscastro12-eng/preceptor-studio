import { Reveal } from "./Reveal";

const STATS = [
  {
    v: "1.400+",
    l: "horas devolvidas ao time",
    note: "por mês, somando as operações atendidas",
  },
  {
    v: "38%",
    l: "de custo reduzido",
    note: "média nos processos automatizados",
  },
  {
    v: "7 em 10",
    l: "execuções sem toque humano",
    note: "o time entra só onde exige critério",
  },
  {
    v: "Semanas",
    l: "até a primeira automação no ar",
    note: "não meses, com retorno medido desde o dia 1",
  },
];

export function ResultsSection() {
  return (
    <section id="resultados" className="section" style={{ paddingBottom: 0 }}>
      <div className="container">
        <Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 40,
              paddingBottom: 56,
              borderBottom: "1px solid var(--line)",
            }}
            className="mkt-grid-4"
          >
            {STATS.map((s) => (
              <div key={s.l}>
                <div
                  style={{
                    fontFamily: "var(--font-head)",
                    fontWeight: 650,
                    fontSize: "clamp(2.2rem, 3.6vw, 3rem)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    color: "var(--navy)",
                  }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontWeight: 600,
                    fontSize: 15,
                    color: "var(--navy)",
                  }}
                >
                  {s.l}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "var(--ink-soft)",
                  }}
                >
                  {s.note}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
