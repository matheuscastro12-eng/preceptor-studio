import { createSupabaseServiceClient } from "@/lib/supabase";

// Rate limit por IP usando a tabela public_rate_limit.
// A chave é "bucket:ip" para permitir limites diferentes por rota sem migration.

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
}

// Retorna ok=false quando o limite foi excedido na janela.
// Falha "aberto" (ok=true) se o banco não responder, para nunca derrubar a rota
// por causa do rate limiter.
export async function checkRateLimit(
  bucket: string,
  ip: string,
  maxHits: number,
  windowHours: number
): Promise<RateLimitResult> {
  if (!ip || ip === "unknown") return { ok: true, remaining: maxHits };

  const key = `${bucket}:${ip}`;
  const windowMs = windowHours * 60 * 60 * 1000;
  const nowIso = new Date().toISOString();

  try {
    const sb = createSupabaseServiceClient();
    const { data: rl } = await sb
      .from("public_rate_limit")
      .select("ip, hits, window_start")
      .eq("ip", key)
      .maybeSingle();

    if (!rl) {
      await sb.from("public_rate_limit").insert({ ip: key, hits: 1, window_start: nowIso });
      return { ok: true, remaining: maxHits - 1 };
    }

    const elapsed = Date.now() - new Date(rl.window_start as string).getTime();
    if (elapsed > windowMs) {
      await sb
        .from("public_rate_limit")
        .update({ hits: 1, window_start: nowIso })
        .eq("ip", key);
      return { ok: true, remaining: maxHits - 1 };
    }

    const hits = rl.hits as number;
    if (hits >= maxHits) {
      return { ok: false, remaining: 0 };
    }

    await sb
      .from("public_rate_limit")
      .update({ hits: hits + 1 })
      .eq("ip", key);
    return { ok: true, remaining: maxHits - hits - 1 };
  } catch {
    return { ok: true, remaining: maxHits };
  }
}

// Helper que já devolve a Response 429 quando estourar.
export async function enforceRateLimit(
  req: Request,
  bucket: string,
  maxHits: number,
  windowHours: number
): Promise<Response | null> {
  const ip = getClientIp(req);
  const result = await checkRateLimit(bucket, ip, maxHits, windowHours);
  if (!result.ok) {
    return new Response(
      JSON.stringify({ error: "Muitas requisições. Tente novamente mais tarde." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }
  return null;
}
