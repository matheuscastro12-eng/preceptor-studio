"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TEAM_COLORS } from "@/lib/teamColors";
import type { TaskWithStudy } from "@/lib/dashboardData";
import type { Assignee, TaskStatus } from "@/lib/store";

const COLUMNS: { key: TaskStatus; label: string; color: string; soft: string }[] = [
  { key: "todo", label: "A Fazer", color: "#334155", soft: "#F1F5F9" },
  { key: "doing", label: "Em Progresso", color: "#1E40AF", soft: "#DBEAFE" },
  { key: "blocked", label: "Bloqueado", color: "#E11D48", soft: "#FEE2E2" },
  { key: "done", label: "Concluído", color: "#047857", soft: "#D1FAE5" },
];

const ASSIGNEES: Assignee[] = [
  "matheus",
  "luciano",
  "ana_flavia",
  "thiago",
  "leonardo",
  "marco",
  "kalley",
];

const CATEGORY_TAG_CLASS: Record<string, string> = {
  saude: "tag saude",
  educacao: "tag educacao",
  juridico: "tag juridico",
  tech: "tag tech",
  outro: "tag outro",
};

export function KanbanGlobal({ initial }: { initial: TaskWithStudy[] }) {
  const [tasks, setTasks] = useState<TaskWithStudy[]>(initial);
  const [assigneeFilter, setAssigneeFilter] = useState<Assignee | "all">("all");
  const [sprintFilter, setSprintFilter] = useState<number | "all">("all");
  const [studyFilter, setStudyFilter] = useState<string | "all">("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const studyOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tasks) {
      if (!map.has(t.study_id)) map.set(t.study_id, t.study_title);
    }
    return Array.from(map.entries());
  }, [tasks]);

  const sprintOptions = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.sprint))).sort((a, b) => a - b);
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (assigneeFilter !== "all" && t.assignee !== assigneeFilter) return false;
      if (sprintFilter !== "all" && t.sprint !== sprintFilter) return false;
      if (studyFilter !== "all" && t.study_id !== studyFilter) return false;
      return true;
    });
  }, [tasks, assigneeFilter, sprintFilter, studyFilter]);

  const totalHours = filtered.reduce(
    (acc, t) => acc + (t.estimated_hours ?? 0),
    0
  );
  const doneHours = filtered
    .filter((t) => t.status === "done")
    .reduce((acc, t) => acc + (t.estimated_hours ?? 0), 0);
  const pct = totalHours > 0 ? Math.round((doneHours / totalHours) * 100) : 0;

  async function moveTask(id: string, status: TaskStatus) {
    const prev = tasks;
    setTasks((curr) => curr.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar");
    } catch {
      setTasks(prev);
    }
  }

  function handleDrop(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) void moveTask(id, status);
    setDraggingId(null);
  }

  return (
    <div>
      {/* Toolbar */}
      <div
        className="ds-surface"
        style={{
          padding: 12,
          marginBottom: 14,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: 4,
            background: "var(--slate-50)",
            borderRadius: 8,
            border: "1px solid var(--slate-200)",
          }}
        >
          <FilterChip
            active={assigneeFilter === "all"}
            onClick={() => setAssigneeFilter("all")}
            label="Todos"
          />
          {ASSIGNEES.map((a) => {
            const m = TEAM_COLORS[a];
            return (
              <FilterChip
                key={a}
                active={assigneeFilter === a}
                onClick={() => setAssigneeFilter(a)}
                label={m.name}
                avatar={
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 999,
                      background: m.color,
                      color: m.textColor,
                      fontSize: 8,
                      fontWeight: 900,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {m.initials}
                  </span>
                }
              />
            );
          })}
        </div>

        <select
          className="ds-input"
          style={{ maxWidth: 180 }}
          value={sprintFilter === "all" ? "all" : String(sprintFilter)}
          onChange={(e) =>
            setSprintFilter(
              e.target.value === "all" ? "all" : Number(e.target.value)
            )
          }
        >
          <option value="all">Todas as sprints</option>
          {sprintOptions.map((s) => (
            <option key={s} value={s}>
              Sprint {s}
            </option>
          ))}
        </select>

        <select
          className="ds-input"
          style={{ maxWidth: 240 }}
          value={studyFilter}
          onChange={(e) => setStudyFilter(e.target.value)}
        >
          <option value="all">Todos os estudos</option>
          {studyOptions.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>

        <div
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: "var(--ink-soft)",
          }}
        >
          <strong style={{ color: "var(--navy)" }}>{filtered.length}</strong> tasks ·{" "}
          <strong style={{ color: "var(--navy)" }} className="tabular">
            {Math.round(totalHours)}h
          </strong>{" "}
          estimadas ·{" "}
          <strong style={{ color: "#047857" }} className="tabular">
            {pct}%
          </strong>{" "}
          concluído
        </div>
      </div>

      {/* Columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {COLUMNS.map((col) => {
          const colTasks = filtered.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.key)}
              style={{
                background: "var(--slate-100)",
                borderRadius: 12,
                padding: 10,
                minHeight: 240,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  padding: "0 4px",
                }}
              >
                <span
                  className="pill"
                  style={{ background: col.soft, color: col.color }}
                >
                  <span className="dot" style={{ background: col.color }} />
                  {col.label}
                </span>
                <span
                  className="tabular"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--ink-mute)",
                  }}
                >
                  {colTasks.length}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flex: 1,
                }}
              >
                {colTasks.map((task) => (
                  <Card
                    key={task.id}
                    task={task}
                    isDragging={draggingId === task.id}
                    onDragStart={() => setDraggingId(task.id)}
                    onDragEnd={() => setDraggingId(null)}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      color: "var(--ink-mute)",
                      padding: "20px 0",
                      fontStyle: "italic",
                    }}
                  >
                    arraste cards aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  avatar,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  avatar?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 6,
        fontSize: 11.5,
        fontWeight: 700,
        border: "1px solid transparent",
        background: active ? "var(--navy-deep)" : "transparent",
        color: active ? "#fff" : "var(--ink-soft)",
        cursor: "pointer",
        transition: "all 160ms",
      }}
    >
      {avatar}
      {label}
    </button>
  );
}

function Card({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  task: TaskWithStudy;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const member = task.assignee ? TEAM_COLORS[task.assignee] : null;
  const tagClass = CATEGORY_TAG_CLASS[task.study_category] ?? "tag outro";
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid var(--slate-200)",
        padding: 10,
        boxShadow: "0 1px 2px rgba(15,23,41,0.04)",
        cursor: "grab",
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? "rotate(1deg)" : "none",
        transition: "opacity 120ms",
      }}
    >
      <Link
        href={`/dashboard/study/${task.study_id}`}
        style={{
          display: "inline-block",
          marginBottom: 6,
        }}
      >
        <span className={tagClass} style={{ fontSize: 9.5 }}>
          {task.study_title}
        </span>
      </Link>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 9.5,
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--blue)",
          marginBottom: 4,
        }}
      >
        {task.milestone && (
          <span style={{ color: "#F59E0B" }}>★</span>
        )}
        Sprint {task.sprint}
      </div>
      <div
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          color: "var(--navy)",
          lineHeight: 1.3,
          marginBottom: 8,
        }}
      >
        {task.title}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {member ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "var(--ink-soft)",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: member.color,
                color: member.textColor,
                fontSize: 9,
                fontWeight: 900,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {member.initials}
            </span>
            {member.name}
          </span>
        ) : (
          <span
            style={{
              fontSize: 10.5,
              color: "var(--ink-mute)",
              fontStyle: "italic",
            }}
          >
            sem responsável
          </span>
        )}
        {task.estimated_hours != null && (
          <span
            className="tabular"
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: "var(--ink-mute)",
            }}
          >
            {task.estimated_hours}h
          </span>
        )}
      </div>
    </div>
  );
}
