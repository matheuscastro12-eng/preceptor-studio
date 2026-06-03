"use client";

import { ClientFacingScores, InsightItem, StudyWithClient } from "@/lib/store";
import { ScoreCard } from "./ScoreCard";
import { ScoreOverall } from "./ScoreOverall";
import { ScoreRadar } from "./ScoreRadar";
import { PDFButton } from "./PDFButton";
import { OutputHeader, OutputMetric } from "./OutputHeader";

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
  { key: "risco_regulatorio", label: "Risco Regulatório", description: "Barreiras legais. Maior número significa menor risco." },
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
      <div>
        <OutputHeader
          kind="diagnostic"
          study={study}
          metrics={[{ label: "Status", value: "Pendente", tone: "warning" }]}
        />
        <div className="surface rounded-2xl p-12 text-center">
          <div className="eyebrow mb-2">Diagnóstico</div>
          <p className="text-ink-soft">
            Os scores ainda não foram calculados. Regenere o estudo para extrair os scores.
          </p>
        </div>
      </div>
    );
  }

  const radarData = SPECS.map((sp) => ({ label: sp.label, value: s[sp.key] }));
  const metrics: OutputMetric[] = [
    { label: "Score geral", value: s.overall, hint: "ponderado", tone: "accent" },
    { label: "Dimensões", value: SPECS.length, hint: "avaliadas" },
    { label: "Insights", value: insights.length, hint: "chave", tone: "success" },
    {
      label: "Risco regulatório",
      value: s.risco_regulatorio,
      hint: "maior = menor risco",
      tone: s.risco_regulatorio < 50 ? "warning" : "default",
    },
  ];

  return (
    <div className="space-y-6">
      <OutputHeader
        kind="diagnostic"
        study={study}
        metrics={metrics}
        actions={<PDFButton study={study} kind="diagnostic" variant="ghost" label="PDF" />}
      />

      <ScoreOverall value={s.overall} rationale={s.rationale?.overall} />

      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ScoreRadar data={radarData} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
          {SPECS.map((sp) => (
            <ScoreCard
              key={sp.key}
              label={sp.label}
              value={s[sp.key]}
              hint={s.rationale?.[sp.key] || sp.description}
            />
          ))}
        </div>
      </div>

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
                    style={{
                      background: meta.chip,
                      color: meta.chip === "#52E1E7" ? "#06122A" : "white",
                    }}
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
