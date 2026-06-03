"use client";

import { Eyebrow } from "@/components/dashboard/Shared";

interface SectorContextShape {
  template_key?: string;
  context_notes?: string;
  suggested_questions?: string[];
  common_risks?: string[];
}

export function SectorChecklistCard({
  sectorContext,
  label,
}: {
  sectorContext: SectorContextShape | null | undefined;
  label: string;
}) {
  if (!sectorContext) return null;
  const risks = Array.isArray(sectorContext.common_risks)
    ? sectorContext.common_risks
    : [];
  const questions = Array.isArray(sectorContext.suggested_questions)
    ? sectorContext.suggested_questions
    : [];
  if (risks.length === 0 && questions.length === 0) return null;

  return (
    <div
      className="surface"
      style={{
        padding: 18,
        borderRadius: 16,
        marginTop: 16,
        borderTop: "3px solid var(--purple)",
      }}
    >
      <Eyebrow tone="purple">Checklist do setor</Eyebrow>
      <p
        style={{
          fontSize: 12,
          color: "var(--ink-soft)",
          margin: "6px 0 14px",
          lineHeight: 1.5,
        }}
      >
        Pontos do setor {label} para o time não esquecer de cobrir.
      </p>

      {questions.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div className="overline" style={{ marginBottom: 8 }}>
            Perguntas-chave
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              fontSize: 12.5,
              color: "var(--navy)",
              lineHeight: 1.55,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {risks.length > 0 && (
        <div>
          <div className="overline" style={{ marginBottom: 8 }}>
            Riscos típicos
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {risks.map((r) => (
              <div
                key={r}
                style={{
                  fontSize: 12.5,
                  color: "#78350F",
                  background: "#FEF3C7",
                  borderLeft: "3px solid #F59E0B",
                  borderRadius: 8,
                  padding: "8px 12px",
                  lineHeight: 1.5,
                }}
              >
                {r}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
