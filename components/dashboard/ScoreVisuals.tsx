import { scoreHex, scoreLabel, scoreSoft } from "./Shared";

export function ScoreDonut({
  value,
  size = 140,
  strokeWidth = 10,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const C = 2 * Math.PI * r;
  const offset = C - (value / 100) * C;
  const stroke = scoreHex(value);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="#E2E8F0"
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
        y={cx + 4}
        textAnchor="middle"
        fontSize={size * 0.27}
        fontWeight="900"
        fontFamily="Inter"
        fill={stroke}
      >
        {value}
      </text>
      <text
        x={cx}
        y={cx + size * 0.19}
        textAnchor="middle"
        fontSize={size * 0.085}
        fontWeight="700"
        fontFamily="Inter"
        letterSpacing="2"
        fill="#94A3B8"
      >
        /100
      </text>
    </svg>
  );
}

interface AxisData {
  label: string;
  value: number;
}

export function ScoreRadar({
  data,
  size = 320,
}: {
  data: AxisData[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 56;
  const n = data.length;
  const axis = (i: number, k = 1): [number, number] => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + radius * k * Math.cos(a), cy + radius * k * Math.sin(a)];
  };
  const pt = (i: number, v: number): [number, number] => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = radius * (Math.max(0, Math.min(100, v)) / 100);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const poly = data.map((d, i) => pt(i, d.value).join(",")).join(" ");
  const grid = [25, 50, 75, 100];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {grid.map((g) => (
        <polygon
          key={g}
          points={data
            .map((_, i) => {
              const a = (Math.PI * 2 * i) / n - Math.PI / 2;
              const r = radius * (g / 100);
              return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
            })
            .join(" ")}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="1"
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = axis(i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#E2E8F0"
            strokeWidth="1"
          />
        );
      })}
      <polygon
        points={poly}
        fill="rgba(82,225,231,0.18)"
        stroke="#5D57EB"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const [x, y] = pt(i, d.value);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="4"
            fill="#5D57EB"
            stroke="#fff"
            strokeWidth="2"
          />
        );
      })}
      {data.map((d, i) => {
        const [x, y] = axis(i, 1.22);
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        const isTop = Math.abs(a + Math.PI / 2) < 0.01;
        const isBottom = Math.abs(a - Math.PI / 2) < 0.5;
        return (
          <g key={`l-${i}`}>
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline={
                isTop ? "auto" : isBottom ? "hanging" : "middle"
              }
              fontSize="11"
              fontWeight="700"
              fill="#0F1729"
              fontFamily="Inter"
            >
              {d.label}
            </text>
            <text
              x={x}
              y={y + (isTop ? -14 : isBottom ? 14 : 13)}
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              fill="#5D57EB"
              fontFamily="Inter"
            >
              {Math.round(d.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ScoreCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  const c = scoreHex(value);
  return (
    <div className="ds-surface" style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span className="overline">{label}</span>
        <span
          className="pill"
          style={{ background: scoreSoft(value), color: c }}
        >
          {scoreLabel(value)}
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 900,
          fontSize: 30,
          color: c,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {value}
        <span style={{ fontSize: 14, color: "var(--ink-mute)", fontWeight: 700 }}>
          /100
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 6,
          background: "#F1F5F9",
          borderRadius: 999,
          overflow: "hidden",
          marginTop: 12,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: c,
            transition: "width 800ms var(--ease-out)",
          }}
        />
      </div>
      {hint && (
        <p
          style={{
            fontSize: 12.5,
            color: "var(--ink-soft)",
            margin: "12px 0 0",
            lineHeight: 1.45,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export function RecommendationBadge({ rec }: { rec: string }) {
  const map: Record<
    string,
    { bg: string; text: string; label: string; icon: string; sub: string }
  > = {
    ENTRAR: {
      bg: "linear-gradient(135deg,#10B981,#047857)",
      text: "#fff",
      label: "ENTRAR",
      icon: "↑",
      sub: "Recomenda-se entrada como sócia.",
    },
    OBSERVAR: {
      bg: "linear-gradient(135deg,#52E1E7,#0E7490)",
      text: "#06122A",
      label: "OBSERVAR",
      icon: "◐",
      sub: "Sinais positivos com dúvidas a validar em 60 a 90 dias.",
    },
    NAO_ENTRAR: {
      bg: "linear-gradient(135deg,#E11D48,#881337)",
      text: "#fff",
      label: "NÃO ENTRAR",
      icon: "✕",
      sub: "Não recomendamos entrada como sócia neste momento.",
    },
  };
  const r = map[rec] || map.OBSERVAR;
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 18,
        padding: 24,
        overflow: "hidden",
        background: r.bg,
        color: r.text,
        boxShadow: "0 12px 32px -12px rgba(10,31,68,0.18)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: -20,
          width: 120,
          height: 120,
          background: "rgba(255,255,255,0.05)",
          borderRadius: "50%",
        }}
      />
      <div style={{ position: "relative" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            marginBottom: 10,
            opacity: 0.95,
          }}
        >
          Recomendação interna
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 900,
              fontSize: 44,
              letterSpacing: "-0.025em",
            }}
          >
            {r.label}
          </span>
          <span style={{ fontSize: 24, opacity: 0.8 }}>{r.icon}</span>
        </div>
        <p
          style={{
            fontSize: 13.5,
            fontWeight: 500,
            margin: "6px 0 0",
            opacity: 0.95,
            maxWidth: 320,
          }}
        >
          {r.sub}
        </p>
      </div>
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
  const isWarn = kind === "warning";
  return (
    <div
      style={{
        background: isWarn ? "#FEF3C7" : "#EBF9FA",
        borderLeft: `4px solid ${isWarn ? "#F59E0B" : "#52E1E7"}`,
        borderRadius: 12,
        padding: "14px 18px 16px",
        color: isWarn ? "#78350F" : "#064151",
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
          background: isWarn ? "#F59E0B" : "#52E1E7",
          color: isWarn ? "#fff" : "#06122A",
          marginBottom: 8,
        }}
      >
        {label}
      </span>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}
