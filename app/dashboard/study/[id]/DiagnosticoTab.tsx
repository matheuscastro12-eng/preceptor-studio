"use client";

import { StudyWithClient } from "@/lib/store";
import { Eyebrow, scoreHex, scoreLabel } from "@/components/dashboard/Shared";
import {
  ScoreDonut,
  ScoreRadar,
  ScoreCard,
  RecommendationBadge,
  InsightCard,
} from "@/components/dashboard/ScoreVisuals";
import { SuggestQuestionsButton } from "@/components/dashboard/SuggestQuestions";
import { ScoreHistoryCard } from "./ScoreHistoryCard";

type AxisSpec = {
  key:
    | "mercado"
    | "execucao"
    | "diferenciacao"
    | "modelo_receita"
    | "risco_regulatorio";
  label: string;
  hint: string;
};

const AXES: AxisSpec[] = [
  {
    key: "mercado",
    label: "Mercado",
    hint: "Tamanho, demanda e urgência do problema.",
  },
  {
    key: "execucao",
    label: "Execução",
    hint: "Capital, tempo, experiência, time.",
  },
  {
    key: "diferenciacao",
    label: "Diferenciação",
    hint: "Vantagem competitiva real e defensabilidade.",
  },
  {
    key: "modelo_receita",
    label: "Modelo",
    hint: "Recorrência, margem, escalabilidade.",
  },
  {
    key: "risco_regulatorio",
    label: "Regulatório",
    hint: "Barreiras legais. Maior número significa menor risco.",
  },
];

export function DiagnosticoTab({ study }: { study: StudyWithClient }) {
  const s = study.scores?.client_facing;
  const insights = (study.insights_chave || []).map((i) => ({
    kind: (i.type === "warning" || i.type === "fragility"
      ? "warning"
      : "insight") as "warning" | "insight",
    label:
      i.type === "warning"
        ? "Atenção"
        : i.type === "fragility"
        ? "Fragilidade"
        : i.type === "force"
        ? "Força"
        : "Insight",
    body: i.title ? `${i.title}. ${i.body}` : i.body,
  }));

  if (!s) {
    return (
      <div
        className="surface"
        style={{ padding: 40, borderRadius: 16, textAlign: "center" }}
      >
        <Eyebrow>Diagnóstico</Eyebrow>
        <p
          style={{
            color: "var(--ink-soft)",
            marginTop: 12,
            fontSize: 14,
          }}
        >
          Os scores ainda não foram calculados. Regenere o estudo para extrair
          os scores.
        </p>
      </div>
    );
  }

  const overall = s.overall || 0;
  const axes = AXES.map((a) => ({
    label: a.label,
    value: s[a.key] ?? 0,
    hint: s.rationale?.[a.key] || a.hint,
  }));

  const internalRec = study.scores?.internal?.recommendation;
  const recLabel =
    internalRec === "entrar"
      ? "ENTRAR"
      : internalRec === "nao_entrar"
      ? "NAO_ENTRAR"
      : "OBSERVAR";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SuggestQuestionsButton studyId={study.id} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 18,
        }}
      >
        <div
          className="surface"
          style={{
            padding: 24,
            display: "flex",
            alignItems: "center",
            gap: 24,
            position: "relative",
            overflow: "hidden",
            borderRadius: 16,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(closest-side at 20% 50%, rgba(82,225,231,0.06), transparent 60%)",
            }}
          />
          <ScoreDonut value={overall} size={160} strokeWidth={12} />
          <div style={{ position: "relative" }}>
            <Eyebrow>Score Geral</Eyebrow>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 900,
                fontSize: 36,
                color: scoreHex(overall),
                letterSpacing: "-0.025em",
                marginTop: 8,
                lineHeight: 1,
              }}
            >
              {scoreLabel(overall)}
            </div>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: 13.5,
                lineHeight: 1.55,
                margin: "10px 0 0",
                maxWidth: 360,
              }}
            >
              Média ponderada: Mercado 25%, Execução 20%, Diferenciação 25%,
              Modelo 20%, Risco Regulatório 10%.
            </p>
          </div>
        </div>
        <RecommendationBadge rec={recLabel} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
        }}
      >
        <div
          className="surface"
          style={{ padding: 20, borderRadius: 16 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: "0 4px 8px",
            }}
          >
            <Eyebrow>Visão geral</Eyebrow>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink-mute)",
              }}
            >
              pesos 25 / 20 / 25 / 20 / 10
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ScoreRadar data={axes} size={340} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {axes.slice(0, 3).map((a) => (
            <ScoreCard
              key={a.label}
              label={a.label}
              value={a.value}
              hint={a.hint}
            />
          ))}
        </div>
      </div>

      <ScoreHistoryCard studyId={study.id} />

      {insights.length > 0 && (
        <div>
          <Eyebrow>Insights-chave</Eyebrow>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginTop: 12,
            }}
          >
            {insights.map((i, idx) => (
              <InsightCard
                key={idx}
                kind={i.kind}
                label={i.label}
                body={i.body}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
