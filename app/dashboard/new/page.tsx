"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient, createStudy, updateStudy, Category } from "@/lib/store";
import { CATEGORIES } from "@/lib/questions";

export default function NewStudy() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [studyTitle, setStudyTitle] = useState("");
  const [category, setCategory] = useState<Category | null>(null);

  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfMeta, setPdfMeta] = useState<{ filename: string; pages: number; chars: number; truncated: boolean } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [pdfSuggestions, setPdfSuggestions] = useState<Record<string, any> | null>(null);
  const [extractStats, setExtractStats] = useState<{ filled: number; total: number } | null>(null);

  async function handlePDFUpload(file: File) {
    setUploading(true);
    setPdfError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-pdf", { method: "POST", body: fd });
      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(`Servidor respondeu sem JSON (HTTP ${res.status})`);
      }
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setPdfText(data.text);
      setPdfMeta({ filename: data.filename, pages: data.pages, chars: data.chars, truncated: data.truncated });
    } catch (e: any) {
      setPdfError(e.message);
      setPdfText(null);
      setPdfMeta(null);
    } finally {
      setUploading(false);
    }
  }

  function clearPDF() {
    setPdfText(null);
    setPdfMeta(null);
    setPdfError(null);
    setPdfSuggestions(null);
    setExtractStats(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function extractAnswersFromPDF() {
    if (!pdfText || !category) return;
    setExtracting(true);
    try {
      const res = await fetch("/api/extract-from-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfText, category }),
      });
      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(`Servidor sem JSON (HTTP ${res.status})`);
      }
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setPdfSuggestions(data.suggestions || {});
      setExtractStats({ filled: data.filled_count, total: data.total_count });
    } catch (e: any) {
      setPdfError(`Falha ao extrair respostas: ${e.message}`);
    } finally {
      setExtracting(false);
    }
  }

  function handleCreate() {
    if (!clientName.trim() || !studyTitle.trim() || !category) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const client = createClient({
        name: clientName.trim(),
        email: clientEmail.trim() || null,
      });
      const study = createStudy({
        client_id: client.id,
        title: studyTitle.trim(),
        category,
        status: "questionnaire",
      });
      // Salva contexto do PDF + respostas pré-preenchidas pela IA (se houver)
      if (pdfText) {
        updateStudy(study.id, {
          answers: {
            __pdf_context: pdfText,
            __pdf_meta: pdfMeta,
            __pdf_suggestions: pdfSuggestions || {},
            ...(pdfSuggestions || {}),
          },
        });
      }
      router.push(`/dashboard/study/${study.id}`);
    } catch (err: any) {
      setError(err.message || "Erro ao criar estudo.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.push("/dashboard")}
        className="text-sm text-ink-soft hover:text-navy mb-4 inline-flex items-center gap-1.5 transition"
      >
        <span>←</span> Voltar para o dashboard
      </button>

      <div className="mb-8">
        <div className="eyebrow mb-2">Novo Estudo</div>
        <h1 className="text-4xl font-black text-navy tracking-tight mb-2">
          Configure o estudo estratégico
        </h1>
        <p className="text-ink-soft">
          Preencha as informações iniciais. Em seguida você responderá ao questionário de diagnóstico.
        </p>
      </div>

      <div className="surface rounded-2xl p-8 space-y-7">
        {/* PDF UPLOAD — opcional, no início */}
        <Section number={0} title="Tem um PDF com informações do projeto? (opcional)">
          <p className="text-sm text-ink-soft mb-3 -mt-2">
            Se você já tem deck, briefing, plano de negócio ou qualquer documento sobre a empresa,
            faça upload aqui. O conteúdo é extraído e usado como contexto adicional pra IA produzir
            um estudo mais específico.
          </p>
          {!pdfText ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handlePDFUpload(f);
              }}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                uploading
                  ? "border-cyan bg-cyan/5"
                  : "border-slate-300 hover:border-cyan hover:bg-cyan/5"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePDFUpload(f);
                }}
                className="hidden"
                id="pdf-upload"
              />
              <div className="text-3xl mb-2">📄</div>
              <p className="text-sm text-navy font-semibold mb-1">
                {uploading ? "Extraindo texto..." : "Arraste o PDF aqui ou clique pra selecionar"}
              </p>
              <p className="text-xs text-ink-mute mb-3">Máximo 15MB</p>
              <label
                htmlFor="pdf-upload"
                className="btn-ghost cursor-pointer inline-block text-xs"
              >
                {uploading ? "Aguarde..." : "Selecionar arquivo"}
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border border-success/40 bg-success-soft rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-success text-white flex items-center justify-center font-black shrink-0">
                  ✓
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-navy text-sm truncate">
                    {pdfMeta?.filename}
                  </div>
                  <div className="text-xs text-ink-soft mt-0.5">
                    {pdfMeta?.pages} páginas · {pdfMeta?.chars.toLocaleString("pt-BR")} caracteres
                    {pdfMeta?.truncated && " · truncado em 60k chars"}
                  </div>
                </div>
                <button onClick={clearPDF} className="btn-ghost text-xs shrink-0">
                  Remover
                </button>
              </div>

              {/* Pré-preenchimento por IA */}
              {!extractStats ? (
                <div className="border border-cyan/40 bg-cyan/5 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan text-navy-deep flex items-center justify-center font-black shrink-0">
                    ✨
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-navy text-sm">
                      Pré-preencher o questionário com a IA?
                    </div>
                    <div className="text-xs text-ink-soft mt-0.5">
                      {category
                        ? "A IA lê o PDF e preenche o que tiver evidência clara. Você revisa e ajusta no questionário."
                        : "Selecione uma categoria abaixo primeiro."}
                    </div>
                  </div>
                  <button
                    onClick={extractAnswersFromPDF}
                    disabled={extracting || !category}
                    className="btn-cyan text-xs shrink-0 disabled:opacity-40"
                  >
                    {extracting ? "Lendo PDF..." : "Pré-preencher"}
                  </button>
                </div>
              ) : (
                <div className="border border-blue/30 bg-blue/5 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue text-white flex items-center justify-center font-black shrink-0">
                    {extractStats.filled}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-navy text-sm">
                      {extractStats.filled} de {extractStats.total} perguntas pré-preenchidas
                    </div>
                    <div className="text-xs text-ink-soft mt-0.5">
                      Você vai revisar cada uma no questionário e pode editar livremente.
                    </div>
                  </div>
                  <button onClick={extractAnswersFromPDF} disabled={extracting} className="btn-ghost text-xs shrink-0">
                    {extracting ? "..." : "Refazer"}
                  </button>
                </div>
              )}
            </div>
          )}
          {pdfError && (
            <div className="bg-danger-soft border border-danger/30 text-danger rounded-lg p-2.5 text-xs font-medium mt-2">
              {pdfError}
            </div>
          )}
        </Section>

        <div className="h-px bg-slate-200/70" />

        <Section number={1} title="Cliente">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nome do Cliente" required>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: João Silva"
                className="input-field"
              />
            </Field>
            <Field label="E-mail do Cliente">
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="cliente@exemplo.com"
                className="input-field"
              />
            </Field>
          </div>
        </Section>

        <div className="h-px bg-slate-200/70" />

        <Section number={2} title="Estudo">
          <Field label="Título do Estudo" required>
            <input
              type="text"
              value={studyTitle}
              onChange={(e) => setStudyTitle(e.target.value)}
              placeholder="Ex: Plataforma de teleconsulta para nutricionistas"
              className="input-field"
            />
          </Field>
        </Section>

        <div className="h-px bg-slate-200/70" />

        <Section number={3} title="Categoria">
          <div className="grid sm:grid-cols-2 gap-3">
            {CATEGORIES.map((c) => {
              const selected = category === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`text-left rounded-xl p-4 transition relative overflow-hidden border-2 ${
                    selected
                      ? "border-cyan bg-cyan/5 shadow-glow"
                      : "border-slate-200/70 hover:border-slate-300 bg-white"
                  }`}
                >
                  {selected && (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan flex items-center justify-center text-navy-deep text-[10px] font-black">
                      ✓
                    </span>
                  )}
                  <div className="font-bold text-navy mb-1">{c.label}</div>
                  <div className="text-sm text-ink-soft leading-snug">{c.description}</div>
                </button>
              );
            })}
          </div>
        </Section>

        {error && (
          <div className="bg-danger-soft border border-danger/30 text-danger rounded-xl p-3.5 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="btn-ghost"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
          >
            {loading ? "Criando..." : "Iniciar Questionário →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-navy-gradient text-cyan font-black text-sm flex items-center justify-center shadow-card">
          {number}
        </div>
        <h2 className="text-lg font-bold text-navy">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-widest text-ink-mute mb-2">
        {label}
        {required && <span className="text-purple ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
