import { notFound } from "next/navigation";
import { getVentureDetail } from "@/lib/ventures";
import { VentureDetailView } from "./VentureDetailView";
import Link from 'next/link';
import { listarProjetos } from '@/lib/opera/server';

export const dynamic = "force-dynamic";

export default async function VentureDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const detail = await getVentureDetail(params.id);
  if (!detail) notFound();
  const {projetos}=await listarProjetos();
  const ligados=projetos.filter(p=>p.venture_id===params.id);
  return <><div style={{padding:'16px 24px',display:'flex',gap:20,flexWrap:'wrap'}}><Link href={`/dashboard/opera/novo?venture=${encodeURIComponent(params.id)}`}>Iniciar construção no OPERA →</Link>{ligados.map(p=><Link key={p.slug} href={`/dashboard/opera/${p.slug}/conexao`}>{p.nome} · compromisso e construção ↗</Link>)}</div><VentureDetailView detail={detail} /></>;
}
