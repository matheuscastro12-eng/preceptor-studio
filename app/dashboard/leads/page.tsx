import { fetchLeads } from "@/lib/dashboardData";
import { LeadsView, type LeadRow } from "./LeadsView";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await fetchLeads();
  const rows: LeadRow[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    company: l.company,
    category: l.category,
    score: l.diagnostic_score,
    priority: l.priority_score,
    summary: l.summary_line,
    requestedContact: l.requested_contact_at,
    status: l.status,
    assignee: l.assignee,
    lastTouch: l.contacted_at || l.created_at,
    created: l.created_at,
  }));
  return <LeadsView rows={rows} />;
}
