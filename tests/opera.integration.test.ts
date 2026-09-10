import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST as cadastrar } from "../app/api/opera/projetos/route";
import { POST as publicar } from "../app/api/opera/projetos/[slug]/conexao/route";
import { POST as colher } from "../app/api/public/colheita/route";
import { GET as painelLegado } from "../app/api/public/painel/[venture]/route";
import { colheitaInicial } from "../lib/opera/model";

test("cadastro → publicação → colheita, com acesso e versões validados", async () => {
  const originalFetch = global.fetch;
  const env = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY };
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54329";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "fixture-only";
  const projetos = new Map<string, any>();
  const respostas: any[] = [];
  let publishFilter = "";
  const eventos=new Map<string,string>();
  const construcaoId='22222222-2222-4222-8222-222222222222';
  global.fetch = async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.origin, "http://127.0.0.1:54329", "teste nunca acessa serviço real");
    const path = url.pathname;
    const headers = new Headers(init?.headers);
    const method = init?.method ?? "GET";
    const payload = init?.body ? JSON.parse(String(init.body)) : null;
    const json = (data: any, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
    if (path === "/auth/v1/user") return json({ id: headers.get("authorization")?.includes("pending") ? "pending" : "member", email: "fixture@example.invalid" });
    if (path.endsWith("/profiles")) return json({ role: url.searchParams.get("id") === "eq.pending" ? "pending" : "member" });
    if(path.endsWith('/opera_membros'))return json(null);
    if(path.endsWith('/rpc/opera_publicar')){
      if(eventos.has(payload.p_evento))return eventos.get(payload.p_evento)===payload.p_digest?json('pub1'):json({code:'23505'},409);
      const p=projetos.get(payload.p_projeto);if(p.snapshot&&p.snapshot.atualizadoEm>=payload.p_snapshot.atualizadoEm)return json({code:'23505'},409);
      p.snapshot=payload.p_snapshot;eventos.set(payload.p_evento,payload.p_digest);return json('pub1');
    }
    if (path.endsWith("/opera_projetos")) {
      if (method === "POST") {
        if (projetos.has(payload.slug)) return json({ code: "23505" }, 409);
        projetos.set(payload.slug, {...payload,construcao_id:construcaoId}); return new Response(null, { status: 201 });
      }
      const slug = url.searchParams.get("slug")?.slice(3) ?? "";
      const p = projetos.get(slug);
      if (method === "PATCH") {
        publishFilter = url.searchParams.get("or") ?? "";
        if (!p || (p.snapshot && p.snapshot.atualizadoEm >= payload.snapshot.atualizadoEm)) return json(null);
        projetos.set(slug, { ...p, ...payload }); return json({ slug });
      }
      return json(p ?? null);
    }
    if (path.endsWith("/colheita_respostas")) { respostas.push(payload); return json({ id: "resposta-test" }, 201); }
    if (path.endsWith("/painel_construcao")) return json({ html: "<html><body>painel legado</body></html>", atualizado_em: "2026-09-09T12:00:00.000Z" });
    throw new Error(`Chamada inesperada ${method} ${path}`);
  };
  const req = (method: string, body: any, token = "member-token") => new Request("http://localhost/api/opera/projetos", { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const projeto = { slug: "teste-plataforma", nome: "Teste", cliente: "Cliente de teste", processo: "Conferir dados do processo", responsavel: "Pessoa Teste", tipo: "plataforma", colheita_publica: true, painel_publico: false, colheita: colheitaInicial(), snapshot: null };
  try {
    assert.equal((await cadastrar(req("POST", projeto, "pending-token"))).status, 403);
    assert.equal(projetos.size, 0);
    assert.equal((await cadastrar(req("POST", projeto))).status, 201);
    assert.equal((await cadastrar(req("POST", projeto))).status, 409);
    const snapshot = { atualizadoEm: "2026-09-09T12:00:00.000Z", etapa: "corpus", resumo: "Coleta iniciada", proximaAcao: "Revisar casos", testes: null, corpus: null, achados: [], atividades: [] };
    const envelope={snapshot,eventoId:'33333333-3333-4333-8333-333333333333',construcaoId,artefatos:[]};
    assert.equal((await publicar(req("POST", envelope), { params: { slug: projeto.slug } })).status, 200);
    assert.equal((await publicar(req("POST", envelope), { params: { slug: projeto.slug } })).status, 200);
    assert.equal((await publicar(req("POST", {...envelope,snapshot:{...snapshot,resumo:'alterado'}}), { params: { slug: projeto.slug } })).status, 409);
    assert.equal((await painelLegado(new NextRequest("http://localhost"), { params: { venture: projeto.slug } })).status, 404);
    const enviar = (body: any) => colher(new NextRequest("http://localhost/api/public/colheita", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
    const body = { venture: projeto.slug, instrumento_versao: 1, nome: "Operador", grupos: ["operacao"], respostas: { fluxo: { texto: "O pedido chega e é conferido." }, q1: { texto: "não pertence a este projeto" } } };
    assert.equal((await enviar({ ...body, instrumento_versao: 2 })).status, 409);
    assert.equal((await enviar({ ...body, ocorrencias: { fichas: [{ tipo: "caso", campos: { quando: "Hoje" } }] } })).status, 400);
    assert.equal(respostas.length, 0);
    assert.equal((await enviar(body)).status, 200);
    assert.equal(respostas[0].venture, projeto.slug);
    assert.equal(respostas[0].instrumento_versao, 1);
    assert.deepEqual(Object.keys(respostas[0].respostas), ["fluxo"]);
    assert.equal(projetos.get(projeto.slug).snapshot.corpus, null, "envio não vira corpus validado");
    projetos.get(projeto.slug).colheita_publica = false;
    assert.equal((await enviar(body)).status, 404);
  } finally {
    global.fetch = originalFetch;
    if (env.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = env.url;
    if (env.key === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = env.key;
  }
});
