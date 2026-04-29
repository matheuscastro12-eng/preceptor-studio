import { Category } from "@/lib/store";

export type ArtifactType =
  | "briefing_dev"
  | "briefing_design"
  | "briefing_growth"
  | "financial_model"
  | "prospecting_script";

export const ARTIFACT_META: Record<
  ArtifactType,
  { label: string; assignee: string; description: string; icon: string }
> = {
  briefing_dev: {
    label: "Briefing de Desenvolvimento",
    assignee: "Matheus",
    description: "Briefing técnico do MVP — stack, escopo, integrações e arquitetura.",
    icon: "⚙",
  },
  briefing_design: {
    label: "Briefing de Design",
    assignee: "Kalley",
    description: "Diretrizes de marca, identidade visual e UI do produto.",
    icon: "✦",
  },
  briefing_growth: {
    label: "Briefing de Growth",
    assignee: "Thiago, Leonardo, Marco",
    description: "Estratégia de aquisição, posicionamento e plano de tráfego.",
    icon: "↗",
  },
  financial_model: {
    label: "Modelo Financeiro",
    assignee: "—",
    description: "Projeções de receita, custos, runway e cenários para 12 meses.",
    icon: "₿",
  },
  prospecting_script: {
    label: "Roteiro de Prospecção",
    assignee: "Luciano + Time Comercial",
    description: "Script de WhatsApp/LinkedIn para captação dos primeiros clientes.",
    icon: "✉",
  },
};

const COMMON = `Você é parte do time da PRECEPTOR! Venture Studio. Sua missão é produzir um documento de execução PRÁTICO baseado no diagnóstico do cliente. Português brasileiro direto, sem clichês, sem emojis. Use Markdown estruturado com headings, bullets e tabelas. Seja específico, tangível e acionável — esse documento vai virar trabalho real.`;

export function buildArtifactSystemPrompt(
  type: ArtifactType,
  category: Category
): string {
  const specific: Record<ArtifactType, string> = {
    briefing_dev: `Produza o BRIEFING DE DESENVOLVIMENTO. Destinatário: Matheus (CTO/dev).

Estrutura obrigatória:
# Briefing de Desenvolvimento — [título]

## 1. Visão do Produto
O que vamos construir, em 2 parágrafos.

## 2. Escopo do MVP
Lista clara de features do MVP. Separe MUST HAVE / SHOULD HAVE / NICE TO HAVE.

## 3. Stack Sugerido
Tabela com camada (frontend, backend, banco, auth, deploy, IA, integrações) e tecnologia recomendada com justificativa curta.

## 4. Arquitetura de Alto Nível
Componentes principais e como conversam.

## 5. Integrações Externas
APIs, serviços, gateways de pagamento, etc.

## 6. Estimativa de Esforço
Tabela com fase / entregáveis / estimativa em semanas.

## 7. Riscos Técnicos
3 a 5 riscos técnicos com mitigação.

## 8. Próximos Passos do Dev
Os 5 primeiros passos concretos para começar.`,

    briefing_design: `Produza o BRIEFING DE DESIGN E IDENTIDADE. Destinatário: Kalley (Designer).

# Briefing de Design — [título]

## 1. Posicionamento da Marca
Como o produto deve ser percebido no mercado.

## 2. Personalidade e Tom Visual
Adjetivos-chave (3 a 5), referências cromáticas, mood.

## 3. Paleta Sugerida
Tabela com cor primária, secundárias, neutros e semânticas. Hex incluído.

## 4. Tipografia
Família principal e secundária, com justificativa.

## 5. Sistema de Componentes
Estilo de botões, cards, tabelas, formulários, ícones.

## 6. Diretrizes de UI
Princípios para densidade, espaçamento, hierarquia visual.

## 7. Referências Visuais
3 a 5 referências (descritivas) que servem de norte.

## 8. Entregas Esperadas
Lista do que deve sair (logo, paleta, sistema, mockups, etc).`,

    briefing_growth: `Produza o BRIEFING DE GROWTH. Destinatários: Thiago (Growth), Leonardo (Tráfego Sr), Marco (Tráfego Jr).

# Briefing de Growth — [título]

## 1. Persona Prioritária
Quem é, onde está online, dores e gatilhos.

## 2. Jornada de Aquisição
Fluxo desde descoberta até pagamento.

## 3. Canais Recomendados
Tabela com canal / objetivo / responsável / KPI / orçamento sugerido.

## 4. Estratégia de Conteúdo
Pilares editoriais e cadência semanal.

## 5. Estratégia de Tráfego Pago
Plataformas, formatos, segmentação inicial e orçamento mensal sugerido.

## 6. Métricas e Metas (90 dias)
Tabela com métrica / meta / responsável.

## 7. Funil de Conversão
Etapas e taxas esperadas.

## 8. Próximas Ações
Os 5 primeiros movimentos.`,

    financial_model: `Produza o MODELO FINANCEIRO INICIAL. Use TABELAS Markdown estruturadas.

# Modelo Financeiro — [título]

## 1. Premissas
Lista de premissas (preço, conversão, churn, CAC, etc).

## 2. Projeção de Receita (12 meses)
Tabela MENSAL com colunas: Mês 1..12. Linhas: Novos clientes, Total de clientes, MRR, Receita única, Receita total.

## 3. Estrutura de Custos
Tabela com Custo / Tipo (fixo/variável) / Valor mensal / Justificativa.

## 4. Fluxo de Caixa Acumulado
Tabela mensal: Receita - Custo - Saldo Acumulado. Indique quando vira positivo.

## 5. Cenários
Cenário Conservador / Realista / Otimista — uma linha de receita anual e EBIT esperado para cada.

## 6. Investimento Inicial
Quanto precisa de capital para os primeiros 6 meses operarem.

## 7. Indicadores-Chave
LTV, CAC, LTV/CAC, Payback, Margem.

Use números aproximados e DEIXE EXPLÍCITO que são estimativas. Não invente faturamento de empresas reais.`,

    prospecting_script: `Produza o ROTEIRO DE PROSPECÇÃO. Foco em WhatsApp e LinkedIn.

# Roteiro de Prospecção — [título]

## 1. Critérios de ICP
Quem é alvo (cargo, segmento, porte) e quem NÃO é.

## 2. Onde Encontrar
Fontes de leads (LinkedIn, comunidades, eventos, listas).

## 3. Mensagem 1 — Primeiro Contato (LinkedIn)
Texto pronto, curto, com placeholders [NOME] [EMPRESA].

## 4. Mensagem 2 — Follow-up (3 dias depois)
Texto pronto.

## 5. Mensagem 3 — WhatsApp (após resposta)
Texto pronto.

## 6. Roteiro de Call Discovery (15 min)
Estrutura de perguntas e ordem.

## 7. Objeções Comuns + Respostas
Tabela: Objeção / Como Responder.

## 8. CTAs e Próximos Passos
Como avançar para fechamento.

REGRAS: tom direto, sem clichês de venda. Mensagens curtas. Sem emojis exceto se essencial pro canal.`,
  };

  return `${COMMON}\n\nCATEGORIA: ${category}\n\nTAREFA:\n${specific[type]}\n\nComece direto pelo título "# ..." sem preâmbulo.`;
}

export function buildArtifactUserPrompt(
  type: ArtifactType,
  studyMd: string,
  clientName?: string | null,
  title?: string | null
): string {
  return `Cliente: ${clientName || "—"}
Título do estudo: ${title || "—"}
Tipo de artefato: ${ARTIFACT_META[type].label}

═══ ESTUDO DO CLIENTE (referência) ═══

${studyMd}

═══════════════════════════════════════

Produza agora o ${ARTIFACT_META[type].label} usando o estudo acima como base. Seja específico, prático e tangível.`;
}
