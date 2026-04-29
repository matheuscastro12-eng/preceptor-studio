"use client";

import { useEffect, useState } from "react";
import { listTasks, StudyWithClient, Task } from "@/lib/store";
import { Kanban } from "./Kanban";
import { Timeline } from "./Timeline";
import { PDFButton } from "./PDFButton";

type Mode = "kanban" | "timeline";

export function ExecutionView({ study }: { study: StudyWithClient }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [version, setVersion] = useState(0);
  const [mode, setMode] = useState<Mode>("kanban");

  useEffect(() => {
    setTasks(listTasks(study.id));
  }, [study.id, version]);

  if (tasks.length === 0) {
    return (
      <div className="surface rounded-2xl p-12 text-center">
        <div className="eyebrow mb-2">Cronograma</div>
        <p className="text-ink-soft">
          Nenhuma tarefa carregada. Regenere o estudo para gerar o cronograma.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="surface rounded-xl p-2 mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <ModeBtn active={mode === "kanban"} onClick={() => setMode("kanban")} icon="▦" label="Kanban" />
          <ModeBtn active={mode === "timeline"} onClick={() => setMode("timeline")} icon="≡" label="Timeline" />
        </div>
        <PDFButton study={study} kind="execution" variant="ghost" />
      </div>

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
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 ${
        active ? "bg-navy-gradient text-white shadow-card" : "text-ink-soft hover:text-navy hover:bg-slate-50"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}
