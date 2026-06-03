import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { sendEmail, emailLayout, SITE_URL } from "@/lib/email";

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
      .select(
        "id, name, email, phone, company, summary_line, diagnostic_score, diagnostic_answers, requested_contact_at"
      )
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

    // ─── Alerta por email pro time (best-effort) ──────────────────────────
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("email, role")
        .in("role", ["owner", "admin"]);

      const recipients = (profiles ?? [])
        .map((p) => (p as { email?: string | null }).email)
        .filter((e): e is string => typeof e === "string" && e.length > 0);

      if (recipients.length > 0) {
        const companyLabel = lead.company ? String(lead.company) : "sem empresa";
        const scoreLabel = score !== null ? String(score) : "n/a";
        const phone = lead.phone ? String(lead.phone) : "nao informado";
        const summary = lead.summary_line ? String(lead.summary_line) : null;

        const rows = [
          ["Nome", String(lead.name)],
          ["Empresa", companyLabel],
          ["Email", String(lead.email)],
          ["Telefone", phone],
          ["Score", scoreLabel],
        ];
        const rowsHtml = rows
          .map(
            ([k, v]) =>
              `<li style="margin:4px 0;"><strong style="color:#0A1F44;">${k}:</strong> ${v}</li>`
          )
          .join("");

        const summaryHtml = summary
          ? `<p style="margin:14px 0 0 0;padding:12px 14px;background:#F1F5F9;border-radius:10px;font-size:14px;color:#475569;">${summary}</p>`
          : "";

        const html = emailLayout({
          heading: "Lead quer falar com um especialista",
          bodyHtml: `
            <p style="margin:0 0 12px 0;">Um lead concluiu o diagnostico e pediu contato.</p>
            <ul style="margin:0;padding-left:18px;">${rowsHtml}</ul>
            ${summaryHtml}
          `,
          ctaLabel: "Abrir lead no dashboard",
          ctaUrl: `${SITE_URL}/dashboard/leads/${lead.id}`,
          footerNote: "Notificacao automatica do funil de diagnostico.",
        });

        await sendEmail({
          to: recipients,
          subject: `Novo lead quer falar: ${lead.name} (${companyLabel}) · score ${scoreLabel}`,
          html,
        });
      }
    } catch {
      // Silencioso: email e best-effort, nunca derruba a resposta publica.
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Public endpoint: never leak details.
    return NextResponse.json({ ok: true });
  }
}
