"use client";

type Macro = "venda" | "entrega" | "expansao";
type Team = "comercial" | "operacional" | "cliente";

const TEAM_LABEL: Record<Team, string> = {
  comercial: "Time Comercial",
  operacional: "Time Operacional",
  cliente: "Cliente",
};

interface Phase {
  num: number;
  macro: Macro;
  macroLabel: string;
  title: string;
  duration: string;
  owners: Team[];
  goal: string;
  steps: string[];
  input: string;
  output: string;
  gate?: { code: string; text: string };
}

const PHASES: Phase[] = [
  {
    num: 1,
    macro: "venda",
    macroLabel: "Venda",
    title: "Reunião de Qualificação",
    duration: "1 call · ~45 min",
    owners: ["comercial", "cliente"],
    goal:
      "O Time Comercial conduz a primeira conversa com o lead pra validar se faz sentido avançar. Aqui a gente qualifica antes de investir tempo de operação: dor real, contexto, urgência, decisor na mesa e faixa de preço validada.",
    steps: [
      "Entender a dor e o contexto do negócio do cliente",
      "Mapear quem decide e quem usa a solução no dia a dia",
      "Validar expectativa de investimento (faixa de preço)",
      "Medir urgência e prazo esperado pelo cliente",
      "Decidir GO / NO-GO e registrar tudo no CRM",
    ],
    input: "Lead novo (indicação, funil de marketing ou prospecção ativa).",
    output: "Lead qualificado com briefing comercial preenchido no CRM.",
    gate: {
      code: "G1",
      text: "GO / NO-GO — só passa lead com dor real, decisor mapeado e preço pré-validado.",
    },
  },
  {
    num: 2,
    macro: "venda",
    macroLabel: "Venda",
    title: "Handoff + Arquitetura da Solução",
    duration: "2–4 dias úteis",
    owners: ["comercial", "operacional"],
    goal:
      "Reunião interna: o Time Comercial traz ao Time Operacional o produto, as necessidades e as nuances do cliente. O Time Operacional desenha a arquitetura do projeto, dimensiona esforço e fecha com o Comercial a precificação final da proposta.",
    steps: [
      "Comercial apresenta briefing: dor, contexto, nuances e expectativas",
      "Operacional levanta dúvidas técnicas e riscos do escopo",
      "Operacional desenha a arquitetura da solução (blueprint)",
      "Dimensionar esforço, prazo e fases de entrega",
      "Fechar precificação e montar a proposta comercial",
    ],
    input: "Briefing comercial do lead qualificado (saída da Fase 1).",
    output: "Blueprint da solução + proposta comercial pronta pra apresentar.",
    gate: {
      code: "G2",
      text: "Proposta aprovada internamente — arquitetura, prazo e preço validados pelos dois times.",
    },
  },
  {
    num: 3,
    macro: "venda",
    macroLabel: "Venda",
    title: "Reunião de Fechamento",
    duration: "1 call · ~60 min",
    owners: ["comercial", "operacional", "cliente"],
    goal:
      "Call conjunta: Cliente + Time Comercial + Time Operacional. A gente já chega com a arquitetura desenhada e a proposta comercial na mão — o objetivo é fechar nessa call. O Operacional dá segurança técnica; o Comercial conduz a negociação.",
    steps: [
      "Operacional apresenta a arquitetura da solução ao cliente",
      "Mostrar como a solução resolve a dor mapeada na qualificação",
      "Comercial apresenta a proposta (escopo, prazo, investimento)",
      "Tratar objeções na hora, com os dois times na sala",
      "Fechar na call ou sair com prazo de decisão definido",
    ],
    input: "Blueprint + proposta comercial (saída da Fase 2).",
    output: "Contrato assinado ou aceite formal com data de início.",
    gate: {
      code: "G3",
      text: "Contrato assinado — sem aceite formal, o projeto não entra na esteira de entrega.",
    },
  },
  {
    num: 4,
    macro: "entrega",
    macroLabel: "Entrega",
    title: "Kickoff & Setup",
    duration: "Semana 1",
    owners: ["operacional", "cliente"],
    goal:
      "O lead vira Venture no CRM e o projeto entra oficialmente na esteira. O kickoff alinha expectativas, garante acessos e define os rituais de acompanhamento — pra ninguém depender de memória de call.",
    steps: [
      "Call de kickoff: apresentar time, cronograma e forma de trabalho",
      "Coletar acessos, credenciais e materiais do cliente",
      "Definir canal oficial de comunicação e ritmo de checkpoints",
      "Registrar marcos e entregáveis no cronograma do Studio",
    ],
    input: "Contrato assinado + proposta com escopo fechado.",
    output: "Venture ativa no CRM com cronograma, acessos e rituais definidos.",
  },
  {
    num: 5,
    macro: "entrega",
    macroLabel: "Entrega",
    title: "Build em Sprints",
    duration: "Conforme escopo",
    owners: ["operacional", "cliente"],
    goal:
      "Execução iterativa da arquitetura desenhada. O Time Operacional constrói em ciclos curtos e mostra progresso real toda semana — demo curta, decisão rápida, sem sumir por semanas e voltar com surpresa.",
    steps: [
      "Sprints curtas com entregáveis demonstráveis",
      "Checkpoint semanal com o cliente (demo + próximos passos)",
      "Registrar decisões e mudanças de escopo por escrito",
      "Escalar riscos e bloqueios pro Comercial quando afetarem prazo ou preço",
    ],
    input: "Cronograma e blueprint aprovados no kickoff.",
    output: "Produto funcional pronto pra homologação com o cliente.",
  },
  {
    num: 6,
    macro: "entrega",
    macroLabel: "Entrega",
    title: "Homologação & Go-live",
    duration: "1–2 semanas",
    owners: ["operacional", "cliente"],
    goal:
      "O cliente valida o que foi construído em cima do escopo fechado. Ajustes finais, deploy em produção e treinamento de quem vai usar. A entrega só conta quando o cliente aceita formalmente.",
    steps: [
      "Rodada de homologação com o cliente sobre o escopo contratado",
      "Ajustes finais priorizados (bugfix ≠ escopo novo)",
      "Deploy em produção + monitoramento assistido",
      "Treinamento e documentação de uso pro time do cliente",
    ],
    input: "Produto funcional (saída da Fase 5).",
    output: "Solução em produção com aceite formal de entrega.",
    gate: {
      code: "G4",
      text: "Aceite de entrega — cliente valida formalmente que o escopo contratado foi cumprido.",
    },
  },
  {
    num: 7,
    macro: "expansao",
    macroLabel: "Expansão",
    title: "Acompanhamento & Expansão",
    duration: "Contínuo",
    owners: ["comercial", "operacional", "cliente"],
    goal:
      "Depois do go-live a relação continua: medir resultado gerado, dar suporte e mapear novas dores. Cliente satisfeito é o lead mais barato do funil — nova dor identificada volta pra Fase 1 com atalho (a qualificação já está meio feita).",
    steps: [
      "Checkpoints de resultado (métricas combinadas na proposta)",
      "Suporte e pequenas evoluções conforme contrato",
      "Comercial mapeia novas dores e oportunidades de expansão",
      "Pedir indicação e case quando o resultado aparecer",
    ],
    input: "Solução em produção com aceite (saída da Fase 6).",
    output: "Novo ciclo de venda (upsell / nova venture) ou case documentado.",
  },
];

const MACROS: { key: Macro; label: string; hint: string; phases: Phase[] }[] = [
  {
    key: "venda",
    label: "A · Venda",
    hint: "Do lead ao contrato assinado",
    phases: PHASES.filter((p) => p.macro === "venda"),
  },
  {
    key: "entrega",
    label: "B · Entrega",
    hint: "Do kickoff ao go-live",
    phases: PHASES.filter((p) => p.macro === "entrega"),
  },
  {
    key: "expansao",
    label: "C · Expansão",
    hint: "Do resultado ao próximo ciclo",
    phases: PHASES.filter((p) => p.macro === "expansao"),
  },
];

type Raci = "R" | "A" | "C" | "I";
const RACI_ROWS: { phase: string; comercial: Raci; operacional: Raci; cliente: Raci }[] = [
  { phase: "1 · Qualificação", comercial: "A", operacional: "I", cliente: "C" },
  { phase: "2 · Handoff + Arquitetura", comercial: "C", operacional: "R", cliente: "I" },
  { phase: "3 · Reunião de Fechamento", comercial: "A", operacional: "C", cliente: "R" },
  { phase: "4 · Kickoff & Setup", comercial: "I", operacional: "A", cliente: "C" },
  { phase: "5 · Build em Sprints", comercial: "I", operacional: "A", cliente: "C" },
  { phase: "6 · Homologação & Go-live", comercial: "I", operacional: "A", cliente: "R" },
  { phase: "7 · Acompanhamento & Expansão", comercial: "A", operacional: "C", cliente: "C" },
];

const PRINCIPLES = [
  {
    title: "Qualifica antes de gastar operação",
    text: "Tempo do Time Operacional só entra depois do G1. Lead sem dor real, decisor ou preço validado não passa da qualificação.",
  },
  {
    title: "Quem desenha participa da venda",
    text: "O Time Operacional entra na reunião de fechamento. Quem vai construir defende a arquitetura — isso dá segurança técnica e evita vender o que não dá pra entregar.",
  },
  {
    title: "Proposta na call, não depois",
    text: "A gente chega na reunião de fechamento com arquitetura e proposta prontas. Objeção se trata na hora, com os dois times na sala.",
  },
  {
    title: "Tudo registrado no CRM",
    text: "Briefing, decisões, mudanças de escopo e aceites vivem no CRM — não na memória de ninguém. Se não está registrado, não aconteceu.",
  },
  {
    title: "Gate não se pula",
    text: "G1 a G4 existem pra proteger margem e prazo. Pular gate por pressa é como o Studio perde dinheiro em silêncio.",
  },
  {
    title: "Entrega puxa a próxima venda",
    text: "A Fase 7 é comercial tanto quanto operacional: resultado medido vira case, case vira indicação, dor nova vira novo ciclo com atalho.",
  },
];

function scrollToPhase(num: number) {
  document
    .getElementById(`fase-${num}`)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ManualView() {
  return (
    <div className="page" data-screen-label="Manual">
      <div className="man-hero">
        <div className="man-hero__eyebrow">Playbook interno · uso do time</div>
        <h1 className="man-hero__title">
          Manual do Produto <em>PRECEPTOR</em>
        </h1>
        <p className="man-hero__sub">
          Nosso framework de venda e entrega, fase a fase: como um lead entra,
          é qualificado, vira proposta, vira Venture e volta pro funil como
          expansão. É o mapa que todo mundo do Studio segue — Comercial e
          Operacional falando a mesma língua.
        </p>
        <div className="man-hero__meta">
          <span className="man-hero__pill">7 fases</span>
          <span className="man-hero__pill">4 gates de decisão</span>
          <span className="man-hero__pill">3 macro-etapas</span>
          <span className="man-hero__pill">Documento interno</span>
        </div>
      </div>

      <div className="man-legend">
        <span className="man-legend__label">Quem participa</span>
        <span className="man-chip man-chip--comercial">
          <span className="man-chip__dot" /> Time Comercial
        </span>
        <span className="man-chip man-chip--operacional">
          <span className="man-chip__dot" /> Time Operacional
        </span>
        <span className="man-chip man-chip--cliente">
          <span className="man-chip__dot" /> Cliente
        </span>
      </div>

      <div className="man-map">
        <p className="man-map__title">Mapa do framework — clique pra ir direto à fase</p>
        <div className="man-map__lanes">
          {MACROS.map((m) => (
            <div key={m.key} className={`man-lane man-lane--${m.key}`}>
              <div className="man-lane__name">{m.label}</div>
              <div className="man-lane__hint">{m.hint}</div>
              <div className="man-lane__steps">
                {m.phases.map((p) => (
                  <button
                    key={p.num}
                    type="button"
                    className="man-step"
                    onClick={() => scrollToPhase(p.num)}
                  >
                    <span className="man-step__num">{p.num}</span>
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="man-flow">
        {PHASES.map((p) => (
          <div key={p.num} id={`fase-${p.num}`} className={`man-phase man-phase--${p.macro}`}>
            <span className="man-phase__node">{p.num}</span>
            <div className="man-phase__card">
              <div className="man-phase__head">
                <span className="man-phase__macro">{p.macroLabel}</span>
                <h2 className="man-phase__title">{p.title}</h2>
                <span className="man-phase__duration">{p.duration}</span>
              </div>
              <div className="man-phase__owners">
                {p.owners.map((o) => (
                  <span key={o} className={`man-chip man-chip--${o}`}>
                    <span className="man-chip__dot" /> {TEAM_LABEL[o]}
                  </span>
                ))}
              </div>
              <p className="man-phase__goal">{p.goal}</p>
              <div className="man-phase__grid">
                <div className="man-box">
                  <div className="man-box__label">O que acontece</div>
                  <ul>
                    {p.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="man-box man-box--io">
                  <div className="man-box__label">Entrada → Saída</div>
                  <div className="man-io">
                    <span className="man-io__tag man-io__tag--in">IN</span>
                    <span className="man-io__text">{p.input}</span>
                  </div>
                  <div className="man-io">
                    <span className="man-io__tag man-io__tag--out">OUT</span>
                    <span className="man-io__text">{p.output}</span>
                  </div>
                  {p.gate && (
                    <div className="man-gate">
                      <span className="man-gate__icon">✓</span>
                      <span>
                        <div className="man-gate__label">Gate {p.gate.code}</div>
                        <div className="man-gate__text">{p.gate.text}</div>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="man-loop">
        <span className="man-loop__icon">↻</span>
        <span className="man-loop__text">
          <strong>O framework é um loop, não uma linha.</strong> Nova dor
          identificada na Fase 7 volta pra Fase 1 com atalho: o cliente já é
          conhecido, a confiança já existe e a qualificação vira uma conversa de
          expansão — o ciclo de venda mais curto e barato do Studio.
        </span>
      </div>

      <h2 className="man-section-title">Quem faz o quê (RACI)</h2>
      <p className="man-section-sub">
        Papéis por fase — pra nunca ter dúvida de quem puxa, quem aprova e quem
        só acompanha.
      </p>
      <div className="man-raci-wrap">
        <table className="man-raci">
          <thead>
            <tr>
              <th>Fase</th>
              <th>Time Comercial</th>
              <th>Time Operacional</th>
              <th>Cliente</th>
            </tr>
          </thead>
          <tbody>
            {RACI_ROWS.map((r) => (
              <tr key={r.phase}>
                <td>{r.phase}</td>
                <td>
                  <span className={`man-raci-tag man-raci-tag--${r.comercial.toLowerCase()}`}>
                    {r.comercial}
                  </span>
                </td>
                <td>
                  <span className={`man-raci-tag man-raci-tag--${r.operacional.toLowerCase()}`}>
                    {r.operacional}
                  </span>
                </td>
                <td>
                  <span className={`man-raci-tag man-raci-tag--${r.cliente.toLowerCase()}`}>
                    {r.cliente}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="man-raci-legend">
          <span><strong>A</strong> — dono da fase (aprova e responde por ela)</span>
          <span><strong>R</strong> — executa / participa ativamente</span>
          <span><strong>C</strong> — consultado antes das decisões</span>
          <span><strong>I</strong> — informado do resultado</span>
        </div>
      </div>

      <h2 className="man-section-title">Regras de ouro</h2>
      <p className="man-section-sub">
        Os princípios que sustentam o framework — quando bater dúvida, decide
        por aqui.
      </p>
      <div className="man-principles">
        {PRINCIPLES.map((pr, i) => (
          <div key={pr.title} className="man-principle">
            <div className="man-principle__num">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="man-principle__title">{pr.title}</h3>
            <p className="man-principle__text">{pr.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
