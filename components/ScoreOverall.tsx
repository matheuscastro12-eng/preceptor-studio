"use client";

import { getScoreColor } from "@/lib/scoreColors";

export function ScoreOverall({ value, rationale }: { value: number | undefined; rationale?: string }) {
  const v = typeof value === "number" ? Math.max(0, Math.min(100, value)) : 0;
  const c = getScoreColor(v);
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (v / 100) * circumference;

  return (
    <div className="surface rounded-2xl p-6 flex items-center gap-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 via-transparent to-purple/5 pointer-events-none" />
      <div className="relative shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="56" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r="56"
            fill="none"
            stroke={c.bg}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            className="transition-all duration-1000 ease-out"
          />
          <text
            x="70"
            y="68"
            textAnchor="middle"
            fontSize="36"
            fontWeight="900"
            fontFamily="Inter"
            fill={c.bg}
          >
            {typeof value === "number" ? v : "—"}
          </text>
          <text
            x="70"
            y="90"
            textAnchor="middle"
            className="fill-ink-mute"
            fontSize="11"
            fontWeight="700"
            fontFamily="Inter"
            letterSpacing="2"
          >
            /100
          </text>
        </svg>
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="eyebrow mb-1">Score Geral</div>
        <div className="text-3xl font-black tracking-tight" style={{ color: c.bg }}>
          {c.label}
        </div>
        <p className="text-sm text-ink-soft mt-1.5 leading-snug">
          {rationale ||
            "Média ponderada: Mercado 25% · Execução 20% · Diferenciação 25% · Modelo 20% · Risco Regulatório 10%."}
        </p>
      </div>
    </div>
  );
}
