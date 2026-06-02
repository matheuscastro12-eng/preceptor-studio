import { NextResponse } from "next/server";
import { fetchSummary } from "@/lib/finance";

export async function GET() {
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
