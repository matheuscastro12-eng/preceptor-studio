// Local visual/integration fixture only. Never imported by application code.
// npx tsx tests/opera.mock.ts (binds loopback, never connects to real Supabase)
import { createServer } from "node:http";
import { OASIS, colheitaInicial } from "../lib/opera/model";
import { randomUUID } from 'node:crypto';
const user = { id: "00000000-0000-4000-8000-000000000001", aud: "authenticated", role: "authenticated", email: "operador@example.invalid", created_at: "2026-09-09T00:00:00Z", app_metadata: {}, user_metadata: { name: "Operador de teste" } };
const projetos = new Map<string, any>([["projeto-teste", { slug: "projeto-teste", nome: "Construção de teste", cliente: "Ambiente de verificação", processo: "Conferir pedidos e encaminhar exceções para a equipe responsável.", responsavel: "Operador de teste", tipo: "plataforma", colheita_publica: true, painel_publico: true, colheita: colheitaInicial(), snapshot: { atualizadoEm: "2026-09-09T15:00:00.000Z", etapa: "corpus", resumo: "Dados simulados exclusivamente para verificar a interface. Não representam um cliente ou uma construção real.", proximaAcao: "Revisar as ocorrências com quem decide hoje.", testes: { passaram: 12, total: 12 }, corpus: { validados: 4, meta: 20 }, achados: [{ titulo: "Definir quem decide quando o pedido chega incompleto.", severidade: "media", estado: "aberto" }], atividades: [{ quando: "2026-09-09T14:00:00.000Z", titulo: "Partitura revisada", detalhe: "Evento simulado para verificar a apresentação do diário." }], artefatos: [{ id: "motor", titulo: "Motor determinístico", estado: "informativo", conteudo: "## Regras verificadas\n\nEste é um artefato de teste.\n\n- Validação de entrada\n- Encaminhamento de exceções" }] } }]]);
const respostas: any[] = [];
const reunioes: any[] = [];
for(const p of projetos.values()){p.criado_por=user.id;p.construcao_id=randomUUID();}
const publicacoes:any[]=[];const decisoes:any[]=[];const entregas:any[]=[];const integracoes:any[]=[];
createServer(async (req, res) => {
  const url = new URL(req.url!, "http://127.0.0.1:54329");
  const json = (v: any, status = 200) => { res.writeHead(status, { "Content-Type": "application/json", "Content-Range": "0-0/0", "Access-Control-Allow-Origin": "http://localhost:3100", "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info", "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS" }); res.end(JSON.stringify(v)); };
  if (req.method === "OPTIONS") return json({});
  if (url.pathname === "/auth/v1/user") return json(user);
  if (url.pathname.endsWith("/profiles")) return json({ ...user, name: "Operador de teste", role: "member", team_key: null });
  const body = async () => { let t = ""; for await (const c of req) t += c; return t ? JSON.parse(t) : null; };
  if (url.pathname.endsWith('/rpc/opera_cadastrar_com_reuniao')) {
    const b = await body(); if (projetos.has(b.p_projeto.slug)) return json({ code: '23505' }, 409);
    projetos.set(b.p_projeto.slug, { ...b.p_projeto, construcao_id: randomUUID() });
    reunioes.push({ ...b.p_reuniao, projeto: b.p_projeto.slug, fonte_hash: b.p_hash, registro_hash: b.p_registro_hash, criado_por: b.p_autor, criado_em: new Date().toISOString(), id: randomUUID() }); return json(null);
  }
  if (url.pathname.endsWith('/opera_reunioes')) {
    if (req.method === 'POST') { const b = await body(); if (reunioes.some(r => r.projeto === b.projeto && r.registro_hash === b.registro_hash)) return json({ code: '23505' }, 409); const r = { ...b, id: randomUUID(), criado_em: new Date().toISOString() }; reunioes.push(r); return json(r, 201); }
    const rows = reunioes.filter(r => `eq.${r.projeto}` === url.searchParams.get('projeto') && (!url.searchParams.has('id') || `eq.${r.id}` === url.searchParams.get('id')));
    return json(req.headers.accept?.includes('object') ? rows[0] ?? null : rows.toReversed());
  }
  if(url.pathname.endsWith('/ventures'))return json(url.searchParams.has('id')?{id:'venture-teste',name:'Venture de teste',slug:'venture-teste'}:[{id:'venture-teste',name:'Venture de teste',slug:'venture-teste'}]);
  if(url.pathname.endsWith('/opera_membros'))return json(req.headers.accept?.includes('object')?null:[]);
  if(url.pathname.endsWith('/opera_integracoes')){
    if(req.method==='POST'){integracoes.push({...await body(),id:randomUUID()});return json({});}
    const result=integracoes.filter(i=>`eq.${i.projeto}`===url.searchParams.get('projeto'));
    return json(url.searchParams.has('token_hash')?result.find(i=>`eq.${i.token_hash}`===url.searchParams.get('token_hash'))??null:result);
  }
  if(url.pathname.endsWith('/opera_auditoria'))return json({});
  if(url.pathname.endsWith('/opera_entregas'))return json(entregas.filter(p=>`eq.${p.projeto}`===url.searchParams.get('projeto')).reverse());
  if(url.pathname.endsWith('/opera_publicacoes'))return json(publicacoes.filter(p=>`eq.${p.projeto}`===url.searchParams.get('projeto')).reverse());
  if(url.pathname.endsWith('/opera_decisoes')){
    const rows=decisoes.filter(d=>`eq.${d.projeto}`===url.searchParams.get('projeto')&&(!url.searchParams.has('id')||`eq.${d.id}`===url.searchParams.get('id')));
    if(req.method==='PATCH'){const b=await body();const d=rows.find(d=>d.estado==='pendente');if(d)Object.assign(d,b);return json(d?{id:d.id}:null);}
    return json(req.headers.accept?.includes('object')?rows[0]??null:rows);
  }
  if(url.pathname.endsWith('/rpc/opera_publicar')){
    const b=await body();const old=publicacoes.find(p=>p.projeto===b.p_projeto&&p.evento_id===b.p_evento);
    if(old)return old.digest===b.p_digest?json(old.id):json({code:'23505'},409);
    const p=projetos.get(b.p_projeto);if(p.snapshot&&p.snapshot.atualizadoEm>=b.p_snapshot.atualizadoEm)return json({code:'23505'},409);
    const pub={id:randomUUID(),projeto:b.p_projeto,evento_id:b.p_evento,digest:b.p_digest,autor:b.p_autor,snapshot:b.p_snapshot,artefatos:b.p_artefatos,recebido_em:new Date().toISOString()};publicacoes.push(pub);p.snapshot=b.p_snapshot;return json(pub.id);
  }
  if(url.pathname.endsWith('/rpc/opera_decidir')){
    const b=await body();const p=publicacoes.filter(p=>p.projeto===b.p_projeto).at(-1);
    const a=p?.artefatos.find((a:any)=>a.propostaId===b.p_proposta&&a.hash===b.p_hash&&a.situacao==='proposta');
    if(p?.id!==b.p_publicacao||!a||decisoes.some(d=>d.projeto===b.p_projeto&&d.proposta_id===b.p_proposta))return json({code:'23505'},409);
    const d={id:randomUUID(),projeto:b.p_projeto,publicacao:b.p_publicacao,proposta_id:b.p_proposta,chave:a.chave,hash:a.hash,decisao:b.p_decisao,motivo:b.p_motivo,autor:b.p_autor,estado:'pendente',criado_em:new Date().toISOString()};decisoes.push(d);return json(d.id);
  }
  if(url.pathname.endsWith('/rpc/opera_entrega_revisar')){const b=await body();const last=entregas.filter(e=>e.projeto===b.p_projeto).at(-1);if(b.p_aceitar){if(last?.id!==b.p_aceitar||last.aceito_em)return json({code:'23505'},409);last.aceito_em=new Date().toISOString();last.aceito_por=b.p_autor;return json(last.id);}const e={...b.p_dados,projeto:b.p_projeto,id:randomUUID(),versao:(last?.versao??0)+1,autor:b.p_autor,criado_em:new Date().toISOString()};entregas.push(e);return json(e.id);}
  if (url.pathname.endsWith("/opera_projetos")) {
    if (req.method === "POST") { const p = {...await body(),construcao_id:randomUUID()}; if (projetos.has(p.slug)) return json({ code: "23505" }, 409); projetos.set(p.slug, p); return json(p, 201); }
    const slug = url.searchParams.get("slug")?.slice(3);
    if (req.method === "PATCH") { const b = await body(); const p = projetos.get(slug!); if (!p) return json(null); projetos.set(slug!, { ...p, ...b }); return json({ slug }); }
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
