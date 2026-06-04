"use client";

import { useState } from "react";
import { formatBRL } from "@/lib/finance";
import type {
  CashflowMonth,
  InstallmentAlerts,
  RevenueVsCostMonth,
  StudyMargin,
} from "@/lib/financeAnalytics";

const SUCCESS = "var(--success)";
const DANGER = "var(--danger-rose)";
const CYAN = "var(--cyan-deep)";
const NAVY = "var(--navy)";

function monthLabel(ym: string): string {
  // ym = YYYY-MM
  const [y, m] = ym.split("-");
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const idx = Math.max(0, Math.min(11, Number(m) - 1));
  return `${months[idx]}/${y.slice(2)}`;
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fin-card">
      <div className="fin-card__head">
        <div>
          <div className="fin-card__title">{title}</div>
          {subtitle && <div className="fin-card__sub">{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function EmptyChart({ children }: { children: React.ReactNode }) {
  return <div className="fin-chart-empty">{children}</div>;
}

function ChartLegend({ items }: { items: Array<{ label: string; color: string; dash?: boolean }> }) {
  return (
    <div className="fin-legend">
      {items.map((i) => (
        <span key={i.label} className="fin-legend__item">
          <span
            className="fin-legend__swatch"
            style={{
              background: i.dash ? "transparent" : i.color,
              border: i.dash ? `2px dashed ${i.color}` : "none",
            }}
          />
          {i.label}
        </span>
      ))}
    </div>
  );
}

// ─── Projeção de fluxo de caixa (área + linha líquida) ────────────────────────

export function CashflowChart({ data }: { data: CashflowMonth[] }) {
  if (data.length === 0) {
    return (
      <ChartCard title="Projeção de fluxo de caixa" subtitle="Próximos 6 meses">
        <EmptyChart>
          Sem dados de projeção. Precifique estudos com parcelas ou recorrência para ver a
          previsão de caixa aqui.
        </EmptyChart>
      </ChartCard>
    );
  }

  const W = 640;
  const H = 220;
  const padL = 56;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxVal = Math.max(
    1,
    ...data.map((d) => Math.max(d.expected_inflow, d.expected_outflow))
  );
  const nets = data.map((d) => d.net);
  const minNet = Math.min(0, ...nets);
  const maxNet = Math.max(0, ...nets);

  const x = (i: number) =>
    padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yVal = (v: number) => padT + innerH - (v / maxVal) * innerH;
  const netRange = maxNet - minNet || 1;
  const yNet = (v: number) => padT + innerH - ((v - minNet) / netRange) * innerH;

  const inflowPts = data.map((d, i) => `${x(i)},${yVal(d.expected_inflow)}`);
  const inflowArea = `M${padL},${padT + innerH} L${inflowPts.join(" L")} L${x(
    data.length - 1
  )},${padT + innerH} Z`;
  const inflowLine = `M${inflowPts.join(" L")}`;
  const outflowLine = `M${data.map((d, i) => `${x(i)},${yVal(d.expected_outflow)}`).join(" L")}`;
  const netLine = `M${data.map((d, i) => `${x(i)},${yNet(d.net)}`).join(" L")}`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const v = maxVal * (1 - f);
    return { y: padT + f * innerH, v };
  });

  const totalNet = data.reduce((acc, d) => acc + d.net, 0);

  return (
    <ChartCard
      title="Projeção de fluxo de caixa"
      subtitle={`Próximos ${data.length} meses · líquido previsto ${formatBRL(totalNet)}`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="fin-svg" role="img">
        <defs>
          <linearGradient id="fin-cf-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={padL}
              y1={g.y}
              x2={W - padR}
              y2={g.y}
              stroke="var(--slate-100)"
              strokeWidth="1"
            />
            <text x={padL - 8} y={g.y + 3} textAnchor="end" className="fin-svg__axis">
              {Math.round(g.v / 1000)}k
            </text>
          </g>
        ))}
        <path d={inflowArea} fill="url(#fin-cf-grad)" />
        <path d={inflowLine} fill="none" stroke={SUCCESS} strokeWidth="2.5" strokeLinejoin="round" />
        <path
          d={outflowLine}
          fill="none"
          stroke={DANGER}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeOpacity="0.85"
        />
        <path
          d={netLine}
          fill="none"
          stroke={NAVY}
          strokeWidth="2"
          strokeDasharray="5 4"
          strokeLinejoin="round"
        />
        {data.map((d, i) => (
          <g key={d.month}>
            <circle cx={x(i)} cy={yVal(d.expected_inflow)} r="3" fill={SUCCESS} />
            <circle cx={x(i)} cy={yNet(d.net)} r="2.5" fill={NAVY} />
            <text x={x(i)} y={H - 8} textAnchor="middle" className="fin-svg__axis">
              {monthLabel(d.month)}
            </text>
            <title>
              {monthLabel(d.month)} · receita {formatBRL(d.expected_inflow)} · custo{" "}
              {formatBRL(d.expected_outflow)} · líquido {formatBRL(d.net)}
            </title>
          </g>
        ))}
      </svg>
      <ChartLegend
        items={[
          { label: "Receita prevista", color: SUCCESS },
          { label: "Custo previsto", color: DANGER },
          { label: "Líquido", color: NAVY, dash: true },
        ]}
      />
    </ChartCard>
  );
}

// ─── Receita vs custo (barras agrupadas) ──────────────────────────────────────

export function RevenueVsCostChart({ data }: { data: RevenueVsCostMonth[] }) {
  const hasData = data.some((d) => d.inflow > 0 || d.outflow > 0);
  if (!hasData) {
    return (
      <ChartCard title="Receita vs custo" subtitle="Últimos 6 meses (realizado)">
        <EmptyChart>Sem transações nos últimos meses. Lance entradas e saídas para comparar.</EmptyChart>
      </ChartCard>
    );
  }

  const W = 640;
  const H = 220;
  const padL = 56;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxVal = Math.max(1, ...data.map((d) => Math.max(d.inflow, d.outflow)));

  const groupW = innerW / data.length;
  const barW = Math.min(22, (groupW - 10) / 2);
  const gap = 4;

  const y = (v: number) => padT + innerH - (v / maxVal) * innerH;
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: padT + f * innerH,
    v: maxVal * (1 - f),
  }));

  const totalIn = data.reduce((a, d) => a + d.inflow, 0);
  const totalOut = data.reduce((a, d) => a + d.outflow, 0);

  return (
    <ChartCard
      title="Receita vs custo"
      subtitle={`Últimos ${data.length} meses · entrou ${formatBRL(totalIn)} · saiu ${formatBRL(
        totalOut
      )}`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="fin-svg" role="img">
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={padL} y1={g.y} x2={W - padR} y2={g.y} stroke="var(--slate-100)" strokeWidth="1" />
            <text x={padL - 8} y={g.y + 3} textAnchor="end" className="fin-svg__axis">
              {Math.round(g.v / 1000)}k
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = padL + i * groupW + groupW / 2;
          const inX = cx - barW - gap / 2;
          const outX = cx + gap / 2;
          const inH = innerH - (y(d.inflow) - padT);
          const outH = innerH - (y(d.outflow) - padT);
          return (
            <g key={d.month}>
              <rect
                x={inX}
                y={y(d.inflow)}
                width={barW}
                height={Math.max(0, inH)}
                rx="3"
                fill={CYAN}
              />
              <rect
                x={outX}
                y={y(d.outflow)}
                width={barW}
                height={Math.max(0, outH)}
                rx="3"
                fill={DANGER}
              />
              <text x={cx} y={H - 8} textAnchor="middle" className="fin-svg__axis">
                {monthLabel(d.month)}
              </text>
              <title>
                {monthLabel(d.month)} · receita {formatBRL(d.inflow)} · custo {formatBRL(d.outflow)}
              </title>
            </g>
          );
        })}
      </svg>
      <ChartLegend
        items={[
          { label: "Receita (entrada)", color: CYAN },
          { label: "Custo (saída)", color: DANGER },
        ]}
      />
    </ChartCard>
  );
}

// ─── Margem por estudo (tabela compacta) ──────────────────────────────────────

export function MarginByStudyTable({ data }: { data: StudyMargin[] }) {
  if (data.length === 0) {
    return (
      <ChartCard title="Margem por estudo" subtitle="TCV menos custo estimado">
        <EmptyChart>Nenhum estudo precificado ainda. Defina preços na aba Precificação.</EmptyChart>
      </ChartCard>
    );
  }
  return (
    <ChartCard title="Margem por estudo" subtitle={`${data.length} estudo${data.length !== 1 ? "s" : ""} precificado${data.length !== 1 ? "s" : ""}`}>
      <div className="fin-table-wrap">
        <table className="fin-table">
          <thead>
            <tr>
              <th>Estudo</th>
              <th className="num">TCV</th>
              <th className="num">Custo</th>
              <th className="num">Margem R$</th>
              <th className="num">Margem %</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => {
              const positive = m.margin_brl >= 0;
              const color = positive ? SUCCESS : DANGER;
              return (
                <tr key={m.pricing_id}>
                  <td>
                    <div className="fin-table__primary">
                      {m.study_title}
                      {m.has_equity && <span className="fin-equity">+ equity</span>}
                    </div>
                    {m.client_name && <div className="fin-table__muted">{m.client_name}</div>}
                  </td>
                  <td className="num">{formatBRL(m.tcv)}</td>
                  <td className="num fin-muted">{formatBRL(m.estimated_cost)}</td>
                  <td className="num" style={{ color, fontWeight: 800 }}>
                    {formatBRL(m.margin_brl)}
                  </td>
                  <td className="num" style={{ color, fontWeight: 700 }}>
                    {m.margin_pct.toFixed(0)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

// ─── Cards de alerta de parcelas ──────────────────────────────────────────────

function AlertCard({
  variant,
  title,
  total,
  items,
}: {
  variant: "overdue" | "upcoming";
  title: string;
  total: number;
  items: InstallmentAlerts["overdue"];
}) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  return (
    <div className={`fin-alert fin-alert--${variant}`}>
      <button type="button" className="fin-alert__head" onClick={() => setOpen((o) => !o)}>
        <div className="fin-alert__icon">{variant === "overdue" ? "!" : "•"}</div>
        <div className="fin-alert__body">
          <div className="fin-alert__title">{title}</div>
          <div className="fin-alert__meta">
            {items.length} parcela{items.length !== 1 ? "s" : ""} · {formatBRL(total)}
          </div>
        </div>
        <div className="fin-alert__amount">{formatBRL(total)}</div>
        <div className="fin-alert__chevron" aria-hidden>
          {open ? "▴" : "▾"}
        </div>
      </button>
      {open && (
        <div className="fin-alert__list">
          {items.map((i) => (
            <div key={i.id} className="fin-alert__row">
              <div className="fin-alert__rowmain">
                <span className="fin-alert__study">{i.study_title}</span>
                <span className="fin-alert__sub">
                  {i.client_name ? `${i.client_name} · ` : ""}Parcela {i.installment_number}/
                  {i.total_installments}
                </span>
              </div>
              <span className="fin-alert__date">
                {new Date(i.due_date + "T00:00:00").toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
                {variant === "overdue"
                  ? ` · ${Math.abs(i.days)}d atrás`
                  : ` · em ${i.days}d`}
              </span>
              <span className="fin-alert__value">{formatBRL(i.amount_brl)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AlertCards({ alerts }: { alerts: InstallmentAlerts }) {
  if (alerts.overdue.length === 0 && alerts.upcoming.length === 0) return null;
  return (
    <div className="fin-alerts">
      <AlertCard
        variant="overdue"
        title="Parcelas vencidas"
        total={alerts.overdue_total}
        items={alerts.overdue}
      />
      <AlertCard
        variant="upcoming"
        title="A vencer em 30 dias"
        total={alerts.upcoming_total}
        items={alerts.upcoming}
      />
    </div>
  );
}
