"use client";

import { Task } from "@/lib/store";
import { TEAM_COLORS } from "@/lib/teamColors";

const SPRINTS = [
  { number: 1, name: "Setup e Fundação", weeks: "1-4" },
  { number: 2, name: "Construção", weeks: "5-8" },
  { number: 3, name: "Lançamento", weeks: "9-12" },
];

const STATUS_COLOR: Record<string, string> = {
  todo: "#94A3B8",
  doing: "#5D57EB",
  blocked: "#E11D48",
  done: "#10B981",
};

export function Timeline({ tasks }: { tasks: Task[] }) {
  const totalHours = tasks.reduce((s, t) => s + (t.estimated_hours || 0), 0) || 1;

  return (
    <div className="surface rounded-2xl p-6">
      {/* Sprint axis */}
      <div className="grid grid-cols-12 gap-1 mb-3">
        {Array.from({ length: 12 }).map((_, i) => {
          const week = i + 1;
          const sprint = week <= 4 ? 1 : week <= 8 ? 2 : 3;
          return (
            <div key={i} className="text-center">
              <div className="text-[9px] font-bold text-ink-mute uppercase tracking-widest mb-1">
                S{week}
              </div>
              <div
                className={`h-1 rounded-full ${
                  sprint === 1 ? "bg-cyan/60" : sprint === 2 ? "bg-blue/60" : "bg-purple/60"
                }`}
              />
            </div>
          );
        })}
      </div>

      <div className="space-y-6">
        {SPRINTS.map((sp) => {
          const sprintTasks = tasks
            .filter((t) => t.sprint === sp.number)
            .sort((a, b) => a.order_index - b.order_index);
          if (sprintTasks.length === 0) return null;
          const sprintHours = sprintTasks.reduce((s, t) => s + (t.estimated_hours || 0), 0);
          return (
            <div key={sp.number}>
              <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-slate-200/70">
                <div className="flex items-baseline gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white bg-navy-gradient px-2 py-1 rounded">
                    Sprint {sp.number}
                  </span>
                  <span className="text-base font-bold text-navy">{sp.name}</span>
                  <span className="text-[10px] uppercase tracking-widest text-ink-mute font-bold">
                    semanas {sp.weeks}
                  </span>
                </div>
                <span className="text-xs font-bold text-ink-mute">{sprintHours}h</span>
              </div>
              <div className="space-y-1.5">
                {sprintTasks.map((task) => {
                  const member = task.assignee ? TEAM_COLORS[task.assignee] : null;
                  const widthPct = Math.max(
                    8,
                    Math.min(100, ((task.estimated_hours || 1) / Math.max(...sprintTasks.map((t) => t.estimated_hours || 1))) * 100)
                  );
                  return (
                    <div key={task.id} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                        style={
                          member
                            ? { background: member.color, color: member.textColor }
                            : { background: "#e2e8f0", color: "#94a3b8" }
                        }
                      >
                        {member?.initials || "—"}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div
                          className="h-7 rounded-md flex items-center px-3 text-xs font-semibold text-white shrink-0 truncate shadow-sm"
                          style={{
                            background: STATUS_COLOR[task.status] || "#94A3B8",
                            width: `${widthPct}%`,
                            minWidth: "120px",
                            maxWidth: "60%",
                          }}
                          title={task.description || ""}
                        >
                          {task.milestone && <span className="text-amber-300 mr-1.5">★</span>}
                          <span className="truncate">{task.title}</span>
                        </div>
                        <span className="text-[10px] font-bold text-ink-mute shrink-0">
                          {task.estimated_hours || "?"}h
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-200/70 text-[10px] uppercase tracking-widest font-bold text-ink-mute">
        <Legend color={STATUS_COLOR.todo} label="A fazer" />
        <Legend color={STATUS_COLOR.doing} label="Em progresso" />
        <Legend color={STATUS_COLOR.blocked} label="Bloqueado" />
        <Legend color={STATUS_COLOR.done} label="Concluído" />
        <span className="text-amber-500">★ marco com cliente</span>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
