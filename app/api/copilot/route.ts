import { NextResponse } from "next/server";
import { requireUser } from "@/lib/apiAuth";
import { COPILOT_TOOLS, runCopilotTool } from "@/lib/copilotTools";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_TURNS = 6;

const SYSTEM = `Você é o copiloto operacional do PRECEPTOR! Venture Studio, dentro do CRM.
Responda em PT-BR, direto e curto, como um sócio que conhece a operação.
Use SEMPRE as ferramentas para puxar dados reais antes de afirmar números. Nunca invente valores.
Valores monetários em reais (R$). Quando um custo de IA estiver marcado como estimado, deixe isso claro.
Se um dado não existir, diga que não há registro ainda em vez de chutar.
Seja objetivo: traga o número e uma leitura curta, não encha linguiça. Sem travessões na resposta.`;

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard) return guard;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return apiError(new Error("ANTHROPIC_API_KEY não configurada"), 500);

  try {
    const body = (await req.json()) as { messages?: ChatMsg[] };
    const incoming = Array.isArray(body.messages) ? body.messages : [];
    if (incoming.length === 0) return apiError(new Error("Sem mensagens"), 400);

    const model = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

    // Histórico no formato da Messages API. content pode virar array de blocos
    // (tool_use / tool_result) durante o loop.
    const messages: { role: string; content: unknown }[] = incoming
      .slice(-12)
      .map((m) => ({ role: m.role, content: String(m.content || "") }));

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const res = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model,
          max_tokens: 1500,
          system: SYSTEM,
          tools: COPILOT_TOOLS,
          messages,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return apiError(new Error(`Claude ${res.status}: ${errText.slice(0, 200)}`), 502);
      }

      const data = await res.json();
      const blocks: any[] = Array.isArray(data?.content) ? data.content : [];

      if (data?.stop_reason === "tool_use") {
        // Registra a vez do assistente (com os blocos tool_use) e executa.
        messages.push({ role: "assistant", content: blocks });
        const toolResults: any[] = [];
        for (const b of blocks) {
          if (b.type !== "tool_use") continue;
          let out: unknown;
          try {
            out = await runCopilotTool(b.name, (b.input as Record<string, unknown>) || {});
          } catch (e) {
            out = { erro: e instanceof Error ? e.message : "falha na ferramenta" };
          }
          toolResults.push({
            type: "tool_result",
            tool_use_id: b.id,
            content: JSON.stringify(out).slice(0, 12000),
          });
        }
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      // Resposta final.
      const text = blocks
        .filter((b) => b.type === "text")
        .map((b) => b.text || "")
        .join("\n")
        .trim();
      return NextResponse.json({ reply: text || "Não consegui formular uma resposta." });
    }

    return NextResponse.json({
      reply: "A consulta ficou longa demais. Tenta reformular de um jeito mais específico.",
    });
  } catch (e) {
    return apiError(e);
  }
}
