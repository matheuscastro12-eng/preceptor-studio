import type { CSSProperties } from "react";

export type DashCategory = "saude" | "educacao" | "juridico" | "tech" | "outro";
export type DashStatus =
  | "draft"
  | "questionnaire"
  | "generating"
  | "completed"
  | "archived";

export const SECTORS_LABEL: Record<DashCategory, string> = {
  saude: "Saúde",
  educacao: "Educação",
  juridico: "Jurídico",
  tech: "Tech",
  outro: "Outro",
};

export function Mark({ size = 12 }: { size?: number }) {
  return (
    <span
      className="mark"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export function Eyebrow({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "purple";
}) {
  const cls = tone === "purple" ? "eyebrow eyebrow--purple" : "eyebrow";
  return <span className={cls}>{children}</span>;
}

const STATUS_MAP: Record<DashStatus, { label: string; c: string }> = {
  draft: { label: "Rascunho", c: "#94A3B8" },
  questionnaire: { label: "Questionário", c: "#5D57EB" },
  generating: { label: "Gerando", c: "#B964FF" },
  completed: { label: "Concluído", c: "#10B981" },
  archived: { label: "Arquivado", c: "#CBD5E1" },
};

export function StatusPill({ status }: { status: DashStatus | string }) {
  const m = STATUS_MAP[status as DashStatus] || STATUS_MAP.draft;
  return (
    <span className={`pill ${status}`}>
      <span className="dot" style={{ background: m.c }} />
      {m.label}
    </span>
  );
}

const CATEGORY_GRADIENT: Record<DashCategory, { bg: string; letter: string }> = {
  saude: { bg: "linear-gradient(135deg,#34D399,#059669)", letter: "S" },
  educacao: { bg: "linear-gradient(135deg,#60A5FA,#2563EB)", letter: "E" },
  juridico: { bg: "linear-gradient(135deg,#B964FF,#5D57EB)", letter: "J" },
  tech: { bg: "linear-gradient(135deg,#52E1E7,#5D57EB)", letter: "T" },
  outro: { bg: "linear-gradient(135deg,#94A3B8,#475569)", letter: "O" },
};

export function CategoryIcon({
  category,
  size = 48,
}: {
  category: string;
  size?: number;
}) {
  const m =
    CATEGORY_GRADIENT[category as DashCategory] || CATEGORY_GRADIENT.outro;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: m.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 900,
        fontSize: size * 0.4,
        boxShadow: "0 4px 12px -4px rgba(10,31,68,0.25)",
        flexShrink: 0,
      }}
    >
      {m.letter}
    </div>
  );
}

export function CategoryChip({ category }: { category: string }) {
  const label = SECTORS_LABEL[category as DashCategory] || category;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        color: "var(--blue)",
      }}
    >
      {label}
    </span>
  );
}

export function scoreLabel(v: number): string {
  if (v >= 75) return "Forte";
  if (v >= 50) return "Promissor";
  if (v >= 25) return "Em desenvolvimento";
  return "Desafiador";
}
export function scoreHex(v: number): string {
  if (v >= 75) return "#10B981";
  if (v >= 50) return "#3BC8CF";
  if (v >= 25) return "#F59E0B";
  return "#E11D48";
}
export function scoreSoft(v: number): string {
  if (v >= 75) return "#D1FAE5";
  if (v >= 50) return "#CFFAFE";
  if (v >= 25) return "#FEF3C7";
  return "#FEE2E2";
}

export function ScoreMini({ value }: { value: number }) {
  const c = scoreHex(value);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <div style={{ textAlign: "right" }}>
        <div className="overline" style={{ marginBottom: 1 }}>
          Score
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 900,
            fontSize: 22,
            color: c,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
      </div>
      <div
        style={{
          width: 4,
          height: 42,
          borderRadius: 999,
          background: "#E2E8F0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ background: c, height: `${value}%` }} />
      </div>
    </div>
  );
}

export function ScoreChip({ value }: { value: number }) {
  const c = scoreHex(value);
  return (
    <span className="score-chip" style={{ color: c }}>
      <span className="score-chip__bar">
        <i style={{ width: `${value}%`, background: c }} />
      </span>
      {value}
    </span>
  );
}

export function Sparkle({
  size = 24,
  color = "var(--cyan)",
  style,
}: {
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <span style={{ position: "absolute", pointerEvents: "none", ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 1.5 L13.4 9.2 L21.2 10.6 L13.4 12 L12 22.5 L10.6 12 L1.5 10.6 L10.6 9.2 Z"
          fill={color}
        />
      </svg>
    </span>
  );
}

export function MiniDiamond({
  size = 9,
  color = "var(--cyan)",
  style,
}: {
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <span style={{ display: "inline-block", lineHeight: 0, ...style }}>
      <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
        <rect
          x="2"
          y="2"
          width="6"
          height="6"
          transform="rotate(45 5 5)"
          fill={color}
        />
      </svg>
    </span>
  );
}

/* Recommendation pill (compact, for tables) */
export function RecPill({ rec }: { rec: string }) {
  const map: Record<string, { bg: string; c: string; label: string }> = {
    ENTRAR: { bg: "#D1FAE5", c: "#10B981", label: "ENTRAR" },
    OBSERVAR: { bg: "#CFFAFE", c: "#3BC8CF", label: "OBSERVAR" },
    NAO_ENTRAR: { bg: "#FEE2E2", c: "#E11D48", label: "NÃO ENTRAR" },
  };
  const m = map[rec] || map.OBSERVAR;
  return (
    <span className="pill" style={{ background: m.bg, color: m.c }}>
      <span className="dot" style={{ background: m.c }} />
      {m.label}
    </span>
  );
}

/* Stage configuration (CRM funnel) */
export interface Stage {
  key: string;
  label: string;
  color: string;
  soft: string;
}

export const STAGES: Stage[] = [
  { key: "novo", label: "Novo lead", color: "#94A3B8", soft: "#F1F5F9" },
  { key: "contatado", label: "Tentando contato", color: "#5D57EB", soft: "#EEF2FF" },
  { key: "qualificado", label: "Qualificado", color: "#3BC8CF", soft: "#CFFAFE" },
  { key: "reuniao", label: "Reunião marcada", color: "#B964FF", soft: "#F3E8FF" },
  { key: "proposta", label: "Em proposta", color: "#F59E0B", soft: "#FEF3C7" },
  { key: "ganho", label: "Ganho", color: "#10B981", soft: "#D1FAE5" },
  { key: "perdido", label: "Perdido", color: "#E11D48", soft: "#FEE2E2" },
];

/* Stage labels by key */
export function getStage(key: string): Stage {
  return STAGES.find((s) => s.key === key) || STAGES[0];
}

/* The schema's LeadStatus does not include "reuniao" — map gracefully */
export function lookupStageForLead(status: string): Stage {
  // Map old statuses (no "reuniao") to the new pipeline buckets.
  if (status === "novo") return STAGES[0];
  if (status === "contatado") return STAGES[1];
  if (status === "qualificado") return STAGES[2];
  if (status === "proposta") return STAGES[4];
  if (status === "ganho") return STAGES[5];
  if (status === "perdido") return STAGES[6];
  return STAGES[0];
}
