import { fetchLeads } from "@/lib/dashboardData";
import { CRMView, type CRMLeadRow } from "./CRMView";

export const dynamic = "force-dynamic";

export default async function CRMPage() {
  const leads = await fetchLeads();
  const rows: CRMLeadRow[] = leads
    .filter((l) => l.status !== "novo")
    .map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      company: l.company,
      category: l.category,
      score: l.diagnostic_score,
      status: l.status,
      assignee: l.assignee,
      created: l.created_at,
    }));
  return <CRMView rows={rows} totalLeads={leads.length} />;
}
