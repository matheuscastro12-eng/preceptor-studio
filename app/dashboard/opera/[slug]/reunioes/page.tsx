import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { membroOpera, operaDB } from '@/lib/opera/server';
import { acessoOpera } from '@/lib/opera/conexao';
import { OperaHeader, DataOpera } from '@/components/opera/OperaUI';
import ReunioesProjeto from '@/components/opera/ReunioesProjeto';
import { CAMPOS_REUNIAO, type CampoReuniao } from '@/lib/opera/reuniao';
export const dynamic = 'force-dynamic';
export default async function Reunioes({ params }: { params: { slug: string } }) {
  if (!await membroOpera()) redirect('/login');
  if (!await acessoOpera(params.slug, 'ler')) notFound();
  const podeRegistrar = !!await acessoOpera(params.slug, 'publicar');
  const { data, error } = await operaDB().from('opera_reunioes').select('*').eq('projeto', params.slug).order('criado_em', { ascending: false }).limit(50);
  return <><Link className="op-back" href={`/dashboard/opera/${params.slug}`}>← Construção</Link><OperaHeader titulo="O que a conversa revelou." descricao="Reuniões alimentam o contexto comercial e técnico. A fonte permanece privada, com leitura rastreável e lacunas explícitas." />
    <p className="op-note">Baixe a fonte e leve ao Construtor com <code>opera-construtor comecar --dir /caminho/solucao --fonte /caminho/reuniao.md --manifesto &lt;o da página de conexão&gt;</code>: a pasta nasce já ligada a este projeto. O manifesto está em <b>Conexão</b>, com o comando montado. A leitura não substitui corpus validado, aprovação de etapas nem aceite da entrega. Novas reuniões não sobrescrevem o escopo ou o instrumento existente.</p>
    <section className="op-panel"><div className="op-section-title"><h2>Fontes registradas</h2><span>Até 50 reuniões recentes</span></div>
      {error ? <p className="op-note warning">Fontes indisponíveis. Verifique a conexão e a migração OPERA v3.</p> : !data?.length ? <p className="op-empty">Nenhuma reunião registrada. Uma conversa pode ser o início da construção, mesmo sem LP.</p> : data.map(r => <details key={r.id} className="op-response"><summary>{r.titulo}<small>{r.revisada ? 'Leitura conferida' : 'Rascunho não revisado'} · <DataOpera valor={r.criado_em} /></small></summary>
        <dl>{Object.entries(CAMPOS_REUNIAO).map(([k, label]) => { const c = r.leitura.campos[k as CampoReuniao]; return <div key={k}><dt>{label}</dt><dd>{c.texto || 'Não identificado'}{c.trecho && <blockquote>{c.trecho}</blockquote>}</dd></div>; })}</dl>
        <h3>Lacunas para a próxima colheita</h3><ul>{r.leitura.lacunas.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
        <a className="op-button secondary" href={`/api/opera/projetos/${params.slug}/reunioes?fonte=${r.id}`}>Baixar fonte para o Construtor</a>
        <details><summary>Transcrição original</summary><pre className="op-review-code">{r.transcricao}</pre></details>
      </details>)}
    </section>{podeRegistrar && <ReunioesProjeto slug={params.slug} fontes={data ?? []} />}</>;
}
