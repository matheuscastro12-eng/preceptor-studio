import { NextResponse } from "next/server";
import { membroOpera, operaDB, listarProjetos } from "@/lib/opera/server";
import { validarProjeto } from "@/lib/opera/model";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!await membroOpera(req)) return NextResponse.json({ error: "Acesso restrito à equipe." }, { status: 403 });
  return NextResponse.json(await listarProjetos(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const membro = await membroOpera(req);
  if (!membro) return NextResponse.json({ error: "Acesso restrito à equipe." }, { status: 403 });
  let projeto;
  try {
    const texto = await req.text();
    if (texto.length > 200_000) throw new Error("Configuração muito grande.");
    projeto = JSON.parse(texto);
    validarProjeto(projeto);
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Configuração inválida." }, { status: 400 }); }
  const { slug, nome, cliente, processo, responsavel, tipo, colheita_publica, painel_publico, colheita, snapshot } = projeto;
  const { error } = await operaDB().from("opera_projetos").insert({ slug, nome, cliente, processo, responsavel, tipo, colheita_publica, painel_publico, colheita, snapshot, criado_por: membro.id });
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Já existe um projeto com esse endereço." : "Não foi possível cadastrar. Verifique a conexão e a migração OPERA." }, { status: error.code === "23505" ? 409 : 503 });
  return NextResponse.json({ slug, painel: `/painel/${slug}`, colheita: `/colheita/${slug}`, portal: `/dashboard/opera/${slug}` }, { status: 201 });
}
