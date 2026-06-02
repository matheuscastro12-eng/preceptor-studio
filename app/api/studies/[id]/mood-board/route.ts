import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { callGemini } from "@/lib/gemini";

function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Erro interno" },
    { status }
  );
}

interface ImagenPrediction {
  bytesBase64Encoded?: string;
  mimeType?: string;
}

interface ImagenResponse {
  predictions?: ImagenPrediction[];
}

async function callImagen(
  prompt: string,
  apiKey: string,
  sampleCount = 4
): Promise<{ images: string[]; mimeType: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount, aspectRatio: "1:1" },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    const err: Error & { status?: number } = new Error(
      `Imagen ${res.status}: ${text.slice(0, 240)}`
    );
    err.status = res.status;
    throw err;
  }
  const data = (await res.json()) as ImagenResponse;
  const preds = data.predictions || [];
  const images = preds
    .map((p) => p.bytesBase64Encoded || "")
    .filter((s): s is string => !!s);
  const mimeType = preds[0]?.mimeType || "image/png";
  if (images.length === 0) {
    throw new Error("Imagen não retornou imagens");
  }
  return { images, mimeType };
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("mood_boards")
      .select("*")
      .eq("study_id", params.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return NextResponse.json({ moodBoards: data || [] });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return apiError(new Error("GOOGLE_API_KEY não configurada"), 500);
    }
    const supabase = createSupabaseServiceClient();
    const { data: study, error: studyErr } = await supabase
      .from("studies")
      .select("id, title, category, brand_brief_md")
      .eq("id", params.id)
      .maybeSingle();
    if (studyErr) throw studyErr;
    if (!study) return apiError(new Error("Estudo não encontrado"), 404);

    const promptSystem =
      "Você converte briefings de marca em prompts visuais curtos em inglês para o Imagen. Sempre em uma única linha, sem texto na imagem, descrevendo paleta, mood, materiais e referências visuais. Sem aspas.";
    const promptUser = `Categoria: ${study.category}\nTítulo: ${study.title}\n\nBrand brief (pode estar vazio):\n${(study.brand_brief_md || "").slice(0, 4000)}\n\nGere UM prompt em inglês de até 60 palavras descrevendo um mood board fotográfico/abstrato com 4 referências em grid, paleta, materiais, mood. Sem texto na imagem. Sem aspas.`;

    let imagenPrompt = `mood board grid of 4 references, modern brand aesthetic for ${study.title}, ${study.category}, cohesive color palette, photographic and abstract textures, no text, editorial layout`;
    try {
      const gen = await callGemini(promptSystem, promptUser, apiKey, {
        temperature: 0.8,
        maxOutputTokens: 256,
        thinking: false,
      });
      const cleaned = gen.content.trim().split(/\n+/)[0].replace(/^["']|["']$/g, "");
      if (cleaned) imagenPrompt = cleaned;
    } catch {
      // keep default
    }

    let images: string[] = [];
    let mimeType = "image/png";
    try {
      const result = await callImagen(imagenPrompt, apiKey, 4);
      images = result.images;
      mimeType = result.mimeType;
    } catch (e) {
      const err = e as Error & { status?: number };
      const status = err.status;
      if (
        status === 403 ||
        status === 404 ||
        status === 400 ||
        /quota|billing|access|not available|permission/i.test(err.message)
      ) {
        return NextResponse.json(
          {
            error: "imagen_unavailable",
            message:
              "Imagen 3 requer cota paga. Contate o owner para ativar a API.",
          },
          { status: 402 }
        );
      }
      throw e;
    }

    const dataUris = images.map((b) => `data:${mimeType};base64,${b}`);

    const { data: row, error: insertErr } = await supabase
      .from("mood_boards")
      .insert({
        study_id: params.id,
        prompt: imagenPrompt,
        image_url: null,
        image_bytes_base64: null,
        metadata: { images: dataUris, mimeType, count: dataUris.length },
      })
      .select("*")
      .single();
    if (insertErr) throw insertErr;

    return NextResponse.json({ moodBoard: row, images: dataUris });
  } catch (e) {
    return apiError(e);
  }
}
