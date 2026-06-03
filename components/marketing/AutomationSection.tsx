import { Sparkle, CircleRing, DoubleCircle, MiniDiamond } from "./MarketingShared";

const STEPS = [
  { n: "01", label: "Mapeamos a operação" },
  { n: "02", label: "Implementamos a automação" },
  { n: "03", label: "Você economiza" },
];

const CARDS = [
  {
    n: "01",
    title: "Integração de sistemas",
    body: "Suas ferramentas param de viver em ilhas. ERP, CRM, planilha e WhatsApp passam a trocar dado sozinhos, sem ninguém copiando e colando entre telas o dia inteiro.",
  },
  {
    n: "02",
    title: "Agentes de IA",
    body: "Atendimento, triagem, qualificação e geração de documento rodando sem operador. O time cuida do que exige cabeça, a máquina cuida do repetitivo.",
  },
  {
    n: "03",
    title: "Painéis e relatórios",
    body: "O número que decide o seu dia atualizado em tempo real. Fim da planilha montada na mão toda segunda de manhã.",
  },
];

export function AutomationSection() {
  return (
    <section
      id="automacao"
      className="section section--dark"
      data-screen-label="Automação"
      style={{ paddingTop: 112, paddingBottom: 112 }}
    >
      <Sparkle size={26} style={{ top: 56, left: 44 }} />
      <CircleRing size={120} dashed style={{ bottom: 70, right: 48 }} />
      <DoubleCircle size={130} style={{ top: 72, right: 36, opacity: 0.35 }} />

      <div className="container" style={{ position: "relative" }}>
        <span className="eyebrow">Segundo produto · Para empresa que já fatura</span>
        <h2
          className="mkt-h2"
          style={{
            marginTop: 18,
            fontSize: "clamp(2.1rem, 4vw, 3.1rem)",
            maxWidth: 760,
          }}
        >
          Já tem empresa?
          <br />
          A gente corta o <span className="cyan">custo</span> que trava o time.
        </h2>
        <p className="mkt-lead" style={{ marginTop: 22, maxWidth: 620 }}>
          Enquanto o Venture Studio constrói do zero, a automação com IA entra na
          operação que já existe. A gente mapeia onde o seu time perde tempo com
          tarefa manual e implementa a automação que se paga em poucos meses.
        </p>

        <div className="mkt-flow" style={{ marginTop: 40 }}>
          {STEPS.map((step, i) => (
            <span
              key={step.n}
              style={{ display: "inline-flex", alignItems: "center", gap: 18 }}
            >
              <span className="mkt-flow__step">
                <span className="mkt-flow__num">{step.n}</span>
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="mkt-flow__arrow" aria-hidden="true">
                  →
                </span>
              )}
            </span>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
          }}
          className="mkt-auto-cards"
        >
          {CARDS.map((c) => (
            <article
              key={c.n}
              className="mkt-card mkt-card--dark"
              style={{
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minHeight: 220,
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
                  {c.n}
                </span>
                <MiniDiamond size={9} color="var(--cyan)" />
              </div>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "var(--font-sans)",
                  fontWeight: 800,
                  fontSize: 22,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                }}
              >
                {c.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.72)",
                  fontSize: 14.5,
                  lineHeight: 1.55,
                }}
              >
                {c.body}
              </p>
            </article>
          ))}
        </div>

        <div
          style={{
            marginTop: 44,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <a
            href="mailto:thiago@ospreceptores.com?subject=Automação na minha empresa"
            className="mkt-btn mkt-btn--cyan mkt-btn--lg"
            aria-label="Falar sobre automação com IA"
          >
            Falar sobre automação
            <span className="mkt-btn__icon" aria-hidden="true">
              →
            </span>
          </a>
          <span
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Conversa direta com o time, sem formulário longo.
          </span>
        </div>
      </div>
    </section>
  );
}
