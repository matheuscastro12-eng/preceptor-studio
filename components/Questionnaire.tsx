"use client";

import { useState, useMemo } from "react";
import { updateStudy, replaceStudyTasks, StudyWithClient, Assignee, TaskStatus } from "@/lib/store";
import { getQuestions, Question, LIKERT_OPTIONS, OTHER_PREFIX } from "@/lib/questions";

interface Props {
  study: StudyWithClient;
  onUpdate: () => void;
}

export function Questionnaire({ study, onUpdate }: Props) {
  const [answers, setAnswers] = useState<Record<string, any>>(study.answers || {});
  const [currentSection, setCurrentSection] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"estudo" | "complementares" | "cronograma" | null>(null);

  const questions = useMemo(() => getQuestions(study.category), [study.category]);

  const sections = useMemo(() => {
    const grouped: { name: string; questions: Question[] }[] = [];
    for (const q of questions) {
      let sec = grouped.find((s) => s.name === q.section);
      if (!sec) {
        sec = { name: q.section, questions: [] };
        grouped.push(sec);
      }
      sec.questions.push(q);
    }
    return grouped;
  }, [questions]);

  const totalSections = sections.length;
  const section = sections[currentSection];
  const isLastSection = currentSection === totalSections - 1;

  function sectionValid(s: typeof section): boolean {
    return s.questions.every((q) => {
      if (!q.required) return true;
      const v = answers[q.id];
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && v !== "";
    });
  }

  function saveAnswers() {
    updateStudy(study.id, { answers });
  }

  async function handleNext() {
    if (!sectionValid(section)) {
      setError("Preencha as perguntas obrigatórias antes de continuar.");
      return;
    }
    setError(null);
    saveAnswers();
    if (!isLastSection) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      await handleGenerate();
    }
  }

  function handlePrev() {
    setError(null);
    saveAnswers();
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function safeFetchJson(url: string, payload: any) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // Resposta não-JSON (timeout/HTML/empty)
      throw new Error(
        `Servidor respondeu sem JSON (HTTP ${res.status}). ${
          text.slice(0, 200) || "Resposta vazia — provável timeout."
        }`
      );
    }
    if (!res.ok) {
      throw new Error(data?.error || `HTTP ${res.status}`);
    }
    return data;
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setStage("estudo");
    try {
      updateStudy(study.id, { answers, status: "generating" });

      // ETAPA 1 — Estudo do Cliente (com scores e insights)
      const stage1 = await safeFetchJson("/api/studies/generate", {
        category: study.category,
        answers,
        clientName: study.client?.name || null,
      });

      // Salva resultado intermediário (já dá pra ver o estudo + diagnóstico)
      updateStudy(study.id, {
        status: "generating",
        output_md: stage1.output_md,
        insights_chave: stage1.insights_chave || [],
        scores: stage1.scores || {},
        artifacts: {},
      });

      // ETAPA 2 — Brand + Commercial + Tese em paralelo
      setStage("complementares");
      const stage2 = await safeFetchJson("/api/studies/generate-supplementary", {
        category: study.category,
        answers,
        clientName: study.client?.name || null,
        title: study.title,
        studyMd: stage1.output_md,
      });

      const newScores = {
        client_facing: stage1.scores?.client_facing || null,
        internal: stage2.internal_scores || null,
      };

      updateStudy(study.id, {
        status: "generating",
        brand_brief_md: stage2.brand_brief_md || null,
        commercial_plan_md: stage2.commercial_plan_md || null,
        internal_thesis_md: stage2.internal_thesis_md || null,
        scores: newScores,
      });

      // ETAPA 3 — Cronograma
      setStage("cronograma");
      const stage3 = await safeFetchJson("/api/studies/generate-execution", {
        category: study.category,
        clientName: study.client?.name || null,
        title: study.title,
        studyMd: stage1.output_md,
        brandMd: stage2.brand_brief_md || "",
        commercialMd: stage2.commercial_plan_md || "",
      });

      // Persist tasks from execution plan
      if (stage3.execution_plan?.sprints) {
        const flat = stage3.execution_plan.sprints.flatMap((sp: any) =>
          (sp.tasks || []).map((t: any, i: number) => ({
            sprint: Number(sp.number) || 1,
            title: String(t.title || "Tarefa sem título").slice(0, 200),
            description: t.description || null,
            assignee: (t.assignee as Assignee) || null,
            estimated_hours: typeof t.estimated_hours === "number" ? t.estimated_hours : null,
            status: "todo" as TaskStatus,
            order_index: typeof t.order === "number" ? t.order : i,
            milestone: !!t.milestone,
          }))
        );
        replaceStudyTasks(study.id, flat);
      }

      updateStudy(study.id, {
        status: "completed",
        completed_at: new Date().toISOString(),
        generation_metadata: {
          ...stage1.metadata,
          ...stage2.metadata,
          ...stage3.metadata,
        },
      });

      onUpdate();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setGenerating(false);
      setStage(null);
      updateStudy(study.id, { status: "questionnaire" });
    }
  }

  function updateAnswer(questionId: string, value: any) {
    setAnswers({ ...answers, [questionId]: value });
  }

  if (generating) {
    const stages: { key: typeof stage; label: string; sub: string }[] = [
      { key: "estudo", label: "Estudo Estratégico", sub: "Diagnóstico, scores e insights" },
      { key: "complementares", label: "Marca + Comercial + Tese", sub: "3 documentos em paralelo" },
      { key: "cronograma", label: "Cronograma de Execução", sub: "Plano de 12 semanas em sprints" },
    ];
    const currentIdx = stages.findIndex((s) => s.key === stage);
    return (
      <div className="surface rounded-2xl p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 via-purple/5 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="text-center mb-8">
            <div className="inline-block w-10 h-10 border-4 border-cyan border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-xl font-black text-navy mb-1 tracking-tight">
              Gerando os 5 outputs
            </h3>
            <p className="text-ink-soft text-sm">
              Pipeline em 3 etapas. Pode levar 2-4 minutos no total.
            </p>
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            {stages.map((s, i) => {
              const done = currentIdx > i;
              const active = currentIdx === i;
              return (
                <div
                  key={s.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition ${
                    done
                      ? "border-success/40 bg-success-soft"
                      : active
                      ? "border-cyan bg-cyan/5"
                      : "border-slate-200 bg-white opacity-60"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      done
                        ? "bg-success text-white"
                        : active
                        ? "bg-cyan text-navy"
                        : "bg-slate-200 text-ink-mute"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-navy">{s.label}</div>
                    <div className="text-xs text-ink-soft">{s.sub}</div>
                  </div>
                  {active && (
                    <div className="w-4 h-4 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const pct = Math.round(((currentSection + 1) / totalSections) * 100);

  return (
    <div className="surface rounded-2xl overflow-hidden">
      {/* Progress header */}
      <div className="px-6 md:px-8 py-5 border-b border-slate-200/70 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-navy-gradient text-cyan font-black text-sm flex items-center justify-center shadow-card">
              {currentSection + 1}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">
                Seção {currentSection + 1} de {totalSections}
              </div>
              <div className="text-base font-bold text-navy tracking-tight">{section.name}</div>
            </div>
          </div>
          <span className="text-xs font-bold text-blue tabular-nums">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan to-blue transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-1 mt-3">
          {Array.from({ length: totalSections }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < currentSection
                  ? "bg-cyan"
                  : i === currentSection
                  ? "bg-blue"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="p-6 md:p-10">
        <div className="space-y-7">
          {section.questions.map((q) => {
            const sugg = (study.answers as any)?.__pdf_suggestions || {};
            const fromPdf = q.id in sugg && answers[q.id] !== undefined;
            return (
              <QuestionField
                key={q.id}
                question={q}
                value={answers[q.id]}
                onChange={(v) => updateAnswer(q.id, v)}
                fromPdf={fromPdf}
              />
            );
          })}
        </div>

        {error && (
          <div className="mt-6 bg-danger-soft border border-danger/30 text-danger rounded-xl p-3.5 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-200/70 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSection === 0}
            className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <button
            type="button"
            onClick={handleNext}
            className={isLastSection ? "btn-cyan" : "btn-primary"}
          >
            {isLastSection ? "Gerar Estudo →" : "Próxima Seção →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Question Field ────────────────────────────────────────────────────
function QuestionField({
  question,
  value,
  onChange,
  fromPdf,
}: {
  question: Question;
  value: any;
  onChange: (v: any) => void;
  fromPdf?: boolean;
}) {
  return (
    <div>
      <label className="block font-bold text-navy mb-1 leading-snug flex items-center gap-2 flex-wrap">
        <span>
          {question.question}
          {question.required && <span className="text-purple ml-1">*</span>}
        </span>
        {fromPdf && (
          <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan/15 text-cyan-deep">
            ✨ Do PDF
          </span>
        )}
      </label>
      {question.helper && (
        <p className="text-sm text-ink-soft mb-3">{question.helper}</p>
      )}

      {question.type === "text_short" && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
      )}

      {question.type === "text_long" && (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="input-field resize-none"
        />
      )}

      {question.type === "number" && (
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
      )}

      {question.type === "currency" && (
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="R$"
          className="input-field"
        />
      )}

      {question.type === "single" && question.options && (
        <SingleField
          options={question.options}
          allowOther={question.allow_other}
          value={value}
          onChange={onChange}
        />
      )}

      {question.type === "likert" && (
        <div>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {LIKERT_OPTIONS.map((opt, idx) => {
              const checked = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(opt)}
                  className={`px-2 py-3 border-2 rounded-xl text-xs font-bold text-center transition relative ${
                    checked
                      ? "border-cyan bg-cyan/10 text-navy shadow-glow"
                      : "border-slate-200/70 text-ink-soft hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className={`text-base mb-0.5 transition ${checked ? "scale-110" : ""}`}>
                    {idx + 1}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide leading-tight">{opt}</div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5 px-1">
            <span className="text-[10px] uppercase tracking-widest text-ink-mute font-bold">Discordo</span>
            <span className="text-[10px] uppercase tracking-widest text-ink-mute font-bold">Concordo</span>
          </div>
        </div>
      )}

      {question.type === "multi" && question.options && (
        <MultiField
          options={question.options}
          allowOther={question.allow_other}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
}

// ─── Single with optional "Outro" ────────────────────────────────────
function SingleField({
  options,
  allowOther,
  value,
  onChange,
}: {
  options: string[];
  allowOther?: boolean;
  value: any;
  onChange: (v: any) => void;
}) {
  const isOther = typeof value === "string" && value.startsWith(OTHER_PREFIX);
  const otherText = isOther ? value.slice(OTHER_PREFIX.length) : "";

  return (
    <div className="space-y-2 mt-1">
      {options.map((opt) => {
        const checked = value === opt;
        return (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(opt)}
            className={`w-full flex items-center gap-3 px-4 py-3 border-2 rounded-xl text-left transition ${
              checked
                ? "border-cyan bg-cyan/5 shadow-glow"
                : "border-slate-200/70 hover:border-slate-300 bg-white"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                checked ? "border-cyan bg-cyan" : "border-slate-300"
              }`}
            >
              {checked && <span className="w-1.5 h-1.5 rounded-full bg-navy-deep" />}
            </span>
            <span className="text-sm text-navy">{opt}</span>
          </button>
        );
      })}

      {allowOther && (
        <div
          className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl transition ${
            isOther
              ? "border-cyan bg-cyan/5 shadow-glow"
              : "border-slate-200/70 hover:border-slate-300 bg-white"
          }`}
        >
          <button
            type="button"
            onClick={() => onChange(OTHER_PREFIX)}
            className="flex items-center gap-3 shrink-0"
          >
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                isOther ? "border-cyan bg-cyan" : "border-slate-300"
              }`}
            >
              {isOther && <span className="w-1.5 h-1.5 rounded-full bg-navy-deep" />}
            </span>
            <span className="text-sm font-semibold text-navy">Outro:</span>
          </button>
          <input
            type="text"
            value={otherText}
            onFocus={() => {
              if (!isOther) onChange(OTHER_PREFIX);
            }}
            onChange={(e) => onChange(OTHER_PREFIX + e.target.value)}
            placeholder="especifique..."
            className="flex-1 bg-transparent text-sm text-navy placeholder:text-ink-mute focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

// ─── Multi with optional "Outro" ─────────────────────────────────────
function MultiField({
  options,
  allowOther,
  value,
  onChange,
}: {
  options: string[];
  allowOther?: boolean;
  value: any;
  onChange: (v: any) => void;
}) {
  const arr: string[] = Array.isArray(value) ? value : [];
  const otherEntry = arr.find((a) => a.startsWith(OTHER_PREFIX));
  const otherActive = !!otherEntry;
  const otherText = otherEntry ? otherEntry.slice(OTHER_PREFIX.length) : "";

  function toggle(opt: string) {
    if (arr.includes(opt)) onChange(arr.filter((a) => a !== opt));
    else onChange([...arr, opt]);
  }

  function setOther(text: string) {
    const without = arr.filter((a) => !a.startsWith(OTHER_PREFIX));
    onChange([...without, OTHER_PREFIX + text]);
  }

  function toggleOther() {
    if (otherActive) {
      onChange(arr.filter((a) => !a.startsWith(OTHER_PREFIX)));
    } else {
      onChange([...arr, OTHER_PREFIX]);
    }
  }

  return (
    <div className="space-y-2 mt-1">
      {options.map((opt) => {
        const checked = arr.includes(opt);
        return (
          <button
            type="button"
            key={opt}
            onClick={() => toggle(opt)}
            className={`w-full flex items-center gap-3 px-4 py-3 border-2 rounded-xl text-left transition ${
              checked
                ? "border-cyan bg-cyan/5 shadow-glow"
                : "border-slate-200/70 hover:border-slate-300 bg-white"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                checked ? "border-cyan bg-cyan" : "border-slate-300"
              }`}
            >
              {checked && (
                <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-navy-deep">
                  <path
                    d="M2 6.5L4.5 9L10 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="text-sm text-navy">{opt}</span>
          </button>
        );
      })}

      {allowOther && (
        <div
          className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl transition ${
            otherActive
              ? "border-cyan bg-cyan/5 shadow-glow"
              : "border-slate-200/70 hover:border-slate-300 bg-white"
          }`}
        >
          <button
            type="button"
            onClick={toggleOther}
            className="flex items-center gap-3 shrink-0"
          >
            <span
              className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                otherActive ? "border-cyan bg-cyan" : "border-slate-300"
              }`}
            >
              {otherActive && (
                <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-navy-deep">
                  <path
                    d="M2 6.5L4.5 9L10 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="text-sm font-semibold text-navy">Outro:</span>
          </button>
          <input
            type="text"
            value={otherText}
            onFocus={() => {
              if (!otherActive) setOther("");
            }}
            onChange={(e) => setOther(e.target.value)}
            placeholder="especifique..."
            className="flex-1 bg-transparent text-sm text-navy placeholder:text-ink-mute focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
