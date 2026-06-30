import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { requireUser } from "@/lib/apiAuth";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

// POST /api/ventures/:id/time  -> lança horas na venture
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const body = (await req.json()) as {
      hours?: number;
      hourly_cost_brl?: number;
      member_key?: string | null;
      entry_date?: string;
      task_id?: string | null;
      notes?: string | null;
    };
    const hours = Number(body.hours);
    if (!Number.isFinite(hours) || hours <= 0) {
      return apiError(new Error("Informe horas válidas"), 400);
    }
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        venture_id: params.id,
        hours,
        hourly_cost_brl: Number(body.hourly_cost_brl) || 0,
        member_key: body.member_key ?? null,
        task_id: body.task_id ?? null,
        entry_date: body.entry_date || new Date().toISOString().slice(0, 10),
        notes: body.notes ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ entry: data });
  } catch (e) {
    return apiError(e);
  }
}
