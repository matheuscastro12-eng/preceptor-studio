"use client";

import { InternalScores, StudyWithClient } from "@/lib/store";
import { ScoreCard } from "./ScoreCard";
import { ScoreRadar } from "./ScoreRadar";
import { RecommendationBadge } from "./RecommendationBadge";
import { MarkdownView } from "./MarkdownView";
import { PDFButton } from "./PDFButton";

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

export function ThesisView({ study }: { study: StudyWithClient }) {
  const s = study.scores?.internal;
  const md = study.internal_thesis_md;

  if (!md && !s) {
    return (
      <div className="surface rounded-2xl p-12 text-center">
        <div className="eyebrow mb-2">Tese Interna</div>
        <p className="text-ink-soft">A tese interna ainda não foi gerada.</p>
      </div>
    );
  }

  const radarData = s
    ? SPECS.map((sp) => ({
        label: sp.label,
        value: sp.inverse ? 100 - s[sp.key] : s[sp.key],
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="bg-warning-soft border border-warning/40 text-warning rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between gap-3">
        <span>⚠ Documento confidencial — uso interno Preceptor!. Não compartilhar com o cliente.</span>
        <PDFButton study={study} kind="thesis" variant="ghost" label="↓ PDF (confidencial)" />
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
        <div className="surface rounded-2xl p-8 md:p-12">
          <MarkdownView md={md} />
        </div>
      )}
    </div>
  );
}
