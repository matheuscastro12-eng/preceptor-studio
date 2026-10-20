import { getFunnelSummary } from "@/lib/funnelData";
import { FunilView } from "./FunilView";

export const dynamic = "force-dynamic";

export default async function FunilPage(
  props: {
    searchParams: Promise<{ d?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const raw = Number(searchParams?.d);
  const days = [7, 30, 90].includes(raw) ? raw : 30;
  const data = await getFunnelSummary(days);
  return <FunilView data={data} days={days} />;
}
