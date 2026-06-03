"use client";

import { useState } from "react";
import {
  Task,
  TaskStatus,
  Assignee,
} from "@/lib/store";
import { createTaskRemote, deleteTaskRemote, updateTaskRemote } from "@/lib/storeApi";
import { AssigneeAvatar } from "./AssigneeAvatar";

const COLUMNS: { key: TaskStatus; label: string; chip: string }[] = [
  { key: "todo", label: "A Fazer", chip: "bg-slate-100 text-slate-700" },
  { key: "doing", label: "Em Progresso", chip: "bg-blue/10 text-blue" },
  { key: "blocked", label: "Bloqueado", chip: "bg-danger-soft text-danger" },
  { key: "done", label: "Concluído", chip: "bg-success-soft text-success" },
];


export function Kanban({
  tasks,
  onChange,
  studyId,
}: {
  tasks: Task[];
  onChange: () => void;
  studyId: string;
}) {
  const [filterSprint, setFilterSprint] = useState<number | "all">("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const sprints = Array.from(new Set(tasks.map((t) => t.sprint))).sort();
  const filtered = filterSprint === "all" ? tasks : tasks.filter((t) => t.sprint === filterSprint);

  const totalHours = filtered.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
  const doneHours = filtered
    .filter((t) => t.status === "done")
    .reduce((s, t) => s + (t.estimated_hours || 0), 0);
  const pct = totalHours > 0 ? Math.round((doneHours / totalHours) * 100) : 0;

  async function moveTask(taskId: string, newStatus: TaskStatus) {
    await updateTaskRemote(taskId, { status: newStatus });
    onChange();
  }

  async function handleDrop(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) await moveTask(id, status);
    setDraggingId(null);
  }

  async function addManual() {
    setCreating(true);
    const sprint = filterSprint === "all" ? 1 : (filterSprint as number);
    await createTaskRemote({
      study_id: studyId,
      sprint,
      title: "Nova tarefa",
      description: null,
      assignee: null,
      estimated_hours: null,
      status: "todo",
      order_index: filtered.length,
    });
    setCreating(false);
    onChange();
  }

  return (
    <div>
      {/* Header */}
      <div className="surface rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1 surface rounded-lg p-1">
            <button
              onClick={() => setFilterSprint("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                filterSprint === "all" ? "bg-navy-gradient text-white" : "text-ink-soft hover:text-navy"
              }`}
            >
              Todos
            </button>
            {sprints.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSprint(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  filterSprint === s ? "bg-navy-gradient text-white" : "text-ink-soft hover:text-navy"
                }`}
              >
                Sprint {s}
              </button>
            ))}
          </div>
          <div className="text-xs text-ink-soft">
            <span className="font-bold text-navy">{filtered.length}</span> tarefas
            {" · "}
            <span className="font-bold text-navy">{totalHours}h</span> estimadas
            {" · "}
            <span className="font-bold text-success">{pct}%</span> concluído
          </div>
        </div>
        <button onClick={addManual} disabled={creating} className="btn-ghost text-xs">
          + Nova Tarefa
        </button>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = filtered.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.key)}
              className="bg-slate-100/60 rounded-2xl p-3 min-h-[200px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${col.chip}`}>
                  {col.label}
                </span>
                <span className="text-[10px] font-bold text-ink-mute">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2 flex-1">
                {colTasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onChange={onChange}
                    onDragStart={() => setDraggingId(task.id)}
                    onDragEnd={() => setDraggingId(null)}
                    isDragging={draggingId === task.id}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="text-xs text-ink-mute text-center py-6 italic">
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

function KanbanCard({
  task,
  onChange,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: Task;
  onChange: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  async function save() {
    if (title.trim() && title !== task.title) {
      await updateTaskRemote(task.id, { title: title.trim() });
      onChange();
    }
    setEditing(false);
  }

  async function remove() {
    if (!confirm("Remover esta tarefa?")) return;
    await deleteTaskRemote(task.id);
    onChange();
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-xl p-3 shadow-card border border-slate-200/60 cursor-grab active:cursor-grabbing transition ${
        isDragging ? "opacity-50 rotate-1" : "hover:shadow-cardLg"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="text-[10px] font-bold text-blue uppercase tracking-widest flex items-center gap-1.5">
          {task.milestone && <span className="text-amber-500">★</span>}
          Sprint {task.sprint}
        </div>
        <button
          onClick={remove}
          className="text-ink-mute hover:text-danger text-xs"
          title="Remover"
        >
          ✕
        </button>
      </div>
      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setTitle(task.title);
              setEditing(false);
            }
          }}
          className="w-full text-sm font-bold text-navy bg-slate-50 rounded px-2 py-1 outline-none border border-cyan"
        />
      ) : (
        <div
          onClick={() => setEditing(true)}
          className="text-sm font-bold text-navy leading-snug mb-1 cursor-text"
        >
          {task.title}
        </div>
      )}
      {task.description && (
        <p className="text-[11px] text-ink-soft leading-snug line-clamp-3 mb-2">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-2">
        <AssigneeAvatar assignee={task.assignee} showName />
        {task.estimated_hours != null && (
          <span className="text-[10px] font-bold text-ink-mute">
            {task.estimated_hours}h
          </span>
        )}
      </div>
    </div>
  );
}
