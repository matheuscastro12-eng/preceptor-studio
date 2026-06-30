import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { requireUser } from "@/lib/apiAuth";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

// Mapeia o status do lead para o estágio inicial da venture.
const STATUS_TO_STAGE: Record<string, string> = {
  novo: "lead",
  contatado: "diagnostico",
  qualificado: "estudo",
  proposta: "proposta",
  ganho: "onboarding",
  perdido: "encerrada",
};

// POST /api/leads/:id/promote -> cria (ou vincula) uma venture a partir do lead.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const supabase = createSupabaseServiceClient();

    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .select("id, name, email, phone, company, status")
      .eq("id", params.id)
      .maybeSingle();
    if (leadErr) throw leadErr;
    if (!lead) return apiError(new Error("Lead não encontrado"), 404);

    const ventureName = (lead.company as string) || (lead.name as string) || "Nova venture";
    const stage = STATUS_TO_STAGE[(lead.status as string) || "novo"] || "lead";

    // 1) Idempotência por lead: se já existe venture deste lead, devolve.
    const { data: byLead } = await supabase
      .from("ventures")
      .select("*")
      .eq("lead_id", lead.id)
      .maybeSingle();
    if (byLead) {
      return NextResponse.json({ venture: byLead, created: false });
    }

    // 2) Resolve cliente: casa por email, senão cria.
    let clientId: string | null = null;
    if (lead.email) {
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("email", lead.email)
        .maybeSingle();
      clientId = (client?.id as string) ?? null;
    }
    if (!clientId) {
      const { data: newClient, error: cErr } = await supabase
        .from("clients")
        .insert({ name: ventureName, email: lead.email ?? null, phone: lead.phone ?? null })
        .select("id")
        .single();
      if (cErr) throw cErr;
      clientId = newClient.id as string;
    }

    // 3) Se o cliente já tem venture (ex.: veio do backfill), vincula o lead nela.
    const { data: byClient } = await supabase
      .from("ventures")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (byClient) {
      const updates: Record<string, unknown> = {};
      if (!byClient.lead_id) updates.lead_id = lead.id;
      let venture = byClient;
      if (Object.keys(updates).length > 0) {
        const { data: upd } = await supabase
          .from("ventures")
          .update(updates)
          .eq("id", byClient.id)
          .select("*")
          .single();
        if (upd) venture = upd;
      }
      return NextResponse.json({ venture, created: false, linked: true });
    }

    // 4) Cria a venture nova a partir do lead.
    const { data: venture, error: vErr } = await supabase
      .from("ventures")
      .insert({ name: ventureName, client_id: clientId, lead_id: lead.id, stage })
      .select("*")
      .single();
    if (vErr) throw vErr;

    // Best-effort: registra na timeline.
    try {
      await supabase.from("venture_events").insert({
        venture_id: venture.id,
        type: "sistema",
        title: "Criada a partir do lead",
        detail: lead.name as string,
      });
    } catch {
      /* ignora */
    }

    return NextResponse.json({ venture, created: true });
  } catch (e) {
    return apiError(e);
  }
}
