// Real Next handlers + real builder + isolated HTTP database fixture. Never production.
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {colheitaInicial} from '../lib/opera/model';
async function main(){
  const repo=process.env.CONSTRUTOR_REPO;if(!repo)throw Error('Informe CONSTRUTOR_REPO para testar o pacote real.');
  const {Construtor}=await import(pathToFileURL(join(repo,'src/construtor/construtor.ts')).href);
  const {sincronizarPortal}=await import(pathToFileURL(join(repo,'src/construtor/studio.ts')).href);
  const base='http://localhost:3100';process.env.OPERA_PORTAL_URL=base;process.env.OPERA_PORTAL_TOKEN='fixture-member';
  async function api(path:string,body?:any){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer fixture-member','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();assert.ok(r.ok,JSON.stringify(data));return data;}
  for(const conflito of [false,true]){
    const slug=`e2e-${conflito?'conflito':'aprovado'}-${Date.now()}`;
    await api('/api/opera/projetos',{slug,nome:'Projeto de teste',cliente:'Cliente fictício',processo:'Conferir pedidos da operação',responsavel:'Pessoa de teste',tipo:'agente',colheita_publica:false,painel_publico:false,colheita:colheitaInicial(),snapshot:null,venture_id:'venture-teste'});
    const p=await api(`/api/opera/projetos/${slug}`);
    const dir=mkdtempSync(join(tmpdir(),'opera-integrado-'));mkdirSync(join(dir,'.opera'));writeFileSync(join(dir,'.opera/portal.json'),JSON.stringify({slug,construcaoId:p.construcao_id}));
    const c=new Construtor({dir});await c.propor('escopo',{frase:'Conferir pedidos recebidos pela operação',porque:'As regras atuais não resolvem as exceções ambíguas observadas.'});
    await sincronizarPortal(c);
    const pubs=await fetch('http://127.0.0.1:54329/rest/v1/opera_publicacoes?projeto=eq.'+slug).then(r=>r.json());
    const pub=pubs[0],a=pub.artefatos[0];
    await api(`/api/opera/projetos/${slug}/decisoes`,{publicacao:pub.id,propostaId:a.propostaId,hash:a.hash,decisao:'aprovar',motivo:'Revisei o escopo e os limites com a operação.'});
    if(conflito){const path=c.arquivoDe('escopo');writeFileSync(path,readFileSync(path,'utf8')+'\n');}
    await sincronizarPortal(c);
    const state=await api(`/api/opera/projetos/${slug}/conexao`);
    assert.equal(state.decisoes[0].estado,conflito?'conflito':'aplicada');assert.equal(c.diario.aprovada('escopo'),!conflito);
    const n=c.diario.tudo.length;await sincronizarPortal(c);assert.equal(c.diario.tudo.length,n);
    const e=await api(`/api/opera/projetos/${slug}/entrega`,{escopo:'Escopo acordado',exclusoes:'Fora do escopo',aceite:'Jornada passa nos testes',dependencias:'Dados de teste',capacidade:'Pessoa responsável confirma capacidade'});
    await api(`/api/opera/projetos/${slug}/entrega`,{aceitar:e.id});
    console.log(`Ciclo real passou: ${slug} · ${dir}`);
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
