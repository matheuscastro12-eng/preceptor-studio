"use client";

import type { CSSProperties, ReactNode } from "react";

export function LockedReveal({
  children,
  label = "Diagnóstico completo PRECEPTOR!",
  hint = "Falar com especialista",
  blur = 6,
  style,
}: {
  children: ReactNode;
  label?: string;
  hint?: string;
  blur?: number;
  style?: CSSProperties;
}) {
  return (
    <div style={{ position: "relative", overflow: "hidden", ...style }}>
      <div
        style={{
          filter: `blur(${blur}px)`,
          pointerEvents: "none",
          userSelect: "none",
        }}
        aria-hidden
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, rgba(6,18,42,0.05), rgba(6,18,42,0.35))",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            background: "rgba(6,18,42,0.85)",
            border: "1px solid var(--cyan)",
            borderRadius: 12,
            boxShadow: "var(--glow-cyan), 0 8px 24px -8px rgba(0,0,0,0.5)",
            maxWidth: "85%",
            textAlign: "center",
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
            {label}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
            {hint}
          </span>
        </div>
      </div>
    </div>
  );
}
