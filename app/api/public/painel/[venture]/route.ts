import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

// Painel de construcao do OPERA por venture. O HTML e publicado pelo gerador
// local da venture (painel/gerar.py --publicar) na tabela painel_construcao;
// aqui so servimos a ultima versao. Publico por prefixo /api/public/ e
// reescrito em /painel/<venture> (next.config.js).

export const dynamic = "force-dynamic";

const SLUG = /^[a-z0-9][a-z0-9-]{1,60}$/;

export async function GET(_req: NextRequest, { params }: { params: { venture: string } }) {
  const venture = String(params?.venture ?? "").toLowerCase();
  if (!SLUG.test(venture)) return new NextResponse("Painel não encontrado.", { status: 404 });
  try {
    const sb = createSupabaseServiceClient();
    const { data, error } = await sb
      .from("painel_construcao")
      .select("html, atualizado_em")
      .eq("venture", venture)
      .maybeSingle();
    if (error) throw error;
    if (!data) return new NextResponse("Painel não encontrado.", { status: 404 });
    return new NextResponse(data.html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Painel-Atualizado-Em": String(data.atualizado_em ?? ""),
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (e) {
    console.error("[painel] falha ao ler", e);
    return new NextResponse("Painel indisponível agora.", { status: 500 });
  }
}
