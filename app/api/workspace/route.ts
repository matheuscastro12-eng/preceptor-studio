import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface WorkspaceSettings {
  id: string;
  slack_digest_webhook: string | null;
  calcom_url: string | null;
  studio_name: string | null;
  studio_email: string | null;
  updated_at: string;
}

interface ProfileRoleRow {
  role: "owner" | "admin" | "member";
}

const ALLOWED_FIELDS = [
  "slack_digest_webhook",
  "calcom_url",
  "studio_name",
  "studio_email",
] as const;

type AllowedField = (typeof ALLOWED_FIELDS)[number];

function pickPatch(body: Record<string, unknown>): Partial<Record<AllowedField, string | null>> {
  const out: Partial<Record<AllowedField, string | null>> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) {
      const value = body[key];
      if (value === null || value === undefined || value === "") {
        out[key] = null;
      } else if (typeof value === "string") {
        out[key] = value.trim();
      }
    }
  }
  return out;
}

export async function GET() {
  try {
    const sb = getServerSupabase();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from("workspace_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error) throw error;

    const row = (data || {
      id: "default",
      slack_digest_webhook: null,
      calcom_url: null,
      studio_name: null,
      studio_email: null,
      updated_at: new Date().toISOString(),
    }) as WorkspaceSettings;

    return NextResponse.json({ settings: row });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const sb = getServerSupabase();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const admin = createSupabaseServiceClient();
    const { data: profile, error: pErr } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (pErr) throw pErr;

    const role = (profile as ProfileRoleRow | null)?.role;
    if (role !== "owner" && role !== "admin") {
      return NextResponse.json(
        { error: "Apenas owner ou admin pode atualizar workspace." },
        { status: 403 }
      );
    }

    const body = (await req.json()) as Record<string, unknown>;
    const patch = pickPatch(body);
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
    }

    const { data, error } = await admin
      .from("workspace_settings")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", "default")
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ settings: data as WorkspaceSettings });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
