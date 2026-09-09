import Link from "next/link";
import { OperaHeader } from "@/components/opera/OperaUI";
import NovoProjeto from "@/components/opera/NovoProjeto";
export default function Novo() { return <><Link className="op-back" href="/dashboard/opera">← Todas as construções</Link><OperaHeader titulo="Uma nova construção." descricao="Painel e colheita nascem juntos. Defina o projeto e prepare o espaço de trabalho da equipe." /><NovoProjeto /></>; }
