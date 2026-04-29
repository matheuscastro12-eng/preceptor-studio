"use client";

import { getScoreColor, getRiskColor, getRiskLabel } from "@/lib/scoreColors";

// Re-export para compat com importadores antigos
export { getScoreColor as scoreColor };

export function ScoreCard({
  label,
  value,
  hint,
  inverse,
}: {
  label: string;
  value: number | undefined;
  hint?: string;
  inverse?: boolean;
}) {
  const v = typeof value === "number" ? Math.max(0, Math.min(100, value)) : 0;
  const c = inverse ? getRiskColor(v) : getScoreColor(v);
  const labelText = inverse ? getRiskLabel(v) : c.label;
  return (
    <div className="surface rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink-mute leading-tight">
          {label}
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
          style={{ background: c.soft, color: c.bg }}
        >
          {labelText}
        </span>
      </div>
      <div className="text-3xl font-black tracking-tight tabular-nums" style={{ color: c.bg }}>
        {typeof value === "number" ? v : "—"}
        <span className="text-base text-ink-mute font-bold">/100</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${v}%`, background: c.bg }}
        />
      </div>
      {hint && <p className="text-xs text-ink-soft mt-3 leading-snug">{hint}</p>}
    </div>
  );
}
