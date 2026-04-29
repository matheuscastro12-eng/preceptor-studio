// ════════════════════════════════════════════════════════════════════════════
// PRECEPTOR STUDIO - Banco de Perguntas (versão enxuta, majoritariamente fechada)
// ════════════════════════════════════════════════════════════════════════════

export type Category = "saude" | "educacao" | "juridico" | "tech" | "outro";

export type QuestionType =
  | "text_short"
  | "text_long"
  | "single"
  | "multi"
  | "number"
  | "currency"
  | "likert";

export const LIKERT_OPTIONS = [
  "Muito pouco",
  "Pouco",
  "Neutro",
  "Parcialmente",
  "Muito",
];

export interface Question {
  id: string;
  section: string;
  order: number;
  type: QuestionType;
  question: string;
  helper?: string;
  options?: string[];
  required: boolean;
  allow_other?: boolean;
  conditional_on?: { field: string; equals: string | string[] };
}

export const OTHER_PREFIX = "Outro: ";

// ─── PERGUNTAS UNIVERSAIS ─────────────────────────────────────────────
const UNIVERSAL_QUESTIONS: Question[] = [
  // SEÇÃO 1: A IDEIA
  {
    id: "ideia_resumo",
    section: "A Ideia",
    order: 1,
    type: "text_long",
    question: "Em poucas linhas, descreva a ideia. O que é e o que ela faz?",
    helper: "Imagine explicar para alguém que nunca ouviu falar. Não precisa ser longo.",
    required: true,
  },
  {
    id: "ideia_origem",
    section: "A Ideia",
    order: 2,
    type: "multi",
    allow_other: true,
    question: "Como a ideia surgiu? (pode marcar mais de um)",
    options: [
      "Problema pessoal que vivi",
      "Oportunidade que vi no mercado",
      "Insight a partir do meu setor de trabalho",
      "Pedido recorrente de clientes",
    ],
    required: true,
  },
  {
    id: "ideia_status",
    section: "A Ideia",
    order: 3,
    type: "single",
    question: "Em que estágio a ideia está hoje?",
    options: [
      "Apenas no papel, sem nada construído",
      "Tenho protótipo ou validação inicial",
      "Tenho clientes pagantes (até 10)",
      "Tenho operação rodando (10+ clientes)",
    ],
    required: true,
  },

  // SEÇÃO 2: PROBLEMA E CLIENTE
  {
    id: "problema_principal",
    section: "Problema e Cliente",
    order: 4,
    type: "text_short",
    question: "Qual problema sua solução resolve? (1 ou 2 frases)",
    required: true,
  },
  {
    id: "cliente_tipo",
    section: "Problema e Cliente",
    order: 5,
    type: "multi",
    allow_other: true,
    question: "Quem é o cliente? (pode marcar mais de um)",
    options: [
      "Pessoa física (B2C)",
      "Pequena empresa ou autônomo",
      "Empresa de médio porte",
      "Empresa grande / corporação",
      "Governo ou setor público",
    ],
    required: true,
  },
  {
    id: "cliente_renda",
    section: "Problema e Cliente",
    order: 6,
    type: "single",
    question: "Qual a faixa econômica do cliente?",
    options: [
      "Classe C/D (até R$5k/mês)",
      "Classe B (R$5k a R$20k/mês)",
      "Classe A (R$20k+/mês)",
      "Empresas de pequeno porte (faturamento até R$5M/ano)",
      "Empresas de médio/grande porte (R$5M+/ano)",
      "Não sei ainda",
    ],
    required: true,
  },
  {
    id: "cliente_disposicao_pagar",
    section: "Problema e Cliente",
    order: 7,
    type: "single",
    question: "Quanto você imagina que o cliente está disposto a pagar?",
    options: [
      "Até R$50/mês ou R$500 único",
      "R$50 a R$200/mês ou R$500 a R$2k único",
      "R$200 a R$1.000/mês ou R$2k a R$10k único",
      "Acima de R$1.000/mês ou R$10k único",
      "Ainda não sei",
    ],
    required: true,
  },

  // SEÇÃO 3: MERCADO
  {
    id: "mercado_tamanho",
    section: "Mercado",
    order: 8,
    type: "single",
    question: "Qual o tamanho que você imagina para esse mercado?",
    options: [
      "Nicho (menos de 10 mil clientes potenciais)",
      "Pequeno (10 mil a 100 mil)",
      "Médio (100 mil a 1 milhão)",
      "Grande (mais de 1 milhão)",
      "Não sei estimar",
    ],
    required: true,
  },
  {
    id: "concorrentes",
    section: "Mercado",
    order: 9,
    type: "text_short",
    question: "Conhece concorrentes? Cite 2 ou 3 (opcional).",
    required: false,
  },
  {
    id: "diferencial",
    section: "Mercado",
    order: 10,
    type: "multi",
    allow_other: true,
    question: "Quais seus principais diferenciais? (marque até 3)",
    options: [
      "Preço mais acessível",
      "Qualidade superior",
      "Tecnologia / automação",
      "Atendimento personalizado",
      "Especialização em um nicho",
      "Velocidade ou conveniência",
      "Marca / reputação",
      "Modelo de negócio inovador",
    ],
    required: true,
  },

  // SEÇÃO 4: EXECUÇÃO E RECURSOS
  {
    id: "capital_disponivel",
    section: "Execução e Recursos",
    order: 11,
    type: "single",
    question: "Quanto capital você tem disponível para os primeiros 6 meses?",
    options: [
      "Menos de R$5.000",
      "R$5.000 a R$15.000",
      "R$15.000 a R$50.000",
      "R$50.000 a R$200.000",
      "Acima de R$200.000",
    ],
    required: true,
  },
  {
    id: "tempo_dedicacao",
    section: "Execução e Recursos",
    order: 12,
    type: "single",
    question: "Quanto tempo você consegue dedicar por semana?",
    options: [
      "Até 10 horas (paralelo a emprego)",
      "10 a 25 horas (meio período)",
      "25 a 40 horas (quase integral)",
      "40+ horas (integral)",
    ],
    required: true,
  },
  {
    id: "experiencia_setor",
    section: "Execução e Recursos",
    order: 13,
    type: "single",
    question: "Qual sua experiência no setor da ideia?",
    options: [
      "Nenhuma experiência direta",
      "Trabalho atualmente nesse setor",
      "Já trabalhei nele",
      "Sou referência ou tenho rede forte no setor",
    ],
    required: true,
  },
  {
    id: "modelo_receita",
    section: "Execução e Recursos",
    order: 14,
    type: "multi",
    allow_other: true,
    question: "Qual modelo de receita você imagina? (pode marcar mais de um)",
    options: [
      "Assinatura mensal recorrente",
      "Pagamento único por produto/serviço",
      "Comissão sobre transações",
      "Marketplace (taxa por venda)",
      "Freemium (gratuito + premium pago)",
      "Publicidade",
      "Ainda não defini",
    ],
    required: true,
  },
  {
    id: "objetivo_12meses",
    section: "Execução e Recursos",
    order: 15,
    type: "single",
    question: "Qual seu objetivo para os próximos 12 meses?",
    options: [
      "Validar o MVP com primeiros usuários",
      "Conseguir os primeiros clientes pagantes",
      "Atingir R$10k/mês de receita",
      "Atingir R$50k/mês de receita",
      "Atingir R$100k+/mês de receita",
      "Captar investimento",
    ],
    required: true,
  },

  // SEÇÃO 5: DIAGNÓSTICO DE CONCORDÂNCIA (LIKERT)
  // Marque o quanto você concorda com cada afirmação. Quanto mais honesto, melhor o estudo.
  {
    id: "diag_clareza_problema",
    section: "Diagnóstico Estratégico",
    order: 16,
    type: "likert",
    question: "Tenho clareza total sobre o problema que minha solução resolve.",
    required: true,
  },
  {
    id: "diag_conversou_clientes",
    section: "Diagnóstico Estratégico",
    order: 17,
    type: "likert",
    question: "Já conversei com pelo menos 10 potenciais clientes sobre essa ideia.",
    required: true,
  },
  {
    id: "diag_conhece_cliente",
    section: "Diagnóstico Estratégico",
    order: 18,
    type: "likert",
    question: "Sei exatamente quem é meu cliente ideal e onde encontrá-lo.",
    required: true,
  },
  {
    id: "diag_preco",
    section: "Diagnóstico Estratégico",
    order: 19,
    type: "likert",
    question: "Tenho confiança no preço que pretendo cobrar.",
    required: true,
  },
  {
    id: "diag_concorrentes",
    section: "Diagnóstico Estratégico",
    order: 20,
    type: "likert",
    question: "Conheço meus principais concorrentes e suas fraquezas.",
    required: true,
  },
  {
    id: "diag_diferencial_defensavel",
    section: "Diagnóstico Estratégico",
    order: 21,
    type: "likert",
    question: "Meu diferencial é defensável contra cópia rápida da concorrência.",
    required: true,
  },
  {
    id: "diag_urgencia",
    section: "Diagnóstico Estratégico",
    order: 22,
    type: "likert",
    question: "O problema que resolvo é urgente e doloroso para o cliente.",
    required: true,
  },
  {
    id: "diag_validacao_pagamento",
    section: "Diagnóstico Estratégico",
    order: 23,
    type: "likert",
    question: "Já validei que clientes estão dispostos a pagar pela solução.",
    required: true,
  },
  {
    id: "diag_aquisicao",
    section: "Diagnóstico Estratégico",
    order: 24,
    type: "likert",
    question: "Sei como vou adquirir os primeiros 100 clientes.",
    required: true,
  },
  {
    id: "diag_experiencia_operacional",
    section: "Diagnóstico Estratégico",
    order: 25,
    type: "likert",
    question: "Tenho experiência operacional suficiente para executar essa ideia.",
    required: true,
  },
  {
    id: "diag_runway",
    section: "Diagnóstico Estratégico",
    order: 26,
    type: "likert",
    question: "Consigo me manter financeiramente por 6 meses sem receita do negócio.",
    required: true,
  },
  {
    id: "diag_resiliencia",
    section: "Diagnóstico Estratégico",
    order: 27,
    type: "likert",
    question: "Tenho energia e disposição para tocar esse projeto por 2+ anos.",
    required: true,
  },
];

// ─── CATEGORIA: SAÚDE ────────────────────────────────────────────────
const SAUDE_QUESTIONS: Question[] = [
  {
    id: "saude_publico",
    section: "Específicas: Saúde",
    order: 20,
    type: "single",
    allow_other: true,
    question: "Quem é o público-alvo dentro da saúde?",
    options: [
      "Pacientes (B2C)",
      "Médicos ou profissionais de saúde",
      "Clínicas e consultórios",
      "Hospitais",
      "Operadoras de saúde",
      "Indústria farmacêutica",
    ],
    required: true,
  },
  {
    id: "saude_especialidade",
    section: "Específicas: Saúde",
    order: 21,
    type: "text_short",
    question: "Qual especialidade ou área da saúde é foco? (ex: dermatologia, nutrição)",
    required: true,
  },
  {
    id: "saude_regulamentacao",
    section: "Específicas: Saúde",
    order: 22,
    type: "multi",
    question: "Quais regulamentações se aplicam? (marque as relevantes)",
    options: [
      "ANVISA (dispositivos ou medicamentos)",
      "CFM / Conselho profissional",
      "LGPD aplicada a dados de saúde",
      "Telemedicina (CFM 2.314/2022)",
      "Não tenho certeza",
      "Nenhuma se aplica",
    ],
    required: true,
  },
  {
    id: "saude_validacao_clinica",
    section: "Específicas: Saúde",
    order: 23,
    type: "single",
    question: "Sua solução requer validação clínica?",
    options: [
      "Sim, é parte essencial",
      "Sim, mas não para o MVP",
      "Não é necessária",
      "Não tenho certeza",
    ],
    required: true,
  },
  {
    id: "saude_canal",
    section: "Específicas: Saúde",
    order: 24,
    type: "multi",
    allow_other: true,
    question: "Como o cliente vai descobrir sua solução?",
    options: [
      "Indicação médica",
      "Redes sociais",
      "Busca direta (Google)",
      "Convênios / parcerias",
      "Indicação boca a boca",
    ],
    required: true,
  },
];

// ─── CATEGORIA: EDUCAÇÃO ─────────────────────────────────────────────
const EDUCACAO_QUESTIONS: Question[] = [
  {
    id: "edu_publico",
    section: "Específicas: Educação",
    order: 30,
    type: "single",
    allow_other: true,
    question: "Qual o público-alvo?",
    options: [
      "Estudantes de ensino médio",
      "Vestibulandos",
      "Universitários",
      "Profissionais buscando especialização",
      "Concurseiros",
      "Crianças e ensino fundamental",
      "Empresas (treinamento corporativo)",
    ],
    required: true,
  },
  {
    id: "edu_formato",
    section: "Específicas: Educação",
    order: 31,
    type: "multi",
    allow_other: true,
    question: "Qual o formato principal do conteúdo?",
    options: [
      "Cursos gravados",
      "Aulas ao vivo",
      "Mentoria individual",
      "Comunidade ou grupo de estudos",
      "Plataforma com exercícios e questões",
      "Material em PDF ou ebook",
    ],
    required: true,
  },
  {
    id: "edu_resultado",
    section: "Específicas: Educação",
    order: 32,
    type: "single",
    allow_other: true,
    question: "Qual a transformação principal para o aluno?",
    options: [
      "Aprovação em prova ou concurso",
      "Certificação técnica ou profissional",
      "Habilidade nova aplicável no trabalho",
      "Mudança de carreira",
      "Desenvolvimento pessoal",
    ],
    required: true,
  },
  {
    id: "edu_diferencial_pedagogico",
    section: "Específicas: Educação",
    order: 33,
    type: "multi",
    allow_other: true,
    question: "Quais diferenciais pedagógicos sua solução tem?",
    options: [
      "Metodologia própria",
      "Acompanhamento individual",
      "Conteúdo prático / hands-on",
      "Material exclusivo",
      "Professores reconhecidos",
      "Tecnologia / IA aplicada",
      "Comunidade ativa",
    ],
    required: true,
  },
  {
    id: "edu_certificacao",
    section: "Específicas: Educação",
    order: 34,
    type: "single",
    question: "Você emite certificado?",
    options: [
      "Certificado próprio",
      "Parceria com instituição",
      "Sem certificado",
      "Ainda não defini",
    ],
    required: false,
  },
];

// ─── CATEGORIA: JURÍDICO ─────────────────────────────────────────────
const JURIDICO_QUESTIONS: Question[] = [
  {
    id: "jur_publico",
    section: "Específicas: Jurídico",
    order: 40,
    type: "single",
    allow_other: true,
    question: "Qual o público-alvo?",
    options: [
      "Pessoas físicas com necessidade jurídica",
      "Pequenos empresários e MEIs",
      "Empresas de médio porte",
      "Outros advogados (B2B legal tech)",
      "Escritórios de advocacia",
    ],
    required: true,
  },
  {
    id: "jur_area",
    section: "Específicas: Jurídico",
    order: 41,
    type: "single",
    question: "Qual área do direito é foco principal?",
    options: [
      "Trabalhista",
      "Tributário",
      "Empresarial e societário",
      "Família e sucessões",
      "Consumidor",
      "Imobiliário",
      "Criminal",
      "Outras",
    ],
    required: true,
  },
  {
    id: "jur_tipo_servico",
    section: "Específicas: Jurídico",
    order: 42,
    type: "multi",
    allow_other: true,
    question: "Que tipo de serviço você oferece?",
    options: [
      "Consultoria pontual",
      "Assessoria jurídica recorrente",
      "Geração de documentos automatizada",
      "Plataforma de marketplace jurídico",
      "Educação jurídica para leigos",
      "Software para advogados",
    ],
    required: true,
  },
  {
    id: "jur_oab_compliance",
    section: "Específicas: Jurídico",
    order: 43,
    type: "single",
    question: "Sua solução respeita as regras da OAB sobre publicidade e captação?",
    options: [
      "Sim, totalmente",
      "Parcialmente / preciso revisar",
      "Não tenho certeza",
      "Não se aplica",
    ],
    required: true,
  },
  {
    id: "jur_diferencial_metodologico",
    section: "Específicas: Jurídico",
    order: 44,
    type: "multi",
    allow_other: true,
    question: "Quais seus diferenciais?",
    options: [
      "Preço mais acessível",
      "Agilidade no atendimento",
      "Especialização em nicho",
      "Tecnologia (automação, IA)",
      "Atendimento humanizado",
      "Modelo digital / 100% online",
    ],
    required: true,
  },
];

// ─── CATEGORIA: TECH ─────────────────────────────────────────────────
const TECH_QUESTIONS: Question[] = [
  {
    id: "tech_modelo",
    section: "Específicas: Tech",
    order: 50,
    type: "single",
    question: "Qual o modelo do produto?",
    options: [
      "SaaS B2B (software para empresas)",
      "SaaS B2C (software para pessoas)",
      "Marketplace",
      "App mobile",
      "API ou ferramenta para devs",
      "Plataforma de IA",
      "Outro",
    ],
    required: true,
  },
  {
    id: "tech_complexidade",
    section: "Específicas: Tech",
    order: 51,
    type: "single",
    question: "Qual a complexidade técnica do MVP?",
    options: [
      "Simples (landing + form, pode ser no-code)",
      "Médio (webapp com login e CRUD básico)",
      "Avançado (integrações, IA, processamento)",
      "Muito avançado (infra própria, escala)",
    ],
    required: true,
  },
  {
    id: "tech_aquisicao",
    section: "Específicas: Tech",
    order: 52,
    type: "multi",
    allow_other: true,
    question: "Como você imagina adquirir os primeiros usuários?",
    options: [
      "Tráfego pago (Google, Meta, LinkedIn)",
      "SEO e conteúdo orgânico",
      "Comunidade e indicação",
      "Parceria estratégica",
      "Vendas outbound (B2B)",
      "Product Hunt e lançamento público",
    ],
    required: true,
  },
  {
    id: "tech_metric",
    section: "Específicas: Tech",
    order: 53,
    type: "single",
    allow_other: true,
    question: "Qual a métrica principal de sucesso?",
    options: [
      "MRR (receita recorrente mensal)",
      "MAU / DAU (usuários ativos)",
      "Retenção / churn",
      "Conversão",
      "CAC / LTV",
      "Volume transacionado (GMV)",
    ],
    required: true,
  },
  {
    id: "tech_moat",
    section: "Específicas: Tech",
    order: 54,
    type: "multi",
    question: "O que protege seu negócio contra cópia? (opcional)",
    options: [
      "Efeito de rede",
      "Dados acumulados / IA proprietária",
      "Marca",
      "Integrações com sistemas-chave",
      "Comunidade engajada",
      "Custo de troca alto",
      "Ainda não tenho moat claro",
    ],
    required: false,
  },
];

// ─── CATEGORIA: OUTRO ────────────────────────────────────────────────
const OUTRO_QUESTIONS: Question[] = [
  {
    id: "outro_setor",
    section: "Específicas: Outro Setor",
    order: 60,
    type: "text_short",
    question: "Em que setor sua ideia se enquadra? (ex: alimentação, moda, beleza)",
    required: true,
  },
  {
    id: "outro_diferencial",
    section: "Específicas: Outro Setor",
    order: 61,
    type: "multi",
    allow_other: true,
    question: "Quais seus principais diferenciais?",
    options: [
      "Preço",
      "Qualidade / curadoria",
      "Atendimento",
      "Marca / posicionamento",
      "Localização",
      "Tecnologia ou conveniência",
      "Sustentabilidade / propósito",
    ],
    required: true,
  },
  {
    id: "outro_canal",
    section: "Específicas: Outro Setor",
    order: 62,
    type: "multi",
    allow_other: true,
    question: "Por quais canais você imagina vender?",
    options: [
      "Loja física",
      "E-commerce próprio",
      "Marketplaces (Mercado Livre, Shopee, Amazon)",
      "Redes sociais e direct",
      "Distribuidores ou representantes",
      "Indicação e boca a boca",
    ],
    required: true,
  },
  {
    id: "outro_sazonalidade",
    section: "Específicas: Outro Setor",
    order: 63,
    type: "single",
    question: "Existe sazonalidade no setor?",
    options: [
      "Alta sazonalidade (datas / estações fortes)",
      "Sazonalidade moderada",
      "Pouca ou nenhuma sazonalidade",
      "Não sei",
    ],
    required: false,
  },
];

// ─── EXPORTAÇÃO ─────────────────────────────────────────────────────────────
export function getQuestions(category: Category): Question[] {
  const specific = {
    saude: SAUDE_QUESTIONS,
    educacao: EDUCACAO_QUESTIONS,
    juridico: JURIDICO_QUESTIONS,
    tech: TECH_QUESTIONS,
    outro: OUTRO_QUESTIONS,
  }[category];

  return [...UNIVERSAL_QUESTIONS, ...specific].sort((a, b) => a.order - b.order);
}

export const CATEGORIES: { value: Category; label: string; description: string }[] = [
  { value: "saude", label: "Saúde", description: "Médicos, clínicas, fisioterapia, nutrição, healthtech" },
  { value: "educacao", label: "Educação", description: "Cursos, plataformas, mentorias, edtech" },
  { value: "juridico", label: "Jurídico", description: "Advocacia, legaltech, consultoria jurídica" },
  { value: "tech", label: "Tech", description: "SaaS, apps, plataformas, marketplaces" },
  { value: "outro", label: "Outro Setor", description: "Alimentação, moda, fitness, varejo, serviços" },
];
