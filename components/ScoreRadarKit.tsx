"use client";

interface RadarDatum {
  label: string;
  value: number;
}

export function ScoreRadarKit({
  data,
  size = 320,
  light,
}: {
  data: RadarDatum[];
  size?: number;
  light?: boolean;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 56;
  const n = data.length;

  function axis(i: number, k = 1) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + radius * k * Math.cos(a), cy + radius * k * Math.sin(a)];
  }
  function pt(i: number, v: number) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = radius * (Math.max(0, Math.min(100, v)) / 100);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  const poly = data.map((d, i) => pt(i, d.value).join(",")).join(" ");
  const grid = [25, 50, 75, 100];
  const axisColor = light ? "rgba(255,255,255,0.12)" : "#E2E8F0";
  const labelColor = light ? "#fff" : "#0F1729";
  const labelAccent = light ? "var(--cyan)" : "#5D57EB";

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
          stroke={axisColor}
          strokeWidth="1"
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = axis(i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={axisColor} strokeWidth="1" />;
      })}
      <polygon
        points={poly}
        fill="rgba(82,225,231,0.22)"
        stroke={light ? "#52E1E7" : "#5D57EB"}
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
            fill={light ? "#52E1E7" : "#5D57EB"}
            stroke={light ? "#06122A" : "#fff"}
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
              dominantBaseline={isTop ? "auto" : isBottom ? "hanging" : "middle"}
              fontSize="11"
              fontWeight="700"
              fill={labelColor}
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
              fill={labelAccent}
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
