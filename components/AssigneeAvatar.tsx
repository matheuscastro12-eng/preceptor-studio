"use client";

import { TEAM_COLORS } from "@/lib/teamColors";

export function AssigneeAvatar({
  assignee,
  size = "sm",
  showName = false,
}: {
  assignee: string | null | undefined;
  size?: "xs" | "sm" | "md";
  showName?: boolean;
}) {
  const member = assignee && TEAM_COLORS[assignee];
  if (!member) {
    return showName ? (
      <span className="text-[11px] text-ink-mute italic">sem responsável</span>
    ) : null;
  }
  const dim = size === "xs" ? "w-5 h-5 text-[9px]" : size === "md" ? "w-8 h-8 text-xs" : "w-6 h-6 text-[10px]";
  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`${dim} rounded-full flex items-center justify-center font-black tracking-tight shrink-0`}
        style={{ background: member.color, color: member.textColor }}
      >
        {member.initials}
      </span>
      {showName && (
        <span className="text-[11px] font-semibold text-ink-soft">{member.name}</span>
      )}
    </div>
  );
}
