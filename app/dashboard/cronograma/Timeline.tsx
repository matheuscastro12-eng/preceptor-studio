import Link from "next/link";
import {
  CategoryIcon,
  MiniDiamond,
} from "@/components/dashboard/Shared";
import { TEAM_COLORS } from "@/lib/teamColors";
import type { StudyWithTasks, TaskRow } from "@/lib/dashboardData";

const WEEKS = 12;
const WEEK_MS = 7 * 86400000;

interface CellTask {
  task: TaskRow;
  studyId: string;
}

function startOfWeek(d: Date): Date {
  const dt = new Date(d);
  const day = dt.getDay(); // 0 sun .. 6 sat
  // Use Monday as week start.
  const diff = (day + 6) % 7;
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() - diff);
  return dt;
}

function weekIndexForTask(task: TaskRow, studyCreated: string): number {
  const meta = task.metadata as { due_week?: unknown } | null | undefined;
  if (meta && typeof meta.due_week === "number") {
    const v = Math.floor(meta.due_week);
    if (v >= 1 && v <= WEEKS) return v - 1;
  }
  // Sprints are biweekly: sprint N starts at week (N-1)*2 + 1 → index (N-1)*2.
  const sprintWeek = (task.sprint - 1) * 2;
  return Math.min(Math.max(sprintWeek, 0), WEEKS - 1);
}

function formatDM(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

export function Timeline({ rows }: { rows: StudyWithTasks[] }) {
  const baseMonday = startOfWeek(new Date());
  const weekDates: Date[] = Array.from({ length: WEEKS }, (_, i) => {
    const d = new Date(baseMonday);
    d.setDate(d.getDate() + i * 7);
    return d;
  });

  // Build per-row, per-week buckets
  const grid = rows.map(({ study, tasks }) => {
    const buckets: CellTask[][] = Array.from({ length: WEEKS }, () => []);
    for (const t of tasks) {
      const idx = weekIndexForTask(t, study.created_at);
      buckets[idx].push({ task: t, studyId: study.id });
    }
    return { study, buckets };
  });

  const labelCol = "240px";
  const gridCols = `${labelCol} repeat(${WEEKS}, minmax(56px, 1fr))`;

  return (
    <div
      className="ds-surface"
      style={{
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridCols,
          borderBottom: "1px solid var(--slate-200)",
          background: "var(--slate-50)",
        }}
      >
        <div
          style={{
            padding: "10px 14px",
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
          }}
        >
          Estudo
        </div>
        {weekDates.map((d, i) => (
          <div
            key={i}
            style={{
              padding: "10px 6px",
              textAlign: "center",
              borderLeft: "1px solid var(--slate-100)",
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                color: "var(--navy)",
                letterSpacing: "0.08em",
              }}
            >
              S{i + 1}
            </div>
            <div
              className="tabular"
              style={{
                fontSize: 9.5,
                color: "var(--ink-mute)",
                marginTop: 2,
              }}
            >
              {formatDM(d)}
            </div>
          </div>
        ))}
      </div>

      {/* Rows */}
      {grid.map(({ study, buckets }) => (
        <div
          key={study.id}
          style={{
            display: "grid",
            gridTemplateColumns: gridCols,
            borderBottom: "1px solid var(--slate-100)",
            minHeight: 64,
          }}
        >
          <Link
            href={`/dashboard/study/${study.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              minWidth: 0,
            }}
          >
            <CategoryIcon category={study.category} size={24} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "var(--navy)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {study.title}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: "var(--ink-mute)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {study.client_name ?? "Sem cliente"}
              </div>
            </div>
          </Link>
          {buckets.map((cell, i) => (
            <div
              key={i}
              style={{
                borderLeft: "1px solid var(--slate-100)",
                padding: "8px 4px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              {cell.some((c) => c.task.milestone) && (
                <div style={{ position: "absolute", top: 2 }}>
                  <MiniDiamond size={10} />
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                  justifyContent: "center",
                  maxWidth: "100%",
                }}
                title={cell.map((c) => c.task.title).join("\n")}
              >
                {cell.map((c) => {
                  const member = c.task.assignee
                    ? TEAM_COLORS[c.task.assignee]
                    : null;
                  const color = member?.color ?? "#CBD5E1";
                  const done = c.task.status === "done";
                  return (
                    <span
                      key={c.task.id}
                      title={`${c.task.title}${
                        c.task.estimated_hours != null
                          ? ` · ${c.task.estimated_hours}h`
                          : ""
                      }${member ? ` · ${member.name}` : ""}`}
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 999,
                        background: color,
                        opacity: done ? 0.35 : 1,
                        border:
                          c.task.status === "blocked"
                            ? "1.5px solid var(--danger-rose, #E11D48)"
                            : "none",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Legend */}
      <div
        style={{
          padding: "12px 16px",
          background: "var(--slate-50)",
          borderTop: "1px solid var(--slate-200)",
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "center",
          fontSize: 11,
          color: "var(--ink-soft)",
        }}
      >
        <span className="overline">Time</span>
        {Object.entries(TEAM_COLORS).map(([key, member]) => (
          <span
            key={key}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: member.color,
              }}
            />
            {member.name}
          </span>
        ))}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginLeft: "auto",
          }}
        >
          <MiniDiamond size={10} /> Milestone
        </span>
      </div>
    </div>
  );
}
