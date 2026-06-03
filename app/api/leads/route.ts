import { NextResponse, type NextRequest } from "next/server";
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

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient();
    const url = req.nextUrl;
    const status = url.searchParams.get("status");
    const assignee = url.searchParams.get("assignee");
    const minScore = url.searchParams.get("minScore");

    let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (status && VALID_STATUSES.includes(status as LeadStatus)) {
      query = query.eq("status", status);
    }
    if (assignee) {
      query = query.eq("assignee", assignee);
    }
    if (minScore) {
      const n = parseInt(minScore, 10);
      if (!Number.isNaN(n)) query = query.gte("diagnostic_score", n);
    }
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ leads: data || [] });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const input = (await req.json()) as Record<string, unknown>;
    const supabase = createSupabaseServiceClient();
    const name = String(input.name ?? "").trim();
    const email = String(input.email ?? "").trim().toLowerCase();
    if (!name) return apiError("Nome é obrigatório", 400);
    if (!email) return apiError("Email é obrigatório", 400);
    const { data, error } = await supabase
      .from("leads")
      .insert({
        name,
        email,
        phone: input.phone ? String(input.phone) : null,
        company: input.company ? String(input.company) : null,
        category: input.category ? String(input.category) : null,
        source: (input.source as string) || "manual",
        status: (input.status as LeadStatus) || "novo",
        assignee: (input.assignee as string) || null,
        notes: input.notes ? String(input.notes) : null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ lead: data });
  } catch (err) {
    return apiError(err);
  }
}
