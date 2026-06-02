import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

interface BulkBody {
  ids: string[];
  patch: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BulkBody;
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json({ error: "ids inválidos" }, { status: 400 });
    }
    if (!body.patch || typeof body.patch !== "object") {
      return NextResponse.json({ error: "patch inválido" }, { status: 400 });
    }
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("leads")
      .update(body.patch)
      .in("id", body.ids)
      .select("*");
    if (error) throw error;
    return NextResponse.json({ updated: data?.length || 0 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
