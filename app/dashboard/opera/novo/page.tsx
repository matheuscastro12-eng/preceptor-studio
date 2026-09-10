import Link from "next/link";
import { OperaHeader } from "@/components/opera/OperaUI";
import NovoProjeto from "@/components/opera/NovoProjeto";
import { membroOpera,operaDB } from '@/lib/opera/server';
import { redirect } from 'next/navigation';
export default async function Novo({searchParams}:{searchParams:{venture?:string}}) { if(!await membroOpera())redirect('/login');const {data}=await operaDB().from('ventures').select('id,name').order('name');return <><Link className="op-back" href="/dashboard/opera">← Todas as construções</Link><OperaHeader titulo="Uma nova construção." descricao="Painel e colheita nascem juntos. Defina o projeto e prepare o espaço de trabalho da equipe." /><NovoProjeto ventures={data??[]} venture={searchParams.venture}/></>; }
