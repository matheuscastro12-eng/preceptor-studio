import { NextResponse } from 'next/server';
import { acessoOpera, corpo, uuid } from '@/lib/opera/conexao';
import { operaDB } from '@/lib/opera/server';
export const dynamic='force-dynamic';
export async function POST(req:Request,{params}:{params:{slug:string}}) {
  try {
    const v=await corpo(req,50000);
    const a=await acessoOpera(params.slug,v.aceitar?'decidir':'publicar',req);
    if(!a||a.integracao) return NextResponse.json({error:'Compromisso exige uma pessoa autorizada.'},{status:403});
    if(v.aceitar) {if(!uuid(v.aceitar)) throw new Error('Versão inválida.');}
    else for(const campo of ['escopo','exclusoes','aceite','dependencias','capacidade']) if(typeof v[campo]!=='string'||!v[campo].trim()||v[campo].length>8000) throw new Error(`Preencha ${campo} (até 8000 caracteres).`);
    const {data,error}=await operaDB().rpc('opera_entrega_revisar',{p_projeto:params.slug,p_autor:a.id,p_dados:v.aceitar?{}:v,p_aceitar:v.aceitar??null});
    return NextResponse.json(error?{error:error.code==='23505'?'Vincule a Venture ou reabra a versão atual.':'Falha ao registrar compromisso.'}:{id:data},{status:error?(error.code==='23505'?409:503):201});
  } catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Entrega inválida.'},{status:400});}
}
