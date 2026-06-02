import { Category } from "@/lib/store";

export type SectorTemplateKey = "saude" | "educacao" | "juridico" | "tech";

export interface SectorTemplate {
  key: SectorTemplateKey;
  label: string;
  defaultTitle: string;
  contextNotes: string;
  suggestedQuestions: string[];
  commonRisks: string[];
}

export const STUDY_TEMPLATES: Record<SectorTemplateKey, SectorTemplate> = {
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
  return STUDY_TEMPLATES[category] ?? null;
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
