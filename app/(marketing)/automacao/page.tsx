import type { Metadata } from "next";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import {
  Sparkle,
  CircleRing,
  DoubleCircle,
  MiniDiamond,
} from "@/components/marketing/MarketingShared";
import { AutomationContactForm } from "@/components/marketing/AutomationContactForm";

export const metadata: Metadata = {
  title: "Automação com IA",
  description:
    "Já tem empresa? A gente corta o custo que trava o time. Mapeamos onde sua operação perde tempo com tarefa manual e implementamos a automação que se paga em poucos meses.",
  alternates: { canonical: "/automacao" },
  openGraph: {
    type: "website",
    url: "https://preceptorstudio.com/automacao",
    title: "Automação com IA · PRECEPTOR! Venture Studio",
    description:
      "A automação com IA entra na operação que já existe. A gente mapeia onde o time perde tempo e implementa a automação que se paga rápido.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const STEPS = [
  { n: "01", label: "Mapeamos a operação" },
  { n: "02", label: "Implementamos a automação" },
  { n: "03", label: "Você economiza" },
];

const PILLARS = [
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

const CASES = [
  {
    title: "Triagem de atendimento no WhatsApp",
    body: "Lead chega, é qualificado e roteado pro vendedor certo sem ninguém olhando a caixa de entrada. O time pega a conversa já com contexto pronto.",
  },
  {
    title: "ERP conversando com o CRM",
    body: "Pedido fechado vira nota, atualiza estoque e dispara o pós-venda sozinho. Acaba o retrabalho de digitar o mesmo dado em três sistemas.",
  },
  {
    title: "Geração de documento e proposta",
    body: "Contrato, proposta e relatório montados a partir do dado que já existe. O que levava uma tarde sai em segundos, com padrão sempre igual.",
  },
  {
    title: "Cobrança e financeiro no automático",
    body: "Régua de cobrança, conciliação e lembrete de vencimento rodando sozinhos. Menos inadimplência sem ocupar uma pessoa pra isso.",
  },
  {
    title: "Relatório que se monta sozinho",
    body: "O painel puxa o dado da fonte e fica pronto antes da reunião. Ninguém perde a segunda de manhã consolidando planilha na mão.",
  },
  {
    title: "Onboarding de cliente sem fricção",
    body: "Cadastro, validação de documento e primeiros acessos disparados em sequência. O cliente entra rápido e o time não vira gargalo.",
  },
];

const METHOD = [
  {
    n: "01",
    title: "Mapeamento da operação",
    body: "A gente senta com o time e olha onde o tempo vaza: a tarefa manual que se repete, o copia e cola entre telas, o dado que alguém digita de novo. Sai dali a lista do que se paga mais rápido.",
  },
  {
    n: "02",
    title: "Implementação com time sênior",
    body: "Quem constrói já entregou automação em produção, não está aprendendo enquanto cobra. Integra os sistemas que você já usa, sem trocar a operação inteira de lugar.",
  },
  {
    n: "03",
    title: "Operação rodando e medida",
    body: "A automação entra no dia a dia com painel pra você ver o ganho. O time é liberado da tarefa repetitiva e o custo que travava cai de forma visível.",
  },
];

export default function AutomacaoPage() {
  return (
    <div className="site">
      <Nav />

      {/* Hero */}
      <section
        id="inicio"
        className="section section--dark"
        data-screen-label="Automação"
        style={{ paddingTop: 96, paddingBottom: 96, position: "relative" }}
      >
        <Sparkle size={26} style={{ top: 56, left: 44 }} />
        <CircleRing size={120} dashed style={{ bottom: 70, right: 48 }} />
        <DoubleCircle size={130} style={{ top: 72, right: 36, opacity: 0.35 }} />

        <div className="container" style={{ position: "relative" }}>
          <span className="eyebrow">Automação com IA · Para empresa que já fatura</span>
          <h1
            className="mkt-display"
            style={{
              marginTop: 18,
              fontSize: "clamp(2.4rem, 4.8vw, 4rem)",
              maxWidth: 880,
              color: "#fff",
            }}
          >
            Já tem empresa?
            <br />
            A gente corta o <span className="cyan">custo</span> que trava o time.
          </h1>
          <p className="mkt-lead" style={{ marginTop: 22, maxWidth: 640 }}>
            A automação com IA entra na operação que já existe. A gente mapeia
            onde o seu time perde tempo com tarefa manual e implementa a
            automação que se paga em poucos meses.
          </p>

          <div style={{ marginTop: 32, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href="#falar" className="mkt-btn mkt-btn--cyan mkt-btn--lg">
              Falar sobre automação
              <span className="mkt-btn__icon" aria-hidden="true">→</span>
            </a>
          </div>

          <div className="mkt-flow" style={{ marginTop: 48 }}>
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
        </div>
      </section>

      {/* Três pilares */}
      <section id="entregamos" className="section section--sm" data-screen-label="O que entregamos">
        <div className="container">
          <span className="eyebrow">O que entregamos</span>
          <h2 className="mkt-h2" style={{ marginTop: 14, maxWidth: 720 }}>
            Três frentes pra tirar a tarefa manual do <span className="cyan">caminho</span>.
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18,
              marginTop: 40,
            }}
            className="mkt-auto-cards"
          >
            {PILLARS.map((c) => (
              <article
                key={c.n}
                className="mkt-card"
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
                      border: "1px solid rgba(82,225,231,0.35)",
                      color: "var(--cyan-deep)",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {c.n}
                  </span>
                  <MiniDiamond size={9} color="var(--cyan-deep)" />
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                    fontWeight: 800,
                    fontSize: 22,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {c.title}
                </h3>
                <p style={{ margin: 0, color: "var(--ink-mute)", fontSize: 14.5, lineHeight: 1.55 }}>
                  {c.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* O que dá pra automatizar */}
      <section id="possibilidades" className="section section--sm" data-screen-label="Possibilidades">
        <div className="container">
          <span className="eyebrow">O que dá pra automatizar</span>
          <h2 className="mkt-h2" style={{ marginTop: 14, maxWidth: 720 }}>
            Onde a automação se paga <span className="cyan">primeiro</span>.
          </h2>
          <div className="mkt-sector-grid" style={{ marginTop: 40 }}>
            {CASES.map((c) => (
              <article key={c.title} className="mkt-card mkt-sector-card">
                <MiniDiamond size={10} color="var(--cyan-deep)" />
                <h3 className="mkt-sector-card__title">{c.title}</h3>
                <p className="mkt-sector-card__body">{c.body}</p>
              </article>
            ))}

            <article
              className="mkt-card mkt-sector-card"
              style={{
                background:
                  "linear-gradient(135deg, rgba(82,225,231,0.16), rgba(82,225,231,0.04))",
                border: "1px solid rgba(82,225,231,0.4)",
                justifyContent: "center",
              }}
            >
              <MiniDiamond size={10} color="var(--cyan-deep)" />
              <h3 className="mkt-sector-card__title" style={{ color: "var(--cyan-deep)" }}>
                E infinitas possibilidades
              </h3>
              <p className="mkt-sector-card__body">
                Esses são só os pontos de partida mais comuns. Se a tarefa se
                repete e segue uma regra, dá pra automatizar. A gente mapeia a
                sua operação e mostra o que se paga primeiro.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="section section--sm" data-screen-label="Como funciona">
        <div className="container">
          <span className="eyebrow">Como funciona</span>
          <h2 className="mkt-h2" style={{ marginTop: 14, maxWidth: 720 }}>
            Do mapa ao ganho, sem virar a operação do <span className="cyan">avesso</span>.
          </h2>
          <div className="mkt-sector-grid" style={{ marginTop: 40 }}>
            {METHOD.map((m) => (
              <article key={m.n} className="mkt-card mkt-sector-card">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(82,225,231,0.12)",
                    border: "1px solid rgba(82,225,231,0.35)",
                    color: "var(--cyan-deep)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {m.n}
                </span>
                <h3 className="mkt-sector-card__title" style={{ marginTop: 14 }}>
                  {m.title}
                </h3>
                <p className="mkt-sector-card__body">{m.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section
        id="falar"
        className="section section--dark"
        data-screen-label="Falar sobre automação"
        style={{ paddingTop: 96, paddingBottom: 96, position: "relative" }}
      >
        <CircleRing size={120} dashed style={{ top: 70, left: 48 }} />
        <DoubleCircle size={120} style={{ bottom: 64, right: 40, opacity: 0.3 }} />

        <div className="container" style={{ position: "relative" }}>
          <span className="eyebrow eyebrow--cyan">Próximo passo</span>
          <h2 className="mkt-h2" style={{ marginTop: 14, maxWidth: 680 }}>
            Fale sobre a automação da sua empresa.
          </h2>
          <p className="mkt-lead" style={{ marginTop: 18, maxWidth: 560 }}>
            Preencha e o time entra em contato para mapear onde a automação se
            paga mais rápido na sua operação.
          </p>
          <div style={{ marginTop: 28 }}>
            <AutomationContactForm />
          </div>
        </div>
      </section>

      <Footer variant="automacao" />
    </div>
  );
}
