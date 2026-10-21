import Link from "next/link";

/*
 * Um card por setor, cada um com um pedaço do fluxo do agente no lugar de
 * ícone: o passo anterior, o passo em foco e a pessoa que decide no fim.
 * Larguras alternadas (1,7 : 1 e 1 : 1,7). Dados fictícios, marcados.
 */

type No = { t: string; d: string; estado: "ok" | "erro" | "pessoa"; foco?: boolean; quem?: string };
type Setor = { id: string; nome: string; texto: string; href?: string; link?: string; nos: No[] };

const SETORES: Setor[] = [
  {
    id: "transporte",
    nome: "Transportadoras",
    texto: "O agente lê o pedido e a NF-e, confere um contra o outro e prepara CT-e, CIOT e MDF-e no TMS.",
    href: "/transporte",
    link: "Ver transportadoras",
    nos: [
      { t: "Pedido e NF-e lidos", d: "Pedido 2231 · NF-e 4.512", estado: "ok" },
      { t: "Confere pedido × NF-e", d: "4 de 4 campos batem", estado: "ok", foco: true },
      { t: "Carla aprova o CT-e", d: "Aguardando você", estado: "pessoa", quem: "CA" },
    ],
  },
  {
    id: "clinicas",
    nome: "Clínicas",
    texto: "O agente responde no WhatsApp, consulta a agenda e confirma. O que foge da regra vai para a recepção.",
    href: "/medicina",
    link: "Ver clínicas",
    nos: [
      { t: "Mensagem no WhatsApp", d: "Tem horário no sábado?", estado: "ok" },
      { t: "Consulta a agenda", d: "Sábado: 9h e 10h30 livres", estado: "ok", foco: true },
      { t: "Encaixe vai para a recepção", d: "Júlia decide o horário", estado: "pessoa", quem: "JU" },
    ],
  },
  {
    id: "agro",
    nome: "Agro e grãos",
    texto: "O agente coleta do ERP, cruza embarque, custo e preço e aponta o que não fecha.",
    href: "/agro",
    link: "Ver agro",
    nos: [
      { t: "Coleta do ERP", d: "Embarque 0412", estado: "ok" },
      { t: "Cruza custo e preço", d: "Frete 6% acima do previsto", estado: "erro", foco: true },
      { t: "Rafael, o gestor, decide", d: "Com o número do dia", estado: "pessoa", quem: "RA" },
    ],
  },
  {
    id: "financeiro",
    nome: "Financeiro",
    texto: "O agente lê o extrato, casa cada recebimento com o título e separa só o que diverge.",
    nos: [
      { t: "Lê o extrato", d: "38 lançamentos", estado: "ok" },
      { t: "Casa com os títulos", d: "36 casados · 2 divergem", estado: "erro", foco: true },
      { t: "Marta confirma as baixas", d: "2 para revisar", estado: "pessoa", quem: "MA" },
    ],
  },
];

function Fluxo({ nos }: { nos: No[] }) {
  return (
    <div className="mb-setor__ui" data-ui>
      <span className="mb-setor__demo">Demonstração</span>
      <ol className="mb-setor__fluxo">
        {nos.map((n) => (
          <li key={n.t} className={`mb-setor__no mb-setor__no--${n.estado}${n.foco ? " is-foco" : ""}`}>
            <p className="mb-setor__no-t">
              <span className="mb-setor__marca" aria-hidden="true">
                {n.estado === "erro" ? "!" : n.quem}
              </span>
              {n.t}
            </p>
            <p className="mb-setor__no-d">{n.d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Setores() {
  return (
    <div className="mb-setores">
      {SETORES.map((s) => (
        <article key={s.id} className={`mb-setor mb-setor--${s.id}`} data-rv>
          <Fluxo nos={s.nos} />
          <div className="mb-setor__txt">
            <h3>{s.nome}</h3>
            <p>{s.texto}</p>
            {s.href && (
              <Link href={s.href} className="mb-setor__link">
                {s.link} <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
