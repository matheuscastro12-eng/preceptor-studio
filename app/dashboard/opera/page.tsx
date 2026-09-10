import Link from "next/link";
import { Plus, ArrowRight, Sprout, GitBranch } from "lucide-react";
import { listarProjetos, membroOpera } from "@/lib/opera/server";
import { redirect } from "next/navigation";
import { OperaHeader, OperaNav, ProjetoCard } from "@/components/opera/OperaUI";
export const dynamic = "force-dynamic";
export default async function OperaPage() {
  if (!await membroOpera()) redirect("/login?redirect=/dashboard/opera");
  const { projetos, aviso } = await listarProjetos();
  return <><OperaHeader titulo="O trabalho, à vista." descricao="Da primeira pergunta à operação. Acompanhe cada construção, reúna evidências e encontre o próximo movimento."><Link className="op-button" href="/dashboard/opera/novo"><Plus size={16} /> Novo projeto</Link></OperaHeader><OperaNav />
    <section className="op-intro"><div><div className="op-eyebrow">CÉREBRO DA OPERAÇÃO</div><h2>Cada projeto com uma casa.</h2><p>Colheita, construção e revisão no mesmo lugar. O que a equipe sabe fica visível para quem precisa agir.</p></div><div className="op-intro-path">Colher <ArrowRight size={14} /> Construir <ArrowRight size={14} /> Verificar</div></section>
    {aviso && <p className="op-note warning" role="status">{aviso}</p>}
    {!projetos.some(p => p.slug === 'oasis-cte') && <p className="op-note">OASIS mantém seus links históricos: <Link href="/colheita/oasis-cte">colheita</Link> e <Link href="/painel/oasis-cte#motor">painel do motor</Link>. O acompanhamento interno depende do cadastro e vínculo da construção.</p>}
    <div className="op-section-title"><h2>Projetos em acompanhamento</h2><span>{projetos.length} {projetos.length === 1 ? "projeto" : "projetos"} · estado da última publicação</span></div>
    <div className="op-project-grid">{projetos.map(p => <ProjetoCard key={p.slug} projeto={p} />)}</div>
    <div className="op-tools"><article className="op-tool"><Sprout size={24} /><div><h3>A construção começa com quem sabe.</h3><p>Cada projeto recebe uma colheita própria: perguntas por área, ocorrências reais e decisões de quem trabalha hoje.</p><Link href="/dashboard/opera/novo">Preparar uma colheita <ArrowRight size={14} /></Link></div></article><article className="op-tool"><GitBranch size={24} /><div><h3>Do combinado ao entregue.</h3><p>O Comercial e as Ventures continuam no mesmo Studio. Use a oportunidade e o escopo acordado para iniciar a construção.</p><Link href="/dashboard/crm">Abrir o Comercial <ArrowRight size={14} /></Link></div></article></div>
  </>;
}
