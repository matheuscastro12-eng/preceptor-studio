import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { projetoOpera } from "@/lib/opera/server";

// Painel de construcao do OPERA por venture. O HTML e publicado pelo gerador
// local da venture (painel/gerar.py --publicar) na tabela painel_construcao;
// aqui so servimos a ultima versao. Publico por prefixo /api/public/ e
// reescrito em /painel/<venture> (next.config.js).

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// O cliente de servico padrao deixa o Next guardar a resposta do Supabase no
// Data Cache; aqui cada pedido precisa ler a ultima versao publicada.
function clienteSemCache() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase nao configurado");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

const SLUG = /^[a-z0-9][a-z0-9-]{1,60}$/;

export async function GET(_req: NextRequest, { params }: { params: { venture: string } }) {
  const venture = String(params?.venture ?? "").toLowerCase();
  if (!SLUG.test(venture)) return new NextResponse("Painel não encontrado.", { status: 404 });
  try {
    const projeto = await projetoOpera(venture);
    if (projeto && !projeto.painel_publico) return new NextResponse("Painel não encontrado.", { status: 404 });
    const sb = clienteSemCache();
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
