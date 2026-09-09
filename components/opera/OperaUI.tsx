import Link from "next/link";
import { ArrowUpRight, ArrowRight, FileCheck2, Layers3, Sprout, Activity, CircleDot } from "lucide-react";
import { ETAPAS, NOMES, type ProjetoOpera } from "@/lib/opera/model";
import { MarkdownView } from "@/components/MarkdownView";

export function DataOpera({ valor }: { valor?: string | null }) {
  return <>{valor ? new Date(valor).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }) : "Ainda não publicado"}</>;
}
export function OperaHeader({ titulo, descricao, children }: { titulo: string; descricao: string; children?: React.ReactNode }) {
  return <header className="op-header"><div><div className="op-eyebrow"><span /> OPERA / PRECEPTOR!</div><h1>{titulo}</h1><p>{descricao}</p></div><div className="op-actions">{children}</div></header>;
}
export function OperaNav() {
  return <nav className="op-nav" aria-label="Áreas do OPERA"><Link href="/dashboard/opera"><Layers3 size={16} /> Construções</Link><Link href="/dashboard/crm">Comercial <ArrowUpRight size={14} /></Link><Link href="/dashboard/ventures">Entregas <ArrowUpRight size={14} /></Link><Link href="/dashboard/manual">Método <ArrowUpRight size={14} /></Link></nav>;
}
export function Trilha({ etapa }: { etapa?: string }) {
  return <ol className="op-trilha" aria-label="Etapas de construção">{ETAPAS.map(e => <li key={e} className={e === etapa ? "current" : ""} aria-current={e === etapa ? "step" : undefined}><span />{NOMES[e]}</li>)}</ol>;
}
export function ProjetoCard({ projeto }: { projeto: ProjetoOpera }) {
  const s = projeto.snapshot;
  return <article className="op-project"><div className="op-project-top"><span className="op-kind">{projeto.tipo === "automacao" ? "Automação" : projeto.tipo === "plataforma" ? "Plataforma" : "Sistema de agentes"}</span><span className={`op-pill ${s ? "teal" : ""}`}>{s ? NOMES[s.etapa] : "Aguardando atualização"}</span></div><h2><Link href={`/dashboard/opera/${projeto.slug}`}>{projeto.nome} <ArrowUpRight size={21} /></Link></h2><p>{projeto.processo}</p><LinksExternos projeto={projeto} /><div className="op-project-footer"><span>{projeto.responsavel || "Responsável não informado"}<small>{projeto.cliente}</small></span><Link className="op-circle" aria-label={`Acompanhar ${projeto.nome}`} href={`/dashboard/opera/${projeto.slug}`}><ArrowRight size={19} /></Link></div><div className="op-stamp"><Activity size={13} /><DataOpera valor={s?.atualizadoEm} /></div></article>;
}

/**
 * Os dois endereços que o projeto publica para fora.
 *
 * Existiam desde o começo e nada apontava para eles: quem abria o OPERA via o
 * card, clicava, e caía na página interna — enquanto o painel da venture, com
 * a evidência inteira, ficava a um endereço que só quem já sabia alcançava.
 * Só aparece o que está liberado no cadastro.
 */
export function LinksExternos({ projeto }: { projeto: ProjetoOpera }) {
  if (!projeto.painel_publico && !projeto.colheita_publica) return null;
  // Reusa o estilo da navegação de artefatos em vez de abrir classe nova: é a
  // mesma forma (uma fila de links curtos) e o opera.css está sendo mexido.
  return <nav className="op-artifact-nav" aria-label={`Endereços públicos de ${projeto.nome}`}>
    {projeto.painel_publico && <a href={`/painel/${projeto.slug}`} target="_blank" rel="noreferrer">Painel da construção <ArrowUpRight size={13} /></a>}
    {projeto.colheita_publica && <a href={`/colheita/${projeto.slug}`} target="_blank" rel="noreferrer">Colheita <ArrowUpRight size={13} /></a>}
  </nav>;
}
export function PainelProjeto({ projeto }: { projeto: ProjetoOpera }) {
  const s = projeto.snapshot;
  return <>
    <Trilha etapa={s?.etapa} />
    {!!s?.artefatos?.length && <nav className="op-artifact-nav" aria-label="Documentos da construção">{s.artefatos.map(a => <a key={a.id} href={`#${a.id}`}>{a.titulo} <ArrowRight size={12} /></a>)}</nav>}
    <section className="op-focus"><span className="op-eyebrow"><CircleDot size={14} /> PRÓXIMO MOVIMENTO</span><h2>{s?.proximaAcao ?? "Publicar o primeiro acompanhamento"}</h2><p>{s?.resumo ?? "O projeto já tem uma casa no OPERA. O responsável pela construção deve publicar o estado, as evidências e a próxima ação para que a equipe acompanhe por aqui."}</p><span className="op-stamp">Última evidência: <DataOpera valor={s?.atualizadoEm} /></span></section>
    <div className="op-metrics"><div><FileCheck2 size={20} /><span>Testes aprovados</span><strong>{s?.testes ? `${s.testes.passaram} / ${s.testes.total}` : "—"}</strong><small>{s?.testes ? "na última publicação" : "sem medição publicada"}</small></div><div><Sprout size={20} /><span>Corpus validado</span><strong>{s?.corpus ? `${s.corpus.validados} / ${s.corpus.meta}` : "—"}</strong><small>respostas recebidas ainda exigem revisão</small></div><div><Layers3 size={20} /><span>Achados abertos</span><strong>{s ? s.achados.filter(a => a.estado === "aberto").length : "—"}</strong><small>da revisão publicada</small></div></div>
    <div className="op-columns"><section className="op-panel"><div className="op-section-title"><h2>Revisão da construção</h2><span>Motor, agentes e plataforma</span></div>{s?.achados.length ? s.achados.map((a, i) => <div className="op-finding" key={i}><span className={`op-pill ${a.estado === "resolvido" ? "teal" : "amber"}`}>{a.estado === "resolvido" ? "Resolvido" : a.severidade}</span><p>{a.titulo}</p></div>) : <p className="op-empty">{s ? "Nenhum achado nesta publicação." : "Os achados aparecerão quando a revisão for publicada."}</p>}</section><section className="op-panel"><div className="op-section-title"><h2>Diário de atividade</h2><span>Evidência publicada</span></div>{s?.atividades.length ? s.atividades.map((a, i) => <article className="op-event" key={i}><span className="op-event-dot" /><time><DataOpera valor={a.quando} /></time><h3>{a.titulo}</h3><p>{a.detalhe}</p></article>) : <p className="op-empty">Nenhuma atividade publicada neste formato.</p>}</section></div>
    {s?.artefatos?.map(a => <section id={a.id} key={a.id} className="op-panel op-artifact"><div className="op-section-title"><h2>{a.titulo}</h2><span className="op-pill">{a.estado}</span></div><MarkdownView md={a.conteudo} /></section>)}
  </>;
}
