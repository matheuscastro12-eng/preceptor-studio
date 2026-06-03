import { NextResponse } from "next/server";
import { fetchSummary } from "@/lib/finance";
import { requireUser } from "@/lib/apiAuth";

export async function GET() {
  const guard = await requireUser();
  if (guard) return guard;
  try {
    const summary = await fetchSummary();
    return NextResponse.json({ summary });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro interno" },
      { status: 500 }
    );
  }
}
