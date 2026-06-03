"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { StudyWithClient } from "@/lib/store";
import { getStudyRemote } from "@/lib/storeApi";
import { Questionnaire } from "@/components/Questionnaire";
import { ShareButton } from "@/components/ShareButton";
import { PDFButton } from "@/components/PDFButton";
import {
  CategoryIcon,
  CategoryChip,
  StatusPill,
  scoreHex,
} from "@/components/dashboard/Shared";
import { DiagnosticoTab } from "./DiagnosticoTab";
import { EstudoTab } from "./EstudoTab";
import { TeseTab } from "./TeseTab";
import { MarcaTab } from "./MarcaTab";
import { ComercialTab } from "./ComercialTab";
import { ExecucaoTab } from "./ExecucaoTab";
import { CommentsSidebar } from "@/components/dashboard/CommentsSidebar";
import { PortalAccessCard } from "./PortalAccessCard";
import { QuickDraftButton, QuickDraftSummaryCard } from "./QuickDraftButton";
import { NextMeetingCard } from "./NextMeetingCard";
import { SectorChecklistCard } from "./SectorChecklistCard";
import { SECTORS_LABEL } from "@/components/dashboard/Shared";

type TabKey =
  | "estudo"
  | "diagnostico"
  | "tese"
  | "marca"
  | "comercial"
  | "execucao";

interface TabDef {
  key: TabKey;
  label: string;
  icon: string;
  confidential?: boolean;
}

const TABS: TabDef[] = [
  { key: "estudo", label: "Estudo do cliente", icon: "📄" },
  { key: "diagnostico", label: "Diagnóstico", icon: "◐" },
  { key: "tese", label: "Tese interna", icon: "✦", confidential: true },
  { key: "marca", label: "Marca", icon: "◇" },
  { key: "comercial", label: "Comercial", icon: "⟶" },
  { key: "execucao", label: "Execução", icon: "▦" },
];

const REC_LABEL: Record<string, string> = {
  entrar: "ENTRAR",
  observar: "OBSERVAR",
  nao_entrar: "NÃO ENTRAR",
};

export default function StudyPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPresenting = searchParams?.get("present") === "1";
  const [study, setStudy] = useState<StudyWithClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("diagnostico");
  const [regenerating, setRegenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sincroniza data-present no shell do dashboard para esconder sb/tb via CSS.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const shell = document.querySelector(".dashboard-shell");
    if (!shell) return;
    if (isPresenting) {
      shell.setAttribute("data-present", "1");
    } else {
      shell.removeAttribute("data-present");
    }
    return () => {
      shell.removeAttribute("data-present");
    };
  }, [isPresenting]);

  // Se está apresentando e a aba "tese" estava selecionada, troca para "estudo".
  useEffect(() => {
    if (isPresenting && tab === "tese") setTab("estudo");
  }, [isPresenting, tab]);

  function exitPresentation() {
    const url = `/dashboard/study/${id as string}`;
    router.push(url);
  }

  function enterPresentation() {
    const url = `/dashboard/study/${id as string}?present=1`;
    router.push(url);
  }

  function startInterview() {
    router.push(`/dashboard/study/${id as string}/entrevista`);
  }

  const interviewState =
    (study?.generation_metadata as Record<string, unknown> | null | undefined)
      ?.interview_state as
      | { current_question_id?: string; paused_at?: string }
      | undefined;
  const interviewResumable = !!interviewState?.paused_at;

  useEffect(() => {
    if (id) loadStudy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    function onResize() {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 1280) setSidebarOpen(false);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  async function loadStudy() {
    setLoading(true);
    setStudy(await getStudyRemote(id as string));
    setLoading(false);
  }

  async function handleRegenerate() {
    if (!study) return;
    if (
      !confirm(
        "Regenerar o estudo? Isso vai sobrescrever o conteúdo atual e reiniciar o questionário."
      )
    )
      return;
    setRegenerating(true);
    try {
      const { updateStudyRemote } = await import("@/lib/storeApi");
      await updateStudyRemote(study.id, { status: "questionnaire" });
      await loadStudy();
    } finally {
      setRegenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          className="shimmer"
          style={{
            height: 40,
            width: 288,
            borderRadius: 10,
            marginBottom: 16,
          }}
        />
        <div
          className="surface shimmer"
          style={{ height: 288, borderRadius: 16 }}
        />
      </div>
    );
  }

  if (!study) {
    return (
      <div className="page" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          className="surface"
          style={{
            padding: 48,
            textAlign: "center",
            borderRadius: 16,
          }}
        >
          <p style={{ color: "var(--ink-soft)", marginBottom: 16 }}>
            Estudo não encontrado.
          </p>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => router.push("/dashboard/estudos")}
          >
            ← Voltar para estudos
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = study.status === "completed";

  // Estados intermediários: mantém o fluxo de questionário / geração inalterado.
  if (!isCompleted) {
    return (
      <div className="page" style={{ maxWidth: 960, margin: "0 auto" }}>
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

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <CategoryIcon category={study.category} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <CategoryChip category={study.category} />
              <span
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 999,
                  background: "var(--ink-mute)",
                }}
              />
              <StatusPill status={study.status} />
              <span
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 999,
                  background: "var(--ink-mute)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-mute)",
                }}
              >
                criado em{" "}
                {new Date(study.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <h1
              style={{
                marginTop: 4,
                fontFamily: "var(--font-sans)",
                fontWeight: 900,
                fontSize: 26,
                letterSpacing: "-0.022em",
                color: "var(--navy)",
                lineHeight: 1.1,
              }}
            >
              {study.title}
            </h1>
            <p
              className="lead"
              style={{
                marginTop: 8,
                color: "var(--ink-soft)",
                fontSize: 14,
              }}
            >
              Cliente:{" "}
              <strong style={{ color: "var(--navy)" }}>
                {study.client?.name}
              </strong>
              .
            </p>
          </div>
        </div>

        {study.status === "questionnaire" && (
          <Questionnaire study={study} onUpdate={loadStudy} />
        )}

        {study.status === "generating" && (
          <div
            className="surface"
            style={{
              padding: 48,
              textAlign: "center",
              borderRadius: 16,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(185,100,255,0.05), rgba(82,225,231,0.05), transparent)",
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                className="animate-spin"
                style={{
                  display: "inline-block",
                  width: 40,
                  height: 40,
                  border: "4px solid var(--cyan)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  marginBottom: 20,
                }}
              />
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 900,
                  fontSize: 20,
                  color: "var(--navy)",
                  letterSpacing: "-0.022em",
                  margin: "0 0 8px",
                }}
              >
                Gerando os outputs...
              </h3>
              <p
                style={{
                  color: "var(--ink-soft)",
                  margin: "0 auto 24px",
                  maxWidth: 480,
                  fontSize: 14,
                }}
              >
                Estudo, Marca, Comercial, Cronograma e Tese Interna em
                pipeline. Pode levar 2 a 4 minutos.
              </p>
              <button
                type="button"
                className="btn-ghost"
                onClick={loadStudy}
              >
                Atualizar status
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const overall = study.scores?.client_facing?.overall ?? 0;
  const internalRec = study.scores?.internal?.recommendation;
  const recLabel = internalRec ? REC_LABEL[internalRec] : "OBSERVAR";

  const gm = study.generation_metadata as Record<string, unknown> | null;
  const templateUsed = !!gm?.template_used;
  const sectorContext =
    gm && typeof gm.sector_context === "object"
      ? (gm.sector_context as {
          template_key?: string;
          context_notes?: string;
          suggested_questions?: string[];
          common_risks?: string[];
        })
      : null;
  const sectorLabel =
    SECTORS_LABEL[study.category as keyof typeof SECTORS_LABEL] || study.category;

  return (
    <div
      className="page"
      style={{
        maxWidth: 1600,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: sidebarOpen ? "minmax(0, 1fr) 376px" : "minmax(0, 1fr)",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div style={{ minWidth: 0 }}>
      <button
        type="button"
        data-admin-action
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

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 8,
        }}
      >
        <CategoryIcon category={study.category} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <CategoryChip category={study.category} />
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: 999,
                background: "var(--ink-mute)",
              }}
            />
            <StatusPill status={study.status} />
            {templateUsed && (
              <>
                <span
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: 999,
                    background: "var(--ink-mute)",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "rgba(93,87,235,0.12)",
                    color: "var(--purple)",
                  }}
                >
                  ◇ Template setorial
                </span>
              </>
            )}
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: 999,
                background: "var(--ink-mute)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink-mute)",
              }}
            >
              criado em{" "}
              {new Date(study.created_at).toLocaleDateString("pt-BR")}
            </span>
          </div>
          <h1
            style={{
              marginTop: 4,
              fontFamily: "var(--font-sans)",
              fontWeight: 900,
              fontSize: 26,
              letterSpacing: "-0.022em",
              color: "var(--navy)",
              lineHeight: 1.1,
            }}
          >
            {study.title}
          </h1>
          <p
            className="lead"
            style={{
              marginTop: 8,
              color: "var(--ink-soft)",
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            Cliente:{" "}
            <strong style={{ color: "var(--navy)" }}>
              {study.client?.name}
            </strong>
            . Score geral{" "}
            <strong style={{ color: scoreHex(overall) }}>{overall}</strong>,
            recomendação{" "}
            <strong style={{ color: "var(--navy)" }}>{recLabel}</strong>.
          </p>
        </div>
      </div>

      <div
        data-study-toolbar
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          marginTop: 18,
        }}
      >
          <button
            type="button"
            className="btn-ghost"
            data-admin-action
            onClick={startInterview}
            style={{ fontSize: 12 }}
            title="Conduzir entrevista pergunta a pergunta com o cliente"
          >
            {interviewResumable ? "▶ Retomar entrevista" : "▶ Iniciar entrevista"}
          </button>
          <button
            type="button"
            className="btn-ghost"
            data-admin-action
            onClick={enterPresentation}
            style={{ fontSize: 12 }}
            title="Apresentar para o cliente (esconde itens internos)"
          >
            ◉ Modo apresentação
          </button>
          <span data-admin-action style={{ display: "inline-flex", gap: 8 }}>
            <ShareButton studyId={study.id} />
          </span>
          <PDFButton
            study={study}
            kind="study"
            variant="ghost"
            label="↓ Baixar PDF"
          />
          <span data-admin-action style={{ display: "inline-flex" }}>
            <QuickDraftButton
              studyId={study.id}
              initialMd={
                (study.generation_metadata?.quick_draft_md as
                  | string
                  | undefined) || null
              }
              initialAt={
                (study.generation_metadata?.quick_draft_at as
                  | string
                  | undefined) || null
              }
              onDraftChange={(md, generatedAt) => {
                setStudy((prev) =>
                  prev
                    ? {
                        ...prev,
                        generation_metadata: {
                          ...(prev.generation_metadata || {}),
                          quick_draft_md: md,
                          quick_draft_at: generatedAt,
                        },
                      }
                    : prev
                );
              }}
            />
          </span>
          <button
            type="button"
            className="btn-ghost"
            data-admin-action
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{ fontSize: 12 }}
          >
            ↻ {regenerating ? "Regenerando..." : "Regenerar"}
          </button>
          <button
            type="button"
            className="btn-ghost"
            data-admin-action
            onClick={() => setSidebarOpen((v) => !v)}
            style={{ fontSize: 12 }}
            title="Mostrar/ocultar comentários"
          >
            {sidebarOpen ? "▸ Ocultar" : "◂ Comentários"}
          </button>
      </div>

      {/* Tabs horizontais */}
      <div
        className="surface"
        style={{
          padding: "6px 8px",
          marginTop: 26,
          display: "inline-flex",
          gap: 4,
          borderRadius: 12,
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              data-tab={t.key}
              onClick={() => setTab(t.key)}
              style={{
                border: 0,
                background: active
                  ? "linear-gradient(180deg,#0A1F44,#06122A)"
                  : "transparent",
                color: active ? "#fff" : "var(--ink-soft)",
                padding: "10px 16px",
                borderRadius: 8,
                fontFamily: "var(--font-sans)",
                fontWeight: active ? 800 : 600,
                fontSize: 13,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 160ms var(--ease-out)",
                position: "relative",
              }}
            >
              <span
                style={{
                  color: active ? "var(--cyan)" : "var(--ink-mute)",
                }}
              >
                {t.icon}
              </span>
              {t.label}
              {t.confidential && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "rgba(185,100,255,0.15)",
                    color: active ? "var(--cyan)" : "var(--purple)",
                  }}
                >
                  Sócios
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div data-internal-only>
        <PortalAccessCard
          studyId={study.id}
          defaultClientEmail={study.client?.email || null}
        />
        <NextMeetingCard
          studyId={study.id}
          clientName={study.client?.name || null}
          initialAgendaMd={
            ((study.generation_metadata?.next_meeting as
              | { agenda_md?: string }
              | undefined)?.agenda_md) || null
          }
          initialGeneratedAt={
            ((study.generation_metadata?.next_meeting as
              | { generated_at?: string }
              | undefined)?.generated_at) || null
          }
        />
        <QuickDraftSummaryCard
          studyId={study.id}
          md={
            (study.generation_metadata?.quick_draft_md as string | undefined) ||
            null
          }
          generatedAt={
            (study.generation_metadata?.quick_draft_at as string | undefined) ||
            null
          }
        />
        {templateUsed && (
          <SectorChecklistCard
            sectorContext={sectorContext}
            label={sectorLabel}
          />
        )}
      </div>

      <div
        style={{ marginTop: 28 }}
        className={isPresenting ? "present-scale" : undefined}
      >
        {tab === "estudo" && <EstudoTab study={study} />}
        {tab === "diagnostico" && <DiagnosticoTab study={study} />}
        {tab === "tese" && <TeseTab study={study} onUpdate={loadStudy} />}
        {tab === "marca" && <MarcaTab study={study} onUpdate={loadStudy} />}
        {tab === "comercial" && (
          <ComercialTab study={study} onUpdate={loadStudy} />
        )}
        {tab === "execucao" && <ExecucaoTab study={study} />}
      </div>
      </div>
      {sidebarOpen && !isPresenting && (
        <CommentsSidebar studyId={study.id} section={tab} />
      )}
      {isPresenting && (
        <button
          type="button"
          className="present-exit-pill"
          onClick={exitPresentation}
        >
          ← Sair do modo apresentação
        </button>
      )}
    </div>
  );
}
