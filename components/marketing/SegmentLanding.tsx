import Image from "next/image";
import { MbNav } from "./home/MbHome";
import { HomeFooter } from "./home/HomeFooter";
import { RevealObserver } from "./home/RevealObserver";
import "./home/home.css";
import "./home/mobbin.css";

/*
 * Página de segmento com as mesmas regras da home: título em 2 linhas, o que
 * é na primeira frase, corpo de 17 a 18 px na tinta cheia, telas de
 * demonstração como imagem e as seções no molde da home.
 */

export type Tela = { titulo: string; sub: string; src: string; w: number; h: number; fone?: boolean };

export interface SegmentContent {
  title: string;
  lead: string;
  hero: Tela;
  pains: { title: string; body: string }[];
  automations: { title: string; body: string }[];
  telas: Tela[];
  /* Conversa de exemplo mostrada como tela (fragmento de interface). */
  conversa?: { titulo: string; sub: string; falas: { de: "cliente" | "agente"; texto: string }[] };
  results: { v: string; l: string }[];
  ctaLine: string;
}

/* Telas de sistemas que já construímos, com dados de exemplo (as mesmas da home). */
export const TELAS = {
  torre: { titulo: "Torre de expedição", sub: "A IA roda os passos do dia e separa o que uma pessoa precisa validar", src: "/telas/hero-torre.jpg", w: 2000, h: 1194 },
  caixa: { titulo: "Caixa do mês", sub: "Quanto sobra, quanto falta receber e o que precisa de você", src: "/telas/caixa.jpg", w: 1600, h: 1000 },
  motorista: { titulo: "App do motorista", sub: "Entregas do dia e baixa com foto, no celular", src: "/telas/motorista.jpg", w: 780, h: 1560, fone: true },
  compras: { titulo: "Compras", sub: "Gasto por mês e por setor, sem planilha", src: "/telas/compras.jpg", w: 1600, h: 1000 },
  clima: { titulo: "Pessoas e clima", sub: "eNPS e notas por tema, com respostas anônimas", src: "/telas/clima.jpg", w: 1600, h: 1000 },
} satisfies Record<string, Tela>;

const WHATS =
  "https://wa.me/5535999191919?text=Ol%C3%A1!%20Quero%20falar%20sobre%20a%20opera%C3%A7%C3%A3o%20da%20minha%20empresa.";

export function SegmentLanding({ content }: { content: SegmentContent }) {
  const { hero } = content;
  return (
    <div className="lp2">
      <RevealObserver />
      <MbNav />
      <main id="conteudo">
        {/* Hero navy: o título, o que é e a tela de um sistema já construído */}
        <section className="mb-hero">
          <div className="mb-wrap">
            <div className="mb-palco">
              <h1 className="mb-h1">{content.title}</h1>
              <p className="mb-sub mb-sobe">{content.lead}</p>
              <div className="mb-ctas mb-sobe">
                <a href={WHATS} target="_blank" rel="noopener noreferrer" className="mb-pilula mb-pilula--teal">
                  Falar sobre a minha operação
                </a>
              </div>
              <div className="mb-palco__tela mb-superficie">
                <div className="mb-video mb-janela" data-ui>
                  <div className="mb-janela__barra" aria-hidden="true">
                    <i /><i /><i />
                    <span>preceptor · {hero.titulo.toLowerCase()}</span>
                    <b>Demonstração</b>
                  </div>
                  <Image
                    src={hero.src}
                    alt={`${hero.titulo}: ${hero.sub.toLowerCase()}. Tela de demonstração com dados de exemplo.`}
                    width={hero.w}
                    height={hero.h}
                    priority
                    sizes="(min-width: 1024px) 1000px, 100vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dores: texto à esquerda, as quatro dores em tipo grande à direita */}
        <section className="mb-sec">
          <div className="mb-wrap mb-porque">
            <div data-rv>
              <h2 className="mb-h2 mb-h2--m">A rotina que o seu time conhece de cor</h2>
              <p className="mb-porque__txt">
                Cada uma dessas dores tem regra por trás. E o que tem regra, a gente ensina a máquina a fazer.
              </p>
            </div>
            <ul className="mb-motivos" data-rv>
              {content.pains.map((p) => (
                <li key={p.title} className="mb-motivo">
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* O que passa a rodar: lista e telas numa caixa azulada */}
        <section className="mb-sec" aria-labelledby="seg-entregas-t">
          <div className="mb-wrap">
            <div className="mb-baia" data-rv>
              <div className="mb-baia__topo">
                <h2 id="seg-entregas-t" className="mb-h2 mb-h2--m">O que passa a rodar sem toque humano</h2>
                <p>Automação em produção, medida em painel. O time entra só onde exige critério.</p>
              </div>
              <ul className="mb-entregas">
                {content.automations.map((a) => (
                  <li key={a.title}>
                    <h3>{a.title}</h3>
                    <p>{a.body}</p>
                  </li>
                ))}
              </ul>
              <div className="mb-telas mb-telas--tres">
                {content.conversa && (
                  <figure className="mb-tela">
                    <div className="mb-tela__moldura mb-conversa" data-ui>
                      {content.conversa.falas.map((f) => (
                        <p key={f.texto} className={`mb-conversa__fala mb-conversa__fala--${f.de}`}>{f.texto}</p>
                      ))}
                      <span className="mb-tela__selo">Demonstração</span>
                    </div>
                    <figcaption>
                      <b>{content.conversa.titulo}</b>
                      <span>{content.conversa.sub}</span>
                    </figcaption>
                  </figure>
                )}
                {content.telas.map((t) => (
                  <figure key={t.titulo} className={`mb-tela${t.fone ? " mb-tela--fone" : ""}`}>
                    <div className="mb-tela__moldura">
                      <Image src={t.src} alt={`${t.titulo}: tela de demonstração com dados de exemplo`} width={t.w} height={t.h} sizes="(min-width: 900px) 360px, 100vw" />
                      <span className="mb-tela__selo">Demonstração</span>
                    </div>
                    <figcaption>
                      <b>{t.titulo}</b>
                      <span>{t.sub}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
              <p className="mb-baia__nota">Telas de sistemas que já construímos, com dados de exemplo.</p>
            </div>
          </div>
        </section>

        {/* O que muda */}
        <section className="mb-sec" aria-labelledby="seg-muda-t">
          <div className="mb-wrap">
            <h2 id="seg-muda-t" className="mb-h2" data-rv>O que muda na operação</h2>
            <ul className="mb-muda" data-rv>
              {content.results.map((r) => (
                <li key={r.l}>
                  <b>{r.v}</b>
                  <p>{r.l}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Fechamento */}
        <section className="mb-sec" aria-labelledby="seg-fim-t">
          <div className="mb-wrap">
            <div className="mb-fecho" data-rv>
              <h2 id="seg-fim-t" className="mb-h2">Onde a automação se paga primeiro</h2>
              <div>
                <p>{content.ctaLine}</p>
                <a href={WHATS} target="_blank" rel="noopener noreferrer" className="mb-pilula mb-pilula--teal">
                  Falar com a equipe
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}
