// Provider: Claude (Anthropic). Mantemos os nomes "gemini" nas exports para
// não quebrar os ~20 call sites; internamente tudo chama a Messages API da Anthropic.
const DEFAULT_MODEL = "claude-sonnet-4-6";
const FALLBACK_MODEL = "claude-haiku-4-5";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

function getModel() {
  return process.env.CLAUDE_MODEL || process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

function getFallbackModel() {
  return (
    process.env.CLAUDE_FALLBACK_MODEL ||
    process.env.GEMINI_FALLBACK_MODEL ||
    FALLBACK_MODEL
  );
}

export const SCORES_RE = /<!--\s*SCORES_JSON\s*([\s\S]*?)\s*SCORES_JSON\s*-->/;
export const INSIGHTS_RE = /<!--\s*INSIGHTS_JSON\s*([\s\S]*?)\s*INSIGHTS_JSON\s*-->/;

export interface GeminiResult {
  content: string;
  usage: any;
  model_used?: string;
}

export interface GeminiCallConfig {
  temperature?: number;
  maxOutputTokens?: number;
  thinking?: boolean;
  primaryModel?: string;
  fallbackModel?: string;
  primaryTimeoutMs?: number;
  fallbackTimeoutMs?: number;
}

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

async function callOnce(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  config: { temperature?: number; maxOutputTokens?: number; thinking?: boolean; timeoutMs?: number }
): Promise<{ content: string; usage: any; status: number; finishReason?: string }> {
  // Opus 4.8 / Sonnet 4.6: nada de temperature/top_p (retorna 400) e thinking
  // só no modo adaptive. max_tokens precisa acomodar o thinking + a saída.
  const body: any = {
    model,
    max_tokens: config.maxOutputTokens ?? 32768,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  };

  if (config.thinking !== false) {
    body.thinking = { type: "adaptive" };
  }

  const controller = new AbortController();
  // Claude Opus + thinking é mais lento que o Gemini Flash; damos folga (as
  // rotas pesadas têm maxDuration 120s).
  const timeoutMs = config.timeoutMs ?? 110000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(timer);
    if (e.name === "AbortError") {
      const err: any = new Error(`Claude ${model} timeout após ${timeoutMs}ms`);
      err.retryable = true;
      throw err;
    }
    throw e;
  }
  clearTimeout(timer);

  if (!res.ok) {
    const errText = await res.text();
    const err: any = new Error(`Claude ${res.status}: ${errText.slice(0, 300)}`);
    err.status = res.status;
    err.retryable = RETRYABLE_STATUSES.has(res.status);
    throw err;
  }

  const data = await res.json();
  const stopReason: string | undefined = data?.stop_reason;
  const content =
    (Array.isArray(data?.content) ? data.content : [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text || "")
      .join("\n") || "";

  // Recusa por segurança/política: erro terminal, não adianta retry.
  if (stopReason === "refusal") {
    const detail = data?.stop_details?.explanation || "";
    const err: any = new Error(`Claude recusou a resposta (refusal). ${detail}`.trim());
    err.retryable = false;
    throw err;
  }

  // Resposta truncada por limite de tokens: marca como retryable (o fallback
  // pode ter mais espaço) e nunca entrega estudo cortado como se fosse completo.
  if (stopReason === "max_tokens") {
    const err: any = new Error(
      `Claude ${model} truncou a resposta (max_tokens). Conteúdo incompleto.`
    );
    err.retryable = true;
    err.truncated = true;
    throw err;
  }

  return {
    content,
    usage: data?.usage || null,
    status: res.status,
    finishReason: stopReason,
  };
}

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  config: GeminiCallConfig = {}
): Promise<GeminiResult> {
  const primary = config.primaryModel || getModel();
  const fallback = config.fallbackModel || getFallbackModel();
  // A chave da Anthropic tem prioridade; o param `apiKey` (legado, vinha do
  // GOOGLE_API_KEY) só é usado como fallback.
  const key = process.env.ANTHROPIC_API_KEY || apiKey;

  try {
    const r = await callOnce(primary, systemPrompt, userPrompt, key, {
      ...config,
      timeoutMs: config.primaryTimeoutMs ?? 110000,
    });
    return { content: r.content, usage: r.usage, model_used: primary };
  } catch (e: any) {
    if (!e.retryable || primary === fallback) {
      throw e;
    }
    try {
      const r = await callOnce(fallback, systemPrompt, userPrompt, key, {
        ...config,
        thinking: false,
        timeoutMs: config.fallbackTimeoutMs ?? 55000,
      });
      return { content: r.content, usage: r.usage, model_used: fallback };
    } catch (e2: any) {
      throw new Error(
        `Primário (${primary}) falhou: ${e.message}. Fallback (${fallback}) também falhou: ${e2.message}`
      );
    }
  }
}

export function extractScores(markdown: string): { md: string; scores: any } {
  const match = markdown.match(SCORES_RE);
  if (!match) return { md: markdown, scores: null };
  try {
    const scores = JSON.parse(match[1].trim());
    const md = markdown.replace(SCORES_RE, "").trim();
    return { md, scores };
  } catch {
    return { md: markdown, scores: null };
  }
}

export function extractInsights(markdown: string): { md: string; insights: any[] | null } {
  const match = markdown.match(INSIGHTS_RE);
  if (!match) return { md: markdown, insights: null };
  try {
    const insights = JSON.parse(match[1].trim());
    const md = markdown.replace(INSIGHTS_RE, "").trim();
    return { md, insights: Array.isArray(insights) ? insights : null };
  } catch {
    return { md: markdown, insights: null };
  }
}

export function extractJSON(content: string): any | null {
  const cleaned = content.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let start = -1;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket))
    start = firstBrace;
  else if (firstBracket !== -1) start = firstBracket;
  if (start === -1) return null;
  const lastBrace = cleaned.lastIndexOf("}");
  const lastBracket = cleaned.lastIndexOf("]");
  const end = Math.max(lastBrace, lastBracket);
  if (end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function getGeminiModelName() {
  return getModel();
}

export const GEMINI_MODEL_NAME = getModel();
