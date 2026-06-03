import Link from "next/link";
import { Kpi } from "@/components/dashboard/Kpi";
import { Timeline } from "./Timeline";
import { getActiveStudiesWithTasks } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

const WEEKS_AHEAD_MILESTONES = 4;

export default async function CronogramaPage() {
  const rows = await getActiveStudiesWithTasks();

  const allTasks = rows.flatMap((r) => r.tasks);
  const openTasks = allTasks.filter((t) => t.status !== "done");
  const milestonesNear = allTasks.filter((t) => {
    if (!t.milestone) return false;
    const week = (t.sprint - 1) * 2 + 1;
    return week <= WEEKS_AHEAD_MILESTONES;
  });
  const hours = openTasks.reduce(
    (acc, t) => acc + (t.estimated_hours ?? 0),
    0
  );

  return (
    <div className="page" data-screen-label="Cronograma">
      <div className="page-head">
        <div>
          <h1 className="h-page">Cronograma</h1>
          <p className="sub">
            Timeline consolidada dos estudos em execução, próximas 12 semanas.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ds-btn ds-btn-ghost" type="button">
            ▾ Visão
          </button>
          <button className="ds-btn ds-btn-ghost" type="button">
            ▾ Time
          </button>
        </div>
      </div>

      <div className="kpis">
        <Kpi
          label="Estudos em execução"
          value={rows.length}
          icon="◆"
        />
        <Kpi
          label="Tasks abertas"
          value={openTasks.length}
          icon="▣"
          delta={`${allTasks.length} total`}
          deltaDir="up"
        />
        <Kpi
          label={`Milestones em ${WEEKS_AHEAD_MILESTONES} semanas`}
          value={milestonesNear.length}
          icon="★"
        />
        <Kpi
          label="Horas estimadas"
          value={`${Math.round(hours)}h`}
          icon="◷"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <Timeline rows={rows} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="ds-surface"
      style={{
        padding: 48,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: "var(--ink-soft)",
          marginBottom: 14,
        }}
      >
        Nenhum estudo em execução no momento.
      </div>
      <Link href="/dashboard/new" className="ds-btn ds-btn-primary">
        Criar novo estudo →
      </Link>
    </div>
  );
}
