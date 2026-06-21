import { fetchLeads } from "@/lib/dashboardData";
import { LeadsView, type LeadRow } from "../leads/LeadsView";

export const dynamic = "force-dynamic";

// Aba "Automações": atalho do CRM filtrado para os leads que chegam pelo
// formulário de automação da landing (source = "automacao").
export default async function AutomacoesPage() {
  const leads = await fetchLeads();
  const rows: LeadRow[] = leads
    .filter((l) => l.source === "automacao")
    .map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      company: l.company,
      category: l.category,
      source: l.source,
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
