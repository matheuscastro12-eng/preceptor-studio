import { Category } from "@/lib/store";

// Segmentos atuais + legados (estudos antigos seguem renderizando).
export type SectorTemplateKey =
  | "logistica"
  | "agro"
  | "medicina"
  | "saude"
  | "educacao"
  | "juridico"
  | "tech";

export interface SectorTemplate {
  key: SectorTemplateKey;
  label: string;
  defaultTitle: string;
  contextNotes: string;
  suggestedQuestions: string[];
  commonRisks: string[];
}

export const STUDY_TEMPLATES: Record<SectorTemplateKey, SectorTemplate> = {
  logistica: {
    key: "logistica",
    label: "Logística e Transportes",
    defaultTitle: "Estudo de automação em operação logística",
    contextNotes: `**Contexto operacional obrigatório de logística e transportes:**

- **Documentação de carga.** CT-e, MDF-e, canhoto e comprovante de entrega são o coração do faturamento. Mapeie onde cada documento nasce, quem digita e onde ele some.
- **SEFAZ e ANTT.** Emissão fiscal e regras de transporte definem prazos duros. Automação que toca documento fiscal precisa respeitar contingência e validação.
- **Torre de controle e ocorrências.** Atraso, avaria e devolução costumam chegar pelo cliente antes do painel. O dado de rastreio vive espalhado entre TMS, planilha e WhatsApp.
- **Faturamento por conferência.** O fechamento depende de bater pedido contra canhoto. É o processo de maior volume e maior retrabalho na maioria das transportadoras.
- **Motorista no WhatsApp.** Adiantamento, comprovante e agenda de carga consomem o time por mensagem, sem registro estruturado.`,
    suggestedQuestions: [
      "Qual o volume mensal de embarques e quantos documentos cada embarque gera?",
      "Onde vive o comprovante de entrega hoje, e quanto tempo leva do canhoto ao faturamento?",
      "Quais sistemas rodam a operação (TMS, ERP, rastreio) e quais não conversam entre si?",
      "Quantas pessoas o fechamento de faturamento ocupa, e com que frequência ele atrasa?",
    ],
    commonRisks: [
      "Dado preso em papel e foto de WhatsApp, sem fonte estruturada pra automação ler.",
      "Integração TMS-ERP subestimada, travando a conferência automática de documentos.",
      "Dependência de conferentes específicos que carregam a regra de cabeça.",
    ],
  },
  agro: {
    key: "agro",
    label: "Agro",
    defaultTitle: "Estudo de automação em operação do agro",
    contextNotes: `**Contexto operacional obrigatório do agro:**

- **Laudos e relatórios multiformato.** Cooperativa, banco, certificadora e cliente exigem o mesmo dado em formatos diferentes. A redigitação é a regra, não a exceção.
- **Receituário e insumos.** Defensivos exigem receituário agronômico e controle de estoque rastreável. Falha de registro vira passivo regulatório.
- **Sazonalidade de safra.** O volume de trabalho concentra em janelas curtas. Automação precisa estar pronta antes da janela, não durante.
- **Conectividade no campo.** Parte do registro nasce offline ou por foto de WhatsApp. O fluxo precisa aguentar registro assíncrono.
- **Rastreabilidade.** Exportação e certificação exigem trilha do talhão à entrega.`,
    suggestedQuestions: [
      "Como o dado sai do campo hoje (papel, foto, app), e quanto tempo leva até virar laudo?",
      "Quais formatos de relatório cada cooperativa, banco ou certificadora exige?",
      "Como é controlado o estoque de insumos e o receituário dos defensivos?",
      "Qual a janela de safra e o que precisa estar rodando antes dela abrir?",
    ],
    commonRisks: [
      "Conectividade rural quebrando fluxos que assumem registro online em tempo real.",
      "Adoção baixa pelo time de campo quando o registro exige mais passos que o caderno.",
      "Multiplicação de formatos por cooperativa tornando o padrão único inviável sem mapeamento.",
    ],
  },
  medicina: {
    key: "medicina",
    label: "Medicina",
    defaultTitle: "Estudo de automação em clínica ou operação de saúde",
    contextNotes: `**Contexto operacional obrigatório de clínicas e saúde:**

- **TISS e convênios.** Cada convênio tem regra própria de código, prazo e anexo. A glosa é o custo silencioso do faturamento e aparece semanas depois do envio.
- **LGPD para dados sensíveis.** Dado de paciente tem proteção reforçada. Toda automação precisa de base legal, trilha de acesso e armazenamento adequado.
- **CFM 2.314/2022.** Se houver ato médico remoto (teleconsulta, laudo a distância), as regras de telemedicina se aplicam.
- **Agenda e no-show.** Furo de agenda é perda direta de receita. Confirmação e lista de espera são a automação de retorno mais rápido.
- **Prontuário e sistemas fechados.** Muitos sistemas de clínica têm integração limitada. Mapear o que expõe API antes de prometer fluxo automático.`,
    suggestedQuestions: [
      "Qual o volume mensal de guias por convênio e a taxa atual de glosa?",
      "Quais sistemas rodam a clínica (agenda, prontuário, faturamento) e o que cada um expõe de integração?",
      "Onde o cadastro do paciente é redigitado hoje, e por quantas mãos ele passa?",
      "Como funciona a confirmação de agenda e qual a taxa de no-show?",
    ],
    commonRisks: [
      "Tratamento de dado sensível sem base legal clara, com exposição sob LGPD.",
      "Sistema de prontuário fechado inviabilizando a integração prometida.",
      "Regra de convênio mudando sem aviso e quebrando a conferência automática de guias.",
    ],
  },
  saude: {
    key: "saude",
    label: "Saúde",
    defaultTitle: "Estudo estratégico de healthtech",
    contextNotes: `**Contexto regulatório obrigatório do setor de saúde:**

- **LGPD aplicada a dados sensíveis.** Dados de saúde têm proteção reforçada. Mapeie base legal, consentimento e fluxo de armazenamento desde o início.
- **CFM 2.314/2022 (telemedicina).** Define regras de teleconsulta, telemonitoramento e prontuário eletrônico. Toda solução com ato médico remoto precisa aderir.
- **ANVISA (SaMD).** Software como dispositivo médico pode exigir registro. Avalie a classe de risco cedo, antes de escalar.
- **Integração com operadoras (ANS).** Venda B2B para operadoras tem ciclo longo e exige padrão TISS. A integração operacional costuma ser o gargalo de tração.
- **Conselhos de classe** (CRN, COFFITO, CFP) restringem publicidade e captação por profissional.`,
    suggestedQuestions: [
      "Qual a base legal de LGPD para tratar os dados de saúde e onde eles ficam armazenados?",
      "A solução tem ato médico remoto? Como ela adere à CFM 2.314/2022?",
      "O produto se enquadra como SaMD na ANVISA? Qual a classe de risco estimada?",
      "Qual o plano de integração com operadoras (padrão TISS) e o ciclo de venda esperado?",
    ],
    commonRisks: [
      "Enquadramento regulatório (ANVISA/CFM) descoberto tarde, travando o go-to-market.",
      "Ciclo de venda B2B com operadoras muito mais longo que o caixa suporta.",
      "Vazamento ou tratamento inadequado de dados sensíveis com exposição sob LGPD.",
    ],
  },
  educacao: {
    key: "educacao",
    label: "Educação",
    defaultTitle: "Estudo estratégico de edtech",
    contextNotes: `**Contexto obrigatório do setor educacional:**

- **MEC e cursos regulados.** Distinga curso livre de curso com certificação reconhecida. Certificação reconhecida exige credenciamento e muda o modelo.
- **LGPD para menores.** Dados de alunos menores de idade exigem consentimento de responsável e cuidado redobrado.
- **Sazonalidade forte.** Pré-vestibular (jan-jun), pré-ENEM (ago-nov) e concursos comprimem a receita em janelas específicas. Black Friday concentra parte das vendas.
- **Taxa de conclusão baixa** (5-15%). Retenção e conclusão são o verdadeiro gargalo, não a venda inicial.
- **Plataformas dominantes** (Hotmart, Kiwify, Eduzz) definem fees e dependência de canal.`,
    suggestedQuestions: [
      "O curso é livre ou regulado pelo MEC? Há certificação reconhecida envolvida?",
      "Como a sazonalidade (vestibular, ENEM, concursos) afeta o fluxo de caixa anual?",
      "Qual a estratégia de retenção e conclusão, dado que a taxa típica é de 5-15%?",
      "Há tratamento de dados de menores? Como o consentimento de responsável é coletado?",
    ],
    commonRisks: [
      "Dependência de plataforma única (Hotmart/Kiwify) com risco de mudança de fee ou banimento.",
      "Receita concentrada em janelas sazonais com caixa apertado nos meses vazios.",
      "Baixa taxa de conclusão corroendo reputação e recompra.",
    ],
  },
  juridico: {
    key: "juridico",
    label: "Jurídico",
    defaultTitle: "Estudo estratégico de legaltech",
    contextNotes: `**Contexto obrigatório do setor jurídico:**

- **Compliance multi-jurisdição.** Operações em mais de um estado ou país exigem aderência a normas distintas. Mapeie as jurisdições-alvo cedo.
- **Provimento OAB 205/2021.** Restringe publicidade e captação ativa de clientes por advogados. Toda estratégia de aquisição precisa respeitar isso.
- **Lei 8.906/94 (Estatuto da OAB) e CNJ.** Limitam o que automação e marketplaces podem oferecer.
- **Perfil do cliente.** Alta concentração em escritórios pequenos (1-5 advogados), historicamente resistentes a mudança tecnológica. A adoção é o gargalo.
- **Sigilo profissional.** Dados de processos e clientes exigem confidencialidade reforçada.`,
    suggestedQuestions: [
      "Em quais jurisdições a solução vai operar e quais normas distintas isso exige?",
      "Como a aquisição de clientes respeita o Provimento OAB 205/2021 sobre publicidade?",
      "O modelo esbarra em alguma restrição do Estatuto da OAB ou do CNJ?",
      "Qual a estratégia de adoção para escritórios pequenos resistentes a tecnologia?",
    ],
    commonRisks: [
      "Estratégia de aquisição violando restrições de publicidade da OAB.",
      "Complexidade de compliance multi-jurisdição maior que o previsto.",
      "Baixa adoção por escritórios pequenos resistentes a mudança.",
    ],
  },
  tech: {
    key: "tech",
    label: "Tech",
    defaultTitle: "Estudo estratégico de SaaS B2B",
    contextNotes: `**Contexto obrigatório do setor tech:**

- **Unit economics são a tese.** CAC, LTV, churn, payback e NRR definem se o modelo fecha. Sem esses números, a análise fica especulativa.
- **Regulação por vertical.** Fintech responde ao BACEN (PIX, Open Finance, cripto). Qualquer dado pessoal cai sob LGPD/ANPD e Marco Civil.
- **Ciclo de venda B2B** de 60-180 dias. O caixa precisa aguentar o tempo entre lead e receita.
- **Defensabilidade.** Em tech, copiar é barato. A vantagem precisa estar em dado proprietário, rede, integração ou custo de troca.
- **Acesso a capital.** Mapear fonte (anjo, pre-seed, seed) coerente com o estágio e o burn.`,
    suggestedQuestions: [
      "Quais são os números reais ou estimados de CAC, LTV, churn, payback e NRR?",
      "Há vertical regulada (fintech/BACEN, dados/LGPD) que muda o go-to-market?",
      "Qual a vantagem defensável (dado, rede, integração, custo de troca)?",
      "O ciclo de venda B2B (60-180 dias) é compatível com o caixa disponível?",
    ],
    commonRisks: [
      "Unit economics que não fecham (CAC alto vs LTV) descobertos tarde.",
      "Diferenciação copiável, sem moat real, em mercado de baixo custo de entrada.",
      "Burn rate incompatível com o ciclo de venda B2B e o acesso a capital.",
    ],
  },
};

export function getTemplate(category: Category): SectorTemplate | null {
  if (category === "outro") return null;
  return STUDY_TEMPLATES[category as SectorTemplateKey] ?? null;
}

export interface SectorContext {
  template_key: SectorTemplateKey;
  context_notes: string;
  suggested_questions: string[];
  common_risks: string[];
}

export function buildSectorContext(template: SectorTemplate): SectorContext {
  return {
    template_key: template.key,
    context_notes: template.contextNotes,
    suggested_questions: template.suggestedQuestions,
    common_risks: template.commonRisks,
  };
}
