import Image from "next/image";
import Link from "next/link";
import { Glifo } from "./Glifo";
import { HeroProduto } from "./HeroProduto";
import { Setores } from "./Setores";
import { CountUp } from "./CountUp";
import { CTA_MICROCOPY, CTA_TEXTO } from "./CtaLink";
import { LeadForm } from "./LeadForm";

/*
 * Home com a estrutura da referência Xenora (docs/design/audit-lp.md): hero
 * de borda a borda com a tela do produto sobreposta, título à esquerda em 2
 * linhas, uma ação; setores em cards com o fluxo do agente no lugar de ícone.
 * Identidade da PRECEPTOR!: navy #00033D, teal #3BCACE e Geist.
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
  { titulo: "Diagnóstico", quando: "30 min", texto: "Você sai com o passo a passo de hoje e o ponto onde o tempo se perde." },
  { titulo: "IA aplicada", quando: "Piloto de 2 a 4 semanas", texto: "O agente trabalha junto com a sua equipe, e cada saída é aprovada ou corrigida por uma pessoa." },
  { titulo: "Medição", quando: "Última semana do piloto", texto: "Você recebe a comparação com a linha de base e decide se o agente segue rodando." },
];

const FATOS = [
  { quando: "Dia 1", valor: "30 min", rot: "de diagnóstico" },
  { quando: "Semanas 1 a 4", valor: "Piloto", rot: "junto com a equipe" },
  { quando: "Toda saída", valor: "1 pessoa", rot: "aprova antes de valer" },
];

const MOTIVOS = [
  { titulo: "Primeiro o processo", texto: "Mapeamos o passo a passo de hoje antes de pôr IA em qualquer coisa." },
  { titulo: "Uma pessoa aprova", texto: "O agente só segue sozinho onde a regra é fechada e você autorizou." },
  { titulo: "Medido de verdade", texto: "No fim do piloto, a comparação com a linha de base decide se ele fica." },
];

const TAREFAS = [
  { titulo: "Lê documentos", antes: "NF-e, CT-e, boleto", texto: "Tira os dados da nota e do e-mail e preenche o sistema." },
  { titulo: "Confere", antes: "Extrato × ERP", texto: "Cruza extrato, romaneio e pedido e aponta só o que diverge." },
  { titulo: "Responde", antes: "WhatsApp", texto: "Responde as perguntas de sempre e passa o resto para a equipe." },
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
      <div className="mb-cena mb-cena--doc" aria-hidden="true" data-ui>
        <i className="mb-cena__scan" />
        <p><span>Emitente</span><b>Transportes Sul</b></p>
        <p><span>Valor</span><b>R$ 4.380,00</b></p>
        <p><span>Vencimento</span><b>28/10</b></p>
        <p className="mb-cena__ok">→ lançado no ERP</p>
      </div>
    );
  if (tipo === 1)
    return (
      <div className="mb-cena mb-cena--conf" aria-hidden="true" data-ui>
        <p><span>2.350,00</span><span>2.350,00</span><b><Glifo nome="certo" /></b></p>
        <p><span>1.180,00</span><span>1.180,00</span><b><Glifo nome="certo" /></b></p>
        <p className="is-exc"><span>780,00</span><span>870,00</span><b>!</b></p>
      </div>
    );
  return (
    <div className="mb-cena mb-cena--chat" aria-hidden="true" data-ui>
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
          <Link href="/#contato" className="mb-pilula mb-pilula--navy mb-pilula--p">Falar com a gente</Link>
        </div>
      </div>
    </header>
  );
}

export function MbHome() {
  return (
    <main id="conteudo">
      {/* Hero: campo de borda a borda (a foto entra aqui; por ora navy chapado) e a tela do produto subindo dele */}
      <section className="mb-hx" aria-labelledby="mb-hx-t">
        {/* Foto do hero pendente: public/fotos/hero-ceu.jpg (céu sobre a operação), ver docs/design/audit-lp.md */}
        <div className="mb-hx__foto" data-foto="pendente" aria-hidden="true" />
        <div className="mb-wrap mb-hx__wrap">
          <h1 id="mb-hx-t" className="mb-hx__h1">Agentes de IA que sua equipe aprova</h1>
          <p className="mb-hx__sub mb-sobe">
            O agente faz a parte repetitiva. <br className="mb-hx__br" />
            Uma pessoa da sua equipe decide.
          </p>
          <div className="mb-hx__acao mb-sobe">
            <a href="#contato" className="mb-pilula mb-pilula--teal">{CTA_TEXTO}</a>
            <p className="mb-hx__micro">{CTA_MICROCOPY}</p>
          </div>
          <div className="mb-hx__tela mb-superficie">
            <HeroProduto />
          </div>
        </div>
      </section>

      {/* Setores: título à esquerda, texto à direita, um card com o fluxo de cada setor */}
      <section id="segmentos" className="mb-sec mb-sec--colado" aria-labelledby="mb-setores-t">
        <div className="mb-wrap">
          <div className="mb-cab" data-rv>
            <h2 id="mb-setores-t" className="mb-h2">Um agente para cada setor</h2>
            <p>
              Cada agente é feito sob medida e ligado ao sistema que você já usa, por API, pela tela ou pelo e-mail. O
              último passo é sempre de uma pessoa da sua equipe.
            </p>
          </div>
          <Setores />
          <p className="mb-setores__nota">
            Exemplos com dados fictícios. O seu agente é desenhado a partir do seu processo e das suas regras.
          </p>
        </div>
      </section>

      {/* Por que: texto à esquerda, os três motivos em tipo grande à direita */}
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
                <h3>{m.titulo}</h3>
                <p>{m.texto}</p>
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
              <p>Telas de sistemas que já construímos, com dados de exemplo. Cada uma foi desenhada para o processo de um cliente.</p>
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

      {/* O que o agente faz: bloco do título em cima, três tarefas embaixo */}
      <section className="mb-sec">
        <div className="mb-wrap mb-bento">
          <div className="mb-bento__grande" data-rv>
            <h2 className="mb-h2 mb-h2--m">O que o agente faz no dia a dia</h2>
            <p>Ele trabalha no ERP, na planilha e no WhatsApp que você já usa. Sem trocar de sistema.</p>
            <a href="#contato" className="mb-pilula mb-pilula--navy mb-pilula--p">Ver na minha operação</a>
          </div>
          {TAREFAS.map((t, i) => (
            <article key={t.titulo} className={`mb-tarefa mb-tarefa--${i + 1}`} data-rv>
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
          <div className="mb-cab" data-rv>
            <h2 className="mb-h2">
              Começar é simples como{"\u00a0"}1,{"\u00a0"}2,{"\u00a0"}3<span className="mb-ponto">.</span>
            </h2>
            <p>Um diagnóstico de 30 minutos e um piloto de 2 a 4 semanas, medido no fim contra a linha de base.</p>
          </div>
          <ol className="mb-passos">
            {PASSOS.map((p) => (
              <li key={p.titulo} data-rv>
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

      {/* FAQ */}
      <section id="faq" className="mb-sec">
        <div className="mb-wrap mb-faq">
          <div className="mb-faq__cab" data-rv>
            <h2 className="mb-h2">
              O que costumam perguntar<span className="mb-ponto">.</span>
            </h2>
            <p>A sua não está aqui? Pergunte na conversa de diagnóstico ou pelo WhatsApp.</p>
          </div>
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
            <div className="mb-contato__txt" data-rv>
              <h2 className="mb-h2">
                Onde a sua equipe perde o dia<span className="mb-ponto">?</span>
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
