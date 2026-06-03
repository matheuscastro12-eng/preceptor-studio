import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";

const VALID_TYPES = new Set([
  "diagnostic",
  "study",
  "brand",
  "commercial",
  "execution",
  "thesis",
  "slides",
  "artifact",
]);

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getServerSupabase();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    const supabase = createSupabaseServiceClient();
    let q = supabase
      .from("output_versions")
      .select("id, study_id, output_type, metadata, created_at, content_md")
      .eq("study_id", params.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (type) q = q.eq("output_type", type);

    const { data, error } = await q;
    if (error) throw error;

    const versions = (data || []).map((v: Record<string, unknown>) => ({
      id: v.id,
      study_id: v.study_id,
      output_type: v.output_type,
      metadata: v.metadata,
      created_at: v.created_at,
      preview: typeof v.content_md === "string" ? (v.content_md as string).slice(0, 80) : "",
    }));
    return NextResponse.json({ versions });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getServerSupabase();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = (await req.json()) as {
      output_type?: string;
      content_md?: string | null;
      content_json?: Record<string, unknown> | null;
      metadata?: Record<string, unknown> | null;
    };

    if (!body.output_type || !VALID_TYPES.has(body.output_type)) {
      return NextResponse.json({ error: "output_type inválido" }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("output_versions")
      .insert({
        study_id: params.id,
        output_type: body.output_type,
        content_md: body.content_md ?? null,
        content_json: body.content_json ?? null,
        metadata: body.metadata ?? {},
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ version: data });
  } catch (error) {
    return apiError(error);
  }
}
