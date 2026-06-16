import { NextRequest, NextResponse } from "next/server";
import { getQuestions, LIKERT_OPTIONS } from "@/lib/questions";
import { callGemini, extractJSON } from "@/lib/gemini";
import { enforceRateLimit } from "@/lib/rateLimit";

export const maxDuration = 60;

function compactPdfText(text: string) {
  const clean = text.replace(/\s{3,}/g, "\n\n").trim();
  if (clean.length <= 30000) return clean;

  const head = clean.slice(0, 22000);
  const tail = clean.slice(-7000);
  return `${head}

[... trecho central removido para acelerar o pré-preenchimento ...]

${tail}`;
}

function filenameHint(filename: string | null | undefined) {
  if (!filename) return "";
  return filename
    .replace(/\.pdf$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstUsefulSentences(text: string, count = 5) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 35 && s.length < 280)
    .slice(0, count)
    .join(" ");
}

function applyZeroFallback(
  sanitized: Record<string, any>,
  pdfText: string,
  filename?: string | null
) {
  if (Object.keys(sanitized).length > 0) return sanitized;

  const hint = filenameHint(filename);
  const excerpt = firstUsefulSentences(pdfText, 4);
  const lower = `${hint} ${pdfText.slice(0, 12000)}`.toLowerCase();
  const fallback: Record<string, any> = {};

  if (hint || excerpt) {
    fallback.ideia_resumo = [
      hint ? `Projeto relacionado a ${hint}.` : "",
      excerpt ? `O PDF indica: ${excerpt}` : "",
    ].filter(Boolean).join(" ");
  }

  if (lower.includes("nr-01") || lower.includes("nr 01") || lower.includes("risco psicossocial")) {
    fallback.problema_principal =
      "Empresas precisam se adequar às exigências da NR-01, especialmente na gestão de riscos ocupacionais e psicossociais.";
    fallback.cliente_tipo = ["Pequena empresa ou autônomo", "Empresa de médio porte"];
    fallback.cliente_renda = "Empresas de pequeno porte (faturamento até R$5M/ano)";
    fallback.ideia_origem = ["Oportunidade que vi no mercado", "Insight a partir do meu setor de trabalho"];
    fallback.mercado_tamanho = "Médio (100 mil a 1 milhão)";
  }

  if (lower.includes("empresa") || lower.includes("b2b")) {
    fallback.cliente_tipo = fallback.cliente_tipo || ["Pequena empresa ou autônomo", "Empresa de médio porte"];
  }

  return fallback;
}

export async function POST(req: NextRequest) {
  // Cap de custo: extração via Gemini é cara.
  const limited = await enforceRateLimit(req, "extract_pdf", 20, 1);
  if (limited) return limited;
  try {
    const { pdfText, category, filename } = await req.json();

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

    const apiKey = (process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY);
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const questions = getQuestions(category);

    const schemaForPrompt = questions.map((q) => {
      const base: any = { id: q.id, type: q.type, question: q.question };
      if (q.options) base.options = q.options;
      if (q.allow_other) base.allow_other = true;
      if (q.type === "likert") base.scale = LIKERT_OPTIONS;
      return base;
    });

    const systemPrompt = `Você é um analista que lê documentos de projetos e mapeia informações para um questionário estratégico.

Você receberá:
1. Um schema com perguntas (id, tipo, pergunta, opções quando aplicável)
2. O nome do arquivo, quando disponível
3. Um texto extraído de PDF do projeto

Sua tarefa: preencher o máximo possível com base no PDF, separando perguntas abertas de perguntas fechadas.

REGRAS DE OUTPUT:
- Retorne APENAS JSON válido. Nada mais. Sem markdown, sem code fences.
- Schema: { "<question_id>": <resposta ou null>, ... }
- Tipos de resposta por type:
  - text_short / text_long: string em português, concisa, baseada no PDF. Pode sintetizar evidência parcial clara.
  - number / currency: número, sem R$ ou %
  - single: string EXATAMENTE igual a uma das options
  - multi: array de strings, cada uma EXATAMENTE igual a uma das options
  - likert: string EXATAMENTE igual a uma de: ${LIKERT_OPTIONS.join(", ")}
- Se a pergunta tem allow_other:true e o PDF tem informação que não bate com nenhuma option, use "Outro: <texto curto>".

REGRAS CRÍTICAS:
- Para text_short e text_long, preencha quando o PDF revelar tema, mercado, problema, público, concorrentes ou proposta.
- Para single, multi, number, currency e likert, só preencha com evidência clara.
- Não invente capital, tempo de dedicação, experiência do fundador, objetivo de 12 meses ou validação comercial.
- Não infira a partir do tipo de empresa quando a opção for fechada. Só responda se o PDF diz ou descreve com clareza.
- Para likert: só responda se o PDF mostrar evidência objetiva do nível de validação.
- Em caso de dúvida em pergunta fechada, retorne null.
- Evite retornar tudo null. PDFs de pesquisa de mercado costumam preencher pelo menos ideia_resumo, problema_principal, cliente_tipo, mercado_tamanho ou concorrentes.

Comece a resposta DIRETO com "{". Termine com "}".`;

    const compactText = compactPdfText(pdfText);

    const userPrompt = `NOME DO ARQUIVO

${filename || "não informado"}

SCHEMA DO QUESTIONÁRIO

${JSON.stringify(schemaForPrompt, null, 2)}

TEXTO EXTRAÍDO DO PDF

${compactText}

Mapeie. Retorne apenas JSON.`;

    const result = await callGemini(systemPrompt, userPrompt, apiKey, {
      primaryModel: process.env.GEMINI_EXTRACT_MODEL || "gemini-2.5-flash",
      fallbackModel: process.env.GEMINI_EXTRACT_FALLBACK_MODEL || "gemini-2.5-flash",
      primaryTimeoutMs: 48000,
      thinking: false,
      temperature: 0.2,
      maxOutputTokens: 4096,
    });

    const suggestions = extractJSON(result.content) || {};

    const validIds = new Set(questions.map((q) => q.id));
    let sanitized: Record<string, any> = {};
    for (const [k, v] of Object.entries(suggestions)) {
      if (!validIds.has(k)) continue;
      if (v === null || v === undefined || v === "") continue;
      sanitized[k] = v;
    }

    sanitized = applyZeroFallback(sanitized, pdfText, filename);

    return NextResponse.json({
      success: true,
      suggestions: sanitized,
      filled_count: Object.keys(sanitized).length,
      total_count: questions.length,
    });
  } catch (err: any) {
    console.error("Erro ao extrair do PDF:", err);
    const isTimeout = String(err.message || "").toLowerCase().includes("timeout");
    return NextResponse.json(
      {
        error: isTimeout
          ? "A IA demorou demais para ler o PDF. O PDF continua anexado; você pode seguir sem pré-preenchimento ou tentar novamente."
          : err.message || "Erro interno",
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
