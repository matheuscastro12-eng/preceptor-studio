import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { enforceRateLimit, getClientIp } from "@/lib/rateLimit";
import { onboardingDe, ventureDoOnboarding } from "@/lib/onboarding";
import { limparValores, pareceSegredo, todosOsCampos, extensao, EXTENSOES_PERMITIDAS } from "@/lib/onboarding/model";

// Recebe um envio do formulário de onboarding (link público /onboarding/<slug>).
// Rota pública por prefixo /api/public/ (middleware). Escrita só pelo service role.
// Grava em colheita_respostas com venture "onboarding-<slug>", sem tabela nova.

export const dynamic = "force-dynamic";

const MAX_ARQUIVOS = 120;
const CAMINHO_RE = /^[a-z0-9-]+\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}-[A-Za-z0-9._-]{1,120}$/;

function curto(v: unknown, max = 160): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "onboarding", 30, 1);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    const texto = await req.text();
    if (texto.length > 1_000_000) return NextResponse.json({ error: "Envio muito grande. Para listas longas, anexe a planilha." }, { status: 413 });
    body = JSON.parse(texto) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Corpo inválido");
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const slug = curto(body.slug, 60);
  const def = onboardingDe(slug);
  if (!def) return NextResponse.json({ error: "Formulário não encontrado" }, { status: 404 });
  if (body.versao !== def.versao) {
    return NextResponse.json({ error: "As perguntas foram atualizadas. Recarregue a página; o que já estava preenchido continua neste navegador." }, { status: 409 });
  }

  const nome = curto(body.nome, 120);
  if (!nome) return NextResponse.json({ error: "Diga seu nome, para sabermos com quem falar sobre as respostas." }, { status: 400 });

  const valores = limparValores(body.valores, def);
  if (pareceSegredo(JSON.stringify(valores))) {
    return NextResponse.json({ error: "Parece que há uma senha ou chave nas respostas. Tire do formulário e combine o envio com o Matheus por um canal seguro." }, { status: 400 });
  }

  const camposComArquivo = new Set(
    todosOsCampos(def).filter((c) => c.tipo === "arquivos" || (c.tipo === "tabela" && c.aceitaPlanilha)).map((c) => c.id),
  );
  const arquivos: { campo: string; caminho: string; nome: string; bytes: number }[] = [];
  if (Array.isArray(body.arquivos)) {
    for (const a of body.arquivos.slice(0, MAX_ARQUIVOS)) {
      if (!a || typeof a !== "object") continue;
      const x = a as Record<string, unknown>;
      const campo = curto(x.campo, 60);
      const caminho = curto(x.caminho, 220);
      const nomeArq = curto(x.nome, 160);
      if (!camposComArquivo.has(campo) || !CAMINHO_RE.test(caminho) || !caminho.startsWith(`${def.slug}/`)) continue;
      if (!Object.hasOwn(EXTENSOES_PERMITIDAS, extensao(caminho))) continue;
      arquivos.push({ campo, caminho, nome: nomeArq || caminho.split("/").pop()!, bytes: Number(x.bytes) > 0 ? Math.round(Number(x.bytes)) : 0 });
    }
  }

  if (!Object.keys(valores).length && !arquivos.length) {
    return NextResponse.json({ error: "Nenhuma resposta preenchida." }, { status: 400 });
  }

  const secoes = def.secoes
    .filter((s) => s.campos.some((c) => Object.hasOwn(valores, c.id) || arquivos.some((a) => a.campo === c.id)))
    .map((s) => s.id);

  try {
    const sb = createSupabaseServiceClient();
    const { data, error } = await sb
      .from("colheita_respostas")
      .insert({
        venture: ventureDoOnboarding(def.slug),
        instrumento_versao: def.versao,
        respondente_nome: nome,
        respondente_funcao: curto(body.funcao, 120) || null,
        respondente_empresa: def.cliente,
        respondente_contato: curto(body.contato, 160) || null,
        grupos: secoes,
        respostas: { valores, arquivos },
        ocorrencias: [],
        rotulos: {},
        ip: getClientIp(req),
        user_agent: (req.headers.get("user-agent") ?? "").slice(0, 300) || null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (e) {
    console.error("[onboarding] falha ao gravar", e);
    return NextResponse.json({ error: "Não conseguimos gravar agora. Tente de novo em um minuto; suas respostas continuam salvas neste navegador." }, { status: 500 });
  }
}
