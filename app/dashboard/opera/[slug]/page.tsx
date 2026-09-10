import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowUpRight, Sprout, FileText } from "lucide-react";
import { membroOpera, projetoOpera, evidenciaProjeto, operaDB } from "@/lib/opera/server";
import { slugValido } from "@/lib/opera/model";
import { OperaHeader, PainelProjeto, DataOpera } from "@/components/opera/OperaUI";
import { acessoOpera, saudeContato } from '@/lib/opera/conexao';
export const dynamic = "force-dynamic";
export default async function Projeto({ params }: { params: { slug: string } }) {
  if (!await membroOpera()) redirect("/login?redirect=/dashboard/opera");
  if (!slugValido(params.slug)) notFound();
  if(!await acessoOpera(params.slug,'ler')) notFound();
  const p = await projetoOpera(params.slug);
  if (!p) notFound();
  const ev = await evidenciaProjeto(p.slug);
  const { data: respostas, error } = await operaDB().from("colheita_respostas").select("id,respondente_nome,respondente_funcao,respostas,ocorrencias,rotulos").eq("venture", p.slug).order("id", { ascending: false }).limit(30);
  return <><Link className="op-back" href="/dashboard/opera">← Todas as construções</Link><OperaHeader titulo={p.nome} descricao={p.processo}><span className="op-pill">{p.cliente}</span></OperaHeader>
    {ev.painelEm && !p.snapshot && <section className="op-note">Este projeto publica um painel completo pelo seu gerador. <Link href={`/painel/${p.slug}`}><b>Abrir acompanhamento publicado ↗</b></Link><br />Última publicação: <DataOpera valor={ev.painelEm} />. As métricas abaixo aguardam integração estruturada; não são extraídas do HTML.</section>}
    <p className="op-note"><Link href={`/dashboard/opera/${p.slug}/conexao`}><b>Revisar evidências, decidir e conectar a entrega →</b></Link><br/>{saudeContato(p.ultimo_contato)}</p>
    <PainelProjeto projeto={p} />
    <p className="op-note"><Link href={`/dashboard/opera/${p.slug}/reunioes`}><b>Reuniões: registrar transcrição, revisar contexto e levar ao Construtor →</b></Link></p>
    <div className="op-tools"><article className="op-tool"><Sprout size={25} /><div><h3>Colheita de evidências</h3><p>{ev.respostas === null ? "Não foi possível consultar as respostas." : `${ev.respostas} envio(s) recebido(s).`} Instrumento v{p.colheita.versao}, com {p.colheita.perguntas.length} perguntas e {Object.keys(p.colheita.fichas).length} tipo(s) de ficha.</p>{p.colheita_publica ? <Link href={`/colheita/${p.slug}`}>Abrir colheita <ArrowUpRight size={14} /></Link> : <span className="op-pill">Link público desativado</span>}</div></article><article className="op-tool"><FileText size={25} /><div><h3>Painel da construção</h3><p>Estado, motor, revisões e atividade. {ev.falhaPainel ? "A fonte do painel legado está indisponível." : "A publicação acompanha a evolução do trabalho."}</p>{p.painel_publico ? <Link href={`/painel/${p.slug}`}>Abrir painel <ArrowUpRight size={14} /></Link> : <span className="op-pill">Visão restrita à equipe</span>}</div></article></div>
    <section className="op-panel" style={{ marginTop: 24 }}><div className="op-section-title"><h2>Respostas da colheita</h2><span>Até 30 envios · revisão humana pendente</span></div>{error ? <p className="op-note warning">Não foi possível carregar as respostas. Verifique a conexão e a migração da colheita.</p> : !respostas?.length ? <p className="op-empty">Nenhum envio recebido. Compartilhe a colheita com as pessoas que conhecem o processo.</p> : respostas.map(r => <details className="op-response" key={r.id}><summary>{r.respondente_nome}<small>{r.respondente_funcao || "Função não informada"}</small></summary><dl>{Object.entries(r.respostas ?? {}).map(([id, resposta]) => <div key={id}><dt>{p.colheita.perguntas.find(q => q.id === id)?.texto ?? id}</dt><dd>{typeof resposta === "string" ? resposta : Object.entries(resposta as object).filter(([, v]) => v !== null && v !== "").map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`).join("\n")}</dd></div>)}</dl><details><summary>Ocorrências e listas enviadas</summary><pre>{JSON.stringify({ ocorrencias: r.ocorrencias, listas: r.rotulos }, null, 2)}</pre></details></details>)}</section>
    <section className="op-panel" style={{ marginTop: 24 }}><div className="op-section-title"><h2>Ligação com o Construtor</h2><span>Publicação com identidade e histórico</span></div><p className="op-empty">O sincronizador envia o estado e as evidências da construção. Publicar não aprova etapas nem promove respostas ao corpus.</p><Link className="op-button" href={`/dashboard/opera/${p.slug}/conexao`}>Configurar conexão e revisar evidências →</Link></section>
  </>;
}
