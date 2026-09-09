// Local visual/integration fixture only. Never imported by application code.
// npx tsx tests/opera.mock.ts (binds loopback, never connects to real Supabase)
import { createServer } from "node:http";
import { OASIS, colheitaInicial } from "../lib/opera/model";
const user = { id: "00000000-0000-4000-8000-000000000001", aud: "authenticated", role: "authenticated", email: "operador@example.invalid", created_at: "2026-09-09T00:00:00Z", app_metadata: {}, user_metadata: { name: "Operador de teste" } };
const projetos = new Map<string, any>([["projeto-teste", { slug: "projeto-teste", nome: "Construção de teste", cliente: "Ambiente de verificação", processo: "Conferir pedidos e encaminhar exceções para a equipe responsável.", responsavel: "Operador de teste", tipo: "plataforma", colheita_publica: true, painel_publico: true, colheita: colheitaInicial(), snapshot: { atualizadoEm: "2026-09-09T15:00:00.000Z", etapa: "corpus", resumo: "Dados simulados exclusivamente para verificar a interface. Não representam um cliente ou uma construção real.", proximaAcao: "Revisar as ocorrências com quem decide hoje.", testes: { passaram: 12, total: 12 }, corpus: { validados: 4, meta: 20 }, achados: [{ titulo: "Definir quem decide quando o pedido chega incompleto.", severidade: "media", estado: "aberto" }], atividades: [{ quando: "2026-09-09T14:00:00.000Z", titulo: "Partitura revisada", detalhe: "Evento simulado para verificar a apresentação do diário." }], artefatos: [{ id: "motor", titulo: "Motor determinístico", estado: "informativo", conteudo: "## Regras verificadas\n\nEste é um artefato de teste.\n\n- Validação de entrada\n- Encaminhamento de exceções" }] } }]]);
const respostas: any[] = [];
createServer(async (req, res) => {
  const url = new URL(req.url!, "http://127.0.0.1:54329");
  const json = (v: any, status = 200) => { res.writeHead(status, { "Content-Type": "application/json", "Content-Range": "0-0/0", "Access-Control-Allow-Origin": "http://localhost:3100", "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info", "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS" }); res.end(JSON.stringify(v)); };
  if (req.method === "OPTIONS") return json({});
  if (url.pathname === "/auth/v1/user") return json(user);
  if (url.pathname.endsWith("/profiles")) return json({ ...user, name: "Operador de teste", role: "member", team_key: null });
  const body = async () => { let t = ""; for await (const c of req) t += c; return t ? JSON.parse(t) : null; };
  if (url.pathname.endsWith("/opera_projetos")) {
    if (req.method === "POST") { const p = await body(); if (projetos.has(p.slug)) return json({ code: "23505" }, 409); projetos.set(p.slug, p); return json(p, 201); }
    const slug = url.searchParams.get("slug")?.slice(3);
    if (req.method === "PATCH") { const b = await body(); const p = projetos.get(slug!); if (!p || (p.snapshot && p.snapshot.atualizadoEm >= b.snapshot.atualizadoEm)) return json(null); projetos.set(slug!, { ...p, ...b }); return json({ slug }); }
    return json(slug ? projetos.get(slug) ?? null : [...projetos.values()]);
  }
  if (url.pathname.endsWith("/painel_construcao")) return json(url.searchParams.get("venture") === `eq.${OASIS.slug}` ? { venture: OASIS.slug, html: "<!doctype html><html><body><h1>Painel legado de teste</h1><section id='motor'>Motor preservado</section></body></html>", atualizado_em: "2026-09-09T15:00:00Z" } : null);
  if (url.pathname.endsWith("/colheita_respostas")) {
    if (req.method === "POST") { const b = await body(); b.id = `resposta-${respostas.length + 1}`; respostas.push(b); return json({ id: b.id }, 201); }
    return json(respostas.filter(r => `eq.${r.venture}` === url.searchParams.get("venture")));
  }
  if (url.pathname.endsWith("/public_rate_limit")) return req.method === "GET" ? json(null) : json({});
  return json([]);
}).listen(54329, "127.0.0.1", () => console.log("Supabase simulado em 127.0.0.1:54329; dados exclusivamente de teste."));
