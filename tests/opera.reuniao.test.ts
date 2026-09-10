import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leituraVazia, validarReuniao, colheitaDaReuniao, fonteDaReuniao } from '../lib/opera/reuniao';
import { validarColheita } from '../lib/opera/model';
import { POST as analisar } from '../app/api/opera/reunioes/analisar/route';
import { GET as baixar, POST as registrar } from '../app/api/opera/projetos/[slug]/reunioes/route';
const transcricao = 'Ana: hoje copiamos pedidos manualmente para a planilha. Ainda não definimos orçamento nem prazo.';
test('reunião sem LP ou dados comerciais inventados gera fonte e colheita válida', () => {
  const leitura = leituraVazia(); leitura.campos.processo = { texto: 'Cópia manual de pedidos.', trecho: 'hoje copiamos pedidos manualmente para a planilha.' };
  leitura.lacunas = ['Quem aprova o orçamento?', 'Qual é o volume de pedidos?'];
  const r = { titulo: 'Descoberta', transcricao, leitura, revisada: true };
  validarReuniao(r); const c = colheitaDaReuniao(leitura); validarColheita(c); assert.equal(c.perguntas.length, 7);
  assert.match(fonteDaReuniao(r, 'fonte-1'), /não aprovam escopo/); assert.equal(leitura.campos.comercial.texto, '');
});
test('leitura sem trecho verificável, citação fabricada ou entrada excessiva é recusada', () => {
  const r = { titulo: 'Descoberta', transcricao, leitura: leituraVazia(), revisada: false };
  r.leitura.campos.comercial = { texto: 'Orçamento aprovado', trecho: 'R$ 10 mil' };
  assert.throws(() => validarReuniao(r), /trecho literal/);
  r.leitura.campos.comercial.trecho = ''; assert.throws(() => validarReuniao(r), /trecho literal/);
  assert.throws(() => validarReuniao({ ...r, transcricao: 'x'.repeat(120001) }), /120.000/);
});
test('rascunho manual é permitido sem IA e sem aprovação implícita', () => {
  const r = { titulo: 'Descoberta', transcricao, leitura: leituraVazia(), revisada: false };
  validarReuniao(r); assert.match(fonteDaReuniao(r, 'fonte-2'), /rascunho não revisado/);
});
test('IA exige consentimento, valida citação e não dá acesso de integração à transcrição', async () => {
  const original = global.fetch; const nomes = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ANTHROPIC_API_KEY'] as const;
  const env = nomes.map(k => process.env[k]); process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54329'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'fixture'; process.env.ANTHROPIC_API_KEY = 'fixture';
  let chamadasIA = 0; let inventar = false;
  global.fetch = async (input) => {
    const u = new URL(String(input)); const json = (d: unknown) => new Response(JSON.stringify(d), { headers: { 'Content-Type': 'application/json' } });
    if (u.hostname === 'api.anthropic.com') { chamadasIA++; const leitura = leituraVazia(); if (inventar) leitura.campos.comercial = { texto: 'Venda ganha', trecho: 'aceite confirmado' }; return json({ content: [{ type: 'text', text: JSON.stringify(leitura) }], stop_reason: 'end_turn' }); }
    assert.equal(u.hostname, '127.0.0.1');
    if (u.pathname.endsWith('/user')) return json({ id: 'membro' });
    if (u.pathname.endsWith('/profiles')) return json({ role: 'member' });
    if (u.pathname.endsWith('/opera_integracoes')) return json({ id: 'integracao', projeto: 'teste' });
    if (u.pathname.endsWith('/opera_projetos')) return json({ criado_por: 'outra-pessoa' });
    return json(null);
  };
  const req = (body: unknown, token = 'pessoa') => new Request('http://localhost/api', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  try {
    assert.equal((await analisar(req({ transcricao, consentimento: false }))).status, 400); assert.equal(chamadasIA, 0);
    assert.equal((await analisar(req({ transcricao, consentimento: true }))).status, 200);
    inventar = true; assert.equal((await analisar(req({ transcricao, consentimento: true }))).status, 502);
    assert.equal((await registrar(req({}, 'opr_token'), { params: { slug: 'teste' } })).status, 403);
    assert.equal((await baixar(req({}, 'opr_token'), { params: { slug: 'teste' } })).status, 403);
    assert.equal((await registrar(req({}), { params: { slug: 'teste' } })).status, 403);
    delete process.env.ANTHROPIC_API_KEY;
    assert.equal((await analisar(req({ transcricao, consentimento: true }))).status, 503);
  } finally { global.fetch = original; nomes.forEach((k, i) => { if (env[i] === undefined) delete process.env[k]; else process.env[k] = env[i]; }); }
});
