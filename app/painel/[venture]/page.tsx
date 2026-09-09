import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { projetoOpera, operaDB } from "@/lib/opera/server";
import { slugValido } from "@/lib/opera/model";
import { OperaHeader, PainelProjeto } from "@/components/opera/OperaUI";
import "@/app/dashboard/opera/opera.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Painel de construção · OPERA", robots: { index: false, follow: false } };
export default async function Painel({ params }: { params: { venture: string } }) {
  if (!slugValido(params.venture)) notFound();
  const p = await projetoOpera(params.venture);
  if (!p) {
    const { data } = await operaDB().from("painel_construcao").select("venture").eq("venture", params.venture).maybeSingle();
    if (!data) notFound();
    redirect(`/api/public/painel/${params.venture}`);
  }
  if (!p.painel_publico) notFound();
  // The existing OASIS HTML remains available from its original URL, including #motor.
  if (p.slug === "oasis-cte" && !p.snapshot) {
    redirect(`/api/public/painel/${p.slug}`);
  }
  return <main className="op-root"><Link className="op-back" href="/">PRECEPTOR! Studio</Link><OperaHeader titulo={p.nome} descricao={p.processo}>{p.colheita_publica && <Link className="op-button secondary" href={`/colheita/${p.slug}`}>Responder à colheita ↗</Link>}</OperaHeader><PainelProjeto projeto={p} /><p className="op-note">Este painel apresenta a última evidência publicada pela equipe. Decisões de aprovação são registradas no fluxo da construção.</p></main>;
}
