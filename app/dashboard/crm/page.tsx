import { fetchLeads } from "@/lib/dashboardData";
import { CRMView, type CRMLeadRow } from "./CRMView";
import Link from 'next/link';

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
  return <><div style={{ padding: '16px 24px' }}><Link href="/dashboard/opera/novo">Veio de uma reunião? Iniciar construção pela transcrição →</Link><p style={{ fontSize: 12 }}>Sem LP obrigatória. Vincule a Venture existente para manter a origem comercial; não criamos um lead duplicado nem marcamos a venda como ganha.</p></div><CRMView rows={rows} totalLeads={leads.length} /></>;
}
