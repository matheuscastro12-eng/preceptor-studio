import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { enforceRateLimit, getClientIp } from "@/lib/rateLimit";
import { GRUPOS, PERGUNTAS, OCORRENCIAS_PEDIDAS, FICHAS, LISTAS_DE_RESPOSTAS, VENTURE } from "@/lib/colheita/oasis";

// Recebe uma resposta da colheita de corpus (OPERA) enviada pelo link publico.
// Rota publica por prefixo /api/public/ (middleware). Escrita so pelo service role.

export const dynamic = "force-dynamic";

const MAX_CURTO = 400;
const MAX_LONGO = 8000;
const MAX_FICHAS = 60;

function curto(v: unknown, max = MAX_CURTO): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function listaDeStrings(v: unknown, max = 12): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => curto(x, 200)).filter(Boolean).slice(0, max);
}

const PERGUNTA_POR_ID = new Map(PERGUNTAS.map((p) => [p.id, p]));
const GRUPOS_VALIDOS = new Set(GRUPOS.map((g) => g.id));
const OCORRENCIAS_VALIDAS = new Set(OCORRENCIAS_PEDIDAS.map((o) => o.id));
const LISTAS_VALIDAS = new Set(LISTAS_DE_RESPOSTAS.map((l) => l.id));

function limparRespostas(bruto: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (typeof bruto !== "object" || bruto === null) return out;
  for (const [id, valor] of Object.entries(bruto as Record<string, unknown>)) {
    const p = PERGUNTA_POR_ID.get(id);
    if (!p || typeof valor !== "object" || valor === null) continue;
    const v = valor as Record<string, unknown>;
    if (p.tipo === "simnao") {
      const r = curto(v.resposta, 10);
      if (!["sim", "nao", "nao_sei"].includes(r) && !curto(v.detalhe)) continue;
      out[id] = { resposta: r || null, detalhe: curto(v.detalhe, MAX_LONGO) || null };
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

function limparOcorrencias(bruto: unknown): unknown[] {
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
      if (!["sim", "nao", "nao_sei"].includes(r) && !curto(x.detalhe)) continue;
      pedidas[id] = { resposta: r || null, quantas: curto(x.quantas, 40) || null, detalhe: curto(x.detalhe, MAX_LONGO) || null };
    }
  }
  out.push({ tipo: "pedidas", itens: pedidas });
  // fichas preenchidas
  if (Array.isArray(b.fichas)) {
    for (const f of b.fichas.slice(0, MAX_FICHAS)) {
      if (typeof f !== "object" || f === null) continue;
      const ficha = f as Record<string, unknown>;
      const tipo = curto(ficha.tipo, 1) as "A" | "B" | "C";
      if (!FICHAS[tipo]) continue;
      const campos: Record<string, string> = {};
      const c = (ficha.campos ?? {}) as Record<string, unknown>;
      for (const campo of FICHAS[tipo].campos) {
        const v = curto(c[campo.id], campo.longo ? MAX_LONGO : MAX_CURTO);
        if (v) campos[campo.id] = v;
      }
      if (Object.keys(campos).length) out.push({ tipo: "ficha", ficha: tipo, campos, viu_sugestao: ficha.viu_sugestao === true });
    }
  }
  return out;
}

function limparRotulos(bruto: unknown): Record<string, string[]> {
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
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const venture = curto(body.venture, 60) || VENTURE.slug;
  if (venture !== VENTURE.slug) return NextResponse.json({ error: "Venture desconhecida" }, { status: 400 });

  const nome = curto(body.nome, 120);
  if (!nome) return NextResponse.json({ error: "Diga seu nome. Resposta sem nome a gente não consegue usar." }, { status: 400 });

  const grupos = listaDeStrings(body.grupos, 5).filter((g) => GRUPOS_VALIDOS.has(g as never));
  const respostas = limparRespostas(body.respostas);
  const ocorrencias = limparOcorrencias(body.ocorrencias);
  const rotulos = limparRotulos(body.rotulos);

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
