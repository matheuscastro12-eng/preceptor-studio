import { notFound } from "next/navigation";
import SombraForm from "@/components/opera/SombraForm";
import { projetoOpera } from "@/lib/opera/server";
import { slugValido } from "@/lib/opera/model";
import { TIPOS_DA_SOMBRA } from "@/lib/opera/sombra";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sombra · OPERA", robots: { index: false, follow: false } };

export default async function SombraPage({ params }: { params: { venture: string } }) {
  if (!slugValido(params.venture)) notFound();
  const tipos = TIPOS_DA_SOMBRA[params.venture];
  if (!tipos) notFound();
  const projeto = await projetoOpera(params.venture);
  if (!projeto) notFound();
  return (
    <SombraForm
      venture={projeto.slug}
      cliente={projeto.cliente}
      processo={projeto.processo}
      tipos={tipos}
    />
  );
}
