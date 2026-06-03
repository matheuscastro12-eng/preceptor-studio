import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

interface GroundingChunkWeb {
  uri?: string;
  title?: string;
}

interface GroundingChunk {
  web?: GroundingChunkWeb;
}

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
  groundingMetadata?: {
    groundingChunks?: GroundingChunk[];
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("market_research")
      .select("*")
      .eq("study_id", params.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw error;
    return NextResponse.json({ research: data || [] });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return apiError(new Error("GOOGLE_API_KEY não configurada"), 500);
    }
    const body = (await req.json().catch(() => ({}))) as { query?: string };
    const query = (body.query || "").trim();
    if (!query) return apiError(new Error("query é obrigatória"), 400);

    const supabase = createSupabaseServiceClient();
    const { data: study } = await supabase
      .from("studies")
      .select("title, category")
      .eq("id", params.id)
      .maybeSingle();

    const systemPrompt = `Você é analista de mercado do estúdio PRECEPTOR!. Responda sempre em português do Brasil, com markdown estruturado (h2, h3, listas), citando fontes inline com [n]. Foco em mercado brasileiro quando relevante. Sem travessões.`;
    const userPrompt = `Contexto do estudo: ${study?.title || ""} (categoria: ${study?.category || "desconhecida"}).\n\nPergunta de pesquisa: ${query}\n\nUse busca web para fundamentar. Estruture em: contexto, números atuais, players, oportunidades, riscos. Seja conciso.`;

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini ${res.status}: ${text.slice(0, 240)}`);
    }

    const data = (await res.json()) as GeminiResponse;
    const cand = data.candidates?.[0];
    const md =
      cand?.content?.parts
        ?.map((p) => p.text || "")
        .filter(Boolean)
        .join("\n") || "";

    const chunks = cand?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c) => c.web)
      .filter((w): w is GroundingChunkWeb => !!w && !!w.uri)
      .map((w) => ({ uri: w.uri || "", title: w.title || w.uri || "" }));

    const { data: row, error: insertErr } = await supabase
      .from("market_research")
      .insert({
        study_id: params.id,
        query,
        results_md: md,
        sources,
        metadata: { model },
      })
      .select("*")
      .single();
    if (insertErr) throw insertErr;

    return NextResponse.json({ research: row, md, sources });
  } catch (e) {
    return apiError(e);
  }
}
