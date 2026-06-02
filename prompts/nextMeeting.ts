export interface NextMeetingContext {
  studyTitle: string;
  clientName: string | null;
  category: string;
  answersText: string;
  unansweredQuestions: string;
  diagnosticSummary: string;
  lastDraftMd: string | null;
  outputMd: string | null;
}

export function buildNextMeetingAgendaSystemPrompt(): string {
  return `Você é o head de operações da PRECEPTOR! Venture Studio organizando a próxima sessão de trabalho com um cliente. Sua função é montar a pauta da próxima reunião: prática, sem perfumaria, focada em destravar decisão.

REGRAS DE LINGUAGEM:
- Português brasileiro. Direto e operacional.
- Sem travessões (—) ou meia-riscas (–). Use vírgulas, pontos, dois-pontos ou parênteses.
- Sem clichês de consultoria. Sem "alinhar expectativas", sem "jornada", sem "sinergia".
- PRECEPTOR! sempre com o ponto de exclamação.
- Markdown puro, sem preâmbulo. Comece direto no primeiro título.

ESTRUTURA OBRIGATÓRIA:

## Pauta sugerida (45 min)
Lista numerada com 5 a 6 tópicos. Cada tópico no formato: **Tópico (X min):** descrição em 1 frase. O total dos minutos soma exatamente 45.

## Material pra cliente preparar
Lista bulletada com exatamente 3 itens objetivos que o cliente traz pronto pra reunião.

## Que decisão a gente quer fechar nesta reunião
Uma única linha. Frase declarativa, sem rodeio. Começa com "Fechar" ou "Definir" ou "Validar".

REGRAS FINAIS:
- Use o contexto pra mirar nos buracos reais do estudo, não em itens genéricos.
- Se houver perguntas em aberto vindas do último resumo, priorize-as.
- Não invente entregáveis que não estão no escopo do PRECEPTOR! (estudo, marca, comercial, execução, tese).`;
}

export function buildNextMeetingAgendaUserPrompt(ctx: NextMeetingContext): string {
  const parts: string[] = [];
  parts.push(`Cliente: ${ctx.clientName || "(sem nome cadastrado)"}`);
  parts.push(`Projeto: ${ctx.studyTitle}`);
  parts.push(`Categoria: ${ctx.category}`);
  parts.push("");
  if (ctx.answersText) {
    parts.push("═══ RESPOSTAS REGISTRADAS ═══");
    parts.push(ctx.answersText);
    parts.push("");
  }
  if (ctx.unansweredQuestions) {
    parts.push("═══ PERGUNTAS AINDA SEM RESPOSTA ═══");
    parts.push(ctx.unansweredQuestions);
    parts.push("");
  }
  if (ctx.diagnosticSummary) {
    parts.push("═══ DIAGNÓSTICO RESUMIDO ═══");
    parts.push(ctx.diagnosticSummary);
    parts.push("");
  }
  if (ctx.lastDraftMd) {
    parts.push("═══ ÚLTIMO RESUMO EXECUTIVO (use os próximos passos e perguntas em aberto) ═══");
    parts.push(ctx.lastDraftMd.slice(0, 4000));
    parts.push("");
  }
  if (ctx.outputMd) {
    parts.push("═══ ESTUDO DO CLIENTE (recorte) ═══");
    parts.push(ctx.outputMd.slice(0, 4000));
    parts.push("");
  }
  parts.push(
    "Produza a pauta da próxima reunião seguindo a estrutura definida no system prompt. Markdown puro."
  );
  return parts.join("\n");
}
