"use client";

import { scoreInk, scoreLabel, scoreSoft } from "@/lib/diagnosticScore";

export function ScoreCardKit({
  label,
  value,
  hint,
  locked,
}: {
  label: string;
  value: number;
  hint?: string;
  locked?: boolean;
}) {
  const v = Math.max(0, Math.min(100, value || 0));
  const main = scoreInk(v);
  return (
    <div
      style={{
        padding: 18,
        position: "relative",
        overflow: "hidden",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
      }}
    >
      <div
        style={{
          filter: locked ? "blur(7px)" : "none",
          pointerEvents: locked ? "none" : "auto",
          userSelect: locked ? "none" : "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {label}
          </span>
          <span
            className="pill-status"
            style={{ background: scoreSoft(v), color: scoreInk(v) }}
          >
            {scoreLabel(v)}
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 900,
            fontSize: 32,
            color: main,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {v}
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
            /100
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 6,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 999,
            overflow: "hidden",
            marginTop: 12,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${v}%`,
              background: main,
              transition: "width 800ms var(--ease-out)",
            }}
          />
        </div>
        {hint && (
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.7)",
              margin: "12px 0 0",
              lineHeight: 1.45,
            }}
          >
            {hint}
          </p>
        )}
      </div>
      {locked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              background: "rgba(6,18,42,0.85)",
              border: "1px solid var(--cyan)",
              borderRadius: 12,
              boxShadow: "var(--glow-cyan), 0 8px 24px -8px rgba(0,0,0,0.5)",
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--cyan)",
              }}
            >
              Diagnóstico completo
            </span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
              Só na PRECEPTOR!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function InsightCard({
  kind,
  label,
  body,
}: {
  kind: "insight" | "warning";
  label: string;
  body: string;
}) {
  const color = kind === "warning" ? "#F59E0B" : "var(--cyan)";
  const bg = kind === "warning" ? "rgba(245,158,11,0.08)" : "rgba(82,225,231,0.08)";
  return (
    <div
      style={{
        background: bg,
        borderRadius: 14,
        borderLeft: `3px solid ${color}`,
        padding: "14px 18px 16px",
        color: "#fff",
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          padding: "3px 8px",
          borderRadius: 4,
          background: color,
          color: "var(--navy-deep)",
          marginBottom: 8,
        }}
      >
        {label}
      </span>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,0.92)" }}>
        {body}
      </p>
    </div>
  );
}
