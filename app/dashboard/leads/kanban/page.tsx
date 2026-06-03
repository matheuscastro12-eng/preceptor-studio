"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ScoreDonut } from "@/components/ScoreDonut";
import {
  LEAD_STATUSES,
  categoryLabel,
  type Lead,
  type LeadStatus,
} from "@/lib/leads";
import { TEAM_COLORS } from "@/lib/teamColors";

export default function LeadsKanbanPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const g: Record<LeadStatus, Lead[]> = {
      novo: [],
      contatado: [],
      qualificado: [],
      proposta: [],
      ganho: [],
      perdido: [],
    };
    for (const l of leads) g[l.status].push(l);
    return g;
  }, [leads]);

  async function moveTo(leadId: string, status: LeadStatus) {
    // Optimistic
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="eyebrow mb-2">Dashboard</div>
          <h1 className="text-4xl font-black text-navy tracking-tight">Pipeline</h1>
          <p className="text-ink-soft mt-1.5">
            Arraste e solte para mover o lead entre os estágios do funil.
          </p>
        </div>
        <Link href="/dashboard/leads" className="btn-pill btn-pill--ghost">
          <span className="btn-pill__icon">≡</span>
          Ver em lista
        </Link>
      </div>

      {loading ? (
        <div className="surface rounded-2xl h-96 shimmer" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {LEAD_STATUSES.map((s) => (
            <div
              key={s.value}
              className="rounded-2xl p-3 min-h-[400px]"
              style={{ background: s.soft, border: `1px solid ${s.color}33` }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragging) {
                  moveTo(dragging, s.value);
                  setDragging(null);
                }
              }}
            >
              <div
                className="flex items-center justify-between mb-3 px-1"
                style={{ color: s.color }}
              >
                <span className="text-[10px] uppercase tracking-widest font-bold">{s.label}</span>
                <span className="font-mono font-bold text-sm tabular-nums">
                  {grouped[s.value].length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {grouped[s.value].map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    onDragStart={() => setDragging(lead.id)}
                    onDragEnd={() => setDragging(null)}
                  />
                ))}
                {grouped[s.value].length === 0 && (
                  <div className="text-[11px] text-ink-mute font-mono px-2 py-4 text-center">
                    vazio
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KanbanCard({
  lead,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const assignee = lead.assignee ? TEAM_COLORS[lead.assignee] : null;
  return (
    <Link
      href={`/dashboard/leads/${lead.id}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="bg-white rounded-xl p-3 shadow-card hover:shadow-cardLg transition cursor-grab active:cursor-grabbing block"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-widest font-bold text-blue mb-1">
            {categoryLabel(lead.category)}
          </div>
          <div className="text-sm font-bold text-navy truncate">{lead.name}</div>
          <div className="text-xs text-ink-soft truncate">{lead.company || lead.email}</div>
        </div>
        {typeof lead.diagnostic_score === "number" && (
          <ScoreDonut value={lead.diagnostic_score} size={40} strokeWidth={5} />
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        {assignee ? (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: assignee.color, color: assignee.textColor }}
            title={assignee.name}
          >
            {assignee.initials}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-slate-100 text-ink-mute text-[10px] font-bold flex items-center justify-center">
            ?
          </div>
        )}
        <span className="text-[10px] font-mono text-ink-mute">
          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
        </span>
      </div>
    </Link>
  );
}
