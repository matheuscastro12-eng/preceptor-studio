"use client";

import { useState } from "react";
import { Lock, RefreshCw, ShieldAlert } from "lucide-react";
import { InternalScores, StudyWithClient } from "@/lib/store";
import { updateStudyRemote } from "@/lib/storeApi";
import { ScoreCard } from "./ScoreCard";
import { ScoreRadar } from "./ScoreRadar";
import { RecommendationBadge } from "./RecommendationBadge";
import { MarkdownView } from "./MarkdownView";
import { PDFButton } from "./PDFButton";
import { OutputHeader, OutputMetric } from "./OutputHeader";

interface ScoreSpec {
  key: keyof Omit<InternalScores, "overall" | "recommendation" | "rationale">;
  label: string;
  inverse?: boolean;
}

const SPECS: ScoreSpec[] = [
  { key: "potencial_portfolio", label: "Potencial de Portfólio" },
  { key: "fit_stack_preceptor", label: "Fit com a Preceptor!" },
  { key: "compromisso_fundador", label: "Compromisso do Fundador" },
  { key: "potencial_recorrencia", label: "Potencial de Recorrência" },
  { key: "risco_reputacional", label: "Risco Reputacional", inverse: true },
];

const recommendationLabel: Record<InternalScores["recommendation"], string> = {
  entrar: "Entrar",
  observar: "Observar",
  nao_entrar: "Não entrar",
};

function normalizeRecommendation(value: unknown): InternalScores["recommendation"] | null {
  const raw = String(value || "")
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace("NÃO", "NAO");

  if (raw === "ENTRAR") return "entrar";
  if (raw === "OBSERVAR") return "observar";
  if (raw === "NAO_ENTRAR") return "nao_entrar";
  return null;
}

export function ThesisView({
  study,
  onUpdate,
}: {
  study: StudyWithClient;
  onUpdate: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const s = study.scores?.internal;
  const md = study.internal_thesis_md;
  const recommendation = normalizeRecommendation(s?.recommendation);

  async function generateThesis() {
    if (!study.output_md) {
      alert("O estudo do cliente precisa existir antes de gerar a tese interna.");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/studies/regenerate-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outputType: "thesis",
          category: study.category,
          studyMd: study.output_md,
          clientName: study.client?.name || null,
          title: study.title,
          answers: study.answers || {},
        }),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Erro ao gerar a tese interna.");
      }

      const data = await res.json();
      await updateStudyRemote(study.id, {
        internal_thesis_md: data.md || null,
        scores: {
          ...(study.scores || {}),
          internal: data.internal_scores || study.scores?.internal,
        },
        generation_metadata: {
          ...(study.generation_metadata || {}),
          ...(data.metadata || {}),
          thesis_generated_manually_at: new Date().toISOString(),
        },
      });
      onUpdate();
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  }

  const generatePrimaryButton = (
    <button
      onClick={generateThesis}
      disabled={generating}
      className="btn-primary inline-flex items-center gap-2 text-xs"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
      {generating ? "Gerando..." : "Gerar tese"}
    </button>
  );

  if (!md && !s) {
    return (
      <div>
        <OutputHeader
          kind="thesis"
          study={study}
          metrics={[{ label: "Status", value: "Pendente", tone: "warning" }]}
          actions={generatePrimaryButton}
        />
        <div className="surface rounded-2xl p-12 text-center">
          <div className="eyebrow mb-2">Tese Interna</div>
          <p className="text-ink-soft mb-5">
            A tese interna ainda não foi gerada. Gere somente este documento sem refazer o estudo inteiro.
          </p>
          <button
            onClick={generateThesis}
            disabled={generating}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
            {generating ? "Gerando tese..." : "Gerar tese interna"}
          </button>
        </div>
      </div>
    );
  }

  const radarData = s
    ? SPECS.map((sp) => ({
        label: sp.label,
        value: sp.inverse ? 100 - s[sp.key] : s[sp.key],
      }))
    : [];

  const metrics: OutputMetric[] = [
    {
      label: "Recomendação",
      value: recommendation ? recommendationLabel[recommendation] : "N/A",
      tone: recommendation === "entrar" ? "success" : recommendation === "nao_entrar" ? "danger" : "warning",
    },
    {
      label: "Score interno",
      value: s?.overall ?? "N/A",
      hint: "potencial agregado",
      tone: "accent",
    },
    {
      label: "Risco reputacional",
      value: s?.risco_reputacional ?? "N/A",
      hint: "maior = pior",
      tone: s && s.risco_reputacional >= 65 ? "danger" : "default",
    },
    {
      label: "Acesso",
      value: "Sócios",
      hint: "não enviar ao cliente",
      tone: "danger",
    },
  ];

  return (
    <div className="space-y-6">
      <OutputHeader
        kind="thesis"
        study={study}
        metrics={metrics}
        actions={
          <>
            <PDFButton study={study} kind="thesis" variant="ghost" label="PDF confidencial" />
            <button
              onClick={generateThesis}
              disabled={generating}
              className="btn-ghost inline-flex items-center gap-2 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Regenerando..." : "Regenerar"}
            </button>
          </>
        }
      />

      <div className="bg-danger-soft border border-danger/30 text-danger rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        Documento confidencial, uso interno Preceptor!. Não compartilhar com o cliente.
      </div>

      {s && <RecommendationBadge recommendation={s.recommendation} />}

      {s && (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <ScoreRadar data={radarData} />
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {SPECS.map((sp) => (
              <ScoreCard
                key={sp.key}
                label={sp.label}
                value={s[sp.key]}
                inverse={sp.inverse}
                hint={s.rationale?.[sp.key]}
              />
            ))}
          </div>
        </div>
      )}

      {s?.rationale && (
        <div>
          <div className="eyebrow mb-3">Por dentro de cada score</div>
          <div className="grid md:grid-cols-2 gap-3">
            {SPECS.map((sp) => {
              const rationale = s.rationale?.[sp.key];
              const value = s[sp.key];
              if (!rationale) return null;
              return (
                <div key={sp.key} className="surface rounded-xl p-4 flex gap-4">
                  <div className="shrink-0 text-right min-w-[72px]">
                    <div className="text-[10px] uppercase tracking-widest text-ink-mute font-bold leading-tight">
                      {sp.label}
                    </div>
                    <div className="text-3xl font-black text-navy tabular-nums">{value}</div>
                  </div>
                  <div className="flex-1 min-w-0 border-l border-slate-200/70 pl-4">
                    <p className="text-sm text-navy leading-relaxed">{rationale}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {md && (
        <div className="surface rounded-2xl p-6 md:p-10 lg:p-12">
          <div className="flex items-center gap-2 mb-6 text-danger">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Corpo da tese</span>
          </div>
          <MarkdownView md={md} withNav />
        </div>
      )}
    </div>
  );
}
