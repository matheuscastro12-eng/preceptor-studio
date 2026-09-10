import { NextResponse } from 'next/server';
import { acessoOpera, corpo, sha, uuid } from '@/lib/opera/conexao';
import { operaDB } from '@/lib/opera/server';
import { validarReuniao, fonteDaReuniao } from '@/lib/opera/reuniao';
export const dynamic = 'force-dynamic';
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const a = await acessoOpera(params.slug, 'ler', req);
  if (!a || a.integracao) return NextResponse.json({ error: 'Acesso restrito aos membros deste projeto.' }, { status: 403 });
  const id = new URL(req.url).searchParams.get('fonte');
  if (!uuid(id)) return NextResponse.json({ error: 'Fonte inválida.' }, { status: 400 });
  const { data, error } = await operaDB().from('opera_reunioes').select('*').eq('projeto', params.slug).eq('id', id).maybeSingle();
  if (error) return NextResponse.json({ error: 'Fonte indisponível.' }, { status: 503 });
  if (!data) return NextResponse.json({ error: 'Fonte não encontrada.' }, { status: 404 });
  return new Response(fonteDaReuniao(data, `${data.id} · sha256:${data.fonte_hash} · autor:${data.criado_por} · ${data.criado_em}`), { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Content-Disposition': `attachment; filename="reuniao-${data.id}.md"`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const a = await acessoOpera(params.slug, 'publicar', req);
  if (!a || a.integracao) return NextResponse.json({ error: 'Somente operadores e revisores do projeto podem registrar reuniões.' }, { status: 403 });
  let v;
  try { v = await corpo(req, 200_000); validarReuniao(v); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 400 }); }
  const { data, error } = await operaDB().from('opera_reunioes').insert({ projeto: params.slug, titulo: v.titulo, transcricao: v.transcricao, leitura: v.leitura, revisada: v.revisada, fonte_hash: sha(v.transcricao), registro_hash: sha(JSON.stringify(v)), criado_por: a.id }).select('id').single();
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'Esta versão da leitura já está registrada. Consulte a fonte existente.' : 'Não foi possível registrar a reunião. Verifique a migração OPERA v3.' }, { status: error.code === '23505' ? 409 : 503 });
  return NextResponse.json(data, { status: 201 });
}
