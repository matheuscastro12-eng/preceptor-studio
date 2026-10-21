/** @type {import('next').NextConfig} */

// CSP pragmática compatível com Next.js App Router.
// script-src precisa de 'unsafe-inline'/'unsafe-eval' (bootstrap/hydration do Next
// sem nonce). A defesa primária contra XSS de markdown é o DOMPurify; a CSP aqui
// é defesa em profundidade (bloqueia frame embedding, objetos, e restringe origens).
const ContentSecurityPolicy = [
  "default-src 'self'",
  // GA4 e Meta Pixel: só carregam após consentimento (components/ConsentManager.tsx).
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.facebook.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-core",
    "@sparticuz/chromium-min",
  ],
  // Painel de construcao do OPERA: /painel/<venture> serve o HTML publicado pela venture.
  // Páginas de segmento antigas saíram do site: manda para a home.
  async redirects() {
    return ["/agro", "/medicina", "/clinicas"].map((source) => ({ source, destination: "/", permanent: true }));
  },
  async rewrites() {
    return { beforeFiles: [{ source: "/painel/oasis-cte", destination: "/api/public/painel/oasis-cte" }, { source: "/painel/mtor", destination: "/api/public/painel/mtor" }] };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
