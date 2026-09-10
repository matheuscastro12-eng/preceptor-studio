import { NextResponse } from 'next/server';
import { acessoOpera, corpo, uuid } from '@/lib/opera/conexao';
import { operaDB } from '@/lib/opera/server';
export const dynamic='force-dynamic';
export async function POST(req:Request,{params}:{params:{slug:string}}) {
  const a=await acessoOpera(params.slug,'decidir',req); if(!a || a.integracao) return NextResponse.json({error:'Revisão exige uma pessoa autorizada.'},{status:403});
  try {
    const v=await corpo(req,10000);
    if(!uuid(v.publicacao) || !/^[0-9a-f]{64}$/.test(v.propostaId) || !/^[0-9a-f]{64}$/.test(v.hash) || !['aprovar','recusar'].includes(v.decisao) || typeof v.motivo!=='string' || v.motivo.trim().length<10 || v.motivo.length>2000) throw new Error('Identifique a versão e registre o motivo da decisão (10–2000 caracteres).');
    const {data,error}=await operaDB().rpc('opera_decidir',{p_projeto:params.slug,p_publicacao:v.publicacao,p_proposta:v.propostaId,p_hash:v.hash,p_decisao:v.decisao,p_motivo:v.motivo,p_autor:a.id});
    return NextResponse.json(error?{error:error.code==='23505'?'A proposta mudou ou já recebeu uma decisão. Reabra a revisão.':'Falha ao registrar decisão.'}:{id:data},{status:error?(error.code==='23505'?409:503):201});
  } catch(e) {return NextResponse.json({error:e instanceof Error?e.message:'Decisão inválida.'},{status:400});}
}
export async function PATCH(req:Request,{params}:{params:{slug:string}}) {
  const a=await acessoOpera(params.slug,'publicar',req); if(!a) return NextResponse.json({error:'Confirmação não autorizada.'},{status:403});
  try {
    const v=await corpo(req,10000);
    if(!uuid(v.id)||!['aplicada','conflito'].includes(v.estado)||typeof v.resultado!=='string'||!v.resultado.trim()||v.resultado.length>2000) throw new Error('Resultado de aplicação inválido.');
    const db=operaDB();
    const {data:prev}=await db.from('opera_decisoes').select('estado,resultado').eq('projeto',params.slug).eq('id',v.id).maybeSingle();
    if(prev && prev.estado===v.estado && prev.resultado===v.resultado) return NextResponse.json({ok:true});
    const {data,error}=await db.from('opera_decisoes').update({estado:v.estado,resultado:v.resultado,confirmado_em:new Date().toISOString()}).eq('projeto',params.slug).eq('id',v.id).eq('estado','pendente').select('id').maybeSingle();
    return NextResponse.json(error||!data?{error:'Decisão ausente ou resultado já confirmado.'}:{ok:true},{status:error?503:!data?409:200});
  } catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Confirmação inválida.'},{status:400});}
}
