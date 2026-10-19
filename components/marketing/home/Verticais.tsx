import Link from "next/link";
import { Marca } from "./Marca";

type Vertical = {
  nome: string;
  titulo: string;
  texto: string;
  link?: { href: string; texto: string };
};

const VERTICAIS: Vertical[] = [
  {
    nome: "Logística",
    titulo: "Romaneio entra. CT-e sai.",
    texto:
      "Transportadoras, distribuidoras e operações com frota. O agente prepara CT-e e MDF-e, monta rotas e organiza ocorrências. Sua equipe aprova o que pede decisão.",
    link: { href: "/transporte", texto: "Ver como funciona em logística" },
  },
  {
    nome: "Financeiro / back-office",
    titulo: "O extrato entra. A baixa sai com prova.",
    texto:
      "Contas a receber, contas a pagar e controles internos de qualquer setor. O agente cruza extrato e títulos, propõe cada baixa com a prova e mantém os painéis do dia em ordem. Quem confirma é o seu financeiro.",
    // PENDENTE copy v3 (pendência 20): rota da página de financeiro ainda não
    // existe; o link "Ver como funciona no financeiro" entra quando existir.
  },
  {
    nome: "Clínicas",
    titulo: "A recepção respira.",
    texto:
      "O agente atende no WhatsApp oficial da clínica, responde dúvidas administrativas e organiza as conversas por assunto. A recepção continua no controle e aprova as respostas. O agente fica longe de orientação de saúde.",
    link: { href: "/medicina", texto: "Ver como funciona em clínicas" },
  },
];

export function Verticais() {
  return (
    <section id="para-quem" className="lp2-section lp2-verticais">
      <div className="lp2-container">
        <header className="lp2-head" data-rv>
          <p className="lp2-rotulo">PARA QUEM</p>
          <h2 className="lp2-h2">
            Feito para operação que roda no WhatsApp e <Marca>na planilha</Marca>.
          </h2>
        </header>

        <ul className="lp2-verticais__grid">
          {VERTICAIS.map((v, i) => (
            <li
              key={v.nome}
              className="lp2-verticais__cel"
              data-rv
              style={{ "--rv-d": `${i * 120}ms` } as React.CSSProperties}
            >
              <div className="lp2-vertical">
              <p className="lp2-rotulo">{v.nome}</p>
              <h3 className="lp2-vertical__titulo">{v.titulo}</h3>
              <p className="lp2-vertical__texto">{v.texto}</p>
              {v.link ? (
                <Link href={v.link.href} className="lp2-textlink">
                  {v.link.texto} <span aria-hidden="true">→</span>
                </Link>
              ) : null}
              </div>
            </li>
          ))}
        </ul>

        {/* Advocacia: só informativo, sem link, sem CTA, sem preço e sem caso
            (copy v3, pendência 7). */}
        <div className="lp2-advocacia" data-rv>
          <p className="lp2-rotulo">Advocacia</p>
          <div>
            <h3 className="lp2-h3">Prazos e rotinas de escritório.</h3>
            <p>
              Escritórios também têm processo repetitivo: leitura de intimações, controle de prazos e
              organização de documentos. Nessas rotinas, a IA pode ajudar a separar e organizar a
              informação, e a decisão fica sempre com o advogado. Publicidade e atendimento de
              escritórios seguem as regras da OAB.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
