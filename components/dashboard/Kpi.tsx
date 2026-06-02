export function Kpi({
  label,
  value,
  delta,
  deltaDir,
  icon,
  spark,
  sparkColor,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaDir?: "up" | "down";
  icon?: string;
  spark?: number[];
  sparkColor?: string;
}) {
  return (
    <div className="kpi">
      <div className="kpi__label">
        {label}
        {icon && <span className="kpi__icon">{icon}</span>}
      </div>
      <div className="kpi__value">{value}</div>
      {delta && (
        <div className={"kpi__delta " + (deltaDir || "up")}>
          {deltaDir === "down" ? "▼" : "▲"} {delta}
        </div>
      )}
      {spark && spark.length > 0 && (
        <Sparkline data={spark} color={sparkColor || "var(--cyan-deep)"} />
      )}
    </div>
  );
}

export function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 88;
  const h = 26;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);
  const pts = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ");
  const gradId = `g-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      className="kpi__spark"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
      <polygon
        fill={`url(#${gradId})`}
        points={`0,${h} ${pts} ${w},${h}`}
      />
    </svg>
  );
}
