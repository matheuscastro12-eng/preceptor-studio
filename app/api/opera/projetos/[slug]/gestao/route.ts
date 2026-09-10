import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { acessoOpera, corpo, sha, uuid } from '@/lib/opera/conexao';
import { operaDB } from '@/lib/opera/server';
import { slugValido } from '@/lib/opera/model';
export const dynamic='force-dynamic';
export async function POST(req:Request,{params}:{params:{slug:string}}) {
  const a=await acessoOpera(params.slug,'gerenciar',req); if(!a) return NextResponse.json({error:'Somente o responsável ou administrador pode configurar.'},{status:403});
  const db=operaDB();
  try {
    const v=await corpo(req,15000); let error:any; let resposta:any={ok:true};
    if(v.acao==='vincular') {
      if(typeof v.venture_id!=='string'||v.venture_id.length>100||!slugValido(v.processo_slug)) throw new Error('Escolha a Venture e o identificador do processo.');
      const {data:venture}=await db.from('ventures').select('id,name,client_id').eq('id',v.venture_id).maybeSingle();
      if(!venture) throw new Error('Venture não encontrada.');
      const {data:atual}=await db.from('opera_projetos').select('venture_id,processo_slug').eq('slug',params.slug).single();
      if(atual?.venture_id && (atual.venture_id!==v.venture_id||atual.processo_slug!==v.processo_slug)) throw new Error('Identidade já vinculada. Uma transferência exige migração revisada.');
      ({error}=await db.from('opera_projetos').update({venture_id:venture.id,processo_slug:v.processo_slug}).eq('slug',params.slug));
    } else if(v.acao==='cerebro') {
      if(!uuid(v.construcao))throw new Error('Identidade do Cérebro inválida.');
      ({error}=await db.rpc('opera_ligar_cerebro',{p_projeto:params.slug,p_construcao:v.construcao,p_autor:a.id}));
    } else if(v.acao==='token') {
      const token='opr_'+randomBytes(32).toString('base64url');
      const expira_em=new Date(Date.now()+30*86400_000).toISOString();
      ({error}=await db.from('opera_integracoes').insert({projeto:params.slug,token_hash:sha(token),criado_por:a.id,expira_em}));
      resposta={token,expira_em};
    } else if(v.acao==='revogar') {
      if(!uuid(v.id)) throw new Error('Credencial inválida.');
      ({error}=await db.from('opera_integracoes').update({revogado_em:new Date().toISOString()}).eq('id',v.id).eq('projeto',params.slug));
    } else if(v.acao==='membro') {
      if(!uuid(v.usuario)||!['leitor','operador','revisor','remover'].includes(v.papel)) throw new Error('Usuário ou papel inválido.');
      const {data:m}=await db.from('profiles').select('role').eq('id',v.usuario).maybeSingle();
      if(!m||!['owner','admin','member'].includes(m.role)) throw new Error('O usuário deve ser membro ativo do Studio.');
      ({error}=v.papel==='remover'?await db.from('opera_membros').delete().eq('projeto',params.slug).eq('usuario',v.usuario):await db.from('opera_membros').upsert({projeto:params.slug,usuario:v.usuario,papel:v.papel}));
    } else if(v.acao==='visibilidade') {
      if(typeof v.painel_publico!=='boolean'||typeof v.colheita_publica!=='boolean') throw new Error('Visibilidade inválida.');
      ({error}=await db.from('opera_projetos').update({painel_publico:v.painel_publico,colheita_publica:v.colheita_publica}).eq('slug',params.slug));
    } else throw new Error('Ação desconhecida.');
    if(error) return NextResponse.json({error:'Não foi possível salvar. Verifique a migração.'},{status:503});
    await db.from('opera_auditoria').insert({projeto:params.slug,tipo:v.acao,autor:a.id,detalhe:{...v}});
    return NextResponse.json(resposta,{headers:{'Cache-Control':'no-store'}});
  } catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Configuração inválida.'},{status:400});}
}
