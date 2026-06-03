import Link from "next/link";
import { KanbanGlobal } from "./KanbanGlobal";
import { getAllOpenTasks } from "@/lib/dashboardData";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const tasks = await getAllOpenTasks();

  return (
    <div className="page" data-screen-label="Execucao">
      <div className="page-head">
        <div>
          <h1 className="h-page">Execução</h1>
          <p className="sub">
            Kanban consolidado de todos os estudos ativos. Arraste para mudar status.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ds-btn ds-btn-ghost" type="button">
            ↗ Exportar
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
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
            Nenhuma task ainda. Crie um estudo e gere o plano de execução.
          </div>
          <Link href="/dashboard/new" className="ds-btn ds-btn-primary">
            Criar novo estudo →
          </Link>
        </div>
      ) : (
        <KanbanGlobal initial={tasks} />
      )}
    </div>
  );
}
