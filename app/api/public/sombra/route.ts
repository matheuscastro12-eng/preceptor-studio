import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { enforceRateLimit, getClientIp } from "@/lib/rateLimit";
import { projetoOpera } from "@/lib/opera/server";
import { slugValido } from "@/lib/opera/model";
import { TIPOS_DA_SOMBRA, DECISOES_VALIDAS, casoId, chaveNfeNormalizada } from "@/lib/opera/sombra";

// Recebe a decisão de uma pessoa da operação, na sombra do OPERA.
//
// Esta rota só conhece a metade humana do par. Ela não lê, não devolve e não
// aceita decisão de agente: a do agente entra por outra porta
// (`gravar_decisao_do_agente`), e só depois desta. Rota pública por prefixo
// /api/public/ (middleware); a escrita é do service role.

export const dynamic = "force-dynamic";

const MAX_CURTO = 400;
const MAX_LONGO = 8000;
const MAX_CORPO = 200_000;

function curto(v: unknown, max = MAX_CURTO): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "sombra", 200, 1);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    const texto = await req.text();
    if (texto.length > MAX_CORPO) return NextResponse.json({ error: "Envio muito grande." }, { status: 413 });
    body = JSON.parse(texto) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Corpo inválido");
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const venture = body.venture;
  if (!slugValido(venture)) return NextResponse.json({ error: "Projeto desconhecido" }, { status: 400 });
  const TIPOS = TIPOS_DA_SOMBRA[venture];
  if (!TIPOS) return NextResponse.json({ error: "Sombra não encontrada" }, { status: 404 });
  let projeto;
  try { projeto = await projetoOpera(venture); }
  catch { return NextResponse.json({ error: "Sombra indisponível agora. Sua decisão continua neste navegador." }, { status: 503 }); }
  if (!projeto) return NextResponse.json({ error: "Sombra não encontrada" }, { status: 404 });

  const quem = curto(body.quem, 120);
  if (!quem) return NextResponse.json({ error: "Diga quem decidiu. Decisão sem nome não entra na sombra." }, { status: 400 });

  const ordem = curto(body.ordem_carregamento, 120);
  if (!ordem) return NextResponse.json({ error: "Diga qual a ordem de carregamento." }, { status: 400 });

  const chave = chaveNfeNormalizada(body.chave_nfe);
  if (!chave) return NextResponse.json({ error: "A chave da nota tem 44 dígitos. Confira e cole de novo." }, { status: 400 });

  const tipo = curto(body.tipo, 300);
  if (!TIPOS.some((t) => t.id === tipo)) return NextResponse.json({ error: "Tipo de ação desconhecido." }, { status: 400 });

  const decisao = curto(body.decisao, 60);
  if (!DECISOES_VALIDAS.has(decisao)) return NextResponse.json({ error: "Diga o que você decidiu." }, { status: 400 });

  const nota = curto(body.nota, MAX_LONGO);
  if (decisao === "outra" && !nota) {
    return NextResponse.json({ error: "Você marcou Outra. Escreva com as suas palavras o que decidiu." }, { status: 400 });
  }

  const tela = curto(body.tela, MAX_LONGO);
  const sistema = curto(body.sistema, 120);

  try {
    const sb = createSupabaseServiceClient();
    const { data, error } = await sb
      .from("sombra_pares")
      .insert({
        venture,
        caso_id: casoId(ordem, chave),
        ordem_carregamento: ordem,
        chave_nfe: chave,
        tipo,
        humano: decisao,
        quem,
        nota: nota || null,
        // O que a pessoa tinha na tela. Vai junto porque é isto que transforma
        // a decisão cega em caso do corpus depois, sem ninguém redigitar nada.
        entrada: { tela: tela || null, sistema: sistema || null },
        ip: getClientIp(req),
        user_agent: (req.headers.get("user-agent") ?? "").slice(0, 300) || null,
      })
      // O select devolve só o que é da pessoa. `agente` nunca sai desta rota.
      .select("id, cega")
      .single();
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Este carregamento já tem uma decisão registrada para esta ação. A decisão humana não se reescreve." }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ ok: true, id: data?.id ?? null, cega: data?.cega ?? null });
  } catch (e) {
    console.error("[sombra] falha ao gravar", e);
    return NextResponse.json({ error: "Não conseguimos gravar agora. Tente de novo em um minuto; a sua decisão fica salva neste navegador." }, { status: 500 });
  }
}
