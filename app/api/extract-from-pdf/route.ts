import { NextRequest, NextResponse } from "next/server";
import { getQuestions, LIKERT_OPTIONS } from "@/lib/questions";
import { callGemini, extractJSON } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { pdfText, category } = await req.json();

    if (!pdfText || typeof pdfText !== "string" || pdfText.length < 50) {
      return NextResponse.json(
        { error: "pdfText obrigatório (mínimo 50 caracteres)" },
        { status: 400 }
      );
    }
    if (!category) {
      return NextResponse.json(
        { error: "category obrigatória" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const questions = getQuestions(category);

    // Schema compacto para o prompt
    const schemaForPrompt = questions.map((q) => {
      const base: any = { id: q.id, type: q.type, question: q.question };
      if (q.options) base.options = q.options;
      if (q.allow_other) base.allow_other = true;
      if (q.type === "likert") base.scale = LIKERT_OPTIONS;
      return base;
    });

    const systemPrompt = `Você é um analista que lê documentos de projetos e mapeia informações pra um questionário estratégico.

Você receberá:
1. Um schema com perguntas (id, tipo, pergunta, opções quando aplicável)
2. Um texto extraído de PDF do projeto

Sua tarefa: para cada pergunta, retornar a resposta SE E SOMENTE SE o PDF fornece evidência clara. Caso contrário, retorne null.

REGRAS DE OUTPUT:
- Retorne APENAS JSON válido. Nada mais. Sem markdown, sem code fences.
- Schema: { "<question_id>": <resposta ou null>, ... }
- Tipos de resposta por type:
  - text_short / text_long → string (português, conciso, baseado no PDF)
  - number / currency → número (sem R$ ou %, apenas o valor)
  - single → string EXATAMENTE igual a uma das options
  - multi → array de strings, cada uma EXATAMENTE igual a uma das options
  - likert → string EXATAMENTE igual a uma de: ${LIKERT_OPTIONS.join(", ")}
- Se a pergunta tem allow_other:true e o PDF tem informação que não bate com nenhuma option → use "Outro: <texto curto>" (single) OU adicione "Outro: <texto>" no array (multi).

REGRAS CRÍTICAS:
- Se NÃO há evidência clara no PDF, retorne null. Não invente.
- Não infira a partir do tipo de empresa (ex: não chute "B2C" só porque é app — só responda se o PDF DIZ ou DESCREVE com clareza).
- Para likert: só responda se o PDF mostrar evidência OBJETIVA do nível de validação (ex: "já conversei com 50 clientes" → "Muito" para diag_conversou_clientes; "ainda em estágio de ideia" → "Muito pouco" para diag_validacao_pagamento).
- Em caso de dúvida, retorne null.

Comece a resposta DIRETO com "{". Termine com "}".`;

    const userPrompt = `═══ SCHEMA DO QUESTIONÁRIO ═══

${JSON.stringify(schemaForPrompt, null, 2)}

═══ TEXTO EXTRAÍDO DO PDF ═══

${pdfText.slice(0, 50000)}

═══════════════════════════════════════

Mapeie. Retorne apenas JSON.`;

    const result = await callGemini(systemPrompt, userPrompt, apiKey, {
      thinking: false,
      temperature: 0.2,
    });

    const suggestions = extractJSON(result.content) || {};

    // Sanitiza: garante que apenas IDs válidos passem e que tipos batam
    const validIds = new Set(questions.map((q) => q.id));
    const sanitized: Record<string, any> = {};
    for (const [k, v] of Object.entries(suggestions)) {
      if (!validIds.has(k)) continue;
      if (v === null || v === undefined || v === "") continue;
      sanitized[k] = v;
    }

    return NextResponse.json({
      success: true,
      suggestions: sanitized,
      filled_count: Object.keys(sanitized).length,
      total_count: questions.length,
    });
  } catch (err: any) {
    console.error("Erro ao extrair do PDF:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno" },
      { status: 500 }
    );
  }
}
