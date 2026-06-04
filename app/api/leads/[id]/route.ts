import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { defaultRevenueCategoryId } from "@/lib/finance";
import type { LeadStatus } from "@/lib/leads";

interface LeadRow {
  id: string;
  name: string | null;
  company: string | null;
  status: LeadStatus | null;
  estimated_value: number | null;
}

// Hook best-effort: ao fechar um deal (lead vira "ganho"), registra a receita
// criando automaticamente uma transação de entrada (inflow) no Financeiro.
// Idempotente: não duplica se já houver transação com a mesma descrição.
// NUNCA lança: qualquer falha aqui é silenciada para não derrubar o PATCH do lead.
async function recordWonDealRevenue(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  lead: LeadRow
): Promise<void> {
  try {
    const company = lead.company ? ` (${lead.company})` : "";
    const description = `Deal ganho: ${lead.name || "Lead"}${company}`;

    // Guard de idempotência: se já existe transação com essa descrição, não duplica.
    const { data: existing } = await supabase
      .from("transactions")
      .select("id")
      .eq("description", description)
      .limit(1)
      .maybeSingle();
    if (existing) return;

    const categoryId = await defaultRevenueCategoryId(supabase);
    await supabase.from("transactions").insert({
      kind: "inflow",
      amount_brl: Number(lead.estimated_value) || 0,
      description,
      category_id: categoryId,
      study_id: null,
      client_id: null,
      occurred_at: new Date().toISOString().slice(0, 10),
    });
  } catch {
    // Best-effort: ignora falhas (não impacta a atualização do lead).
  }
}

const VALID_STATUSES: LeadStatus[] = [
  "novo",
  "contatado",
  "qualificado",
  "proposta",
  "ganho",
  "perdido",
];

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", params.id)
      .single();
    if (error) throw error;
    return NextResponse.json({ lead: data });
  } catch (err) {
    return apiError(err, 404);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const input = (await req.json()) as Record<string, unknown>;
    const update: Record<string, unknown> = {};
    if (typeof input.status === "string" && VALID_STATUSES.includes(input.status as LeadStatus)) {
      update.status = input.status;
      if (input.status === "contatado") update.contacted_at = new Date().toISOString();
      if (input.status === "qualificado") update.qualified_at = new Date().toISOString();
    }
    if ("assignee" in input) update.assignee = input.assignee || null;
    if ("notes" in input) update.notes = input.notes || null;
    if ("name" in input) update.name = String(input.name || "").trim();
    if ("email" in input) update.email = String(input.email || "").trim().toLowerCase();
    if ("phone" in input) update.phone = input.phone || null;
    if ("company" in input) update.company = input.company || null;
    if ("category" in input) update.category = input.category || null;

    const supabase = createSupabaseServiceClient();

    // Captura o status anterior para detectar a transição para "ganho".
    let prevStatus: LeadStatus | null = null;
    try {
      const { data: before } = await supabase
        .from("leads")
        .select("status")
        .eq("id", params.id)
        .maybeSingle();
      prevStatus = (before as { status: LeadStatus | null } | null)?.status ?? null;
    } catch {
      // ignora; o hook abaixo é best-effort
    }

    const { data, error } = await supabase
      .from("leads")
      .update(update)
      .eq("id", params.id)
      .select("*")
      .single();
    if (error) throw error;

    // Lead ganho -> receita: registra a transação quando o deal fecha.
    if (update.status === "ganho" && prevStatus !== "ganho") {
      await recordWonDealRevenue(supabase, data as LeadRow);
    }

    return NextResponse.json({ lead: data });
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("leads").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err);
  }
}
