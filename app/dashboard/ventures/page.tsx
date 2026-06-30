import { listVentures, studioHeader } from "@/lib/ventures";
import { VenturesView } from "./VenturesView";

export const dynamic = "force-dynamic";

export default async function VenturesPage() {
  const rows = await listVentures();
  const header = await studioHeader(rows);
  return <VenturesView rows={rows} header={header} />;
}
