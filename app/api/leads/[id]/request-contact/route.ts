import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

type Internal = {
  recommendation?: string;
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // Source is optional metadata only; we don't act on it.
    try {
      await req.json();
    } catch {
      // body optional
    }

    const supabase = createSupabaseServiceClient();
    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .select("id, name, email, company, diagnostic_score, diagnostic_answers, requested_contact_at")
      .eq("id", params.id)
      .single();

    if (leadErr || !lead) {
      // Don't reveal whether the lead exists.
      return NextResponse.json({ ok: true });
    }

    if (!lead.requested_contact_at) {
      await supabase
        .from("leads")
        .update({ requested_contact_at: new Date().toISOString() })
        .eq("id", params.id);
    }

    const answers = (lead.diagnostic_answers || {}) as Record<string, unknown>;
    const internal = (answers.__internal as Internal | undefined) ?? {};
    const score = typeof lead.diagnostic_score === "number" ? lead.diagnostic_score : null;
    const recommendation = internal.recommendation ?? null;

    const company = lead.company ? ` (${lead.company})` : "";
    const scorePart = score !== null ? ` (score ${score})` : "";

    await supabase.from("notifications").insert({
      type: "lead_requested_contact",
      title: "Novo lead pediu contato",
      body: `${lead.name}${company} terminou o diagnóstico${scorePart} e quer falar com um especialista.`,
      link: `/dashboard/leads/${lead.id}`,
      recipient_role: "all",
      metadata: {
        lead_id: lead.id,
        lead_name: lead.name,
        lead_email: lead.email,
        score,
        recommendation,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Public endpoint: never leak details.
    return NextResponse.json({ ok: true });
  }
}
