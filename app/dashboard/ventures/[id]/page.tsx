import { notFound } from "next/navigation";
import { getVentureDetail } from "@/lib/ventures";
import { VentureDetailView } from "./VentureDetailView";

export const dynamic = "force-dynamic";

export default async function VentureDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const detail = await getVentureDetail(params.id);
  if (!detail) notFound();
  return <VentureDetailView detail={detail} />;
}
