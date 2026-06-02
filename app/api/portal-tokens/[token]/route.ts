import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

export async function DELETE(
  _req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase
      .from("client_portal_tokens")
      .update({ expires_at: new Date().toISOString() })
      .eq("token", params.token);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
