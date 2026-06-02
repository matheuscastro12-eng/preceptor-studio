"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/lib/store";
import {
  createClientRemote,
  createStudyRemote,
  updateStudyRemote,
} from "@/lib/storeApi";
import { CategoryIcon, Eyebrow, MiniDiamond } from "@/components/dashboard/Shared";
import { getTemplate, buildSectorContext } from "@/lib/studyTemplates";

type CategoryOption = {
  value: Category;
  label: string;
  description: string;
};

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: "saude",
    label: "Saúde",
    description: "Telemed, regtech clínica, software para operadoras.",
  },
  {
    value: "educacao",
    label: "Educação",
    description: "Edtech, plataformas de ensino, formação corporativa.",
  },
  {
    value: "juridico",
    label: "Jurídico",
    description: "Lawtech, automação contratual, compliance.",
  },
  {
    value: "tech",
    label: "Tech",
    description: "SaaS B2B, infra, dev tools, AI nativo.",
  },
];

const VALID_CATS = new Set<Category>(["saude", "educacao", "juridico", "tech", "outro"]);

type LeadLite = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  category: string | null;
  notes: string | null;
  diagnostic_answers: Record<string, unknown> | null;
};

function mapCategory(input: string | null | undefined): Category | null {
  if (!input) return null;
  const v = input.toLowerCase();
  if (v === "outro") return null;
  if (VALID_CATS.has(v as Category)) return v as Category;
  return null;
}

export default function NewStudyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<number>(1);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [studyTitle, setStudyTitle] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [useTemplate, setUseTemplate] = useState(false);

  const template = category ? getTemplate(category) : null;
  // Limpa o uso do template se a categoria muda para uma sem template.
  useEffect(() => {
    if (!template) setUseTemplate(false);
  }, [template]);

  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfMeta, setPdfMeta] = useState<{
    filename: string;
    pages: number;
    chars: number;
    truncated: boolean;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [pdfSuggestions, setPdfSuggestions] = useState<Record<string, unknown> | null>(null);
  const [extractStats, setExtractStats] = useState<{ filled: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // ── Lead context (importação de diagnóstico) ────────────────────────────
  const leadIdParam = searchParams?.get("lead_id") ?? null;
  const [leadContext, setLeadContext] = useState<LeadLite | null>(null);

  useEffect(() => {
    if (!leadIdParam) return;
    let cancelled = false;
    fetch(`/api/leads/${leadIdParam}`)
      .then((r) => r.json())
      .then((d: { lead?: LeadLite }) => {
        if (cancelled || !d.lead) return;
        const lead = d.lead;
        setLeadContext(lead);
        // Pre-fill
        setClientName(lead.name || "");
        setClientEmail(lead.email || "");
        setStudyTitle(`Estudo estratégico - ${lead.company || lead.name}`);
        const mapped = mapCategory(lead.category);
        if (mapped) setCategory(mapped);
        // Persist temp context
        if (typeof window !== "undefined" && lead.diagnostic_answers) {
          try {
            window.localStorage.setItem(
              `preceptor_lead_context_${lead.id}`,
              JSON.stringify(lead.diagnostic_answers)
            );
          } catch {
            // ignore storage errors
          }
        }
      })
      .catch(() => {
        // silently ignore
      });
    return () => {
      cancelled = true;
    };
  }, [leadIdParam]);

  function discardLeadContext() {
    if (leadContext && typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(`preceptor_lead_context_${leadContext.id}`);
      } catch {
        // ignore
      }
    }
    setLeadContext(null);
    router.replace("/dashboard/new");
  }

  const valid =
    clientName.trim().length > 0 && studyTitle.trim().length > 0 && !!category;

  // Track which section needs attention.
  useEffect(() => {
    if (!clientName.trim()) setActiveSection(1);
    else if (!studyTitle.trim()) setActiveSection(2);
    else if (!category) setActiveSection(3);
    else setActiveSection(0);
  }, [clientName, studyTitle, category]);

  const handlePDFUpload = useCallback(async (file: File) => {
    setUploading(true);
    setPdfError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-pdf", { method: "POST", body: fd });
      const text = await res.text();
      type UploadResp = {
        text?: string;
        filename?: string;
        pages?: number;
        chars?: number;
        truncated?: boolean;
        error?: string;
      };
      let data: UploadResp | null = null;
      try {
        data = text ? (JSON.parse(text) as UploadResp) : null;
      } catch {
        throw new Error(`Servidor respondeu sem JSON (HTTP ${res.status})`);
      }
      if (!res.ok) throw new Error((data && data.error) || `HTTP ${res.status}`);
      if (!data) throw new Error("Resposta vazia do servidor.");
      setPdfText(data.text ?? "");
      setPdfMeta({
        filename: data.filename ?? file.name,
        pages: data.pages ?? 0,
        chars: data.chars ?? 0,
        truncated: !!data.truncated,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha no upload do PDF.";
      setPdfError(msg);
      setPdfText(null);
      setPdfMeta(null);
    } finally {
      setUploading(false);
    }
  }, []);

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
    setPdfError(null);
    setPdfSuggestions(null);
    setExtractStats(null);
    try {
      const res = await fetch("/api/extract-from-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfText,
          category,
          filename: pdfMeta?.filename || null,
        }),
      });
      const text = await res.text();
      type ExtractResp = {
        suggestions?: Record<string, unknown>;
        filled_count?: number;
        total_count?: number;
        error?: string;
      };
      let data: ExtractResp | null = null;
      try {
        data = text ? (JSON.parse(text) as ExtractResp) : null;
      } catch {
        throw new Error(`Servidor sem JSON (HTTP ${res.status})`);
      }
      if (!res.ok) throw new Error((data && data.error) || `HTTP ${res.status}`);
      setPdfSuggestions(data?.suggestions || {});
      setExtractStats({
        filled: data?.filled_count ?? 0,
        total: data?.total_count ?? 0,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao extrair respostas do PDF.";
      setPdfSuggestions(null);
      setExtractStats(null);
      setPdfError(
        `Falha ao extrair respostas: ${msg} O PDF continua anexado e será usado como contexto no estudo.`
      );
    } finally {
      setExtracting(false);
    }
  }

  async function handleCreate() {
    if (!valid) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const client = await createClientRemote({
        name: clientName.trim(),
        email: clientEmail.trim() || null,
      });
      const study = await createStudyRemote({
        client_id: client.id,
        title: studyTitle.trim(),
        category: category as Category,
        status: "questionnaire",
      });

      const baseAnswers: Record<string, unknown> = {};
      const sectorCtx =
        useTemplate && template ? buildSectorContext(template) : null;
      if (sectorCtx) {
        // Embute nas respostas para o fluxo de geração existente injetar no prompt.
        baseAnswers.__sector_context = sectorCtx;
      }
      if (pdfText) {
        baseAnswers.__pdf_context = pdfText;
        baseAnswers.__pdf_meta = pdfMeta;
        baseAnswers.__pdf_suggestions = pdfSuggestions || {};
        Object.assign(baseAnswers, pdfSuggestions || {});
      }
      if (leadContext) {
        baseAnswers.__source_lead_id = leadContext.id;
        baseAnswers.__source_diagnostic_answers = leadContext.diagnostic_answers ?? {};
      }
      if (Object.keys(baseAnswers).length > 0) {
        await updateStudyRemote(study.id, { answers: baseAnswers });
      }

      if (leadContext || sectorCtx) {
        // Mark study with provenance + sector template metadata.
        const genMeta: Record<string, unknown> = {};
        if (leadContext) {
          genMeta.source_lead_id = leadContext.id;
          genMeta.source_diagnostic_answers =
            leadContext.diagnostic_answers ?? {};
        }
        if (sectorCtx) {
          genMeta.sector_context = sectorCtx;
          genMeta.template_used = true;
        }
        try {
          await fetch(`/api/studies/${study.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ generation_metadata: genMeta }),
          });
        } catch {
          // non-fatal
        }
      }

      if (leadContext) {
        try {
          const prevNotes = leadContext.notes || "";
          await fetch(`/api/leads/${leadContext.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "qualificado",
              notes: `${prevNotes}${prevNotes ? "\n" : ""}Estudo gerado: ${study.id}`,
            }),
          });
        } catch {
          // non-fatal
        }
      }

      router.push(`/dashboard/study/${study.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar estudo.";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 920, margin: "0 auto" }}>
      <button
        type="button"
        onClick={() => router.push("/dashboard/estudos")}
        style={{
          color: "var(--ink-soft)",
          fontSize: 13,
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 16,
          background: "transparent",
          border: 0,
          cursor: "pointer",
          padding: 0,
        }}
      >
        ← Voltar para estudos
      </button>

      <Eyebrow tone="purple">Novo Estudo</Eyebrow>
      <h1
        style={{
          marginTop: 10,
          fontFamily: "var(--font-sans)",
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
          color: "var(--navy)",
        }}
      >
        Configure o estudo
        <br />
        <span style={{ fontStyle: "italic", fontWeight: 800, color: "var(--ink-soft)" }}>
          estratégico.
        </span>
      </h1>
      <p
        className="lead"
        style={{
          marginTop: 12,
          color: "var(--ink-soft)",
          fontSize: 15.5,
          lineHeight: 1.55,
          maxWidth: 640,
        }}
      >
        Em até 5 dias úteis você recebe os 5 documentos. Comece preenchendo o
        contexto inicial logo abaixo.
      </p>

      <div
        className="surface"
        style={{
          padding: 40,
          marginTop: 32,
          display: "flex",
          flexDirection: "column",
          gap: 32,
          borderRadius: 18,
          background: "linear-gradient(180deg, #FFFFFF 0%, #F9FBFD 100%)",
        }}
      >
        {leadContext && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 18px",
              background: "rgba(82,225,231,0.08)",
              border: "1px solid rgba(82,225,231,0.35)",
              borderRadius: 14,
            }}
          >
            <MiniDiamond size={14} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: 13 }}>
                Importando contexto do diagnóstico de {leadContext.name}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 2 }}>
                Cliente, título e categoria já foram pré-preenchidos. Edite o que precisar.
              </div>
            </div>
            <button
              type="button"
              onClick={discardLeadContext}
              className="btn-ghost"
              style={{ fontSize: 11.5, padding: "6px 12px" }}
            >
              Descartar contexto
            </button>
          </div>
        )}

        <Section
          number={0}
          title="Tem um PDF com informações do projeto?"
          active={activeSection === 0}
        >
          <p
            style={{
              fontSize: 13,
              color: "var(--ink-soft)",
              margin: "0 0 14px",
            }}
          >
            Briefing, deck, plano de negócio. A IA usa como contexto adicional e
            pré-preenche o questionário. Opcional.
          </p>

          {!pdfText ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handlePDFUpload(f);
              }}
              onClick={() => fileRef.current?.click()}
              style={{
                border:
                  uploading || dragOver
                    ? "2px dashed var(--cyan)"
                    : "2px dashed rgba(15,23,41,0.15)",
                background:
                  uploading || dragOver ? "rgba(82,225,231,0.06)" : "#FFFFFF",
                borderRadius: 16,
                padding: 24,
                height: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 160ms var(--ease-out)",
                animation: dragOver ? "pulseBorder 1.2s infinite" : undefined,
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePDFUpload(f);
                }}
                style={{ display: "none" }}
              />
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 32,
                  color: dragOver ? "var(--cyan)" : "var(--ink-mute)",
                  marginBottom: 10,
                  lineHeight: 1,
                }}
              >
                ↑
              </div>
              <div
                style={{
                  color: "var(--navy)",
                  fontWeight: 700,
                  fontSize: 14.5,
                }}
              >
                {uploading
                  ? "Extraindo texto..."
                  : dragOver
                    ? "Solte o PDF aqui"
                    : "Arraste o PDF aqui ou clique pra selecionar"}
              </div>
              <div
                style={{
                  color: "var(--ink-mute)",
                  fontSize: 12,
                  marginTop: 6,
                }}
              >
                Máximo 15MB
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  background: "#D1FAE5",
                  border: "1px solid rgba(16,185,129,0.4)",
                  borderRadius: 14,
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "#10B981",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--navy)",
                      fontSize: 13,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pdfMeta?.filename}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--ink-soft)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {pdfMeta?.pages} páginas ·{" "}
                    {(pdfMeta?.chars ?? 0).toLocaleString("pt-BR")} caracteres
                    {pdfMeta?.truncated ? " · truncado em 60k chars" : ""}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={clearPDF}
                  style={{ fontSize: 11, padding: "6px 10px" }}
                >
                  Remover
                </button>
              </div>

              {!extractStats ? (
                <div
                  style={{
                    border: "1px solid rgba(82,225,231,0.4)",
                    background: "rgba(82,225,231,0.05)",
                    borderRadius: 14,
                    padding: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "var(--cyan)",
                      color: "var(--navy-deep)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    ✦
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "var(--navy)",
                        fontSize: 13,
                      }}
                    >
                      Pré-preencher o questionário com a IA?
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--ink-soft)",
                        marginTop: 2,
                      }}
                    >
                      {category
                        ? "A IA lê o PDF e preenche o que tiver evidência clara. Você revisa no questionário."
                        : "Selecione uma categoria abaixo primeiro."}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={extractAnswersFromPDF}
                    disabled={extracting || !category}
                    className="btn-cyan"
                    style={{
                      fontSize: 11.5,
                      padding: "6px 12px",
                      opacity: extracting || !category ? 0.5 : 1,
                    }}
                  >
                    {extracting ? "Lendo PDF..." : "Pré-preencher"}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    border:
                      extractStats.filled > 0
                        ? "1px solid rgba(93,87,235,0.3)"
                        : "1px solid rgba(245,158,11,0.4)",
                    background:
                      extractStats.filled > 0 ? "rgba(93,87,235,0.05)" : "#FEF3C7",
                    borderRadius: 14,
                    padding: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background:
                        extractStats.filled > 0 ? "var(--blue)" : "var(--warning)",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      flexShrink: 0,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {extractStats.filled}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "var(--navy)",
                        fontSize: 13,
                      }}
                    >
                      {extractStats.filled > 0
                        ? `${extractStats.filled} de ${extractStats.total} perguntas pré-preenchidas`
                        : "Nenhuma pergunta foi pré-preenchida"}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--ink-soft)",
                        marginTop: 2,
                      }}
                    >
                      {extractStats.filled > 0
                        ? "Você vai revisar cada uma no questionário e pode editar livremente."
                        : "A IA não achou evidência clara no PDF. O PDF segue anexado como contexto."}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={extractAnswersFromPDF}
                    disabled={extracting}
                    className="btn-ghost"
                    style={{ fontSize: 11.5, padding: "6px 12px" }}
                  >
                    {extracting ? "..." : "Refazer"}
                  </button>
                </div>
              )}
            </div>
          )}

          {pdfError && (
            <div
              style={{
                marginTop: 10,
                background: "var(--danger-soft)",
                border: "1px solid rgba(225,29,72,0.3)",
                color: "var(--danger-rose)",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {pdfError}
            </div>
          )}
        </Section>

        <Section number={1} title="Cliente" active={activeSection === 1}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <Field label="Nome do cliente" required>
              <input
                className="input new-input"
                placeholder="Ex: João Silva"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </Field>
            <Field label="E-mail do cliente">
              <input
                type="email"
                className="input new-input"
                placeholder="cliente@exemplo.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </Field>
          </div>
        </Section>

        <Section number={2} title="Estudo" active={activeSection === 2}>
          <Field label="Título do estudo" required>
            <input
              className="input new-input"
              placeholder="Ex: Plataforma de teleconsulta para nutricionistas"
              value={studyTitle}
              onChange={(e) => setStudyTitle(e.target.value)}
            />
          </Field>
        </Section>

        <Section number={3} title="Categoria" active={activeSection === 3}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {CATEGORY_OPTIONS.map((c) => {
              const selected = category === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className="cat-card"
                  data-selected={selected ? "true" : "false"}
                  style={{
                    textAlign: "left",
                    borderRadius: 14,
                    padding: 18,
                    background: selected ? "rgba(82,225,231,0.06)" : "#fff",
                    border: `2px solid ${
                      selected ? "var(--cyan)" : "rgba(15,23,41,0.08)"
                    }`,
                    boxShadow: selected
                      ? "0 0 0 4px rgba(82,225,231,0.18)"
                      : "none",
                    cursor: "pointer",
                    position: "relative",
                    transform: selected ? "scale(1.02)" : "scale(1)",
                    transition: "transform 200ms var(--ease-out), background 160ms, box-shadow 160ms, border-color 160ms",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {selected && (
                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "var(--cyan)",
                        color: "var(--navy-deep)",
                        fontWeight: 900,
                        fontSize: 11,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✓
                    </span>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        filter: selected
                          ? "drop-shadow(0 0 6px rgba(82,225,231,0.5))"
                          : "none",
                        transition: "filter 200ms",
                        display: "inline-flex",
                      }}
                    >
                      <CategoryIcon category={c.value} size={32} />
                    </span>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "var(--navy)",
                        fontSize: 15,
                      }}
                    >
                      {c.label}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--ink-soft)",
                      lineHeight: 1.45,
                    }}
                  >
                    {c.description}
                  </div>
                </button>
              );
            })}
          </div>

          {template && (
            <div
              style={{
                marginTop: 16,
                border: useTemplate
                  ? "2px solid var(--purple)"
                  : "1px solid rgba(93,87,235,0.25)",
                background: useTemplate
                  ? "rgba(93,87,235,0.05)"
                  : "rgba(93,87,235,0.03)",
                borderRadius: 16,
                padding: 20,
                transition: "border-color 160ms, background 160ms",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 14,
                  marginBottom: 12,
                }}
              >
                <div>
                  <Eyebrow tone="purple">Começar de um template do setor</Eyebrow>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "var(--navy)",
                      fontSize: 15,
                      marginTop: 6,
                    }}
                  >
                    Template {template.label}
                  </div>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: "var(--ink-soft)",
                      margin: "4px 0 0",
                      lineHeight: 1.5,
                      maxWidth: 520,
                    }}
                  >
                    Pré-preenche o contexto que o setor exige e injeta no estudo.
                    Opcional, você pode ajustar tudo depois.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !useTemplate;
                    setUseTemplate(next);
                    if (next && !studyTitle.trim()) {
                      setStudyTitle(template.defaultTitle);
                    }
                  }}
                  className={useTemplate ? "btn-ghost" : "btn-cyan"}
                  style={{ fontSize: 12, padding: "8px 14px", flexShrink: 0 }}
                >
                  {useTemplate ? "✓ Template aplicado" : "Usar este template"}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div className="overline" style={{ marginBottom: 6 }}>
                    O que o setor exige
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--ink-soft)",
                      lineHeight: 1.55,
                      whiteSpace: "pre-wrap",
                      maxHeight: 180,
                      overflowY: "auto",
                      padding: "10px 12px",
                      background: "#fff",
                      borderRadius: 10,
                      border: "1px solid rgba(15,23,41,0.06)",
                    }}
                  >
                    {template.contextNotes}
                  </div>
                </div>
                <div>
                  <div className="overline" style={{ marginBottom: 6 }}>
                    Perguntas-chave do setor
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      fontSize: 12.5,
                      color: "var(--ink-soft)",
                      lineHeight: 1.6,
                    }}
                  >
                    {template.suggestedQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Section>

        {error && (
          <div
            style={{
              background: "var(--danger-soft)",
              border: "1px solid rgba(225,29,72,0.3)",
              color: "var(--danger-rose)",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            paddingTop: 6,
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "var(--ink-mute)",
              fontWeight: 500,
            }}
          >
            Cerca de 25 perguntas, 8 a 12 minutos. Você pode salvar e voltar depois.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => router.push("/dashboard/estudos")}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!valid || loading}
              onClick={handleCreate}
              style={{
                flex: 1,
                justifyContent: "center",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 22px",
                borderRadius: 12,
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.01em",
                color: "#fff",
                border: 0,
                cursor: !valid || loading ? "not-allowed" : "pointer",
                opacity: !valid || loading ? 0.5 : 1,
                background:
                  "linear-gradient(180deg, #16307A 0%, #0A1F44 55%, #06122A 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 16px -4px rgba(10,31,68,0.4)",
              }}
            >
              {loading ? "Criando..." : "Iniciar Questionário →"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseBorder {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(82, 225, 231, 0.35);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(82, 225, 231, 0);
          }
        }
        :global(.new-input:hover) {
          border-color: rgba(82, 225, 231, 0.4) !important;
        }
      `}</style>
    </div>
  );
}

function Section({
  number,
  title,
  active,
  children,
}: {
  number: number;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(180deg,#0A1F44,#06122A)",
            color: "var(--cyan)",
            fontWeight: 900,
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: active
              ? "var(--glow-cyan), 0 1px 2px rgba(15,23,41,0.06)"
              : "0 1px 2px rgba(15,23,41,0.06)",
            fontFamily: "var(--font-mono)",
            transition: "box-shadow 200ms var(--ease-out)",
            flexShrink: 0,
          }}
        >
          {number}
        </div>
        <h2
          style={{
            fontSize: 18,
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            color: "var(--navy)",
            letterSpacing: "-0.015em",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </h2>
        <div
          style={{
            flex: 1,
            height: 1,
            background:
              "linear-gradient(90deg, rgba(15,23,41,0.06), transparent)",
          }}
        />
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
      <label className="overline" style={{ display: "block", marginBottom: 8 }}>
        {label}
        {required && (
          <span style={{ color: "var(--purple)", marginLeft: 4 }}>*</span>
        )}
      </label>
      {children}
    </div>
  );
}
