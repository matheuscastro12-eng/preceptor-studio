import Link from "next/link";
import {
  fetchStudies,
  fetchLeads,
  getHotLeads,
  getRevenueByMonth,
  formatBRL,
  type HotLead,
  type MonthPoint,
} from "@/lib/dashboardData";
import { getInstallmentAlerts, type InstallmentAlert } from "@/lib/financeAnalytics";
import {
  listVentures,
  studioHeader,
  STAGE_LABEL,
  type VentureRow,
  type VentureStage,
} from "@/lib/ventures";
import { Kpi } from "@/components/dashboard/Kpi";

export const dynamic = "force-dynamic";

// Estágios na ordem do funil lead -> equity (a espinha do CRM).
const STAGE_ORDER: VentureStage[] = [
  "lead",
  "diagnostico",
  "estudo",
  "proposta",
  "onboarding",
  "execucao",
  "manutencao",
  "equity",
];
const STAGE_COLOR: Record<VentureStage, string> = {
  lead: "#94A3B8",
  diagnostico: "#60A5FA",
  estudo: "#52E1E7",
  proposta: "#38BDF8",
  onboarding: "#A78BFA",
  execucao: "#34D399",
  manutencao: "#10B981",
  equity: "#F59E0B",
  encerrada: "#64748B",
};
const HEALTH = {
  verde: { color: "#10B981", label: "Saudáveis" },
  amarelo: { color: "#F59E0B", label: "Atenção" },
  vermelho: { color: "#EF4444", label: "Risco" },
} as const;

export default async function HomePage() {
  const ventures = await listVentures();
  const [header, studies, leads, hotLeads, alerts, revByMonth] = await Promise.all([
    studioHeader(ventures),
    fetchStudies(),
    fetchLeads(),
    getHotLeads(6),
    getInstallmentAlerts(),
    getRevenueByMonth(7),
  ]);

  const generating = studies.filter((s) => s.status === "generating").length;
  const newLeads = leads.filter((l) => l.status === "novo").length;

  // Agregados do studio (margem real consolidada das ventures).
  const tot = ventures.reduce(
    (a, v) => ({
      receita: a.receita + v.metrics.receita_realizada,
      custoHoras: a.custoHoras + v.metrics.custo_horas,
      custoIa: a.custoIa + v.metrics.custo_ia,
      custoOutros: a.custoOutros + v.metrics.custo_outros,
      margem: a.margem + v.metrics.margem,
      horas: a.horas + v.metrics.horas,
    }),
    { receita: 0, custoHoras: 0, custoIa: 0, custoOutros: 0, margem: 0, horas: 0 }
  );

  const byStage = STAGE_ORDER.map((st) => {
    const items = ventures.filter((v) => v.stage === st);
    return {
      stage: st,
      count: items.length,
      receita: items.reduce((s, v) => s + v.metrics.receita_realizada, 0),
    };
  });

  const health = ventures.reduce(
    (a, v) => ({ ...a, [v.health]: (a[v.health as keyof typeof a] || 0) + 1 }),
    { verde: 0, amarelo: 0, vermelho: 0 }
  );

  const revSpark = revByMonth.map((m) => m.value);
  const recentVentures = ventures.slice(0, 6);

  return (
    <div className="page" data-screen-label="Home">
      <div className="page-head">
        <div>
          <h1 className="h-page">
            Painel do studio{" "}
            <span style={{ color: "var(--ink-mute)", fontWeight: 500 }}>· {formatToday()}</span>
          </h1>
          <p className="sub">
            {ventures.length} ventures ativas · {newLeads} lead{newLeads === 1 ? "" : "s"} novo
            {newLeads === 1 ? "" : "s"} pra triar
            {generating > 0 ? ` · ${generating} estudo${generating === 1 ? "" : "s"} gerando` : ""}.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="ds-btn ds-btn-ghost" href="/dashboard/ventures">
            Ventures
          </Link>
          <Link className="ds-btn ds-btn-primary" href="/dashboard/new">
            + Novo estudo
          </Link>
        </div>
      </div>

      {/* 4 números que contam a história do studio */}
      <div className="kpis">
        <Kpi
          label="Caixa do mês"
          value={formatBRL(header.caixa_mes)}
          delta="entradas menos saídas, realizado"
          deltaDir={header.caixa_mes >= 0 ? "up" : "down"}
          icon="◆"
          spark={revSpark.some((v) => v > 0) ? revSpark : undefined}
        />
        <Kpi
          label="MRR atual"
          value={formatBRL(header.mrr_total)}
          delta="recorrência de manutenção"
          deltaDir="up"
          icon="↑"
        />
        <Kpi
          label="Pipeline aberto"
          value={formatBRL(header.pipeline_aberto)}
          delta="leads em negociação"
          deltaDir="up"
          icon="◇"
        />
        <Kpi
          label="Portfólio de equity"
          value={formatBRL(header.portfolio_equity)}
          delta="valor de papel, separado do caixa"
          deltaDir="up"
          icon="◐"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 14 }}>
        <VenturesPipeline byStage={byStage} total={ventures.length} />
        <TodayPanel alerts={alerts.overdue} hotLeads={hotLeads} generating={generating} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
        <StudioMargin tot={tot} revByMonth={revByMonth} />
        <HealthPanel health={health} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <RecentVentures ventures={recentVentures} />
        <HotLeadsPanel leads={hotLeads} />
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

// ─── Pipeline de Ventures (espinha lead -> equity) ───────────────────────────
function VenturesPipeline({
  byStage,
  total,
}: {
  byStage: { stage: VentureStage; count: number; receita: number }[];
  total: number;
}) {
  const max = Math.max(...byStage.map((s) => s.count), 1);
  return (
    <div className="ds-card" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <h3 className="h-section">Pipeline de ventures</h3>
          <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--ink-soft)" }}>
            Cada conta do lead à equity · {total} no total
          </p>
        </div>
        <Link href="/dashboard/ventures" style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 700 }}>
          Abrir Ventures →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {byStage.map((s) => (
          <div
            key={s.stage}
            style={{ display: "grid", gridTemplateColumns: "130px 1fr auto", gap: 10, alignItems: "center" }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ink-soft)" }}>
              <span style={{ width: 7, height: 7, background: STAGE_COLOR[s.stage], borderRadius: 2 }} />
              {STAGE_LABEL[s.stage]}
            </span>
            <div style={{ height: 8, background: "var(--slate-100, #F1F5F9)", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${s.count > 0 ? Math.max((s.count / max) * 100, 6) : 0}%`,
                  background: STAGE_COLOR[s.stage],
                }}
              />
            </div>
            <span
              className="tabular"
              style={{ fontSize: 12, fontWeight: 800, color: STAGE_COLOR[s.stage], minWidth: 70, textAlign: "right" }}
            >
              {s.count}
              {s.receita > 0 && (
                <span style={{ color: "var(--ink-mute)", fontWeight: 600 }}> · {formatBRL(s.receita)}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── O que fazer hoje (alertas acionáveis) ───────────────────────────────────
function TodayPanel({
  alerts,
  hotLeads,
  generating,
}: {
  alerts: InstallmentAlert[];
  hotLeads: HotLead[];
  generating: number;
}) {
  const items: { href: string; tag: string; tagColor: string; text: string }[] = [];
  for (const a of alerts.slice(0, 3)) {
    items.push({
      href: "/dashboard/financeiro",
      tag: "Vencida",
      tagColor: "#EF4444",
      text: `${formatBRL(a.amount_brl)} · ${a.study_title} (${Math.abs(a.days)}d)`,
    });
  }
  for (const l of hotLeads.slice(0, 3)) {
    items.push({
      href: `/dashboard/leads/${l.id}`,
      tag: "Lead quente",
      tagColor: "#3BC8CF",
      text: `${l.name}${l.company ? ` · ${l.company}` : ""}`,
    });
  }
  if (generating > 0) {
    items.push({
      href: "/dashboard/estudos",
      tag: "Gerando",
      tagColor: "#5D57EB",
      text: `${generating} estudo${generating === 1 ? "" : "s"} em geração`,
    });
  }

  return (
    <div className="ds-card" style={{ padding: 0 }}>
      <div style={{ padding: "14px 16px" }}>
        <h3 className="h-section">O que fazer hoje</h3>
      </div>
      {items.length === 0 && (
        <div style={{ padding: 28, textAlign: "center", color: "var(--ink-mute)", fontSize: 13, borderTop: "1px solid var(--slate-100, #F1F5F9)" }}>
          Tudo em dia. Sem pendências.
        </div>
      )}
      {items.map((it, i) => (
        <Link
          key={i}
          href={it.href}
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 10,
            alignItems: "center",
            padding: "11px 16px",
            borderTop: "1px solid var(--slate-100, #F1F5F9)",
          }}
        >
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: it.tagColor,
              background: `${it.tagColor}1A`,
              padding: "4px 8px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            {it.tag}
          </span>
          <span style={{ fontSize: 12.5, color: "var(--navy)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {it.text}
          </span>
        </Link>
      ))}
    </div>
  );
}

// ─── Margem do studio (receita - horas - IA) ─────────────────────────────────
function StudioMargin({
  tot,
  revByMonth,
}: {
  tot: { receita: number; custoHoras: number; custoIa: number; custoOutros: number; margem: number; horas: number };
  revByMonth: MonthPoint[];
}) {
  const custoTotal = tot.custoHoras + tot.custoIa + tot.custoOutros;
  const max = Math.max(...revByMonth.map((m) => m.value), 1);
  return (
    <div className="ds-card" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <h3 className="h-section">Margem do studio</h3>
          <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--ink-soft)" }}>
            Receita realizada menos horas, IA e infra
          </p>
        </div>
        <Link href="/dashboard/financeiro" style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 700 }}>
          Financeiro →
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Receita" value={formatBRL(tot.receita)} />
        <MiniStat label="Custo IA" value={formatBRL(tot.custoIa)} />
        <MiniStat label="Horas" value={`${tot.horas.toFixed(0)}h`} sub={formatBRL(tot.custoHoras)} />
        <MiniStat label="Margem" value={formatBRL(tot.margem)} color={tot.margem >= 0 ? "#10B981" : "#EF4444"} />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 64 }}>
        {revByMonth.map((m, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: "100%",
                height: `${Math.max((m.value / max) * 52, m.value > 0 ? 4 : 1)}px`,
                background: m.value > 0 ? "var(--cyan-deep, #1796A0)" : "var(--slate-100, #E2E8F0)",
                borderRadius: 4,
              }}
            />
            <span style={{ fontSize: 9.5, color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}>{m.label}</span>
          </div>
        ))}
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 10.5, color: "var(--ink-mute)" }}>
        Barras: valor fechado por mês (deals ganhos). Custo total atual: {formatBRL(custoTotal)}.
      </p>
    </div>
  );
}

function MiniStat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ padding: "10px 12px", background: "var(--bg, #F8FAFC)", borderRadius: 10, border: "1px solid var(--line, #E6EBF2)" }}>
      <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)" }}>
        {label}
      </div>
      <div className="tabular" style={{ fontSize: 17, fontWeight: 800, color: color || "var(--navy)", marginTop: 2 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10.5, color: "var(--ink-mute)" }}>{sub}</div>}
    </div>
  );
}

// ─── Saúde do portfólio ──────────────────────────────────────────────────────
function HealthPanel({ health }: { health: { verde: number; amarelo: number; vermelho: number } }) {
  const total = health.verde + health.amarelo + health.vermelho || 1;
  return (
    <div className="ds-card" style={{ padding: 16 }}>
      <h3 className="h-section" style={{ marginBottom: 14 }}>
        Saúde do portfólio
      </h3>
      <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", marginBottom: 16 }}>
        {(["verde", "amarelo", "vermelho"] as const).map((k) => (
          <div key={k} style={{ width: `${(health[k] / total) * 100}%`, background: HEALTH[k].color }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(["verde", "amarelo", "vermelho"] as const).map((k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-soft)" }}>
              <span style={{ width: 9, height: 9, background: HEALTH[k].color, borderRadius: 999 }} />
              {HEALTH[k].label}
            </span>
            <span className="tabular" style={{ fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>
              {health[k]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Ventures recentes ───────────────────────────────────────────────────────
function RecentVentures({ ventures }: { ventures: VentureRow[] }) {
  return (
    <div className="ds-card" style={{ padding: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
        <h3 className="h-section">Ventures recentes</h3>
        <Link href="/dashboard/ventures" style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 700 }}>
          Ver todas →
        </Link>
      </div>
      {ventures.length === 0 && (
        <div style={{ padding: 32, textAlign: "center", color: "var(--ink-mute)", fontSize: 13, borderTop: "1px solid var(--slate-100, #F1F5F9)" }}>
          Nenhuma venture ainda.
        </div>
      )}
      {ventures.map((v) => (
        <Link
          key={v.id}
          href={`/dashboard/ventures/${v.id}`}
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto auto",
            gap: 12,
            alignItems: "center",
            padding: "11px 16px",
            borderTop: "1px solid var(--slate-100, #F1F5F9)",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 999, background: HEALTH[v.health].color }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {v.name}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{v.client_name || "Sem cliente"}</div>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: STAGE_COLOR[v.stage],
              background: `${STAGE_COLOR[v.stage]}1A`,
              padding: "4px 9px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            {STAGE_LABEL[v.stage]}
          </span>
          <span
            className="tabular"
            style={{ fontSize: 12, fontWeight: 800, color: v.metrics.margem >= 0 ? "#10B981" : "#EF4444", minWidth: 70, textAlign: "right" }}
          >
            {formatBRL(v.metrics.margem)}
          </span>
        </Link>
      ))}
    </div>
  );
}

// ─── Leads quentes ───────────────────────────────────────────────────────────
function HotLeadsPanel({ leads }: { leads: HotLead[] }) {
  return (
    <div className="ds-card" style={{ padding: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
        <h3 className="h-section">Leads quentes</h3>
        <Link href="/dashboard/leads" style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 700 }}>
          Ver todos →
        </Link>
      </div>
      {leads.length === 0 && (
        <div style={{ padding: 32, textAlign: "center", color: "var(--ink-mute)", fontSize: 13, borderTop: "1px solid var(--slate-100, #F1F5F9)" }}>
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
            borderTop: "1px solid var(--slate-100, #F1F5F9)",
          }}
        >
          <span
            className="tabular"
            style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 800, color: "var(--cyan-deep, #1796A0)", minWidth: 28, textAlign: "center" }}
          >
            {l.priority_score ?? "-"}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {l.name}
              {l.company && <span style={{ color: "var(--ink-mute)", fontWeight: 500 }}> · {l.company}</span>}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {l.summary_line || "Sem resumo gerado."}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
