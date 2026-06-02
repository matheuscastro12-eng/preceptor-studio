import Link from "next/link";
import {
  fetchStudies,
  fetchLeads,
  summarize,
  studyOverall,
  getRevenueMetrics,
  getHotLeads,
  formatBRL,
  type RevenueMetrics,
  type HotLead,
} from "@/lib/dashboardData";
import { Kpi } from "@/components/dashboard/Kpi";
import {
  CategoryIcon,
  StatusPill,
  ScoreChip,
  getStage,
  lookupStageForLead,
} from "@/components/dashboard/Shared";
import { priorityColor } from "@/lib/leadScore";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [studies, leads, revenue, hotLeads] = await Promise.all([
    fetchStudies(),
    fetchLeads(),
    getRevenueMetrics(),
    getHotLeads(5),
  ]);
  const c = summarize(studies, leads);

  // weekly synthetic activity for the chart (last 12 weeks).
  const leadsByWeek = bucketByWeek(leads.map((l) => l.created_at), 12);
  const studiesByWeek = bucketByWeek(
    studies.map((s) => s.created_at),
    12
  );

  return (
    <div className="page" data-screen-label="Home">
      <div className="page-head">
        <div>
          <h1 className="h-page">
            Bom dia, Luciano{" "}
            <span style={{ color: "var(--ink-mute)", fontWeight: 500 }}>
              · {formatToday()}
            </span>
          </h1>
          <p className="sub">
            {c.newLeads} leads novos aguardando triagem · {c.generating} estudo
            {c.generating === 1 ? "" : "s"} gerando · {studies.filter((s) => s.status === "questionnaire").length} em questionário.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ds-btn ds-btn-ghost">▾ Esta semana</button>
          <Link className="ds-btn ds-btn-primary" href="/dashboard/new">
            + Novo estudo
          </Link>
        </div>
      </div>

      <div className="kpis">
        <Kpi
          label="Pipeline ponderado"
          value={formatBRL(revenue.weightedPipeline)}
          delta="por probabilidade de estágio"
          deltaDir="up"
          icon="◆"
          spark={[3, 5, 4, 7, 6, 8, 9]}
        />
        <Kpi
          label="MRR projetado"
          value={formatBRL(revenue.projectedMrr)}
          delta="ganhos / 12 meses"
          deltaDir="up"
          icon="↑"
          spark={[2, 3, 3, 4, 5, 6, 7]}
        />
        <Kpi
          label="Ticket médio"
          value={formatBRL(revenue.averageTicket)}
          delta={
            revenue.averageTicket > 0 ? "estimado por deal" : "sem dados ainda"
          }
          deltaDir="up"
          icon="◇"
          spark={[4, 4, 5, 5, 6, 6, 7]}
        />
        <Kpi
          label="Taxa de conversão"
          value={`${revenue.conversionRate}%`}
          delta="ganhos / (ganhos + perdidos)"
          deltaDir="up"
          icon="◐"
          spark={[28, 29, 30, 31, 32, 33, 34]}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <RevenueFunnel revenue={revenue} />
        <HotLeadsPanel leads={hotLeads} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <ActivityChart leads={leadsByWeek} studies={studiesByWeek} />
        <PipelineMini leads={leads} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 14,
        }}
      >
        <RecentStudiesPanel studies={studies.slice(0, 5)} />
        <RecentLeadsPanel leads={leads.slice(0, 5)} />
      </div>
    </div>
  );
}

function formatToday() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function bucketByWeek(dates: string[], weeks: number): number[] {
  const buckets = Array.from({ length: weeks }, () => 0);
  const now = Date.now();
  const weekMs = 7 * 86400000;
  for (const d of dates) {
    if (!d) continue;
    const t = new Date(d).getTime();
    const diff = Math.floor((now - t) / weekMs);
    const idx = weeks - 1 - diff;
    if (idx >= 0 && idx < weeks) buckets[idx]++;
  }
  return buckets;
}

function RevenueFunnel({ revenue }: { revenue: RevenueMetrics }) {
  const max = Math.max(...revenue.funnel.map((f) => f.value), 1);
  return (
    <div className="ds-card" style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div>
          <h3 className="h-section">Funil de receita</h3>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 11.5,
              color: "var(--ink-soft)",
            }}
          >
            Valor R$ acumulado por estágio do pipeline
          </p>
        </div>
        <Link
          href="/dashboard/crm"
          style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 700 }}
        >
          Abrir CRM →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {revenue.funnel.map((f) => {
          const s = getStage(f.stage);
          return (
            <div
              key={f.stage}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 10,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11.5,
                  color: "var(--ink-soft)",
                  minWidth: 130,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    background: s.color,
                    borderRadius: 2,
                  }}
                />
                {s.label}
              </span>
              <div
                style={{
                  height: 8,
                  background: "var(--slate-100)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.max((f.value / max) * 100, f.value > 0 ? 4 : 0)}%`,
                    background: s.color,
                  }}
                />
              </div>
              <span
                className="tabular"
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: s.color,
                  minWidth: 64,
                  textAlign: "right",
                }}
              >
                {formatBRL(f.value)}
              </span>
            </div>
          );
        })}
        {revenue.funnel.every((f) => f.value === 0) && (
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "var(--ink-mute)",
              textAlign: "center",
              padding: "8px 0",
            }}
          >
            Sem valor estimado no pipeline ainda.
          </p>
        )}
      </div>
    </div>
  );
}

function HotLeadsPanel({ leads }: { leads: HotLead[] }) {
  return (
    <div className="ds-card" style={{ padding: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 16px",
        }}
      >
        <h3 className="h-section">Leads quentes</h3>
        <Link
          href="/dashboard/leads"
          style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 700 }}
        >
          Ver todos →
        </Link>
      </div>
      {leads.length === 0 && (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--ink-mute)",
            fontSize: 13,
            borderTop: "1px solid var(--slate-100)",
          }}
        >
          Sem leads pontuados ainda.
        </div>
      )}
      {leads.map((l) => (
        <Link
          key={l.id}
          href={`/dashboard/leads/${l.id}`}
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 12,
            alignItems: "center",
            padding: "11px 16px",
            borderTop: "1px solid var(--slate-100)",
          }}
        >
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 16,
              fontWeight: 800,
              color: priorityColor(l.priority_score),
              minWidth: 32,
              textAlign: "center",
            }}
          >
            {l.priority_score ?? "-"}
          </span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                color: "var(--navy)",
                fontSize: 13,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {l.name}
              {l.company && (
                <span style={{ color: "var(--ink-mute)", fontWeight: 500 }}>
                  {" "}
                  · {l.company}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--ink-soft)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {l.summary_line || "Sem resumo gerado."}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ActivityChart({
  leads,
  studies,
}: {
  leads: number[];
  studies: number[];
}) {
  const W = 720;
  const H = 220;
  const PAD = { l: 40, r: 16, t: 16, b: 28 };
  const max = Math.max(...leads, ...studies, 4) + 4;
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const step = innerW / Math.max(leads.length - 1, 1);
  const pts = (arr: number[]) =>
    arr
      .map(
        (v, i) =>
          `${PAD.l + i * step},${PAD.t + innerH - (v / max) * innerH}`
      )
      .join(" ");
  return (
    <div className="ds-card" style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
          gap: 14,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h3 className="h-section" style={{ whiteSpace: "nowrap" }}>
            Atividade do estúdio
          </h3>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 11.5,
              color: "var(--ink-soft)",
            }}
          >
            Últimas 12 semanas
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 14,
            fontSize: 11.5,
            color: "var(--ink-soft)",
            flexShrink: 0,
          }}
        >
          <span>
            <span
              style={{
                width: 8,
                height: 8,
                background: "var(--cyan-deep)",
                borderRadius: 2,
                display: "inline-block",
                marginRight: 6,
                verticalAlign: "middle",
              }}
            />{" "}
            Leads
          </span>
          <span>
            <span
              style={{
                width: 8,
                height: 8,
                background: "var(--blue)",
                borderRadius: 2,
                display: "inline-block",
                marginRight: 6,
                verticalAlign: "middle",
              }}
            />{" "}
            Estudos
          </span>
        </div>
      </div>
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block" }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const y = PAD.t + innerH * (1 - p);
          return (
            <g key={i}>
              <line
                x1={PAD.l}
                y1={y}
                x2={W - PAD.r}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray={i === 0 || i === 4 ? "" : "3 3"}
                strokeWidth="1"
              />
              <text
                x={PAD.l - 8}
                y={y + 3}
                fontSize="10"
                fill="#94A3B8"
                textAnchor="end"
                fontFamily="JetBrains Mono"
              >
                {Math.round(max * p)}
              </text>
            </g>
          );
        })}
        {leads.map((_, i) => (
          <text
            key={i}
            x={PAD.l + i * step}
            y={H - 8}
            fontSize="10"
            fill="#94A3B8"
            textAnchor="middle"
            fontFamily="JetBrains Mono"
          >
            S{i + 1}
          </text>
        ))}
        <defs>
          <linearGradient id="g-leads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3BC8CF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3BC8CF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          fill="url(#g-leads)"
          points={`${PAD.l},${PAD.t + innerH} ${pts(leads)} ${W - PAD.r},${PAD.t + innerH}`}
        />
        <polyline
          fill="none"
          stroke="#3BC8CF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pts(leads)}
        />
        <polyline
          fill="none"
          stroke="#5D57EB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pts(studies)}
        />
        {leads.map((v, i) => (
          <circle
            key={`l${i}`}
            cx={PAD.l + i * step}
            cy={PAD.t + innerH - (v / max) * innerH}
            r="2.5"
            fill="#3BC8CF"
          />
        ))}
        {studies.map((v, i) => (
          <circle
            key={`s${i}`}
            cx={PAD.l + i * step}
            cy={PAD.t + innerH - (v / max) * innerH}
            r="2.5"
            fill="#5D57EB"
          />
        ))}
      </svg>
    </div>
  );
}

function PipelineMini({ leads }: { leads: { status: string }[] }) {
  const order = ["contatado", "qualificado", "proposta", "ganho"];
  const counts: Record<string, number> = {};
  for (const k of order) counts[k] = leads.filter((l) => l.status === k).length;
  const max = Math.max(...Object.values(counts), 1);
  return (
    <div
      className="ds-card"
      style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 className="h-section">Funil esta semana</h3>
        <Link
          href="/dashboard/crm"
          style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 700 }}
        >
          Abrir CRM →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {order.map((k) => {
          const s = getStage(k);
          return (
            <div
              key={k}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 10,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11.5,
                  color: "var(--ink-soft)",
                  minWidth: 130,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    background: s.color,
                    borderRadius: 2,
                  }}
                />
                {s.label}
              </span>
              <div
                style={{
                  height: 6,
                  background: "var(--slate-100)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(counts[k] / max) * 100}%`,
                    background: s.color,
                  }}
                />
              </div>
              <span
                className="tabular"
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: s.color,
                  minWidth: 24,
                  textAlign: "right",
                }}
              >
                {counts[k]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentStudiesPanel({ studies }: { studies: Awaited<ReturnType<typeof fetchStudies>> }) {
  return (
    <div className="ds-card" style={{ padding: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 16px",
        }}
      >
        <h3 className="h-section">Estudos recentes</h3>
        <Link
          href="/dashboard/estudos"
          style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 700 }}
        >
          Ver todos →
        </Link>
      </div>
      <div>
        {studies.length === 0 && (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: "var(--ink-mute)",
              fontSize: 13,
            }}
          >
            Nenhum estudo ainda.
          </div>
        )}
        {studies.map((s) => {
          const overall = studyOverall(s);
          return (
            <Link
              key={s.id}
              href={`/dashboard/study/${s.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                gap: 14,
                alignItems: "center",
                padding: "11px 16px",
                borderTop: "1px solid var(--slate-100)",
              }}
            >
              <CategoryIcon category={s.category} size={32} />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--navy)",
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.title}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                  {s.client?.name || "Sem cliente"}
                  <span style={{ margin: "0 6px", color: "var(--ink-mute)" }}>·</span>
                  <span className="tabular">
                    {new Date(s.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
              <StatusPill status={s.status} />
              {typeof overall === "number" ? (
                <ScoreChip value={overall} />
              ) : (
                <span style={{ width: 56 }} />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function RecentLeadsPanel({ leads }: { leads: Awaited<ReturnType<typeof fetchLeads>> }) {
  return (
    <div className="ds-card" style={{ padding: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 16px",
        }}
      >
        <h3 className="h-section">Leads recentes</h3>
        <Link
          href="/dashboard/leads"
          style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 700 }}
        >
          Ver todos →
        </Link>
      </div>
      {leads.length === 0 && (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--ink-mute)",
            fontSize: 13,
            borderTop: "1px solid var(--slate-100)",
          }}
        >
          Sem leads ainda.
        </div>
      )}
      {leads.map((l) => {
        const stage = lookupStageForLead(l.status);
        return (
          <div
            key={l.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: 12,
              alignItems: "center",
              padding: "11px 16px",
              borderTop: "1px solid var(--slate-100)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--navy)",
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {l.name}{" "}
                {l.company && (
                  <span style={{ color: "var(--ink-mute)", fontWeight: 500 }}>
                    · {l.company}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-soft)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {l.email}
              </div>
            </div>
            <span
              className="pill"
              style={{ background: stage.soft, color: stage.color }}
            >
              <span className="dot" style={{ background: stage.color }} />
              {stage.label}
            </span>
            {typeof l.diagnostic_score === "number" ? (
              <ScoreChip value={l.diagnostic_score} />
            ) : (
              <span style={{ width: 56 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
