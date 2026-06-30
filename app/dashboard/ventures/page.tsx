import { listVentures, studioHeader } from "@/lib/ventures";
import { VenturesWorkspace } from "./VenturesWorkspace";

export const dynamic = "force-dynamic";

export default async function VenturesPage() {
  const rows = await listVentures();
  const header = await studioHeader(rows);
  return <VenturesWorkspace rows={rows} header={header} />;
}
