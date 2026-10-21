import Image from "next/image";
import Link from "next/link";
import { Glifo } from "./Glifo";
import { HeroIcone } from "./HeroIcone";
import { MarcaFundo } from "./MarcaFundo";
import { Segmentos } from "./Segmentos";
import { CountUp } from "./CountUp";
import { CTA_MICROCOPY, CTA_TEXTO } from "./CtaLink";
import { LeadForm } from "./LeadForm";

/*
 * Home no molde da Mobbin (hero centralizado com ícones no título, caixa
 * cinza com o produto, texto em dois tons, carrossel e grade de blocos),
 * com as cores da PRECEPTOR!: navy #00033D e teal #3BCACE.
 */

const WHATS =
  "https://wa.me/5535999191919?text=Ol%C3%A1!%20Quero%20falar%20sobre%20a%20opera%C3%A7%C3%A3o%20da%20minha%20empresa.";

const TELAS = [
  { titulo: "Caixa do mês", sub: "Quanto sobra, quanto falta receber e o que precisa de você", src: "/telas/caixa.jpg", w: 1600, h: 1000, classe: "mb-tela--larga" },
  { titulo: "App do motorista", sub: "Entregas do dia e baixa com foto, no celular", src: "/telas/motorista.jpg", w: 780, h: 1560, classe: "mb-tela--fone" },
  { titulo: "Compras", sub: "Gasto por mês e por setor, sem planilha", src: "/telas/compras.jpg", w: 1600, h: 1000, classe: "mb-tela--meia" },
  { titulo: "Pessoas e clima", sub: "eNPS e notas por tema, com respostas anônimas", src: "/telas/clima.jpg", w: 1600, h: 1000, classe: "mb-tela--meia" },
];

const PASSOS = [
  { n: "01", titulo: "Diagnóstico", quando: "30 min", texto: "Você sai com o passo a passo de hoje e o ponto onde o tempo se perde.", icone: "lupa", tom: "#E3F1FF" },
  { n: "02", titulo: "Piloto junto com a equipe", quando: "Piloto de 2 a 4 semanas", texto: "O agente trabalha junto com a sua equipe, e cada saída é aprovada ou corrigida por uma pessoa.", icone: "check", tom: "#E6F8F8" },
  { n: "03", titulo: "Medição", quando: "Última semana do piloto", texto: "Você recebe a comparação com a linha de base e decide se o agente segue rodando.", icone: "grafico", tom: "#EEF0FF" },
];

/* Dores que os clientes mais contam no diagnóstico: o visitante se reconhece antes de ler o "como". */
const DORES = [
  { titulo: "Os documentos são uma bagunça", texto: "Nota, CT-e e boleto chegam por e-mail, WhatsApp e papel, e alguém digita tudo no sistema.", icone: "documento" },
  { titulo: "A conferência leva a tarde inteira", texto: "Extrato contra ERP, romaneio contra pedido, linha por linha, e o erro só aparece no fechamento.", icone: "lupa" },
  { titulo: "O WhatsApp não para", texto: "A mesma pergunta o dia todo: horário, preço, status da entrega. E quem responde deixa o resto parado.", icone: "mensagem" },
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
  {
    q: "Por que não um software pronto ou o ChatGPT?",
    a: "Porque o seu processo não é o do vizinho. Um produto pronto obriga a equipe a se adaptar a ele. O agente é montado sobre as suas regras, os seus documentos e os sistemas que vocês já usam.",
  },
  {
    q: "Quanto tempo leva e quanto custa?",
    a: "O piloto roda de 2 a 4 semanas. O valor depende do processo e é definido no diagnóstico, antes de você assumir qualquer compromisso.",
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
          <Link href="/#segmentos">Por setor</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="mb-nav__acoes">
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
            <p className="mb-palco__selo mb-sobe">Agentes de IA sob medida para a sua operação</p>
            <h1 className="mb-h1">
              <span className="mb-linha" style={{ animationDelay: "400ms" }}>
                Um agente de IA desenhado
                <HeroIcone atraso={1400} intervalo={2600} icones={[
                  { nome: "documento", tom: "#3BCACE" }, { nome: "recibo", tom: "#2B3BB0" },
                  { nome: "arquivo", tom: "#3BCACE" }, { nome: "mensagem", tom: "#2B3BB0" },
                ]} />
                
              </span>{" "}
              <span className="mb-linha" style={{ animationDelay: "500ms" }}>
                para o seu processo
                <HeroIcone atraso={1550} intervalo={3100} icones={[
                  { nome: "lupa", tom: "#2B3BB0" }, { nome: "recibo", tom: "#3BCACE" },
                  { nome: "ampulheta", tom: "#2B3BB0" }, { nome: "grafico", tom: "#3BCACE" },
                ]} />
                ,
              </span>{" "}
              <span className="mb-linha" style={{ animationDelay: "600ms" }}>
                não um produto de prateleira
                <HeroIcone atraso={1700} intervalo={3600} icones={[
                  { nome: "check", tom: "#3BCACE" }, { nome: "dinheiro", tom: "#2B3BB0" },
                  { nome: "pacote", tom: "#3BCACE" }, { nome: "caminhao", tom: "#2B3BB0" },
                ]} />
                <span className="mb-ponto">.</span>
              </span>
            </h1>
            <p className="mb-sub mb-sobe">
              Ele faz a parte repetitiva no sistema que você já usa. Sua equipe só aprova.
            </p>
            <div className="mb-ctas mb-sobe">
              <a href="#contato" className="mb-pilula mb-pilula--teal">{CTA_TEXTO}</a>
              <a href="#segmentos" className="mb-pilula mb-pilula--vazada">
                Ver por setor <span aria-hidden="true">→</span>
              </a>
            </div>
            <p className="mb-micro mb-sobe">{CTA_MICROCOPY}</p>
            <div className="mb-palco__tela mb-superficie">
              <div className="mb-video mb-janela">
                <div className="mb-janela__barra" aria-hidden="true">
                  <i /><i /><i />
                  <span>preceptor · torre de expedição</span>
                  <b>Demonstração</b>
                </div>
                <Image
                  src="/telas/hero-torre.jpg"
                  alt="Torre de expedição de uma transportadora: a IA rodou os passos do dia e separou 11 itens para uma pessoa validar. Dados de exemplo."
                  width={2000}
                  height={1194}
                  priority
                  sizes="(min-width: 1024px) 1000px, 100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dores: o visitante se reconhece antes do "como" */}
      <section className="mb-sec">
        <div className="mb-wrap mb-porque">
          <div data-rv>
            <h2 className="mb-h2 mb-h2--m">
              Se alguma destas acontece aí, dá para tirar da mesa da sua equipe<span className="mb-ponto">.</span>
            </h2>
            <p className="mb-porque__txt">
              É o que os clientes mais contam no diagnóstico. Cada empresa tem o seu jeito, mas a dor costuma ser uma
              destas.
            </p>
            <a href="#contato" className="mb-pilula mb-pilula--navy mb-pilula--p">{CTA_TEXTO}</a>
          </div>
          <ul className="mb-motivos" data-rv>
            {DORES.map((m) => (
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

      {/* O que o agente faz: bento com bloco grande e três cartões altos */}
      <section className="mb-sec">
        <div className="mb-wrap mb-bento">
          <div className="mb-bento__grande" data-rv>
            <h2 className="mb-h2 mb-h2--m">O documento chega. A conferência fica pronta. Sua equipe só aprova.</h2>
            <p>O agente assume a parte repetitiva no ERP, na planilha e no WhatsApp que você já usa. Sem trocar de sistema.</p>
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

      {/* Segmentos: falar como em reunião de vendas */}
      <section id="segmentos" className="mb-sec mb-sec--colado">
        <div className="mb-wrap">
          <div className="mb-seg__cab" data-rv>
            <h2 className="mb-h2">
              Nada de pacote pronto.
              <br />
              <span className="mb-seg__destaque">Cada agente é feito para o seu processo</span>
              <span className="mb-ponto">.</span>
            </h2>
            <p>
              Montado em cima do sistema que vocês já usam, por API, pela tela ou pelo e-mail. Veja a mesma tarefa hoje
              e com o agente, setor por setor:
            </p>
          </div>
          <div data-rv>
            <Segmentos />
          </div>
        </div>
      </section>

      {/* Frentes numa caixa azulada */}
      <section className="mb-sec" aria-labelledby="mb-frentes-t">
        <div className="mb-wrap">
          <div className="mb-baia" data-rv>
            <div className="mb-baia__topo">
              <h2 id="mb-frentes-t" className="mb-h2 mb-h2--m">Feito para clientes de verdade</h2>
              <p>Telas de sistemas que construímos para o processo de cada cliente, com dados de exemplo.</p>
            </div>
            <div className="mb-telas">
              {TELAS.map((t) => (
                <figure key={t.titulo} className={`mb-tela ${t.classe}`}>
                  <div className="mb-tela__moldura">
                    <Image src={t.src} alt={`${t.titulo}: tela de demonstração com dados de exemplo`} width={t.w} height={t.h} sizes="(min-width: 900px) 700px, 100vw" />
                    <span className="mb-tela__selo">Demonstração</span>
                  </div>
                  <figcaption>
                    <b>{t.titulo}</b>
                    <span>{t.sub}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prova */}
      <section id="exemplo" className="mb-sec">
        <div className="mb-wrap">
          <div className="mb-casos mb-casos--um">
            <div className="mb-medida" data-rv>
              <p className="mb-medida__rot">Financeiro · cliente de logística · caso anônimo</p>
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
        </div>
      </section>

      {/* Como funciona: 1-2-3 */}
      <section id="como" className="mb-sec">
        <div className="mb-wrap">
          <h2 className="mb-h2 mb-h2--m" data-rv>
            Começa com uma conversa, não com um contrato<span className="mb-ponto">.</span>
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
