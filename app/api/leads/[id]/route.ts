import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import type { LeadStatus } from "@/lib/leads";

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
    const { data, error } = await supabase
      .from("leads")
      .update(update)
      .eq("id", params.id)
      .select("*")
      .single();
    if (error) throw error;
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
