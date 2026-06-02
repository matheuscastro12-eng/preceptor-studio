"use client";

import { useEffect, useState } from "react";
import { StudyWithClient, Task } from "@/lib/store";
import { listTasksRemote } from "@/lib/storeApi";
import { Kanban } from "@/components/Kanban";
import { Eyebrow } from "@/components/dashboard/Shared";

export function ExecucaoTab({ study }: { study: StudyWithClient }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    listTasksRemote(study.id).then(setTasks);
  }, [study.id, version]);

  if (tasks.length === 0) {
    return (
      <div
        className="surface"
        style={{ padding: 40, borderRadius: 16, textAlign: "center" }}
      >
        <Eyebrow>Execução</Eyebrow>
        <p
          style={{
            color: "var(--ink-soft)",
            marginTop: 12,
            fontSize: 14,
          }}
        >
          Nenhuma tarefa carregada. Regenere o estudo para gerar o cronograma.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <Eyebrow>Execução</Eyebrow>
      </div>
      <Kanban
        tasks={tasks}
        onChange={() => setVersion((v) => v + 1)}
        studyId={study.id}
      />
    </div>
  );
}
