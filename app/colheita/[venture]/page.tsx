import { notFound } from "next/navigation";
import ColheitaForm from "@/components/opera/ColheitaForm";
import { projetoOpera } from "@/lib/opera/server";
import { slugValido } from "@/lib/opera/model";
export const dynamic = "force-dynamic";
export const metadata = { title: "Colheita · OPERA", robots: { index: false, follow: false } };
export default async function ColheitaPage({ params }: { params: { venture: string } }) {
  if (!slugValido(params.venture)) notFound();
  const projeto = await projetoOpera(params.venture);
  if (!projeto?.colheita_publica) notFound();
  return <ColheitaForm key={`${projeto.slug}:${projeto.colheita.versao}`} projeto={{ slug: projeto.slug, cliente: projeto.cliente, processo: projeto.processo, colheita: projeto.colheita }} />;
}
