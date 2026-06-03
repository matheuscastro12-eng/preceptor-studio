"use client";

import { CalendarRange, Columns3, SquareGanttChart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StudyWithClient, Task } from "@/lib/store";
import { listTasksRemote } from "@/lib/storeApi";
import { Kanban } from "./Kanban";
import { Timeline } from "./Timeline";
import { PDFButton } from "./PDFButton";
import { OutputHeader, OutputMetric } from "./OutputHeader";

type Mode = "kanban" | "timeline";

export function ExecutionView({ study, publicMode = false }: { study: StudyWithClient; publicMode?: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [version, setVersion] = useState(0);
  const [mode, setMode] = useState<Mode>("kanban");

  useEffect(() => {
    listTasksRemote(study.id).then(setTasks);
  }, [study.id, version]);

  const metrics = useMemo<OutputMetric[]>(() => {
    const totalHours = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
    const milestones = tasks.filter((task) => task.milestone).length;
    const done = tasks.filter((task) => task.status === "done").length;
    return [
      { label: "Tarefas", value: tasks.length, hint: "no cronograma", tone: "accent" },
      { label: "Horas", value: totalHours || "N/A", hint: "estimadas" },
      { label: "Marcos", value: milestones, hint: "com cliente", tone: "warning" },
      { label: "Concluídas", value: done, hint: "status atual", tone: "success" },
    ];
  }, [tasks]);

  const modeActions = (
    <>
      <div className="surface rounded-xl p-1 flex items-center gap-1">
        <ModeBtn active={mode === "kanban"} onClick={() => setMode("kanban")} icon={<Columns3 className="w-3.5 h-3.5" />} label="Kanban" />
        <ModeBtn active={mode === "timeline"} onClick={() => setMode("timeline")} icon={<SquareGanttChart className="w-3.5 h-3.5" />} label="Timeline" />
      </div>
      <PDFButton study={study} kind="execution" variant="ghost" />
    </>
  );

  if (tasks.length === 0) {
    return (
      <div>
        <OutputHeader
          kind="execution"
          study={study}
          metrics={[{ label: "Status", value: "Pendente", tone: "warning" }]}
        />
        <div className="surface rounded-2xl p-12 text-center">
          <CalendarRange className="w-8 h-8 mx-auto text-cyan-deep mb-3" />
          <div className="eyebrow mb-2">Cronograma</div>
          <p className="text-ink-soft">
            Nenhuma tarefa carregada. Regenere o estudo para gerar o cronograma.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <OutputHeader kind="execution" study={study} metrics={metrics} actions={modeActions} />

      {mode === "kanban" ? (
        <Kanban
          tasks={tasks}
          onChange={() => setVersion((v) => v + 1)}
          studyId={study.id}
        />
      ) : (
        <Timeline tasks={tasks} />
      )}
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 ${
        active ? "bg-navy-gradient text-white shadow-card" : "text-ink-soft hover:text-navy hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
