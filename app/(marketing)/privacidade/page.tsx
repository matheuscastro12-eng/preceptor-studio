import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";

const SITE_URL = "https://preceptorstudio.com";
const STUDIO_EMAIL = "thiago@ospreceptores.com";
const LAST_UPDATED = "02 de junho de 2026";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como a PRECEPTOR! Venture Studio coleta, usa e protege os seus dados pessoais, em conformidade com a LGPD (Lei 13.709/2018).",
  alternates: { canonical: "/privacidade" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_URL}/privacidade`,
    siteName: "PRECEPTOR! Venture Studio",
    title: "Política de Privacidade · PRECEPTOR! Venture Studio",
    description: "Como tratamos os seus dados pessoais, em conformidade com a LGPD.",
  },
};

const linkStyle: React.CSSProperties = {
  color: "var(--navy, #0A1F44)",
  fontWeight: 600,
  textDecoration: "underline",
};

export default function PrivacidadePage() {
  return (
    <div className="site marketing-shell">
      <Nav />

      <section className="section" id="main" style={{ paddingBottom: 24 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <span className="eyebrow">Confiança</span>
          <h1
            className="mkt-display"
            style={{ marginTop: 16, fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
          >
            Política de <span className="cyan">Privacidade.</span>
          </h1>
          <p className="mkt-lead" style={{ marginTop: 18, maxWidth: 640 }}>
            Levamos os seus dados tão a sério quanto a sua tese. Aqui está, em
            português claro, o que coletamos, por que coletamos e o que você pode
            exigir de nós a qualquer momento.
          </p>
          <p
            style={{
              marginTop: 12,
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 12,
              color: "var(--ink-mute, #64748B)",
            }}
          >
            Última atualização: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <Block title="1. Quem é o controlador">
            <P>
              A <strong>PRECEPTOR! Venture Studio</strong> é a controladora dos
              dados pessoais tratados neste site, nos termos da Lei Geral de
              Proteção de Dados (Lei nº 13.709/2018 — LGPD).
            </P>
            <P>
              Identificação do controlador:{" "}
              <strong>[preencher: razão social completa e CNPJ]</strong> — sede em
              Itajubá/MG. Contato do encarregado (DPO) e canal de privacidade:{" "}
              <a href={`mailto:${STUDIO_EMAIL}`} style={linkStyle}>
                {STUDIO_EMAIL}
              </a>
              .
            </P>
          </Block>

          <Block title="2. Quais dados coletamos">
            <P>Coletamos apenas o necessário, e sempre com um propósito:</P>
            <List
              items={[
                <>
                  <strong>Dados que você nos fornece no diagnóstico:</strong> nome,
                  e-mail, empresa ou projeto, telefone (opcional), categoria do
                  negócio e as respostas do questionário estratégico.
                </>,
                <>
                  <strong>Dados de contato:</strong> quando você nos escreve por
                  e-mail ou pede para falar com um especialista.
                </>,
                <>
                  <strong>Dados técnicos:</strong> endereço IP e identificação do
                  navegador (user-agent), usados para segurança, prevenção de abuso
                  e métricas agregadas.
                </>,
              ]}
            />
            <P>
              Não coletamos dados sensíveis intencionalmente e pedimos que você não
              os inclua nas respostas abertas do questionário.
            </P>
          </Block>

          <Block title="3. Para que usamos os seus dados">
            <List
              items={[
                "Gerar e enviar o seu diagnóstico e o score estratégico.",
                "Permitir que um especialista do estúdio entre em contato, quando fizer sentido.",
                "Operar, proteger e melhorar o site e o serviço.",
                "Cumprir obrigações legais e regulatórias.",
              ]}
            />
            <P>
              <strong>Bases legais (LGPD):</strong> o tratamento se apoia no seu{" "}
              <em>consentimento</em> (art. 7º, I), no <em>legítimo interesse</em> de
              avaliar e contatar potenciais clientes (art. 7º, IX) e no cumprimento
              de obrigações legais quando aplicável.
            </P>
          </Block>

          <Block title="4. Com quem compartilhamos">
            <P>
              Não vendemos os seus dados. Compartilhamos apenas com fornecedores que
              viabilizam a operação, sob obrigação de confidencialidade:
            </P>
            <List
              items={[
                <>
                  <strong>Hospedagem do site:</strong> Vercel Inc.
                </>,
                <>
                  <strong>Banco de dados:</strong> Supabase.
                </>,
                <>
                  <strong>Processamento de IA do diagnóstico:</strong> Google
                  (Gemini).
                </>,
                <>
                  <strong>Envio de e-mails:</strong> Resend.
                </>,
              ]}
            />
            <P>
              Alguns desses provedores podem processar dados fora do Brasil. Nesses
              casos, adotamos as salvaguardas previstas na LGPD para a transferência
              internacional de dados.
            </P>
          </Block>

          <Block title="5. Cookies e armazenamento local">
            <P>
              Usamos armazenamento estritamente necessário para o funcionamento do
              site e podemos medir, de forma agregada e anônima, a performance de
              chamadas para ação. Não usamos cookies de publicidade de terceiros.
            </P>
          </Block>

          <Block title="6. Por quanto tempo guardamos">
            <P>
              Guardamos os dados pelo tempo necessário às finalidades acima ou
              enquanto houver relacionamento comercial em potencial. Você pode pedir
              a exclusão a qualquer momento (ver seção 7), respeitadas as hipóteses
              de guarda obrigatória previstas em lei.
            </P>
          </Block>

          <Block title="7. Os seus direitos" id="lgpd">
            <P>A LGPD (art. 18) garante a você, titular dos dados, o direito de:</P>
            <List
              items={[
                "Confirmar a existência de tratamento e acessar os seus dados;",
                "Corrigir dados incompletos, inexatos ou desatualizados;",
                "Solicitar anonimização, bloqueio ou eliminação de dados desnecessários;",
                "Solicitar a portabilidade dos seus dados;",
                "Revogar o consentimento e solicitar a exclusão dos dados;",
                "Ser informado sobre com quem compartilhamos os seus dados.",
              ]}
            />
            <P>
              Para exercer qualquer um desses direitos, escreva para{" "}
              <a href={`mailto:${STUDIO_EMAIL}`} style={linkStyle}>
                {STUDIO_EMAIL}
              </a>
              . Respondemos no menor prazo possível.
            </P>
          </Block>

          <Block title="8. Segurança">
            <P>
              Adotamos medidas técnicas e organizacionais para proteger os seus
              dados, incluindo controle de acesso, criptografia em trânsito e acesso
              restrito da equipe. Nenhum sistema é 100% inviolável, mas tratamos cada
              diagnóstico como conversa de sócios.
            </P>
          </Block>

          <Block title="9. Alterações nesta política">
            <P>
              Podemos atualizar esta política para refletir mudanças no serviço ou na
              legislação. A data da última atualização fica sempre indicada no topo
              desta página.
            </P>
          </Block>

          <Block title="10. Contato">
            <P>
              Dúvidas sobre privacidade ou sobre os seus dados? Fale com a gente:{" "}
              <a href={`mailto:${STUDIO_EMAIL}`} style={linkStyle}>
                {STUDIO_EMAIL}
              </a>
              . Veja também os nossos{" "}
              <Link href="/termos" style={linkStyle}>
                Termos de Uso
              </Link>
              .
            </P>
          </Block>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Block({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} style={{ marginBottom: 36, scrollMarginTop: 96 }}>
      <h2
        style={{
          fontFamily: "var(--font-sans, system-ui)",
          fontWeight: 800,
          fontSize: 20,
          letterSpacing: "-0.01em",
          color: "var(--navy, #0A1F44)",
          margin: "0 0 12px",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 12px",
        color: "var(--ink-soft, #475569)",
        fontSize: 15.5,
        lineHeight: 1.7,
      }}
    >
      {children}
    </p>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul
      style={{
        margin: "0 0 12px",
        paddingLeft: 20,
        color: "var(--ink-soft, #475569)",
        fontSize: 15.5,
        lineHeight: 1.7,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
