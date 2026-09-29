import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { enforceRateLimit } from "@/lib/rateLimit";
import { onboardingDe } from "@/lib/onboarding";
import { BUCKET_ONBOARDING, EXTENSOES_PERMITIDAS, MAX_BYTES_ARQUIVO, extensao, todosOsCampos } from "@/lib/onboarding/model";

// Autoriza o envio de UM arquivo do formulário de onboarding: devolve uma URL
// assinada de upload para o bucket privado `onboarding`. O navegador envia o
// arquivo direto ao Storage, sem passar pelo limite de corpo da função.
// Ninguém lê o bucket pelo link público: só o painel autenticado gera links de download.

export const dynamic = "force-dynamic";

function nomeSeguro(nome: string): string {
  const ext = extensao(nome);
  const base = nome.replace(/\.[^.]*$/, "").normalize("NFKD").replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "arquivo";
  return `${base}.${ext}`;
}

let bucketConferido = false;
async function garantirBucket(sb: ReturnType<typeof createSupabaseServiceClient>) {
  if (bucketConferido) return;
  const { data } = await sb.storage.getBucket(BUCKET_ONBOARDING);
  if (!data) {
    const { error } = await sb.storage.createBucket(BUCKET_ONBOARDING, {
      public: false,
      fileSizeLimit: MAX_BYTES_ARQUIVO,
      allowedMimeTypes: Array.from(new Set(Object.values(EXTENSOES_PERMITIDAS))),
    });
    if (error && !/already exists/i.test(error.message)) throw error;
  }
  bucketConferido = true;
}

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "onboarding-upload", 150, 1);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }
  const def = onboardingDe(typeof body.slug === "string" ? body.slug : "");
  if (!def) return NextResponse.json({ error: "Formulário não encontrado" }, { status: 404 });

  const campo = todosOsCampos(def).find((c) => c.id === body.campo);
  const aceita =
    campo?.tipo === "arquivos" ? campo.aceita : campo?.tipo === "tabela" && campo.aceitaPlanilha ? ["xlsx", "xls", "csv"] : null;
  if (!aceita) return NextResponse.json({ error: "Este campo não recebe arquivos." }, { status: 400 });

  const nome = typeof body.nome === "string" ? body.nome.slice(0, 200) : "";
  const ext = extensao(nome);
  if (!aceita.includes(ext) || !Object.hasOwn(EXTENSOES_PERMITIDAS, ext)) {
    return NextResponse.json({ error: `Formato não aceito aqui. Use: ${aceita.join(", ")}.` }, { status: 400 });
  }
  const bytes = Number(body.bytes);
  if (!Number.isFinite(bytes) || bytes <= 0 || bytes > MAX_BYTES_ARQUIVO) {
    return NextResponse.json({ error: "Arquivo vazio ou maior que 20 MB. Divida em partes ou compacte." }, { status: 400 });
  }

  try {
    const sb = createSupabaseServiceClient();
    await garantirBucket(sb);
    const dia = new Date().toISOString().slice(0, 10);
    const caminho = `${def.slug}/${dia}/${randomUUID()}-${nomeSeguro(nome)}`;
    const { data, error } = await sb.storage.from(BUCKET_ONBOARDING).createSignedUploadUrl(caminho);
    if (error || !data) throw error ?? new Error("sem URL");
    return NextResponse.json({ caminho, token: data.token });
  } catch (e) {
    console.error("[onboarding] falha ao preparar upload", e);
    return NextResponse.json({ error: "Não conseguimos receber o arquivo agora. Tente de novo em um minuto." }, { status: 500 });
  }
}
