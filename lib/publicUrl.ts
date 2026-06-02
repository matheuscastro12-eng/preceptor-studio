// Resolve a URL pública estável para links compartilháveis (convites, portal, share).
// Ordem de prioridade:
//  1. NEXT_PUBLIC_APP_URL (configurado em produção, ignorado se for localhost)
//  2. NEXT_PUBLIC_SITE_URL (idem)
//  3. VERCEL_PROJECT_PRODUCTION_URL (alias estável do projeto na Vercel)
//  4. VERCEL_URL (URL do deploy atual; nem sempre é o domínio público, mas serve)
//  5. origin do request (fallback de último caso)
//  6. https://preceptor.studio (fallback hardcoded)

const FALLBACK = "https://preceptor.studio";

function clean(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Ignora URLs locais que vazam de sessões de dev
  if (/localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(trimmed)) return null;
  // Aceita "preceptor.studio" sem protocolo
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed.replace(/^\/+/, "")}`;
  return trimmed.replace(/\/+$/, "");
}

export function getPublicAppUrl(req?: Request | { headers: Headers }): string {
  const envCandidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];
  for (const c of envCandidates) {
    const v = clean(c);
    if (v) return v;
  }
  if (req) {
    const origin = req.headers.get("origin");
    const v = clean(origin);
    if (v) return v;
  }
  return FALLBACK;
}

// Constrói uma URL absoluta no app público, garantindo / no início do path.
export function buildPublicUrl(req: Request | { headers: Headers }, path: string): string {
  const base = getPublicAppUrl(req);
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
