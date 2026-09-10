import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validarPublicacao,sha,saudeContato,acessoOpera} from '../lib/opera/conexao';
import {POST as decidir} from '../app/api/opera/projetos/[slug]/decisoes/route';
const snapshot={atualizadoEm:'2026-09-09T12:00:00.000Z',etapa:'escopo',resumo:'Escopo',proximaAcao:'Revisar',testes:null,corpus:null,achados:[],atividades:[]};
test('hash e identidade de publicação são conferidos; diário adulterado é recusado',()=>{
  const v={eventoId:'33333333-3333-4333-8333-333333333333',construcaoId:'22222222-2222-4222-8222-222222222222',snapshot,artefatos:[{chave:'escopo',propostaId:'a'.repeat(64),hash:sha('conteúdo'),conteudo:'conteúdo',situacao:'proposta'}]};
  validarPublicacao(v);assert.throws(()=>validarPublicacao({...v,artefatos:[{...v.artefatos[0],conteudo:'alterado'}]}));
  assert.throws(()=>validarPublicacao({...v,diario:[{seq:1,hash:'falso'}]}));
  assert.match(saudeContato(null),/Sem conexão/);assert.match(saudeContato('2020-01-01'),/Sem contato recente/);
});
test('membro sem vínculo e integração não podem decidir; token é limitado ao projeto',async()=>{
  const original=global.fetch;const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL='http://127.0.0.1:54329';process.env.SUPABASE_SERVICE_ROLE_KEY='teste';
  global.fetch=async(input)=>{const u=new URL(String(input));assert.equal(u.hostname,'127.0.0.1');let data:any=null;
    if(u.pathname.endsWith('/user'))data={id:'outro'};
    if(u.pathname.endsWith('/profiles'))data={role:'member'};
    if(u.pathname.endsWith('/opera_projetos'))data={criado_por:'criador'};
    if(u.pathname.endsWith('/opera_integracoes'))data=u.searchParams.get('projeto')==='eq.projeto-a'?{id:'chave1',projeto:'projeto-a'}:null;
    return new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}});
  };
  try{
    const req=(token:string)=>new Request('http://localhost',{method:'POST',headers:{Authorization:`Bearer ${token}`},body:'{}'});
    assert.equal(await acessoOpera('projeto-a','ler',req('pessoa')),null);
    assert.ok(await acessoOpera('projeto-a','publicar',req('opr_token')));
    assert.equal(await acessoOpera('projeto-b','publicar',req('opr_token')),null);
    assert.equal((await decidir(req('opr_token'),{params:{slug:'projeto-a'}})).status,403);
  }finally{global.fetch=original;if(url===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=url;if(key===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=key;}
});
