import { NextResponse } from "next/server";
import { membroOpera, operaDB, listarProjetos } from "@/lib/opera/server";
import { validarProjeto,slugValido } from "@/lib/opera/model";
import { validarReuniao } from '@/lib/opera/reuniao';
import { sha } from '@/lib/opera/conexao';
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const m=await membroOpera(req);
  if (!m) return NextResponse.json({ error: "Acesso restrito à equipe." }, { status: 403 });
  return NextResponse.json(await listarProjetos(m), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const membro = await membroOpera(req);
  if (!membro) return NextResponse.json({ error: "Acesso restrito à equipe." }, { status: 403 });
  let projeto; let reuniao;
  try {
    const texto = await req.text();
    if (texto.length > 400_000) throw new Error("Configuração muito grande.");
    projeto = JSON.parse(texto);
    reuniao = projeto.reuniao;
    validarProjeto(projeto);
    if (reuniao !== undefined) validarReuniao(reuniao);
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Configuração inválida." }, { status: 400 }); }
  const { slug, nome, cliente, processo, responsavel, tipo, colheita_publica, painel_publico, colheita, snapshot } = projeto;
  if(snapshot!==null) return NextResponse.json({error:'Cadastre sem snapshot; publique com identidade e histórico pela conexão.'},{status:400});
  const venture_id=projeto.venture_id??null;
  if(venture_id) {const {data}=await operaDB().from('ventures').select('id').eq('id',venture_id).maybeSingle();if(!data)return NextResponse.json({error:'Venture inválida.'},{status:400});}
  const processo_slug=projeto.processo_slug??slug;
  if(!slugValido(processo_slug))return NextResponse.json({error:'Identificador de processo inválido.'},{status:400});
  const registro = { slug, nome, cliente, processo, responsavel, tipo, colheita_publica, painel_publico, colheita, snapshot, venture_id, processo_slug, criado_por: membro.id };
  const { error } = reuniao
    ? await operaDB().rpc('opera_cadastrar_com_reuniao', { p_projeto: registro, p_reuniao: reuniao, p_hash: sha(reuniao.transcricao), p_registro_hash: sha(JSON.stringify(reuniao)), p_autor: membro.id })
    : await operaDB().from("opera_projetos").insert(registro);
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Já existe um projeto com esse endereço." : "Não foi possível cadastrar. Verifique a conexão e a migração OPERA." }, { status: error.code === "23505" ? 409 : 503 });
  return NextResponse.json({ slug, painel: `/painel/${slug}`, colheita: `/colheita/${slug}`, portal: `/dashboard/opera/${slug}` }, { status: 201 });
}
