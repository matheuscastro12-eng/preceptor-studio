// ════════════════════════════════════════════════════════════════════════════
// PRECEPTOR! Studio — Prompts do Copiloto IA (modo entrevista)
// ════════════════════════════════════════════════════════════════════════════
//
// Helpers de prompt para o painel lateral "COPILOTO IA". Cada função monta
// um par (system, user) curto para Gemini Flash. As respostas são curtas e
// objetivas — uma chamada por clique de botão, sem polling.

import type { Category } from "@/lib/questions";

const PERSONA = `Você é consultor sênior do PRECEPTOR! Studio (venture studio brasileiro), acompanhando ao vivo uma reunião comercial entre o time comercial e um possível cliente. O comercial conduz a entrevista e você sussurra dicas. Escreve em português brasileiro, direto, sem travessões nem meia-riscas, sem floreios.`;

function categoryLabel(category: Category): string {
  return (
    {
      saude: "Saúde",
      educacao: "Educação",
      juridico: "Jurídico",
      tech: "Tech",
      outro: "Outro Setor",
    }[category] || "Outro Setor"
  );
}

function truncate(text: string, max = 800): string {
  const t = (text || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max) + "...";
}

function formatContext(
  contextAnswers: Record<string, string> | undefined,
  limit = 6
): string {
  if (!contextAnswers) return "(sem contexto prévio relevante)";
  const entries = Object.entries(contextAnswers)
    .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
    .slice(-limit);
  if (entries.length === 0) return "(sem contexto prévio relevante)";
  return entries
    .map(([k, v]) => `- ${k}: ${truncate(v, 200)}`)
    .join("\n");
}

// ─── FOLLOW-UP ────────────────────────────────────────────────────────────
export function buildFollowUpPrompt(
  category: Category,
  questionText: string,
  answer: string,
  contextAnswers?: Record<string, string>
): { system: string; user: string } {
  const system = `${PERSONA}

Sua tarefa: sugerir UMA pergunta de follow-up para o comercial fazer ao cliente agora. A pergunta deve aprofundar a resposta atual e revelar algo concreto (número, exemplo, decisão, mecanismo). Uma frase só, sem listas, sem prefixos como "Pergunta:". Sem travessão.`;

  const user = `Setor do estudo: ${categoryLabel(category)}

Contexto prévio (respostas mais recentes do cliente):
${formatContext(contextAnswers)}

Pergunta que o comercial acabou de fazer:
"${truncate(questionText, 400)}"

Resposta do cliente:
"${truncate(answer, 800)}"

Sugira UMA pergunta de follow-up curta e concreta, em uma única linha.`;

  return { system, user };
}

// ─── VAGUENESS ────────────────────────────────────────────────────────────
export function buildVaguenessPrompt(
  questionText: string,
  answer: string
): { system: string; user: string } {
  const system = `${PERSONA}

Sua tarefa: avaliar se a resposta do cliente está vaga ou concreta. Vaga = não tem número, exemplo específico, mecanismo, nome, prazo ou decisão. Concreta = tem pelo menos um desses elementos verificáveis.

Responda APENAS com um JSON válido neste formato exato:
{"vague": true|false, "why": "motivo curto em uma frase, sem travessão"}

Se a resposta for concreta, retorne {"vague": false, "why": ""}. Não inclua nada fora do JSON.`;

  const user = `Pergunta:
"${truncate(questionText, 400)}"

Resposta do cliente:
"${truncate(answer, 1000)}"

Avalie.`;

  return { system, user };
}

// ─── ADJACENT TOPICS ──────────────────────────────────────────────────────
export function buildAdjacentTopicsPrompt(
  category: Category,
  questionText: string,
  answer: string
): { system: string; user: string } {
  const system = `${PERSONA}

Sua tarefa: sugerir 3 tópicos adjacentes (relacionados mas ainda não cobertos) que o comercial poderia explorar a seguir, baseado no que o cliente acabou de dizer. Cada tópico em 4 a 8 palavras, sem travessão, sem prefixo numérico.

Responda APENAS com um JSON válido neste formato exato:
{"topics": ["tópico 1", "tópico 2", "tópico 3"]}

Não inclua nada fora do JSON.`;

  const user = `Setor: ${categoryLabel(category)}

Pergunta atual:
"${truncate(questionText, 400)}"

Resposta do cliente:
"${truncate(answer, 800)}"

Liste 3 tópicos adjacentes a explorar.`;

  return { system, user };
}
