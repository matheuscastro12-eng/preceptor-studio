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

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

interface PatchInput {
  name?: unknown;
  role?: unknown;
  team_key?: unknown;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError("Não autenticado", 401);

    const admin = createSupabaseServiceClient();
    const { data: me } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    const myRole = (me?.role as Role | undefined) ?? "member";
    const isOwner = myRole === "owner";
    const isSelf = user.id === params.id;

    const input = (await req.json()) as PatchInput;
    const update: Record<string, string | null> = {};

    if (typeof input.name === "string") {
      const trimmed = input.name.trim();
      if (trimmed.length > 0 && (isSelf || isOwner)) {
        update.name = trimmed;
      }
    }

    if (typeof input.role === "string") {
      if (!isOwner) return apiError("Apenas owner pode mudar papel", 403);
      if (!VALID_ROLES.includes(input.role as Role)) {
        return apiError("Papel inválido", 400);
      }
      update.role = input.role;
    }

    if ("team_key" in input) {
      if (!isOwner) return apiError("Apenas owner pode mudar team_key", 403);
      if (input.team_key === null || input.team_key === "") {
        update.team_key = null;
      } else if (
        typeof input.team_key === "string" &&
        VALID_TEAM_KEYS.includes(input.team_key as TeamKey)
      ) {
        update.team_key = input.team_key;
      } else {
        return apiError("team_key inválido", 400);
      }
    }

    if (Object.keys(update).length === 0) {
      return apiError("Nada a atualizar", 400);
    }

    const { data, error } = await admin
      .from("profiles")
      .update(update)
      .eq("id", params.id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (err) {
    return apiError(err);
  }
}
