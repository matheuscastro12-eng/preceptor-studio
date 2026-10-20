import Link from "next/link";
import { AppPreview } from "./AppPreview";
import { Glifo } from "./Glifo";
import { HeroIcone } from "./HeroIcone";
import { MarcaFundo } from "./MarcaFundo";
import { Segmentos } from "./Segmentos";
import { CountUp } from "./CountUp";
import { CTA_MICROCOPY, CTA_TEXTO } from "./CtaLink";
import { LeadForm } from "./LeadForm";
import { MockClinica } from "./MockClinica";
import { MockFinanceiro } from "./MockFinanceiro";
import { MockLogistica } from "./MockLogistica";

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

const FATOS = [
  { quando: "Dia 1", valor: "30 min", rot: "de diagnóstico" },
  { quando: "Semanas 1 a 4", valor: "Piloto", rot: "junto com a equipe" },
  { quando: "Toda saída", valor: "1 pessoa", rot: "aprova antes de valer" },
];

const MOTIVOS = [
  { titulo: "Primeiro o processo", texto: "Mapeamos o passo a passo de hoje antes de pôr IA em qualquer coisa.", icone: "arquivo" },
  { titulo: "Uma pessoa aprova", texto: "O agente só segue sozinho onde a regra é fechada e você autorizou.", icone: "check" },
  { titulo: "Medido de verdade", texto: "No fim do piloto, a comparação com a linha de base decide se ele fica.", icone: "grafico" },
];

const TAREFAS = [
  { titulo: "Lê documentos", antes: "NF-e, CT-e, boleto", texto: "Tira os dados da nota e do e-mail e preenche o sistema.", icone: "documento" },
  { titulo: "Confere", antes: "Extrato × ERP", texto: "Cruza extrato, romaneio e pedido e aponta só o que diverge.", icone: "lupa" },
  { titulo: "Responde", antes: "WhatsApp", texto: "Responde as perguntas de sempre e passa o resto para a equipe.", icone: "mensagem" },
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

/* Mini cenas em loop dentro dos cartões de tarefa (dados de exemplo). */
function Cena({ tipo }: { tipo: number }) {
  if (tipo === 0)
    return (
      <div className="mb-cena mb-cena--doc" aria-hidden="true">
        <i className="mb-cena__scan" />
        <p><span>Emitente</span><b>Transportes Sul</b></p>
        <p><span>Valor</span><b>R$ 4.380,00</b></p>
        <p><span>Vencimento</span><b>28/10</b></p>
        <p className="mb-cena__ok">→ lançado no ERP</p>
      </div>
    );
  if (tipo === 1)
    return (
      <div className="mb-cena mb-cena--conf" aria-hidden="true">
        <p><span>2.350,00</span><span>2.350,00</span><b>✓</b></p>
        <p><span>1.180,00</span><span>1.180,00</span><b>✓</b></p>
        <p className="is-exc"><span>780,00</span><span>870,00</span><b>!</b></p>
      </div>
    );
  return (
    <div className="mb-cena mb-cena--chat" aria-hidden="true">
      <p className="in">Tem horário no sábado?</p>
      <p className="out">Tem sim: 9h ou 10h30. Qual prefere?</p>
      <p className="in">9h</p>
    </div>
  );
}

export function MbNav() {
  return (
    <header className="mb-nav">
      <div className="mb-wrap mb-nav__bar">
        <Link href="/" className="mb-nav__logo" aria-label="PRECEPTOR! Studio, página inicial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-horizontal.png" alt="PRECEPTOR!" width={480} height={120} />
        </Link>
        <nav className="mb-nav__links" aria-label="Seções da página">
          <Link href="/#como">Como funciona</Link>
          <Link href="/#exemplo">Exemplo</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="mb-nav__acoes">
          <Link href="/opera" className="mb-nav__entrar">Entrar</Link>
          <Link href="/#contato" className="mb-pilula mb-pilula--navy mb-pilula--p">Falar com a gente</Link>
        </div>
      </div>
    </header>
  );
}

export function MbHome() {
  return (
    <main id="conteudo">
      {/* Hero: palco navy com o P! desenhado e a central subindo de dentro */}
      <section className="mb-hero">
        <div className="mb-wrap">
          <div className="mb-palco">
            <MarcaFundo />
            <p className="mb-palco__selo mb-sobe">Agentes de IA para operações</p>
            <h1 className="mb-h1">
              <span className="mb-linha" style={{ animationDelay: "400ms" }}>
                O documento
                <HeroIcone atraso={1400} intervalo={2600} icones={[
                  { nome: "documento", tom: "#3BCACE" }, { nome: "recibo", tom: "#2B3BB0" },
                  { nome: "arquivo", tom: "#3BCACE" }, { nome: "mensagem", tom: "#2B3BB0" },
                ]} />
                chega<span className="mb-ponto">.</span>
              </span>{" "}
              <span className="mb-linha" style={{ animationDelay: "500ms" }}>
                A conferência
                <HeroIcone atraso={1550} intervalo={3100} icones={[
                  { nome: "lupa", tom: "#2B3BB0" }, { nome: "recibo", tom: "#3BCACE" },
                  { nome: "ampulheta", tom: "#2B3BB0" }, { nome: "grafico", tom: "#3BCACE" },
                ]} />
                fica pronta<span className="mb-ponto">.</span>
              </span>{" "}
              <span className="mb-linha" style={{ animationDelay: "600ms" }}>
                Sua equipe
                <HeroIcone atraso={1700} intervalo={3600} icones={[
                  { nome: "check", tom: "#3BCACE" }, { nome: "dinheiro", tom: "#2B3BB0" },
                  { nome: "pacote", tom: "#3BCACE" }, { nome: "caminhao", tom: "#2B3BB0" },
                ]} />
                só aprova<span className="mb-ponto">.</span>
              </span>
            </h1>
            <p className="mb-sub mb-sobe">
              Documentos, conferências e mensagens: o agente faz a parte repetitiva e uma pessoa da sua equipe decide.
            </p>
            <div className="mb-ctas mb-sobe">
              <a href="#contato" className="mb-pilula mb-pilula--teal">{CTA_TEXTO}</a>
              <a href="#como" className="mb-pilula mb-pilula--vazada">
                Como funciona <span aria-hidden="true">→</span>
              </a>
            </div>
            <p className="mb-micro mb-sobe">{CTA_MICROCOPY}</p>
            <div className="mb-palco__tela mb-superficie">
              <div className="mb-video">
                <AppPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Segmentos: falar como em reunião de vendas */}
      <section id="segmentos" className="mb-sec mb-sec--colado">
        <div className="mb-wrap">
          <div className="mb-seg__cab" data-rv>
            <h2 className="mb-h2">
              Seja qual for o seu sistema,
              <br />
              <span className="mb-seg__destaque">o agente trabalha nele</span>
              <span className="mb-ponto">.</span>
            </h2>
            <p>Com API, pela tela ou pelo e-mail. Escolha a sua operação:</p>
          </div>
          <div data-rv>
            <Segmentos />
          </div>
        </div>
      </section>

      {/* Por que: texto à esquerda, três cartões à direita */}
      <section className="mb-sec">
        <div className="mb-wrap mb-porque">
          <div data-rv>
            <h2 className="mb-h2 mb-h2--m">
              A parte repetitiva sai da mesa da sua equipe<span className="mb-ponto">.</span>
            </h2>
            <p className="mb-porque__txt">
              Nota digitada à mão, extrato conferido linha por linha, a mesma pergunta no WhatsApp o dia todo. O agente
              assume essa parte e entrega pronto para alguém aprovar.
            </p>
            <ol className="mb-trilha">
              {FATOS.map((f) => (
                <li key={f.rot}>
                  <span className="mb-trilha__quando">{f.quando}</span>
                  <b>{f.valor}</b>
                  <span className="mb-trilha__rot">{f.rot}</span>
                </li>
              ))}
            </ol>
          </div>
          <ul className="mb-motivos" data-rv>
            {MOTIVOS.map((m) => (
              <li key={m.titulo} className="mb-motivo">
                <span className="mb-motivo__ic"><Glifo nome={m.icone} /></span>
                <div>
                  <h3>{m.titulo}</h3>
                  <p>{m.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Frentes numa caixa azulada */}
      <section className="mb-sec" aria-labelledby="mb-frentes-t">
        <div className="mb-wrap">
          <div className="mb-baia" data-rv>
            <div className="mb-baia__topo">
              <h2 id="mb-frentes-t" className="mb-h2 mb-h2--m">Onde o agente já trabalha</h2>
              <p>Três frentes em que o trabalho tem regra. As telas são demonstrações, com dados de exemplo.</p>
            </div>
            <div className="mb-frentes">
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
          </div>
        </div>
      </section>

      {/* O que o agente faz: bento com bloco grande e três cartões altos */}
      <section className="mb-sec">
        <div className="mb-wrap mb-bento">
          <div className="mb-bento__grande" data-rv>
            <h2 className="mb-h2 mb-h2--m">O que o agente faz no dia a dia</h2>
            <p>Ele trabalha no ERP, na planilha e no WhatsApp que você já usa. Sem trocar de sistema.</p>
            <a href="#contato" className="mb-pilula mb-pilula--navy mb-pilula--p">Ver na minha operação</a>
            <span className="mb-bento__p" aria-hidden="true">P!</span>
          </div>
          {TAREFAS.map((t, i) => (
            <article key={t.titulo} className={`mb-tarefa mb-tarefa--${i + 1}`} data-rv>
              <span className="mb-tarefa__ic"><Glifo nome={t.icone} /></span>
              <p className="mb-tarefa__antes">{t.antes}</p>
              <Cena tipo={i} />
              <div>
                <h3>{t.titulo}</h3>
                <p>{t.texto}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Como funciona: 1-2-3 */}
      <section id="como" className="mb-sec">
        <div className="mb-wrap">
          <h2 className="mb-h2 mb-h2--m" data-rv>
            Começar é simples como 1, 2, 3<span className="mb-ponto">.</span>
          </h2>
          <ol className="mb-passos">
            {PASSOS.map((p) => (
              <li key={p.n} data-rv>
                <span className="mb-passos__n">{p.n}</span>
                <h3>{p.titulo}</h3>
                <p className="mb-passos__quando">{p.quando}</p>
                <p>{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Prova */}
      <section id="exemplo" className="mb-sec">
        <div className="mb-wrap">
          <div className="mb-medida" data-rv>
            <p className="mb-medida__rot">Financeiro · um cliente de logística · caso anônimo</p>
            <p className="mb-medida__num">
              <span className="mb-medida__pre">cerca de</span>
              <CountUp to={99} />
              <span className="mb-ponto">%</span>
            </p>
            <div className="mb-medida__barra" aria-hidden="true"><i /></div>
            <p className="mb-medida__txt">
              dos recebimentos conciliados no período medido. O financeiro confirma as baixas.
            </p>
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
