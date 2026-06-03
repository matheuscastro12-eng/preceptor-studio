import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";

const SITE_URL = "https://preceptorstudio.com";
const STUDIO_EMAIL = "thiago@ospreceptores.com";
const LAST_UPDATED = "02 de junho de 2026";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de Uso do site e do diagnóstico gratuito da PRECEPTOR! Venture Studio.",
  alternates: { canonical: "/termos" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_URL}/termos`,
    siteName: "PRECEPTOR! Venture Studio",
    title: "Termos de Uso · PRECEPTOR! Venture Studio",
    description: "As regras de uso do nosso site e do diagnóstico gratuito.",
  },
};

const linkStyle: React.CSSProperties = {
  color: "var(--navy, #0A1F44)",
  fontWeight: 600,
  textDecoration: "underline",
};

export default function TermosPage() {
  return (
    <div className="site marketing-shell">
      <Nav />

      <section className="section" id="main" style={{ paddingBottom: 24 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <span className="eyebrow">Regras do jogo</span>
          <h1
            className="mkt-display"
            style={{ marginTop: 16, fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
          >
            Termos de <span className="cyan">Uso.</span>
          </h1>
          <p className="mkt-lead" style={{ marginTop: 18, maxWidth: 640 }}>
            Termos curtos e honestos sobre o que você pode esperar do nosso site e
            do diagnóstico, e o que esperamos de você.
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
          <Block title="1. Aceitação">
            <P>
              Ao acessar e usar este site e o diagnóstico gratuito da PRECEPTOR!
              Venture Studio, você concorda com estes Termos de Uso. Se não
              concordar, por favor não utilize o serviço.
            </P>
          </Block>

          <Block title="2. O que oferecemos">
            <P>
              Oferecemos conteúdo informativo sobre o estúdio e um diagnóstico
              estratégico gratuito que gera um score e insights a partir das suas
              respostas. O serviço é fornecido como uma ferramenta de orientação
              inicial, não como consultoria formal, auditoria, parecer jurídico,
              contábil ou financeiro.
            </P>
          </Block>

          <Block title="3. Diagnóstico automatizado">
            <P>
              O score e os insights do diagnóstico são gerados com apoio de
              inteligência artificial e têm caráter <strong>orientativo</strong>. Não
              representam garantia de resultado, recomendação de investimento, nem
              substituem a sua própria diligência e a de profissionais qualificados.
              Decisões de negócio são de sua responsabilidade.
            </P>
          </Block>

          <Block title="4. Uso adequado">
            <P>Ao usar o serviço, você concorda em:</P>
            <List
              items={[
                "Fornecer informações verdadeiras e que você tem o direito de compartilhar;",
                "Não usar o site para fins ilícitos, fraudulentos ou que violem direitos de terceiros;",
                "Não tentar burlar limites de uso, sobrecarregar ou comprometer a segurança do serviço.",
              ]}
            />
          </Block>

          <Block title="5. Propriedade intelectual">
            <P>
              A marca PRECEPTOR!, o conteúdo, o design e os materiais deste site são
              de titularidade da PRECEPTOR! Venture Studio e protegidos por lei. O
              resultado do seu diagnóstico é disponibilizado para o seu próprio uso.
            </P>
          </Block>

          <Block title="6. Limitação de responsabilidade">
            <P>
              O serviço é fornecido &ldquo;no estado em que se encontra&rdquo;. Na
              máxima extensão permitida em lei, não nos responsabilizamos por perdas
              ou danos decorrentes do uso ou da impossibilidade de uso do site ou do
              diagnóstico, nem por decisões tomadas com base no seu resultado.
            </P>
          </Block>

          <Block title="7. Privacidade">
            <P>
              O tratamento dos seus dados pessoais segue a nossa{" "}
              <Link href="/privacidade" style={linkStyle}>
                Política de Privacidade
              </Link>
              , parte integrante destes Termos.
            </P>
          </Block>

          <Block title="8. Alterações">
            <P>
              Podemos atualizar estes Termos a qualquer momento. A versão vigente é
              sempre a publicada nesta página, com a data de última atualização
              indicada no topo.
            </P>
          </Block>

          <Block title="9. Lei aplicável e foro">
            <P>
              Estes Termos são regidos pelas leis da República Federativa do Brasil.
              Fica eleito o foro da Comarca de Itajubá/MG para dirimir eventuais
              controvérsias, salvo disposição legal em contrário.
            </P>
          </Block>

          <Block title="10. Contato">
            <P>
              Dúvidas sobre estes Termos? Fale com a gente:{" "}
              <a href={`mailto:${STUDIO_EMAIL}`} style={linkStyle}>
                {STUDIO_EMAIL}
              </a>
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
