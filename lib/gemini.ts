const DEFAULT_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-pro";

function getModel() {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

function getFallbackModel() {
  return process.env.GEMINI_FALLBACK_MODEL || FALLBACK_MODEL;
}

function getUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
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
  const body: any = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: config.temperature ?? 0.7,
      maxOutputTokens: config.maxOutputTokens ?? 32768,
    },
  };

  if (config.thinking !== false) {
    body.generationConfig.thinkingConfig = { thinkingBudget: -1 };
  } else if (!model.includes("pro")) {
    body.generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  const controller = new AbortController();
  const timeoutMs = config.timeoutMs ?? 55000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${getUrl(model)}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(timer);
    if (e.name === "AbortError") {
      const err: any = new Error(`Gemini ${model} timeout após ${timeoutMs}ms`);
      err.retryable = true;
      throw err;
    }
    throw e;
  }
  clearTimeout(timer);

  if (!res.ok) {
    const errText = await res.text();
    const err: any = new Error(`Gemini ${res.status}: ${errText.slice(0, 300)}`);
    err.status = res.status;
    err.retryable = RETRYABLE_STATUSES.has(res.status);
    throw err;
  }

  const data = await res.json();
  const candidate = data?.candidates?.[0];
  const finishReason: string | undefined = candidate?.finishReason;
  const content =
    candidate?.content?.parts?.map((p: any) => p.text || "").join("\n") || "";

  // Bloqueio por segurança/política: erro terminal, não adianta retry.
  if (finishReason === "SAFETY" || finishReason === "RECITATION" || finishReason === "BLOCKLIST") {
    const err: any = new Error(`Gemini bloqueou a resposta (${finishReason}).`);
    err.retryable = false;
    throw err;
  }

  // Resposta truncada por limite de tokens: marca como retryable (o fallback
  // pode ter mais espaço) e nunca entrega estudo cortado como se fosse completo.
  if (finishReason === "MAX_TOKENS" || finishReason === "LENGTH") {
    const err: any = new Error(
      `Gemini ${model} truncou a resposta (${finishReason}). Conteúdo incompleto.`
    );
    err.retryable = true;
    err.truncated = true;
    throw err;
  }

  return {
    content,
    usage: data?.usageMetadata || null,
    status: res.status,
    finishReason,
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

  try {
    const r = await callOnce(primary, systemPrompt, userPrompt, apiKey, {
      ...config,
      timeoutMs: config.primaryTimeoutMs ?? 55000,
    });
    return { content: r.content, usage: r.usage, model_used: primary };
  } catch (e: any) {
    if (!e.retryable || primary === fallback) {
      throw e;
    }
    try {
      const r = await callOnce(fallback, systemPrompt, userPrompt, apiKey, {
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
