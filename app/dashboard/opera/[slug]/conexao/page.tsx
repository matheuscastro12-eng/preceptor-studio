import Link from 'next/link';
import { notFound } from 'next/navigation';
import { acessoOpera,saudeContato } from '@/lib/opera/conexao';
import { operaDB } from '@/lib/opera/server';
import { OperaHeader } from '@/components/opera/OperaUI';
import ConexaoProjeto from '@/components/opera/ConexaoProjeto';
export const dynamic='force-dynamic';
export default async function Conexao({params}:{params:{slug:string}}){
  const a=await acessoOpera(params.slug,'ler');if(!a)notFound();const db=operaDB();
  const [p,pubs,decs,ent,ventures,membros,chaves,decidir,publicar]=await Promise.all([
    db.from('opera_projetos').select('*').eq('slug',params.slug).single(),
    db.from('opera_publicacoes').select('*').eq('projeto',params.slug).order('recebido_em',{ascending:false}).limit(50),
    db.from('opera_decisoes').select('*').eq('projeto',params.slug).order('criado_em',{ascending:false}).limit(200),
    db.from('opera_entregas').select('*').eq('projeto',params.slug).order('versao',{ascending:false}).limit(50),
    a.admin?db.from('ventures').select('id,name').order('name'):Promise.resolve({data:[],error:null}),
    a.admin?db.from('opera_membros').select('usuario,papel').eq('projeto',params.slug):Promise.resolve({data:[],error:null}),
    a.admin?db.from('opera_integracoes').select('id,expira_em,revogado_em').eq('projeto',params.slug):Promise.resolve({data:[],error:null}),
    acessoOpera(params.slug,'decidir'),acessoOpera(params.slug,'publicar')]);
  if(!p.data)notFound();
  return <><Link className="op-back" href={`/dashboard/opera/${params.slug}`}>← Acompanhamento</Link><OperaHeader titulo="Evidência, decisão, retorno." descricao={`${p.data.nome} · ${saudeContato(p.data.ultimo_contato)}`} />{[p,pubs,decs,ent,ventures,membros,chaves].some(r=>r.error)?<p className="op-note warning">Não foi possível carregar a conexão completa. Verifique o banco e aplique opera_v2_conexao.sql.</p>:<ConexaoProjeto slug={params.slug} projeto={p.data} publicacoes={pubs.data??[]} decisoes={decs.data??[]} entregas={ent.data??[]} ventures={ventures.data??[]} membros={membros.data??[]} chaves={chaves.data??[]} podeGerenciar={a.admin} podeDecidir={!!decidir} podePublicar={!!publicar}/>}</>;
}
