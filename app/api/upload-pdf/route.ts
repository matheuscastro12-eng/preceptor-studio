import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Apenas PDF é aceito" }, { status: 400 });
    }
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF acima de 15MB" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());

    // Import direto do lib evita o debug-on-import do pdf-parse que tenta abrir
    // ./test/data/05-versions-space.pdf no diretório de execução.
    // @ts-expect-error pdf-parse não tem types
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const data = await pdfParse(buf);

    const text = (data.text || "").trim();
    const truncated = text.length > 60000;
    const finalText = truncated ? text.slice(0, 60000) + "\n\n[... PDF truncado em 60k chars ...]" : text;

    return NextResponse.json({
      success: true,
      text: finalText,
      pages: data.numpages,
      chars: text.length,
      truncated,
      filename: file.name,
    });
  } catch (err: any) {
    console.error("Erro ao processar PDF:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao processar PDF" },
      { status: 500 }
    );
  }
}
