import { createHash } from 'node:crypto';
import { operaDB, membroOpera } from './server';
import { validarSnapshot, type Snapshot } from './model';

export const sha = (s: string) => createHash('sha256').update(s).digest('hex');
export const uuid = (s: unknown): s is string => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
export type Permissao = 'ler'|'publicar'|'decidir'|'gerenciar';
export async function acessoOpera(slug: string, permissao: Permissao, req?: Request) {
  const db = operaDB();
  const token = req?.headers.get('authorization')?.match(/^Bearer (opr_[a-zA-Z0-9_-]+)$/)?.[1];
  if (token) {
    if (!['ler','publicar'].includes(permissao)) return null;
    const { data } = await db.from('opera_integracoes').select('id,projeto').eq('token_hash',sha(token)).eq('projeto',slug).is('revogado_em',null).gt('expira_em',new Date().toISOString()).maybeSingle();
    return data ? { id: `integracao:${data.id}`, integracao: true, admin: false } : null;
  }
  const m = await membroOpera(req);
  if (!m) return null;
  const admin = ['owner','admin'].includes(m.role);
  const { data: p } = await db.from('opera_projetos').select('criado_por').eq('slug',slug).maybeSingle();
  if (!p) return null;
  if (admin || p.criado_por === m.id) return { id: m.id, integracao: false, admin: true };
  const { data } = await db.from('opera_membros').select('papel').eq('projeto',slug).eq('usuario',m.id).maybeSingle();
  const allowed: Record<Permissao,string[]> = { ler:['leitor','operador','revisor'], publicar:['operador','revisor'], decidir:['revisor'], gerenciar:[] };
  return data && allowed[permissao].includes(data.papel) ? { id:m.id, integracao:false, admin:false } : null;
}
export interface ArtefatoRevisao { chave: string; propostaId: string; hash: string; conteudo: string; situacao: string }
export function validarPublicacao(v: any): asserts v is { eventoId: string; construcaoId: string; snapshot: Snapshot; artefatos: ArtefatoRevisao[]; diario?:any[] } {
  if (!v || !uuid(v.eventoId) || !uuid(v.construcaoId)) throw new Error('Informe evento e construção com identidade estável.');
  validarSnapshot(v.snapshot);
  if (!Array.isArray(v.artefatos) || v.artefatos.length>150) throw new Error('Artefatos de revisão inválidos.');
  const chaves = new Set<string>();
  for (const a of v.artefatos) {
    if (!a || typeof a.chave !== 'string' || !/^(escopo|partitura|personas|corpus|esqueleto|passos|ensaio|verificacao|sombra|passo:[0-9]+)$/.test(a.chave) || chaves.has(a.chave) || !/^[0-9a-f]{64}$/.test(a.propostaId) || typeof a.conteudo !== 'string' || a.conteudo.length>300_000 || sha(a.conteudo)!==a.hash || !['proposta','aprovada','recusada','desatualizada'].includes(a.situacao)) throw new Error('Artefato alterado, duplicado ou sem proposta identificável.');
    chaves.add(a.chave);
  }
  if(v.diario!==undefined){
    if(!Array.isArray(v.diario)||v.diario.length>10000)throw new Error('Diário inválido.');
    let anterior:string|null=null;
    for(const [i,e] of v.diario.entries()){
      const {hash,...resto}=e;
      if(e.seq!==i+1||e.anterior!==anterior||sha(JSON.stringify(resto))!==hash||!['proposta','aprovacao','recusa'].includes(e.tipo)||typeof e.etapa!=='string'||!/^[0-9a-f]{64}$/.test(e.artefato)||!Number.isFinite(Date.parse(e.quando))||(e.tipo!=='proposta'&&(typeof e.quem!=='string'||!e.quem.trim())))throw new Error('Cadeia do diário inválida.');
      anterior=hash;
    }
    for(const a of v.artefatos){const propostas=v.diario.filter((e:any)=>e.etapa===a.chave&&e.tipo==='proposta');const p=propostas.at(-1);if(!p||p.hash!==a.propostaId||(a.situacao!=='desatualizada'&&p.artefato!==a.hash))throw new Error('Artefato não corresponde à proposta do diário.');}
  }
}
export async function corpo(req: Request, limite=2_000_000) {
  const t=await req.text(); if(t.length>limite) throw new Error('Conteúdo excede o limite.');
  const v=JSON.parse(t); if(!v || typeof v!=='object' || Array.isArray(v)) throw new Error('Objeto esperado.'); return v;
}
export function saudeContato(contato?:string|null) { return !contato ? 'Sem conexão confirmada' : Date.now()-Date.parse(contato)>15*60_000 ? 'Sem contato recente · verificar sincronização' : 'Conexão recente'; }
