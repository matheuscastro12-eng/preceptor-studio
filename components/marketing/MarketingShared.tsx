import type { CSSProperties } from "react";

export function Mark({ size = 16 }: { size?: number }) {
  return (
    <span
      className="mark"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
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

export function CircleRing({
  size = 120,
  color = "var(--cyan)",
  strokeWidth = 1.5,
  style,
  dashed,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
  dashed?: boolean;
}) {
  return (
    <span style={{ position: "absolute", pointerEvents: "none", ...style }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - strokeWidth}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={dashed ? "4 6" : undefined}
          opacity="0.55"
        />
      </svg>
    </span>
  );
}

export function DoubleCircle({
  size = 160,
  color = "var(--cyan)",
  style,
}: {
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <span style={{ position: "absolute", pointerEvents: "none", ...style }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        <circle
          cx={size / 2 - 18}
          cy={size / 2}
          r={size / 2 - 22}
          stroke={color}
          strokeWidth="1.2"
          opacity="0.4"
        />
        <circle
          cx={size / 2 + 18}
          cy={size / 2}
          r={size / 2 - 22}
          stroke={color}
          strokeWidth="1.2"
          opacity="0.6"
        />
      </svg>
    </span>
  );
}

export function SwoopLine({
  width = 320,
  height = 180,
  color = "var(--cyan)",
  style,
}: {
  width?: number;
  height?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <span style={{ position: "absolute", pointerEvents: "none", ...style }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
      >
        <path
          d={`M 8 ${height - 16} Q ${width / 2} ${-height * 0.3} ${width - 8} ${height - 16}`}
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.65"
        />
      </svg>
    </span>
  );
}

export function MiniDiamond({
  size = 10,
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

export function MeshTexture({ style }: { style?: CSSProperties }) {
  return (
    <span
      style={{ position: "absolute", inset: 0, pointerEvents: "none", ...style }}
    >
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <pattern
            id="lmesh"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="rgba(82,225,231,0.06)"
              strokeWidth="0.8"
            />
          </pattern>
          <radialGradient id="lmfade" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="lmmask">
            <rect width="100%" height="100%" fill="url(#lmfade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#lmesh)" mask="url(#lmmask)" />
      </svg>
    </span>
  );
}

export function ScoreDonutMini({
  value,
  size = 100,
  strokeWidth = 8,
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
  const offset = C - (value / 100) * C;
  const stroke = "#52E1E7";
  const track = light ? "rgba(255,255,255,0.12)" : "#E2E8F0";
  const numColor = light ? "#fff" : "#0A1F44";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={track}
        strokeWidth={strokeWidth}
      />
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
      />
      <text
        x={cx}
        y={cx + 6}
        textAnchor="middle"
        fontSize={size * 0.32}
        fontWeight="900"
        fontFamily="Inter"
        fill={numColor}
      >
        {value}
      </text>
    </svg>
  );
}
