import { NextResponse } from "next/server";
import { membroOpera, operaDB } from "@/lib/opera/server";
import { slugValido, validarSnapshot } from "@/lib/opera/model";
import { acessoOpera } from '@/lib/opera/conexao';
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  if (!await acessoOpera(params.slug,'ler',req)) return NextResponse.json({ error: "Acesso restrito ao projeto." }, { status: 403 });
  if (!slugValido(params.slug)) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
  // Publication clients must distinguish persisted projects from the public OASIS fallback.
  const { data: p, error } = await operaDB().from("opera_projetos").select("*").eq("slug", params.slug).maybeSingle();
  if (error) return NextResponse.json({ error: "Cadastro de projetos indisponível." }, { status: 503 });
  return NextResponse.json(p ?? { error: "Projeto não encontrado." }, { status: p ? 200 : 404, headers: { "Cache-Control": "no-store" } });
}

// The builder publishes structured evidence; a publication never approves a gate.
export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  if (!await acessoOpera(params.slug,'publicar',req)) return NextResponse.json({error:'Publicação não autorizada.'},{status:403});
  return NextResponse.json({error:'Use POST /api/opera/projetos/<slug>/conexao com eventoId, construcaoId, snapshot e artefatos. A publicação sem histórico foi encerrada.'},{status:410});
}
