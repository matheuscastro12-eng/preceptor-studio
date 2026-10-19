import { CtaLink, CTA_MICROCOPY } from "./CtaLink";
import { Marca } from "./Marca";

const SEMANAS = [
  {
    titulo: "Semana 1: linha de base.",
    texto:
      "A gente mede tempo, volume e erros do processo de hoje e liga o agente ao seu sistema.",
  },
  {
    titulo: "Semanas do meio: em paralelo.",
    texto: "O agente trabalha junto com a sua equipe. Uma pessoa aprova ou corrige cada saída.",
  },
  {
    titulo: "Última semana: resultado.",
    texto: "Você recebe a comparação com a linha de base num relatório de uma página.",
  },
];

const METAS = [
  { chave: "Conciliação:", texto: "mais recebimentos do mês conciliados com prova." },
  {
    chave: "WhatsApp da clínica:",
    texto: "primeira resposta mais rápida, inclusive fora do horário.",
  },
  { chave: "CT-e:", texto: "menos minutos por documento emitido, sem retrabalho." },
];

const PRECISA = [
  "Acesso ao sistema (usuário de teste ou API).",
  "Uma pessoa que conheça o processo, com cerca de 1 hora por semana.",
  "Exemplos reais do processo: documentos, mensagens e planilhas.",
];

const DECIDE = [
  "A IA sugere e a pessoa aprova. Nada irreversível acontece sem confirmação.",
  "Toda ação fica registrada, com quem aprovou e quando.",
];

export function Piloto() {
  return (
    <section id="piloto" className="lp2-section lp2-soft lp2-piloto">
      <div className="lp2-container">
        <header className="lp2-head" data-rv>
          <p className="lp2-rotulo">O PILOTO</p>
          <h2 className="lp2-h2">
            De 2 a 4 semanas, um processo, <Marca>uma meta</Marca>.
          </h2>
          <p className="lp2-lead">
            Depois do diagnóstico, você recebe a proposta de um piloto pago num único processo. A meta
            é combinada antes de começar e medida com os registros do seu próprio sistema.
          </p>
        </header>

        <ol className="lp2-regua">
          {SEMANAS.map((s, i) => (
            <li
              key={s.titulo}
              className="lp2-regua__marco"
              data-rv
              style={{ "--rv-d": `${i * 120}ms` } as React.CSSProperties}
            >
              <span className="lp2-regua__ponto" aria-hidden="true" />
              <h3 className="lp2-h3">{s.titulo}</h3>
              <p>{s.texto}</p>
            </li>
          ))}
        </ol>

        <div className="lp2-piloto__listas">
          <div data-rv>
            <h3 className="lp2-rotulo lp2-piloto__lista-titulo">Exemplos de meta</h3>
            <ul className="lp2-lista">
              {METAS.map((m) => (
                <li key={m.chave}>
                  <strong>{m.chave}</strong> {m.texto}
                </li>
              ))}
            </ul>
          </div>
          <div data-rv style={{ "--rv-d": "120ms" } as React.CSSProperties}>
            <h3 className="lp2-rotulo lp2-piloto__lista-titulo">O que a gente precisa de você</h3>
            <ul className="lp2-lista">
              {PRECISA.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div data-rv style={{ "--rv-d": "240ms" } as React.CSSProperties}>
            <h3 className="lp2-rotulo lp2-piloto__lista-titulo">
              Quem decide continua sendo a sua equipe
            </h3>
            <ul className="lp2-lista">
              {DECIDE.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* PENDENTE copy v3 (pendência 3): parágrafo "Depois do piloto" fica fora
            até a política para meta não atingida ser confirmada. */}

        <div className="lp2-cta-wrap lp2-piloto__cta" data-rv>
          <CtaLink />
          <p className="lp2-micro">{CTA_MICROCOPY}</p>
        </div>
      </div>
    </section>
  );
}
