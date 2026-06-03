import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { fetchCategories } from "@/lib/finance";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

export async function GET() {
  try {
    const categories = await fetchCategories();
    return NextResponse.json({ categories });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const input = await req.json();
    const name = String(input.name || "").trim();
    if (!name) return apiError(new Error("name obrigatório"), 400);
    const kind = input.kind === "expense" ? "expense" : "revenue";
    const color = input.color || (kind === "revenue" ? "#10b981" : "#ef4444");

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("finance_categories")
      .insert({ name, kind, color, is_default: false })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ category: data });
  } catch (e) {
    return apiError(e);
  }
}
