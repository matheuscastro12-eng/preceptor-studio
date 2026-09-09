import { NextResponse } from "next/server";
import { membroOpera, operaDB } from "@/lib/opera/server";
import { slugValido, validarSnapshot } from "@/lib/opera/model";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  if (!await membroOpera(req)) return NextResponse.json({ error: "Acesso restrito à equipe." }, { status: 403 });
  if (!slugValido(params.slug)) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
  // Publication clients must distinguish persisted projects from the public OASIS fallback.
  const { data: p, error } = await operaDB().from("opera_projetos").select("*").eq("slug", params.slug).maybeSingle();
  if (error) return NextResponse.json({ error: "Cadastro de projetos indisponível." }, { status: 503 });
  return NextResponse.json(p ?? { error: "Projeto não encontrado." }, { status: p ? 200 : 404, headers: { "Cache-Control": "no-store" } });
}

// The builder publishes structured evidence; a publication never approves a gate.
export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  if (!await membroOpera(req)) return NextResponse.json({ error: "Acesso restrito à equipe." }, { status: 403 });
  if (!slugValido(params.slug)) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
  let snapshot;
  try {
    const texto = await req.text();
    if (texto.length > 200_000) throw new Error("Publicação muito grande.");
    snapshot = JSON.parse(texto).snapshot;
    validarSnapshot(snapshot);
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Publicação inválida." }, { status: 400 }); }
  // Compare-and-set prevents old runs from overwriting more recent evidence.
  const { data, error } = await operaDB().from("opera_projetos").update({ snapshot, atualizado_em: new Date().toISOString() })
    .eq("slug", params.slug).or(`snapshot.is.null,snapshot->>atualizadoEm.lt.${snapshot.atualizadoEm}`).select("slug").maybeSingle();
  if (error) return NextResponse.json({ error: "Falha ao publicar o acompanhamento." }, { status: 503 });
  if (!data) return NextResponse.json({ error: "Projeto ausente ou publicação mais recente já recebida." }, { status: 409 });
  return NextResponse.json({ ok: true });
}
