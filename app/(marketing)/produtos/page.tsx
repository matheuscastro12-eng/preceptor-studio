import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import {
  Sparkle,
  CircleRing,
  DoubleCircle,
  MiniDiamond,
} from "@/components/marketing/MarketingShared";

const SITE_URL = "https://preceptorstudio.com";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Dois produtos da PRECEPTOR! Venture Studio: construção de produto digital para quem tem uma ideia e automação com IA para empresas que já estão rodando.",
  alternates: { canonical: "/produtos" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_URL}/produtos`,
    siteName: "PRECEPTOR! Venture Studio",
    title: "Produtos · PRECEPTOR! Venture Studio",
    description:
      "Construção de produto digital para quem tem uma ideia e automação com IA para empresas que já rodam.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const STUDIO_STEPS = [
  {
    n: "01",
    title: "Diagnóstico da ideia",
    body: "A gente lê a sua ideia a fundo e devolve um veredito honesto: onde está forte, onde está exposta, o que precisa virar concreto antes de gastar a primeira hora de código.",
  },
  {
    n: "02",
    title: "Sonar do negócio",
    body: "Mercado, cliente que paga, modelo de receita, concorrência, regulação e um plano de execução de 12 semanas. Cinco documentos que viram a sua base de decisão.",
  },
  {
    n: "03",
    title: "Construção em sprints",
    body: "O plano vira produto. Engenheiro sênior alocado, entregas quinzenais, você acompanha tudo em tempo real. Da primeira tela ao código rodando.",
  },
];

const STUDIO_DELIVERABLES = [
  "Estudo do cliente, o diagnóstico técnico e empreendedor da ideia",
  "Brand brief com identidade, voz e paleta prontos para o designer",
  "Plano comercial com canal, pricing e os primeiros leads",
  "Cronograma de execução em sprints, que vira quadro de tarefas no dia 1",
  "Diagnóstico contínuo, o score que acompanha o negócio durante a obra",
];

const AUTOMATION_CASES = [
  {
    n: "01",
    title: "Integração de sistemas",
    body: "ERP, CRM, planilha e WhatsApp param de viver em ilhas e passam a trocar dado sozinhos. Acabou o copia e cola entre telas o dia inteiro.",
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

export default function ProdutosPage() {
  return (
    <div className="site marketing-shell">
      <Nav />

      {/* Hero da página */}
      <section className="section" style={{ paddingBottom: 40 }}>
        <div className="container">
          <span className="eyebrow">O que a gente faz</span>
          <h1
            className="mkt-display"
            style={{
              marginTop: 16,
              fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
            }}
          >
            Dois produtos,
            <br />
            <span className="cyan">um estúdio só.</span>
          </h1>
          <p className="mkt-lead" style={{ marginTop: 18, maxWidth: 620 }}>
            A PRECEPTOR! resolve dois problemas de quem empreende. Se você tem
            uma ideia, a gente descobre se ela dá dinheiro e constrói o produto.
            Se você já tem empresa rodando, a gente automatiza o que custa caro
            no seu dia.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginTop: 32,
            }}
          >
            <a
              href="#venture-studio"
              className="mkt-card"
              style={{ padding: 24, textDecoration: "none", display: "block" }}
            >
              <span className="eyebrow">Tem uma ideia</span>
              <h2
                className="mkt-h2"
                style={{ fontSize: "1.5rem", marginTop: 12 }}
              >
                Venture Studio
              </h2>
              <p
                style={{
                  margin: "10px 0 0",
                  color: "var(--ink-soft)",
                  fontSize: 14.5,
                  lineHeight: 1.5,
                }}
              >
                Da ideia ao produto digital rodando, com engenharia de verdade.
              </p>
            </a>
            <a
              href="#automacao-ia"
              className="mkt-card"
              style={{ padding: 24, textDecoration: "none", display: "block" }}
            >
              <span className="eyebrow">Já tem empresa</span>
              <h2
                className="mkt-h2"
                style={{ fontSize: "1.5rem", marginTop: 12 }}
              >
                Automação com IA
              </h2>
              <p
                style={{
                  margin: "10px 0 0",
                  color: "var(--ink-soft)",
                  fontSize: 14.5,
                  lineHeight: 1.5,
                }}
              >
                Automação na sua operação que se paga em poucos meses.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Produto 1: Venture Studio */}
      <section id="venture-studio" className="section">
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 1fr",
              gap: 56,
              alignItems: "end",
              marginBottom: 48,
            }}
          >
            <div>
              <span className="eyebrow">Produto 1 · Venture Studio</span>
              <h2 className="mkt-h2" style={{ marginTop: 18 }}>
                Você chega com a ideia.
                <br />A gente devolve o <span className="cyan">produto</span>.
              </h2>
            </div>
            <p className="mkt-lead">
              Para o empreendedor que quer sair do papel sem queimar a grana no
              escuro. A gente entende, valida e constrói, do diagnóstico ao
              produto vendendo.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18,
              marginBottom: 32,
            }}
          >
            {STUDIO_STEPS.map((s) => (
              <article
                key={s.n}
                className="mkt-card"
                style={{
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  minHeight: 220,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--cyan-deep)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  passo {s.n}
                </span>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                    fontWeight: 800,
                    fontSize: 21,
                    letterSpacing: "-0.02em",
                    color: "var(--navy)",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "var(--ink-soft)",
                    fontSize: 14.5,
                    lineHeight: 1.55,
                  }}
                >
                  {s.body}
                </p>
              </article>
            ))}
          </div>

          <div
            className="mkt-card"
            style={{
              padding: 32,
              background:
                "linear-gradient(135deg, rgba(82,225,231,0.05), rgba(93,87,235,0.05))",
              borderColor: "rgba(82,225,231,0.2)",
            }}
          >
            <span className="eyebrow">O que sai no fim</span>
            <h3
              className="mkt-h2"
              style={{ fontSize: "1.5rem", marginTop: 12, marginBottom: 18 }}
            >
              Cinco documentos que viram a sua base de decisão.
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {STUDIO_DELIVERABLES.map((d, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    fontSize: 14.5,
                    color: "var(--ink)",
                    lineHeight: 1.45,
                  }}
                >
                  <MiniDiamond
                    size={9}
                    color="var(--cyan-deep)"
                    style={{ marginTop: 5, flexShrink: 0 }}
                  />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 32, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link
              href="/diagnostico?start=1"
              className="mkt-btn mkt-btn--primary mkt-btn--lg"
              aria-label="Fazer diagnóstico grátis"
            >
              Fazer diagnóstico grátis
              <span className="mkt-btn__icon" aria-hidden="true">→</span>
            </Link>
            <span
              style={{
                alignSelf: "center",
                fontSize: 13,
                color: "var(--ink-mute)",
              }}
            >
              A porta de entrada do Venture Studio. Sem login, sem custo.
            </span>
          </div>
        </div>
      </section>

      {/* Produto 2: Automação com IA */}
      <section id="automacao-ia" className="section section--dark">
        <Sparkle size={26} style={{ top: 56, left: 44 }} />
        <DoubleCircle size={130} style={{ top: 60, right: 40, opacity: 0.4 }} />
        <CircleRing size={110} dashed style={{ bottom: 70, right: 60 }} />

        <div className="container" style={{ position: "relative" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 1fr",
              gap: 56,
              alignItems: "end",
              marginBottom: 48,
            }}
          >
            <div>
              <span className="eyebrow">Produto 2 · Automação com IA</span>
              <h2 className="mkt-h2" style={{ marginTop: 18 }}>
                Sua empresa já roda.
                <br />A gente tira o{" "}
                <span className="cyan">repetitivo</span> da frente.
              </h2>
            </div>
            <p className="mkt-lead">
              Para empresas que perdem horas em tarefa manual. A gente entra na
              operação, acha onde o tempo escorre e implementa a automação com
              IA que se paga em poucos meses.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18,
            }}
          >
            {AUTOMATION_CASES.map((c) => (
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
                    fontSize: 21,
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
              marginTop: 40,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <a
              href="mailto:thiago@ospreceptores.com?subject=Automação na minha empresa"
              className="mkt-btn mkt-btn--cyan mkt-btn--lg"
              aria-label="Falar sobre automação com IA"
            >
              Falar sobre automação
              <span className="mkt-btn__icon" aria-hidden="true">→</span>
            </a>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
              Conversa direta com o time, sem formulário longo.
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
