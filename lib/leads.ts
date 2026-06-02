// Lead types and constants

export type LeadStatus =
  | "novo"
  | "contatado"
  | "qualificado"
  | "proposta"
  | "ganho"
  | "perdido";

export type LeadSource = "diagnostic_public" | "manual" | "indicacao";

export type LeadCategory = "saude" | "educacao" | "juridico" | "tech" | "outro";

export const LEAD_STATUSES: { value: LeadStatus; label: string; color: string; soft: string }[] = [
  { value: "novo", label: "Novo", color: "#5D57EB", soft: "#EEF2FF" },
  { value: "contatado", label: "Contatado", color: "#3BC8CF", soft: "#CFFAFE" },
  { value: "qualificado", label: "Qualificado", color: "#B964FF", soft: "#F3E8FF" },
  { value: "proposta", label: "Proposta", color: "#F59E0B", soft: "#FEF3C7" },
  { value: "ganho", label: "Ganho", color: "#10B981", soft: "#D1FAE5" },
  { value: "perdido", label: "Perdido", color: "#E11D48", soft: "#FEE2E2" },
];

export const LEAD_CATEGORIES: { value: LeadCategory; label: string }[] = [
  { value: "saude", label: "Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "juridico", label: "Jurídico" },
  { value: "tech", label: "Tech" },
  { value: "outro", label: "Outro" },
];

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  category: LeadCategory | null;
  source: LeadSource;
  status: LeadStatus;
  assignee: string | null;
  diagnostic_answers: Record<string, unknown>;
  diagnostic_score: number | null;
  diagnostic_axes: Array<{ label: string; value: number; hint?: string }>;
  diagnostic_insights: Array<{ kind: "insight" | "warning"; label: string; body: string }>;
  notes: string | null;
  ip_address: string | null;
  user_agent: string | null;
  contacted_at: string | null;
  qualified_at: string | null;
  requested_contact_at: string | null;
  priority_score: number | null;
  summary_line: string | null;
  estimated_value: number | null;
  created_at: string;
  updated_at: string;
}

export function statusMeta(status: LeadStatus) {
  return LEAD_STATUSES.find((s) => s.value === status) ?? LEAD_STATUSES[0];
}

export function categoryLabel(cat: string | null | undefined): string {
  if (!cat) return "Sem categoria";
  return LEAD_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}
