import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST as cadastrar } from "../app/api/opera/projetos/route";
import { PATCH as publicar } from "../app/api/opera/projetos/[slug]/route";
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
    if (path.endsWith("/opera_projetos")) {
      if (method === "POST") {
        if (projetos.has(payload.slug)) return json({ code: "23505" }, 409);
        projetos.set(payload.slug, payload); return new Response(null, { status: 201 });
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
    assert.equal((await publicar(req("PATCH", { snapshot }), { params: { slug: projeto.slug } })).status, 200);
    assert.match(publishFilter, /snapshot\.is\.null,snapshot->>atualizadoEm\.lt\.2026-09-09T12:00:00.000Z/);
    assert.equal((await publicar(req("PATCH", { snapshot }), { params: { slug: projeto.slug } })).status, 409);
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
