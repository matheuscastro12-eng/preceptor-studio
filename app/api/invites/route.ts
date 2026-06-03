import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";

const VALID_ROLES = ["owner", "admin", "member"] as const;
const VALID_TEAM_KEYS = [
  "matheus",
  "luciano",
  "ana_flavia",
  "thiago",
  "leonardo",
  "marco",
  "kalley",
] as const;

type Role = (typeof VALID_ROLES)[number];
type TeamKey = (typeof VALID_TEAM_KEYS)[number];

interface InviteRow {
  token: string;
  email: string | null;
  role: Role;
  team_key: TeamKey | null;
  used_by: string | null;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

async function requireOwnerOrAdmin() {
  const supabase = getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, error: "Não autenticado" };
  const admin = createSupabaseServiceClient();
  const { data } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (data?.role as Role | undefined) ?? "member";
  if (role !== "owner" && role !== "admin") {
    return { ok: false as const, status: 403, error: "Acesso restrito" };
  }
  return { ok: true as const, admin };
}

export async function GET() {
  const auth = await requireOwnerOrAdmin();
  if (!auth.ok) return apiError(auth.error, auth.status);
  try {
    const { data, error } = await auth.admin
      .from("invites")
      .select("*")
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ invites: (data ?? []) as InviteRow[] });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: Request) {
  const auth = await requireOwnerOrAdmin();
  if (!auth.ok) return apiError(auth.error, auth.status);
  try {
    const body = (await req.json()) as {
      email?: unknown;
      role?: unknown;
      team_key?: unknown;
    };

    const role: Role = VALID_ROLES.includes(body.role as Role)
      ? (body.role as Role)
      : "member";

    let team_key: TeamKey | null = null;
    if (
      typeof body.team_key === "string" &&
      VALID_TEAM_KEYS.includes(body.team_key as TeamKey)
    ) {
      team_key = body.team_key as TeamKey;
    }

    const email =
      typeof body.email === "string" && body.email.trim().length > 0
        ? body.email.trim().toLowerCase()
        : null;

    const { data, error } = await auth.admin
      .from("invites")
      .insert({ email, role, team_key })
      .select("*")
      .single();
    if (error) throw error;

    const invite = data as InviteRow;
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://preceptor.studio";
    const url = `${origin}/signup?token=${invite.token}`;
    return NextResponse.json({ invite, url });
  } catch (err) {
    return apiError(err);
  }
}
