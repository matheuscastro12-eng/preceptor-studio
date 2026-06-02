"use client";

import { scoreHex, scoreInk } from "@/lib/diagnosticScore";

export function ScoreDonut({
  value,
  size = 160,
  strokeWidth = 11,
  light,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  light?: boolean;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const C = 2 * Math.PI * r;
  const offset = C - (Math.max(0, Math.min(100, value)) / 100) * C;
  const stroke = scoreHex(value);
  const trackColor = light ? "rgba(255,255,255,0.12)" : "#E2E8F0";
  const numColor = light ? "#fff" : scoreInk(value);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: "stroke-dashoffset 1s var(--ease-out)" }}
      />
      <text
        x={cx}
        y={cx - 2}
        textAnchor="middle"
        fontSize={size * 0.28}
        fontWeight="900"
        fontFamily="Inter"
        fill={numColor}
      >
        {Math.round(value)}
      </text>
      <text
        x={cx}
        y={cx + size * 0.17}
        textAnchor="middle"
        fontSize={size * 0.085}
        fontWeight="700"
        fontFamily="Inter"
        letterSpacing="2"
        fill={light ? "rgba(255,255,255,0.55)" : "#94A3B8"}
      >
        /100
      </text>
    </svg>
  );
}
