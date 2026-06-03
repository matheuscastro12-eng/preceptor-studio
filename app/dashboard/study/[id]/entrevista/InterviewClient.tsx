"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StudyWithClient } from "@/lib/store";
import { updateStudyRemote } from "@/lib/storeApi";
import { getQuestions, LIKERT_OPTIONS, Question } from "@/lib/questions";

interface Props {
  study: StudyWithClient;
}

interface InterviewState {
  current_question_id?: string;
  paused_at?: string;
}

type AnswersMap = Record<string, unknown>;
type NotesMap = Record<string, string>;

interface FollowUpResp {
  question: string;
}
interface VaguenessResp {
  vague: boolean;
  why: string | null;
}
interface TopicsResp {
  topics: string[];
}

export function InterviewClient({ study }: Props) {
  const router = useRouter();
  const questions = useMemo(
    () => getQuestions(study.category),
    [study.category]
  );

  const initialAnswers = (study.answers as AnswersMap | null) || {};
  const initialNotes =
    ((initialAnswers.__notes as NotesMap | undefined) || {}) as NotesMap;
  const initialState =
    ((study.generation_metadata as Record<string, unknown> | null)
      ?.interview_state as InterviewState | undefined) || {};

  const startIndex = (() => {
    if (initialState.current_question_id) {
      const i = questions.findIndex((q) => q.id === initialState.current_question_id);
      if (i >= 0) return i;
    }
    return 0;
  })();

  const [answers, setAnswers] = useState<AnswersMap>(() => {
    const a: AnswersMap = { ...initialAnswers };
    delete a.__notes;
    return a;
  });
  const [notes, setNotes] = useState<NotesMap>(initialNotes);
  const [idx, setIdx] = useState(startIndex);
  const [noteOpen, setNoteOpen] = useState(false);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");

  const current = questions[idx];
  const total = questions.length;
  const progressPct = Math.round(((idx + 1) / total) * 100);

  // ─── Persistência com debounce ──────────────────────────────────────────
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const persist = useCallback(
    async (
      nextAnswers: AnswersMap,
      nextNotes: NotesMap,
      extra?: { interview_state?: InterviewState | null }
    ) => {
      if (mounted.current) setSavingState("saving");
      const patch: Record<string, unknown> = {
        answers: { ...nextAnswers, __notes: nextNotes },
      };
      if (extra && "interview_state" in extra) {
        const meta =
          (study.generation_metadata as Record<string, unknown> | null) || {};
        patch.generation_metadata = {
          ...meta,
          interview_state: extra.interview_state,
        };
      }
      await updateStudyRemote(study.id, patch);
      if (!mounted.current) return;
      setSavingState("saved");
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (mounted.current) setSavingState("idle");
      }, 1200);
    },
    [study.id, study.generation_metadata]
  );

  const scheduleSave = useCallback(
    (nextAnswers: AnswersMap, nextNotes: NotesMap) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void persist(nextAnswers, nextNotes);
      }, 600);
    },
    [persist]
  );

  function setAnswerValue(qid: string, value: unknown) {
    const next = { ...answers, [qid]: value };
    setAnswers(next);
    scheduleSave(next, notes);
  }

  function setNoteValue(qid: string, value: string) {
    const next: NotesMap = { ...notes, [qid]: value };
    if (!value.trim()) delete next[qid];
    setNotes(next);
    scheduleSave(answers, next);
  }

  // ─── Navegação ─────────────────────────────────────────────────────────
  const navBusy = useRef(false);
  async function goNext() {
    if (navBusy.current) return;
    navBusy.current = true;
    try {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      await persist(answers, notes);
      if (idx < total - 1) {
        setIdx(idx + 1);
        setNoteOpen(false);
      }
    } finally {
      navBusy.current = false;
    }
  }

  async function goPrev() {
    if (navBusy.current) return;
    navBusy.current = true;
    try {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      await persist(answers, notes);
      if (idx > 0) {
        setIdx(idx - 1);
        setNoteOpen(false);
      }
    } finally {
      navBusy.current = false;
    }
  }

  function skip() {
    if (idx < total - 1) {
      setIdx(idx + 1);
      setNoteOpen(false);
    }
  }

  async function pause() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await persist(answers, notes, {
      interview_state: {
        current_question_id: current.id,
        paused_at: new Date().toISOString(),
      },
    });
    router.push(`/dashboard/study/${study.id}`);
  }

  async function exit() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await persist(answers, notes);
    router.push(`/dashboard/study/${study.id}`);
  }

  // ─── Atalhos de teclado ─────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTextarea = target?.tagName === "TEXTAREA";
      if (e.key === "Tab" && !e.shiftKey && !isTextarea) {
        e.preventDefault();
        void goNext();
      } else if (e.key === "Tab" && e.shiftKey && !isTextarea) {
        e.preventDefault();
        void goPrev();
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        void goNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, answers, notes]);

  // ─── Contexto recente para o copiloto ───────────────────────────────────
  const recentContext = useMemo<Record<string, string>>(() => {
    const ctx: Record<string, string> = {};
    for (let i = Math.max(0, idx - 6); i < idx; i++) {
      const q = questions[i];
      const v = answers[q.id];
      if (typeof v === "string" && v.trim().length > 0) {
        ctx[q.question.slice(0, 80)] = v;
      }
    }
    return ctx;
  }, [idx, questions, answers]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        alignItems: "start",
      }}
    >
      <div style={{ minWidth: 0, padding: "28px 32px 80px" }}>
        {/* Header minimalista */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
            paddingBottom: 14,
            borderBottom: "1px solid var(--slate-200)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              fontSize: 14,
              color: "var(--navy)",
            }}
          >
            PRECEPTOR!
          </div>
          <span
            style={{
              width: 3,
              height: 3,
              borderRadius: 999,
              background: "var(--ink-mute)",
            }}
          />
          <div
            style={{
              fontSize: 13,
              color: "var(--ink-soft)",
              flex: 1,
              minWidth: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {study.title}
            {study.client?.name ? ` · ${study.client.name}` : ""}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-mute)",
              fontFamily: "var(--font-mono)",
              minWidth: 60,
              textAlign: "right",
            }}
          >
            {savingState === "saving"
              ? "salvando..."
              : savingState === "saved"
              ? "salvo"
              : ""}
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={exit}
            style={{ fontSize: 12 }}
          >
            ← Voltar ao estudo
          </button>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {/* Progresso fino */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--ink-mute)",
                marginBottom: 8,
              }}
            >
              Pergunta {idx + 1} de {total} · {current.section}
            </div>
            <div
              style={{
                height: 3,
                background: "var(--slate-200)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  background:
                    "linear-gradient(90deg, var(--cyan), var(--blue))",
                  transition: "width 320ms var(--ease-out)",
                }}
              />
            </div>
          </div>

          {/* Pergunta */}
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 800,
              fontSize: 30,
              lineHeight: 1.2,
              letterSpacing: "-0.022em",
              color: "var(--navy)",
              margin: "0 0 14px",
            }}
          >
            {current.question}
            {current.required && (
              <span style={{ color: "var(--purple)", marginLeft: 6 }}>*</span>
            )}
          </h2>
          {current.helper && (
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: 15,
                lineHeight: 1.55,
                marginBottom: 22,
              }}
            >
              {current.helper}
            </p>
          )}

          {/* Campo de resposta */}
          <QuestionInput
            question={current}
            value={answers[current.id]}
            onChange={(v) => setAnswerValue(current.id, v)}
          />

          {/* Anotação interna */}
          <div style={{ marginTop: 18 }}>
            <button
              type="button"
              className="btn-ghost"
              data-internal-only
              onClick={() => setNoteOpen((v) => !v)}
              style={{ fontSize: 12 }}
            >
              {noteOpen ? "▾" : "▸"} Anotação interna
              {notes[current.id] ? " (preenchida)" : ""}
            </button>
            {noteOpen && (
              <div
                style={{
                  marginTop: 10,
                  background: "var(--slate-50, #F8FAFC)",
                  border: "1.5px dashed var(--slate-300, #CBD5E1)",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--ink-mute)",
                    marginBottom: 6,
                  }}
                >
                  Visível só para o time interno
                </div>
                <textarea
                  value={notes[current.id] || ""}
                  onChange={(e) => setNoteValue(current.id, e.target.value)}
                  rows={3}
                  placeholder="Observações sobre como o cliente respondeu, dúvidas, próximos passos..."
                  className="input-field"
                  style={{ background: "#fff", resize: "vertical" }}
                />
              </div>
            )}
          </div>

          {/* Ações */}
          <div
            style={{
              marginTop: 32,
              paddingTop: 18,
              borderTop: "1px solid var(--slate-200)",
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="btn-ghost"
              onClick={goPrev}
              disabled={idx === 0}
              style={{ fontSize: 13 }}
            >
              ← Anterior
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={skip}
              style={{ fontSize: 13 }}
            >
              Pular
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={pause}
              style={{ fontSize: 13 }}
            >
              ⏸ Pausar
            </button>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              className="btn-primary"
              onClick={goNext}
              disabled={idx === total - 1}
              style={{ fontSize: 13 }}
            >
              Próxima →
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              fontSize: 11,
              color: "var(--ink-mute)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Atalhos: Tab próxima · Shift+Tab anterior · Cmd/Ctrl+Enter próxima
          </div>
        </div>
      </div>

      <CopilotPanel
        studyId={study.id}
        question={current}
        answer={typeof answers[current.id] === "string" ? (answers[current.id] as string) : ""}
        context={recentContext}
      />
    </div>
  );
}

// ─── Input universal (text/textarea/single/multi/likert/number) ────────────
function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const placeholder = "Digite a resposta do cliente conforme ele fala...";

  if (question.type === "text_long") {
    return (
      <textarea
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder={placeholder}
        className="input-field"
        style={{ fontSize: 16, lineHeight: 1.5, resize: "vertical" }}
        autoFocus
      />
    );
  }

  if (question.type === "text_short") {
    return (
      <input
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
        style={{ fontSize: 16 }}
        autoFocus
      />
    );
  }

  if (question.type === "number" || question.type === "currency") {
    return (
      <input
        type="number"
        value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.type === "currency" ? "R$" : "número"}
        className="input-field"
        style={{ fontSize: 16 }}
        autoFocus
      />
    );
  }

  if (question.type === "single" && question.options) {
    return (
      <div style={{ display: "grid", gap: 8 }}>
        {question.options.map((opt) => {
          const checked = value === opt;
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onChange(opt)}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: 10,
                border: checked
                  ? "2px solid var(--cyan)"
                  : "2px solid var(--slate-200)",
                background: checked ? "rgba(82,225,231,0.08)" : "#fff",
                cursor: "pointer",
                fontSize: 15,
                color: "var(--navy)",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "multi" && question.options) {
    const arr: string[] = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div style={{ display: "grid", gap: 8 }}>
        {question.options.map((opt) => {
          const checked = arr.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() =>
                onChange(checked ? arr.filter((a) => a !== opt) : [...arr, opt])
              }
              style={{
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: 10,
                border: checked
                  ? "2px solid var(--cyan)"
                  : "2px solid var(--slate-200)",
                background: checked ? "rgba(82,225,231,0.08)" : "#fff",
                cursor: "pointer",
                fontSize: 15,
                color: "var(--navy)",
              }}
            >
              {checked ? "☑ " : "☐ "}
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "likert") {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 8,
        }}
      >
        {LIKERT_OPTIONS.map((opt, i) => {
          const checked = value === opt;
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onChange(opt)}
              style={{
                padding: "14px 6px",
                borderRadius: 10,
                border: checked
                  ? "2px solid var(--cyan)"
                  : "2px solid var(--slate-200)",
                background: checked ? "rgba(82,225,231,0.08)" : "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--navy)",
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 2 }}>{i + 1}</div>
              <div style={{ fontSize: 10, color: "var(--ink-soft)" }}>{opt}</div>
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}

// ─── Painel Copiloto IA ─────────────────────────────────────────────────────
function CopilotPanel({
  studyId,
  question,
  answer,
  context,
}: {
  studyId: string;
  question: Question;
  answer: string;
  context: Record<string, string>;
}) {
  const [active, setActive] = useState(false);
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [vagueness, setVagueness] = useState<VaguenessResp | null>(null);
  const [vaguenessLoading, setVaguenessLoading] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Reseta resultados ao trocar de pergunta.
  useEffect(() => {
    setFollowUp(null);
    setVagueness(null);
    setTopics([]);
    setErr(null);
  }, [question.id]);

  function ensureAnswer(): boolean {
    if (!answer.trim()) {
      setErr("Digite a resposta do cliente antes de pedir sugestão.");
      return false;
    }
    setErr(null);
    return true;
  }

  async function callApi<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`/api/studies/${studyId}/copilot/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Resposta inválida (HTTP ${res.status})`);
    }
    if (!res.ok) {
      const msg =
        (data as { error?: string } | null)?.error || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data as T;
  }

  async function askFollowUp() {
    if (!ensureAnswer()) return;
    setFollowUpLoading(true);
    setFollowUp(null);
    try {
      const r = await callApi<FollowUpResp>("follow-up", {
        question_id: question.id,
        question_text: question.question,
        answer,
        context,
      });
      setFollowUp(r.question || "");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro");
    } finally {
      setFollowUpLoading(false);
    }
  }

  async function checkVagueness() {
    if (!ensureAnswer()) return;
    setVaguenessLoading(true);
    setVagueness(null);
    try {
      const r = await callApi<VaguenessResp>("check-vagueness", {
        question_id: question.id,
        question_text: question.question,
        answer,
      });
      setVagueness(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro");
    } finally {
      setVaguenessLoading(false);
    }
  }

  async function suggestTopics() {
    if (!ensureAnswer()) return;
    setTopicsLoading(true);
    setTopics([]);
    try {
      const r = await callApi<TopicsResp>("topics", {
        question_id: question.id,
        question_text: question.question,
        answer,
      });
      setTopics(Array.isArray(r.topics) ? r.topics : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro");
    } finally {
      setTopicsLoading(false);
    }
  }

  return (
    <aside
      data-internal-only
      style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        padding: 20,
        borderLeft: "1px solid var(--slate-200)",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--purple)",
          }}
        >
          Copiloto IA
        </div>
        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          style={{
            border: 0,
            cursor: "pointer",
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            background: active ? "var(--cyan)" : "var(--slate-100)",
            color: active ? "var(--navy)" : "var(--ink-soft)",
          }}
        >
          {active ? "Ativo" : "Inativo"}
        </button>
      </div>

      {!active && (
        <div
          className="surface"
          style={{
            padding: 14,
            borderRadius: 12,
            fontSize: 12,
            color: "var(--ink-soft)",
            lineHeight: 1.5,
          }}
        >
          Ative para receber sugestões de follow-up e alertas de respostas
          vagas durante a entrevista. Cada sugestão é manual, sem chamadas
          automáticas.
        </div>
      )}

      {active && (
        <div style={{ display: "grid", gap: 12 }}>
          {/* Follow-up */}
          <div
            className="surface"
            style={{ padding: 12, borderRadius: 12 }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--ink-mute)",
                marginBottom: 6,
              }}
            >
              Follow-up sugerido
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={askFollowUp}
              disabled={followUpLoading}
              style={{ fontSize: 12, width: "100%" }}
            >
              {followUpLoading ? "Pensando..." : "Pedir sugestão"}
            </button>
            {followUp && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: "var(--navy)",
                  lineHeight: 1.45,
                  paddingLeft: 12,
                  borderLeft: "3px solid var(--cyan)",
                }}
              >
                {followUp}
              </div>
            )}
          </div>

          {/* Vagueness */}
          <div
            className="surface"
            style={{ padding: 12, borderRadius: 12 }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--ink-mute)",
                marginBottom: 6,
              }}
            >
              Risco de vagueza
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={checkVagueness}
              disabled={vaguenessLoading}
              style={{ fontSize: 12, width: "100%" }}
            >
              {vaguenessLoading ? "Avaliando..." : "Avaliar resposta"}
            </button>
            {vagueness && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 8,
                  background: vagueness.vague
                    ? "#FEF3C7"
                    : "rgba(16,185,129,0.1)",
                  border: vagueness.vague
                    ? "1px solid #F59E0B"
                    : "1px solid rgba(16,185,129,0.4)",
                  fontSize: 12,
                  color: "var(--navy)",
                  lineHeight: 1.4,
                }}
              >
                <strong>
                  {vagueness.vague ? "Vaga." : "Concreta."}
                </strong>
                {vagueness.why ? ` ${vagueness.why}` : ""}
              </div>
            )}
          </div>

          {/* Topics */}
          <div
            className="surface"
            style={{ padding: 12, borderRadius: 12 }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--ink-mute)",
                marginBottom: 6,
              }}
            >
              Tópicos adjacentes
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={suggestTopics}
              disabled={topicsLoading}
              style={{ fontSize: 12, width: "100%" }}
            >
              {topicsLoading ? "Pensando..." : "Sugerir tópicos"}
            </button>
            {topics.length > 0 && (
              <ul
                style={{
                  marginTop: 10,
                  paddingLeft: 18,
                  fontSize: 13,
                  color: "var(--navy)",
                  lineHeight: 1.5,
                }}
              >
                {topics.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}
          </div>

          {err && (
            <div
              style={{
                padding: 10,
                borderRadius: 8,
                background: "var(--danger-soft, #FEE2E2)",
                color: "var(--danger, #B91C1C)",
                fontSize: 12,
              }}
            >
              {err}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
