import { Reveal } from "./Reveal";

/* Resultados contados como texto corrido, com os números destacados na frase.
   Sem grade de "big number + label": o formato aqui é declaração, não painel. */

function Num({ children }: { children: React.ReactNode }) {
  return (
    <strong
      style={{
        fontWeight: 650,
        color: "var(--navy)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </strong>
  );
}

export function ResultsSection() {
  return (
    <section id="resultados" className="section" style={{ paddingBottom: 96 }}>
      <div className="container">
        <Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "44px 1fr",
              gap: 32,
              alignItems: "start",
            }}
          >
            <span
              className="mkt-bang"
              aria-hidden="true"
              style={{ marginTop: 14 }}
            />
            <div>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-head)",
                  fontWeight: 460,
                  fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)",
                  letterSpacing: "-0.022em",
                  lineHeight: 1.35,
                  color: "var(--ink-soft)",
                  maxWidth: 920,
                }}
              >
                No último ano, as operações que atendemos devolveram{" "}
                <Num>mais de 1.400 horas por mês</Num> aos seus times, cortaram{" "}
                <Num>38% do custo</Num> dos processos automatizados e colocaram{" "}
                <Num>7 de cada 10 execuções</Num> pra rodar sem toque humano.
                Da assinatura à primeira automação em produção:{" "}
                <Num>
                  semanas
                  <span
                    style={{
                      display: "inline-block",
                      width: "0.18em",
                      height: "0.18em",
                      borderRadius: 999,
                      background: "var(--teal)",
                      marginLeft: "0.12em",
                    }}
                    aria-hidden="true"
                  />
                </Num>
              </p>
              <p
                style={{
                  margin: "28px 0 0",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11.5,
                  letterSpacing: "0.08em",
                  color: "var(--ink-mute)",
                }}
              >
                Somatório das operações em produção. Cada projeto acompanha
                painel próprio de indicadores.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
