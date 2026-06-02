import { statusMeta, type LeadStatus } from "@/lib/leads";

export function LeadStatusPill({ status }: { status: LeadStatus }) {
  const meta = statusMeta(status);
  return (
    <span
      className="pill-status"
      style={{ background: meta.soft, color: meta.color }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: meta.color,
          display: "inline-block",
        }}
      />
      {meta.label}
    </span>
  );
}
