import { getFunnelSummary } from "@/lib/funnelData";
import { FunilView } from "./FunilView";

export const dynamic = "force-dynamic";

export default async function FunilPage({
  searchParams,
}: {
  searchParams: { d?: string };
}) {
  const raw = Number(searchParams?.d);
  const days = [7, 30, 90].includes(raw) ? raw : 30;
  const data = await getFunnelSummary(days);
  return <FunilView data={data} days={days} />;
}
