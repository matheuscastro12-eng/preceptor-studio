"use client";

import { ClientFacingScores, InsightItem, StudyWithClient } from "@/lib/store";
import { ScoreCard } from "./ScoreCard";
import { ScoreOverall } from "./ScoreOverall";
import { ScoreRadar } from "./ScoreRadar";
import { PDFButton } from "./PDFButton";

interface ScoreSpec {
  key: keyof Omit<ClientFacingScores, "overall" | "rationale">;
  label: string;
  description: string;
}

const SPECS: ScoreSpec[] = [
  { key: "mercado", label: "Mercado", description: "Tamanho, demanda e urgência do problema." },
  { key: "execucao", label: "Execução", description: "Capital, tempo, experiência, time." },
  { key: "diferenciacao", label: "Diferenciação", description: "Vantagem competitiva real e defensabilidade." },
  { key: "modelo_receita", label: "Modelo de Receita", description: "Recorrência, margem, escalabilidade." },
  { key: "risco_regulatorio", label: "Risco Regulatório", description: "Barreiras legais (ANVISA, OAB, BACEN, LGPD). Maior número = menor risco." },
];

const INSIGHT_META: Record<InsightItem["type"], { label: string; chip: string; border: string; bg: string }> = {
  force: { label: "Força", chip: "#10B981", border: "#10B981", bg: "#D1FAE5" },
  fragility: { label: "Fragilidade", chip: "#E11D48", border: "#E11D48", bg: "#FEE2E2" },
  insight: { label: "Insight", chip: "#52E1E7", border: "#52E1E7", bg: "#EBF9FA" },
  warning: { label: "Atenção", chip: "#F59E0B", border: "#F59E0B", bg: "#FEF3C7" },
};

export function DiagnosticView({ study }: { study: StudyWithClient }) {
  const s = study.scores?.client_facing;
  const insights = study.insights_chave || [];

  if (!s) {
    return (
      <div className="surface rounded-2xl p-12 text-center">
        <div className="eyebrow mb-2">Diagnóstico</div>
        <p className="text-ink-soft">
          Os scores ainda não foram calculados. Regenere o estudo para extrair os scores.
        </p>
      </div>
    );
  }

  const radarData = SPECS.map((sp) => ({ label: sp.label, value: s[sp.key] }));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <PDFButton study={study} kind="diagnostic" variant="ghost" label="↓ Diagnóstico em PDF" />
      </div>
      <ScoreOverall value={s.overall} rationale={s.rationale?.overall} />

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
              hint={s.rationale?.[sp.key]}
            />
          ))}
        </div>
      </div>

      {/* Por dentro de cada score (rationale completo) */}
      <div>
        <div className="eyebrow mb-3">Por dentro de cada score</div>
        <div className="grid md:grid-cols-2 gap-3">
          {SPECS.map((sp) => {
            const rationale = s.rationale?.[sp.key];
            const value = s[sp.key];
            if (!rationale) return null;
            return (
              <div key={sp.key} className="surface rounded-xl p-4 flex gap-4">
                <div className="shrink-0 text-right min-w-[64px]">
                  <div className="text-[10px] uppercase tracking-widest text-ink-mute font-bold leading-tight">
                    {sp.label}
                  </div>
                  <div className="text-3xl font-black text-navy tabular-nums">{value}</div>
                </div>
                <div className="flex-1 min-w-0 border-l border-slate-200/70 pl-4">
                  <p className="text-sm text-navy leading-relaxed">{rationale}</p>
                  <p className="text-[11px] text-ink-mute mt-2 italic">{sp.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights-Chave */}
      {insights.length > 0 && (
        <div>
          <div className="eyebrow mb-3">Insights-Chave do Diagnóstico</div>
          <div className="grid md:grid-cols-2 gap-3">
            {insights.map((it, i) => {
              const meta = INSIGHT_META[it.type] || INSIGHT_META.insight;
              return (
                <div
                  key={i}
                  className="rounded-xl p-4 border-l-4"
                  style={{ background: meta.bg, borderLeftColor: meta.border }}
                >
                  <span
                    className="inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded mb-2"
                    style={{ background: meta.chip, color: meta.chip === "#52E1E7" ? "#06122A" : "white" }}
                  >
                    {meta.label}
                  </span>
                  <h4 className="font-bold text-navy mb-1 leading-tight">{it.title}</h4>
                  <p className="text-sm text-ink leading-snug">{it.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
