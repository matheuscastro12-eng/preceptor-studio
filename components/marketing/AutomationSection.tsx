import Link from "next/link";
import { AutomationContactForm } from "./AutomationContactForm";
import { Reveal } from "./Reveal";

const SCOPES = [
  {
    title: "Integração de sistemas",
    body: "ERP, CRM, planilha e WhatsApp passam a trocar dado sozinhos, sem ninguém copiando e colando entre telas.",
  },
  {
    title: "Agentes de IA",
    body: "Atendimento, triagem, qualificação e geração de documento rodando sem operador. O time fica com o que exige critério.",
  },
  {
    title: "Painéis e relatórios",
    body: "O número que decide o seu dia atualizado em tempo real, sem planilha montada na mão toda segunda.",
  },
];

export function AutomationSection() {
  return (
    <section id="contato" className="section section--dark mkt-contact">
      <div className="mkt-contact__grid-bg" aria-hidden="true" />
      <div className="container" style={{ position: "relative" }}>
        <Reveal>
          <div className="mkt-sec-head" style={{ marginBottom: 56 }}>
            <div>
              <span className="eyebrow">Contato · Soluções em IA</span>
              <h2 className="mkt-h2" style={{ marginTop: 20 }}>
                A gente corta o custo
                <br />
                <span className="bang">que trava o seu time</span>
              </h2>
            </div>
            <p className="mkt-lead">
              Mapeamos onde o time perde tempo com tarefa manual e
              implementamos a automação que se paga em poucos meses. O retorno
              fica visível em painel.
            </p>
          </div>
        </Reveal>

        <div
          className="mkt-contact-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr",
            gap: 56,
            alignItems: "start",
          }}
        >
          <Reveal delay={150}>
            <div>
              <h3
                style={{
                  margin: "0 0 12px",
                  fontFamily: "var(--font-head)",
                  fontSize: 26,
                  fontWeight: 650,
                  letterSpacing: "-0.025em",
                  color: "#fff",
                }}
              >
                Fale sobre a automação da sua empresa
              </h3>
              <p
                style={{
                  margin: "0 0 28px",
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.7)",
                  maxWidth: 400,
                }}
              >
                Preencha o formulário e o time entra em contato para mapear
                onde a automação se paga mais rápido na sua operação. Se
                preferir, chame direto no WhatsApp.
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <a
                  className="mkt-contact__phone"
                  href="https://wa.me/5535999191919"
                >
                  <span className="dot" aria-hidden="true" />
                  +55 35 99919-1919
                </a>
                <a
                  className="mkt-contact__phone"
                  href="https://wa.me/5535987035957"
                >
                  <span className="dot" aria-hidden="true" />
                  +55 35 98703-5957
                </a>
                <a
                  href="mailto:thiago@ospreceptores.com"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.6)",
                    textDecoration: "none",
                  }}
                >
                  thiago@ospreceptores.com
                </a>
              </div>
              <div
                style={{
                  marginTop: 32,
                  paddingTop: 24,
                  borderTop: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 14px",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.6)",
                    maxWidth: 380,
                  }}
                >
                  Ainda não sabe por onde começar? Responda o diagnóstico
                  grátis e receba na hora um retrato da sua operação.
                </p>
                <Link
                  href="/diagnostico?start=1"
                  className="mkt-btn"
                  style={{ background: "#fff", color: "var(--navy)" }}
                  aria-label="Fazer o diagnóstico grátis"
                >
                  Fazer o diagnóstico grátis
                  <span className="mkt-btn__icon" aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={220}>
            <AutomationContactForm />
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div
            className="mkt-grid-3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 40,
              marginTop: 88,
            }}
          >
            {SCOPES.map((c) => (
              <div
                key={c.title}
                style={{
                  paddingTop: 20,
                  borderTop: "1px solid rgba(255,255,255,0.16)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontFamily: "var(--font-head)",
                    fontSize: 17,
                    fontWeight: 630,
                    letterSpacing: "-0.015em",
                    color: "#fff",
                  }}
                >
                  {c.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,0.66)",
                  }}
                >
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
     </div>
    </section>
  );
}
