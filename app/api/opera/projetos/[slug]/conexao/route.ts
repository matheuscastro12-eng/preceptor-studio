import { NextResponse } from 'next/server';
import { acessoOpera, corpo, sha, validarPublicacao } from '@/lib/opera/conexao';
import { operaDB } from '@/lib/opera/server';
export const dynamic='force-dynamic';
export async function GET(req:Request,{params}:{params:{slug:string}}) {
  const a=await acessoOpera(params.slug,'ler',req); if(!a) return NextResponse.json({error:'Sem acesso a esta construção.'},{status:403});
  const db=operaDB();
  const {data:p,error}=await db.from('opera_projetos').select('construcao_id,venture_id,processo_slug,ultimo_contato').eq('slug',params.slug).single();
  if(error) return NextResponse.json({error:'Aplique a migração de conexão OPERA.'},{status:503});
  const {data:decisoes,error:e}=await db.from('opera_decisoes').select('*').eq('projeto',params.slug).order('criado_em',{ascending:false}).limit(200);
  if(e) return NextResponse.json({error:'Não foi possível consultar as decisões.'},{status:503});
  return NextResponse.json({...p,decisoes: a.integracao ? decisoes?.filter(d=>d.estado==='pendente') : decisoes},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:Request,{params}:{params:{slug:string}}) {
  const a=await acessoOpera(params.slug,'publicar',req); if(!a) return NextResponse.json({error:'Publicação não autorizada.'},{status:403});
  try {
    const v=await corpo(req); validarPublicacao(v);
    const db=operaDB(); const {data:p}=await db.from('opera_projetos').select('construcao_id').eq('slug',params.slug).single();
    if(p?.construcao_id!==v.construcaoId) return NextResponse.json({error:'Construção diferente da vinculada ao projeto.'},{status:409});
    const digest=sha(JSON.stringify(v));
    const {data,error}=await db.rpc('opera_publicar',{p_projeto:params.slug,p_evento:v.eventoId,p_digest:digest,p_autor:a.id,p_snapshot:v.snapshot,p_artefatos:v.artefatos,p_diario:v.diario??[]});
    if(error) return NextResponse.json({error:error.code==='23505'?'Publicação repetida com alterações ou desatualizada.':'Falha ao persistir a publicação.'},{status:error.code==='23505'?409:503});
    return NextResponse.json({id:data});
  } catch(e) {return NextResponse.json({error:e instanceof Error?e.message:'Publicação inválida.'},{status:400});}
}
export async function PATCH(req:Request,{params}:{params:{slug:string}}) {
  const a=await acessoOpera(params.slug,'publicar',req); if(!a) return NextResponse.json({error:'Conexão não autorizada.'},{status:403});
  const {error}=await operaDB().from('opera_projetos').update({ultimo_contato:new Date().toISOString()}).eq('slug',params.slug);
  return NextResponse.json(error?{error:'Falha ao registrar contato.'}:{ok:true},{status:error?503:200});
}
