import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

// Match `/api/leads/<id>/request-contact` (public endpoint for diagnostic flow).
const PUBLIC_LEAD_CONTACT_RE = /^\/api\/leads\/[^/]+\/request-contact\/?$/;

function isPublicApi(pathname: string) {
  return (
    pathname.startsWith("/api/public/") ||
    pathname.startsWith("/api/auth/callback") ||
    pathname.startsWith("/api/auth/redeem-invite") ||
    pathname.startsWith("/api/portal/") ||
    pathname.startsWith("/api/ab/track") ||
    PUBLIC_LEAD_CONTACT_RE.test(pathname)
  );
}

const ADMIN_API_PATTERNS = [
  /^\/api\/studies(\/|$)/,
  /^\/api\/leads(\/|$)/,
  /^\/api\/tasks(\/|$)/,
  /^\/api\/upload-pdf/,
  /^\/api\/extract-from-pdf/,
  /^\/api\/clients(\/|$)/,
  /^\/api\/portal-tokens(\/|$)/,
  /^\/api\/finance(\/|$)/,
  /^\/api\/workspace(\/|$)/,
  /^\/api\/invites(\/|$)/,
  /^\/api\/profiles(\/|$)/,
];

// Rotas cujo acesso (incluindo GET) exige autenticação, não só mutações.
const FULLY_GATED_API_PREFIXES = [
  "/api/studies",
  "/api/upload-pdf",
  "/api/extract-from-pdf",
  "/api/finance",
  "/api/workspace",
  "/api/invites",
  "/api/profiles",
];

const MUTATION_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always refresh the Supabase session cookies.
  const { response, user } = await updateSession(req);

  // Always public routes.
  if (
    pathname.startsWith("/diagnostico") ||
    pathname.startsWith("/share/") ||
    pathname.startsWith("/portal/") ||
    PUBLIC_PATHS.includes(pathname) ||
    isPublicApi(pathname)
  ) {
    return response;
  }

  // Dashboard UI requires authentication.
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Gated API routes.
  const method = req.method.toUpperCase();
  const matchesAdminApi = ADMIN_API_PATTERNS.some((re) => re.test(pathname));
  if (matchesAdminApi) {
    const isMutation = MUTATION_METHODS.has(method);
    // Fully gated routes: every method (GET incluído). Demais: só mutações.
    const isFullyGated = FULLY_GATED_API_PREFIXES.some((p) => pathname.startsWith(p));
    const requiresAuth = isFullyGated || isMutation;
    if (requiresAuth && !user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/share/:path*",
    "/portal/:path*",
    "/diagnostico/:path*",
  ],
};
