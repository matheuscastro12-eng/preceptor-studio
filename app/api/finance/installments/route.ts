import { NextResponse } from "next/server";
import { fetchInstallments } from "@/lib/finance";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const data = await fetchInstallments({
      pricingId: url.searchParams.get("pricing_id") || undefined,
      studyId: url.searchParams.get("study_id") || undefined,
      status: (status as any) || undefined,
      dueBefore: url.searchParams.get("due_before") || undefined,
      dueAfter: url.searchParams.get("due_after") || undefined,
      limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
    });
    return NextResponse.json({ installments: data });
  } catch (e) {
    return apiError(e);
  }
}
