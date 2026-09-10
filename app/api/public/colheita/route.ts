import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { enforceRateLimit, getClientIp } from "@/lib/rateLimit";
import { projetoOpera } from "@/lib/opera/server";
import { type Colheita, slugValido } from "@/lib/opera/model";

// Recebe uma resposta da colheita de corpus (OPERA) enviada pelo link publico.
// Rota publica por prefixo /api/public/ (middleware). Escrita so pelo service role.

export const dynamic = "force-dynamic";

const MAX_CURTO = 400;
const MAX_LONGO = 8000;
const MAX_FICHAS = 60;
/** O espaco fechado das perguntas de sim ou nao. Fora dele, a resposta e nula. */
const SIM_NAO = ["sim", "nao", "nao_sei"];

function curto(v: unknown, max = MAX_CURTO): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function listaDeStrings(v: unknown, max = 12): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => curto(x, 200)).filter(Boolean).slice(0, max);
}

function limparRespostas(bruto: unknown, c: Colheita): Record<string, unknown> {
  const PERGUNTA_POR_ID = new Map(c.perguntas.map((p) => [p.id, p]));
  const out: Record<string, unknown> = {};
  if (typeof bruto !== "object" || bruto === null) return out;
  for (const [id, valor] of Object.entries(bruto as Record<string, unknown>)) {
    const p = PERGUNTA_POR_ID.get(id);
    if (!p || typeof valor !== "object" || valor === null) continue;
    const v = valor as Record<string, unknown>;
    if (p.tipo === "simnao") {
      const r = curto(v.resposta, 10);
      const valida = SIM_NAO.includes(r) ? r : null;
      if (!valida && !curto(v.detalhe)) continue;
      // `r || null` gravava o lixo que nao passou no teste acima: com detalhe
      // preenchido, "ZZZZZZZZZZ" entrava no campo que so aceita sim/nao/nao_sei,
      // e a contagem de respostas passava a mentir.
      out[id] = { resposta: valida, detalhe: curto(v.detalhe, MAX_LONGO) || null };
    } else if (p.tipo === "escolha") {
      const escolhidas = listaDeStrings(v.escolhas).filter((e) => p.opcoes?.includes(e));
      const outro = curto(v.outro);
      const detalhe = curto(v.detalhe, MAX_LONGO);
      if (!escolhidas.length && !outro && !detalhe) continue;
      out[id] = { escolhas: escolhidas, outro: outro || null, detalhe: detalhe || null };
    } else {
      const texto = curto(v.texto, MAX_LONGO);
      if (!texto) continue;
      out[id] = { texto };
    }
  }
  return out;
}

function limparOcorrencias(bruto: unknown, config: Colheita): unknown[] {
  const OCORRENCIAS_VALIDAS = new Set(config.ocorrencias.map(o => o.id));
  const FICHAS = config.fichas;
  const out: unknown[] = [];
  if (typeof bruto !== "object" || bruto === null) return out;
  const b = bruto as Record<string, unknown>;
  // "ja aconteceu?" por ocorrencia pedida
  const pedidas: Record<string, unknown> = {};
  if (typeof b.pedidas === "object" && b.pedidas !== null) {
    for (const [id, v] of Object.entries(b.pedidas as Record<string, unknown>)) {
      if (!OCORRENCIAS_VALIDAS.has(id) || typeof v !== "object" || v === null) continue;
      const x = v as Record<string, unknown>;
      const r = curto(x.resposta, 10);
      const valida = SIM_NAO.includes(r) ? r : null;
      if (!valida && !curto(x.detalhe)) continue;
      pedidas[id] = { resposta: valida, quantas: curto(x.quantas, 40) || null, detalhe: curto(x.detalhe, MAX_LONGO) || null };
    }
  }
  out.push({ tipo: "pedidas", itens: pedidas });
  // fichas preenchidas
  if (Array.isArray(b.fichas)) {
    for (const f of b.fichas.slice(0, MAX_FICHAS)) {
      if (typeof f !== "object" || f === null) continue;
      const ficha = f as Record<string, unknown>;
      const tipo = curto(ficha.tipo, 60);
      if (!Object.hasOwn(FICHAS, tipo)) continue;
      const campos: Record<string, string> = {};
      const c = (ficha.campos ?? {}) as Record<string, unknown>;
      for (const campo of FICHAS[tipo].campos) {
        const v = curto(c[campo.id], campo.longo ? MAX_LONGO : MAX_CURTO);
        if (v) campos[campo.id] = v;
      }
      if (Object.keys(campos).length) {
        const faltam = FICHAS[tipo].campos.filter(c => c.obrigatorio && !campos[c.id]);
        if (faltam.length) throw new Error(`${FICHAS[tipo].nome}: preencha ${faltam.map(c => c.rotulo).join(", ")}.`);
        out.push({ tipo: "ficha", ficha: tipo, campos, viu_sugestao: ficha.viu_sugestao === true });
      }
    }
  }
  return out;
}

function limparRotulos(bruto: unknown, c: Colheita): Record<string, string[]> {
  const LISTAS_VALIDAS = new Set(c.listas.map(l => l.id));
  const out: Record<string, string[]> = {};
  if (typeof bruto !== "object" || bruto === null) return out;
  for (const [id, v] of Object.entries(bruto as Record<string, unknown>)) {
    if (!LISTAS_VALIDAS.has(id)) continue;
    const linhas = curto(v, MAX_LONGO).split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 40);
    if (linhas.length) out[id] = linhas;
  }
  return out;
}

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "colheita", 30, 1);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    const texto = await req.text();
    if (texto.length > 1_000_000) return NextResponse.json({ error: "Envio muito grande." }, { status: 413 });
    body = JSON.parse(texto) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Corpo inválido");
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const venture = body.venture;
  if (!slugValido(venture)) return NextResponse.json({ error: "Projeto desconhecido" }, { status: 400 });
  let projeto;
  try { projeto = await projetoOpera(venture); }
  catch { return NextResponse.json({ error: "Colheita indisponível. Suas respostas continuam neste navegador." }, { status: 503 }); }
  if (!projeto?.colheita_publica) return NextResponse.json({ error: "Colheita não encontrada" }, { status: 404 });
  const config = projeto.colheita;
  // Old OASIS tabs did not send a version. Preserve only that v1 contract.
  const versao = body.instrumento_versao ?? (venture === "oasis-cte" ? 1 : null);
  if (versao !== config.versao) return NextResponse.json({ error: "As perguntas foram atualizadas. Guarde suas respostas e abra a colheita novamente." }, { status: 409 });

  const nome = curto(body.nome, 120);
  if (!nome) return NextResponse.json({ error: "Diga seu nome. Resposta sem nome a gente não consegue usar." }, { status: 400 });

  const grupos = listaDeStrings(body.grupos, 200).filter((g) => config.grupos.some(x => x.id === g));
  const respostas = limparRespostas(body.respostas, config);
  let ocorrencias;
  try { ocorrencias = limparOcorrencias(body.ocorrencias, config); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Ficha incompleta." }, { status: 400 }); }
  const rotulos = limparRotulos(body.rotulos, config);

  const temConteudo =
    Object.keys(respostas).length > 0 ||
    ocorrencias.some((o) => (o as { tipo: string }).tipo === "ficha") ||
    Object.keys((ocorrencias[0] as { itens: Record<string, unknown> })?.itens ?? {}).length > 0 ||
    Object.keys(rotulos).length > 0;
  if (!temConteudo) return NextResponse.json({ error: "Nenhuma resposta preenchida." }, { status: 400 });

  try {
    const sb = createSupabaseServiceClient();
    const { data, error } = await sb
      .from("colheita_respostas")
      .insert({
        venture,
        ...(venture === "oasis-cte" && config.versao === 1 ? {} : { instrumento_versao: config.versao }),
        respondente_nome: nome,
        respondente_funcao: curto(body.funcao, 120) || null,
        respondente_empresa: curto(body.empresa, 120) || null,
        respondente_contato: curto(body.contato, 160) || null,
        grupos,
        respostas,
        ocorrencias,
        rotulos,
        ip: getClientIp(req),
        user_agent: (req.headers.get("user-agent") ?? "").slice(0, 300) || null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (e) {
    console.error("[colheita] falha ao gravar", e);
    return NextResponse.json({ error: "Não conseguimos gravar agora. Tente de novo em um minuto; suas respostas ficam salvas neste navegador." }, { status: 500 });
  }
}
