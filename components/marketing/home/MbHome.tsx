import Link from "next/link";
import { AppPreview } from "./AppPreview";
import { Glifo } from "./Glifo";
import { HeroIcone } from "./HeroIcone";
import { MarcaFundo } from "./MarcaFundo";
import { CountUp } from "./CountUp";
import { CTA_MICROCOPY, CTA_TEXTO } from "./CtaLink";
import { LeadForm } from "./LeadForm";
import { MockClinica } from "./MockClinica";
import { MockFinanceiro } from "./MockFinanceiro";
import { MockLogistica } from "./MockLogistica";
import { ProvaGrade } from "./ProvaGrade";

/*
 * Home no molde da Mobbin (hero centralizado com ícones no título, caixa
 * cinza com o produto, texto em dois tons, carrossel e grade de blocos),
 * com as cores da PRECEPTOR!: navy #00033D e teal #3BCACE.
 */

const WHATS =
  "https://wa.me/5535999191919?text=Ol%C3%A1!%20Quero%20falar%20sobre%20a%20opera%C3%A7%C3%A3o%20da%20minha%20empresa.";

const FRENTES = [
  { titulo: "Logística", sub: "CT-e pronto para conferir", Mock: MockLogistica, href: "/transporte" },
  { titulo: "Financeiro", sub: "Extrato conciliado com prova", Mock: MockFinanceiro },
  { titulo: "Clínicas", sub: "WhatsApp da recepção em dia", Mock: MockClinica, href: "/medicina" },
];

const PASSOS = [
  { n: "01", titulo: "Diagnóstico", quando: "30 min", texto: "Você sai com o passo a passo de hoje e o ponto onde o tempo se perde.", icone: "lupa", tom: "#E3F1FF" },
  { n: "02", titulo: "IA aplicada", quando: "Piloto de 2 a 4 semanas", texto: "O agente trabalha junto com a sua equipe, e cada saída é aprovada ou corrigida por uma pessoa.", icone: "check", tom: "#E6F8F8" },
  { n: "03", titulo: "Medição", quando: "Última semana do piloto", texto: "Você recebe a comparação com a linha de base e decide se o agente segue rodando.", icone: "grafico", tom: "#EEF0FF" },
];

const PERGUNTAS = [
  {
    q: "Minha empresa não é de logística nem de clínica. Serve?",
    a: "Serve se o trabalho tem regra: documento que alguém digita, conferência que alguém faz na mão, mensagem que alguém responde do mesmo jeito todo dia.",
  },
  {
    q: "Preciso trocar o meu sistema?",
    a: "Não. O agente trabalha no ERP, na planilha ou no WhatsApp que você já usa. Quando o sistema tem API, a ligação é por ela. Quando não tem, pela tela ou pelo e-mail.",
  },
  {
    q: "E se a IA errar?",
    a: "Ela só segue sozinha onde a regra é fechada e você autorizou. O resto passa por uma pessoa da sua equipe antes de virar documento, baixa ou resposta.",
  },
];

export function MbNav() {
  return (
    <header className="mb-nav">
      <div className="mb-wrap mb-nav__bar">
        <Link href="/" className="mb-nav__logo" aria-label="PRECEPTOR! Studio, página inicial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-horizontal.png" alt="PRECEPTOR!" width={480} height={120} />
        </Link>
        <nav className="mb-nav__links" aria-label="Seções da página">
          <a href="#como">Como funciona</a>
          <a href="#exemplo">Exemplo</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="mb-nav__acoes">
          <Link href="/opera" className="mb-nav__entrar">Entrar</Link>
          <a href="#contato" className="mb-pilula mb-pilula--navy mb-pilula--p">Falar com a gente</a>
        </div>
      </div>
    </header>
  );
}

export function MbHome() {
  return (
    <main id="conteudo">
      {/* Hero */}
      <section className="mb-hero">
        <MarcaFundo />
        <div className="mb-wrap">
          <h1 className="mb-h1">
            <span className="mb-linha" style={{ animationDelay: "400ms" }}>
              O documento
              <HeroIcone atraso={1400} intervalo={2600} icones={[
                { nome: "documento", tom: "#00033D" }, { nome: "recibo", tom: "#00033D" },
                { nome: "arquivo", tom: "#12888E" }, { nome: "mensagem", tom: "#12888E" },
              ]} />
              chega<span className="mb-ponto">.</span>
            </span>{" "}
            <span className="mb-linha" style={{ animationDelay: "500ms" }}>
              A conferência
              <HeroIcone atraso={1550} intervalo={3100} icones={[
                { nome: "lupa", tom: "#12888E" }, { nome: "recibo", tom: "#00033D" },
                { nome: "ampulheta", tom: "#00033D" }, { nome: "grafico", tom: "#12888E" },
              ]} />
              fica pronta<span className="mb-ponto">.</span>
            </span>{" "}
            <span className="mb-linha" style={{ animationDelay: "600ms" }}>
              Sua equipe
              <HeroIcone atraso={1700} intervalo={3600} icones={[
                { nome: "check", tom: "#00033D" }, { nome: "dinheiro", tom: "#12888E" },
                { nome: "pacote", tom: "#00033D" }, { nome: "caminhao", tom: "#12888E" },
              ]} />
              só aprova<span className="mb-ponto">.</span>
            </span>
          </h1>
          <p className="mb-sub mb-sobe">
            Agentes de IA para a parte repetitiva da operação: documentos, conferências e mensagens.
            Primeiro o processo, depois a IA.
          </p>
          <div className="mb-ctas mb-sobe">
            <a href="#contato" className="mb-pilula mb-pilula--navy">{CTA_TEXTO}</a>
            <a href="#como" className="mb-pilula mb-pilula--cinza">
              Como funciona <span aria-hidden="true">→</span>
            </a>
          </div>
          <p className="mb-micro mb-sobe">{CTA_MICROCOPY}</p>
        </div>

        <div className="mb-wrap">
          <div className="mb-caixa mb-caixa--produto mb-superficie">
            <div className="mb-video">
              <AppPreview />
            </div>
          </div>
        </div>

        <div className="mb-wrap">
          <p className="mb-confia">Para operações de</p>
          <ul className="mb-setores">
            <li>Logística</li>
            <li>Financeiro</li>
            <li>Clínicas</li>
            <li>Agro</li>
            <li>Back-office</li>
          </ul>
        </div>
      </section>

      {/* Problema em dois tons */}
      <section className="mb-sec">
        <div className="mb-wrap">
          <h2 className="mb-dois-tons" data-rv>
            Hoje, alguém digita a nota.{" "}
            <span>Outra pessoa confere o extrato. A recepção responde o mesmo WhatsApp o dia todo.</span>
          </h2>
        </div>
      </section>

      {/* Carrossel das frentes */}
      <section className="mb-sec mb-sec--colado" aria-labelledby="mb-frentes-t">
        <div className="mb-wrap">
          <h2 id="mb-frentes-t" className="mb-h3t" data-rv>
            Onde o agente já trabalha
          </h2>
        </div>
        <div className="mb-carrossel" data-rv>
          {FRENTES.map(({ titulo, sub, Mock, href }) => (
            <article key={titulo} className="mb-card">
              <div className="mb-card__tela">
                <Mock />
              </div>
              <div className="mb-card__rodape">
                <div>
                  <h3>{titulo}</h3>
                  <p>{sub}</p>
                </div>
                {href ? (
                  <Link href={href} className="mb-seta" aria-label={`Ver como funciona em ${titulo}`}>
                    →
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Como funciona: grade de blocos */}
      <section id="como" className="mb-sec">
        <div className="mb-wrap">
          <h2 className="mb-h2 mb-centro" data-rv>
            Primeiro o processo,
            <br />
            depois a IA<span className="mb-ponto">.</span>
          </h2>
          <ol className="mb-grade">
            {PASSOS.map((p) => (
              <li key={p.n} className="mb-bloco-grade" data-rv style={{ "--tom": p.tom } as React.CSSProperties}>
                <p className="mb-bloco-grade__n">{p.n}</p>
                <h3>{p.titulo}</h3>
                <div className="mb-bloco-grade__arte" aria-hidden="true">
                  <Glifo nome={p.icone} />
                </div>
                <p className="mb-bloco-grade__quando">{p.quando}</p>
                <p className="mb-bloco-grade__txt">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Prova */}
      <section id="exemplo" className="mb-sec">
        <div className="mb-wrap">
          <div className="mb-prova lp2-prova" data-rv>
            <div>
              <p className="mb-prova__rot">Financeiro · um cliente de logística · caso anônimo</p>
              <p className="mb-prova__num">
                <span className="mb-prova__pre">Cerca de</span>
                <CountUp to={99} />
                <span className="mb-prova__pct">%</span>
              </p>
              <p className="mb-prova__txt">
                dos recebimentos conciliados no período medido. O financeiro confirma as baixas.
              </p>
            </div>
            <ProvaGrade />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mb-sec">
        <div className="mb-wrap mb-faq">
          <h2 className="mb-h2 mb-centro" data-rv>
            O que costumam perguntar<span className="mb-ponto">.</span>
          </h2>
          <div className="mb-faq__lista" data-rv>
            {PERGUNTAS.map((p) => (
              <details key={p.q} className="mb-faq__item">
                <summary>
                  <span>{p.q}</span>
                  <span className="mb-faq__mais" aria-hidden="true">+</span>
                </summary>
                <p>{p.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="mb-sec">
        <div className="mb-wrap">
          <div className="mb-caixa mb-contato">
            <MarcaFundo variante="contato" />
            <div className="mb-contato__txt" data-rv>
              <h2 className="mb-h2">
                Qual processo come o dia da sua equipe<span className="mb-ponto">?</span>
              </h2>
              <p className="mb-sub mb-sub--esq">
                Em 30 minutos de conversa, você sai sabendo se dá para automatizar e por onde começar.
              </p>
              <a href={WHATS} target="_blank" rel="noopener noreferrer" className="mb-pilula mb-pilula--cinza">
                Prefiro o WhatsApp <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="mb-contato__form" data-rv>
              <LeadForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
