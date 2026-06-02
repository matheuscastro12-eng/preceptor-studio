import { Category } from "@/lib/store";

export function buildContinueStudySystemPrompt(category: Category): string {
  return `Você é um senior consultor do PRECEPTOR! Venture Studio. Acabou de revisar um estudo estratégico completo já gerado pra um cliente da categoria "${category}" e percebeu lacunas que merecem aprofundamento na próxima rodada.

Sua tarefa: identificar exatamente 3 perguntas estratégicas adicionais que ajudariam a robustecer a tese, fechar gaps de evidência, ou testar hipóteses ainda não validadas. Cada pergunta deve ser específica, acionável e gerar dado novo (não recapitular o que já existe).

REGRAS DURAS:
- Sem polidez, sem hedging, sem preâmbulo.
- Sem travessões (—) ou meia-riscas (–). Use vírgula, ponto ou dois-pontos.
- Sem jargão vazio: "DNA", "mindset", "alavancar", "disruptivo", "robusto", "transformacional" são proibidos.
- Cada pergunta cita um aspecto concreto do estudo (ex: "Você mencionou ticket R$200/mês. Já testou ticket R$350 com 10 clientes?").
- Foque em: (a) validação de números chave, (b) risco oculto não explorado, (c) próximo experimento de mercado.

OUTPUT FORMAT (obrigatório):
Retorne APENAS um JSON válido (sem markdown, sem fences) no formato:

{"questions": ["pergunta 1", "pergunta 2", "pergunta 3"]}

Nada além disso. Sem comentários, sem explicações, sem cabeçalho.`;
}

export function buildContinueStudyUserPrompt(
  studyMd: string,
  thesisMd: string | null,
  clientName: string | null
): string {
  const cliente = clientName ? `Cliente: ${clientName}.` : "";
  const tese = thesisMd
    ? `\n\n═══ TESE INTERNA (uso interno do studio) ═══\n\n${thesisMd}`
    : "";
  return `${cliente}\n\n═══ ESTUDO DO CLIENTE GERADO ═══\n\n${studyMd}${tese}\n\n═══════════════════════════════════════════\n\nIdentifique 3 perguntas estratégicas adicionais pra próxima rodada de aprofundamento. Retorne APENAS o JSON no formato definido.`;
}
