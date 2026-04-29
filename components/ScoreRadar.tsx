"use client";

interface RadarDatum {
  label: string;
  value: number;
}

export function ScoreRadar({
  data,
  size = 320,
}: {
  data: RadarDatum[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 50;
  const n = data.length;

  function point(i: number, value: number) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = radius * (Math.max(0, Math.min(100, value)) / 100);
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  function axisPoint(i: number, factor = 1) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + radius * factor * Math.cos(angle), cy + radius * factor * Math.sin(angle)];
  }

  const polyPoints = data
    .map((d, i) => point(i, d.value).join(","))
    .join(" ");

  const grid = [25, 50, 75, 100];

  return (
    <div className="surface rounded-2xl p-6">
      <div className="eyebrow mb-3">Visão Geral</div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        {/* concentric pentagons */}
        {grid.map((level) => (
          <polygon
            key={level}
            points={data
              .map((_, i) => {
                const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
                const r = radius * (level / 100);
                return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
              })
              .join(" ")}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        {/* axes */}
        {data.map((_, i) => {
          const [x, y] = axisPoint(i);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
        })}
        {/* shape */}
        <polygon
          points={polyPoints}
          fill="rgba(82, 225, 231, 0.18)"
          stroke="#5D57EB"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* points */}
        {data.map((d, i) => {
          const [x, y] = point(i, d.value);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#5D57EB" stroke="white" strokeWidth="2" />
            </g>
          );
        })}
        {/* labels */}
        {data.map((d, i) => {
          const [x, y] = axisPoint(i, 1.18);
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          const isTop = Math.abs(angle + Math.PI / 2) < 0.01;
          const isBottom = Math.abs(angle - Math.PI / 2) < 0.5;
          return (
            <g key={`label-${i}`}>
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline={isTop ? "auto" : isBottom ? "hanging" : "middle"}
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
    </div>
  );
}
