"use client";

import { useMemo, useState } from "react";
import {
  ScoreChip,
  STAGES,
  lookupStageForLead,
  SECTORS_LABEL,
  type DashCategory,
} from "@/components/dashboard/Shared";
import { Kpi } from "@/components/dashboard/Kpi";
import { TEAM_COLORS } from "@/lib/teamColors";

export interface CRMLeadRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  category: string | null;
  score: number | null;
  status: string;
  assignee: string | null;
  created: string;
}

const NEXT_ACTIONS = [
  "Confirmar agenda da reunião (qui)",
  "Enviar proposta v2",
  "Follow up: aguardando resposta há 4d",
  "Ligar pra qualificar fit técnico",
  "Reagendar com CTO da operadora",
  "Mandar case Nutrii por email",
];

export function CRMView({
  rows,
  totalLeads,
}: {
  rows: CRMLeadRow[];
  totalLeads: number;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeStage, setActiveStage] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return rows.filter((l) => {
      if (activeStage !== "all" && l.status !== activeStage) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        if (
          !l.name.toLowerCase().includes(s) &&
          !(l.company || "").toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
  }, [rows, activeStage, search]);

  const perPage = 11;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const counts: Record<string, number> = {};
  for (const s of STAGES) counts[s.key] = rows.filter((l) => l.status === s.key).length;
  const totalFunnel = rows.filter(
    (l) => l.status !== "ganho" && l.status !== "perdido"
  ).length;
  const ganho = counts.ganho || 0;
  const winRate = rows.length > 0 ? Math.round((ganho / rows.length) * 100) : 0;

  const allSelected =
    visible.length > 0 && visible.every((l) => selected.has(l.id));
  function toggleAll() {
    const n = new Set(selected);
    if (allSelected) visible.forEach((l) => n.delete(l.id));
    else visible.forEach((l) => n.add(l.id));
    setSelected(n);
  }
  function toggleOne(id: string) {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setSelected(n);
  }

  return (
    <div className="page" data-screen-label="CRM">
      <div className="page-head">
        <div>
          <h1 className="h-page">
            CRM{" "}
            <span style={{ color: "var(--ink-mute)", fontWeight: 500 }}>
              · pipeline ativo
            </span>
          </h1>
          <p className="sub">
            Funil comercial dos leads qualificados. Use ações em lote pra mover
            múltiplos de uma vez.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ds-btn ds-btn-ghost">▸ Automações</button>
          <button className="ds-btn ds-btn-ghost">↗ Exportar</button>
          <button className="ds-btn ds-btn-primary">+ Novo lead</button>
        </div>
      </div>

      <div className="kpis">
        <Kpi
          label="No funil ativo"
          value={totalFunnel}
          delta={`${rows.length} total promovidos`}
          deltaDir="up"
          icon="◆"
          spark={[8, 9, 10, 11, 11, 12, totalFunnel]}
        />
        <Kpi
          label="Conv. lead → reunião"
          value={`${totalLeads > 0 ? Math.round((counts.qualificado / Math.max(totalLeads, 1)) * 100) : 0}%`}
          delta="dos capturados"
          deltaDir="up"
          icon="↑"
          spark={[34, 36, 38, 38, 40, 41, 42]}
        />
        <Kpi
          label="Conv. proposta → ganho"
          value={`${counts.proposta > 0 ? Math.round((ganho / counts.proposta) * 100) : 0}%`}
          delta="taxa de fechamento"
          deltaDir="up"
          icon="→"
          spark={[63, 64, 62, 63, 62, 62, 61]}
        />
        <Kpi
          label="Win rate"
          value={`${winRate}%`}
          delta={`${ganho} ganhos`}
          deltaDir="up"
          icon="◐"
          spark={[7, 6.5, 6, 5.5, 5.2, 5, winRate]}
        />
      </div>

      <div className="ds-card" style={{ padding: 18, marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <h3 className="h-section" style={{ whiteSpace: "nowrap" }}>
            Distribuição no funil
          </h3>
          <span
            className="overline"
            style={{ textAlign: "right", lineHeight: 1.4 }}
          >
            Conversion rate por estágio · últimos 30 dias
          </span>
        </div>
        <FunnelBar counts={counts} total={rows.length} />
      </div>

      <div className="toolbar">
        <div className="toolbar__search">
          <span className="mag">⌕</span>
          <input
            className="ds-input"
            placeholder="Buscar lead, empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="divider" />
        <button
          className={"chipfilter" + (activeStage === "all" ? " active" : "")}
          onClick={() => setActiveStage("all")}
        >
          Todos <span className="count">{rows.length}</span>
        </button>
        {STAGES.filter((s) => s.key !== "novo" && s.key !== "reuniao").map(
          (s) => (
            <button
              key={s.key}
              className={
                "chipfilter" + (activeStage === s.key ? " active" : "")
              }
              onClick={() => setActiveStage(s.key)}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 2,
                  background: s.color,
                  display: "inline-block",
                }}
              />
              {s.label} <span className="count">{counts[s.key] || 0}</span>
            </button>
          )
        )}
        <div className="grow" />
        <button className="btn-icon">⊞ Group by</button>
        <button className="btn-icon">⇅ Sort</button>
      </div>

      {selected.size > 0 && (
        <div
          style={{
            position: "sticky",
            top: 8,
            zIndex: 5,
            marginBottom: -38,
            marginLeft: 12,
            marginRight: 12,
          }}
        >
          <div className="bulkbar">
            <span className="count">{selected.size}</span>
            <span style={{ fontSize: 13 }}>leads</span>
            <span
              style={{
                width: 1,
                height: 18,
                background: "rgba(255,255,255,0.15)",
              }}
            />
            <button className="act">→ Mover estágio</button>
            <button className="act">↦ Atribuir owner</button>
            <button className="act">✉ Sequência email</button>
            <button className="act">📌 Agendar follow-up</button>
            <button className="act">↗ Exportar</button>
            <span style={{ flex: 1 }} />
            <button className="act" onClick={() => setSelected(new Set())}>
              Limpar
            </button>
          </div>
        </div>
      )}

      <div className="tablewrap">
        <table className="table">
          <thead>
            <tr>
              <th className="cb">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>
              <th style={{ width: 220 }}>Lead</th>
              <th style={{ width: 160 }}>Empresa</th>
              <th style={{ width: 90 }}>Setor</th>
              <th style={{ width: 90 }}>Score</th>
              <th style={{ width: 170 }}>Estágio</th>
              <th style={{ width: 100 }}>Owner</th>
              <th style={{ width: 100 }}>Em estágio</th>
              <th style={{ width: 250 }}>Próxima ação</th>
              <th style={{ width: 36 }} />
            </tr>
          </thead>
          <tbody>
            {visible.map((l) => (
              <CRMRowEl
                key={l.id}
                lead={l}
                selected={selected.has(l.id)}
                onToggle={() => toggleOne(l.id)}
              />
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--ink-mute)",
                  }}
                >
                  Nenhum lead no funil.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pager">
          <span>
            Mostrando{" "}
            <strong style={{ color: "var(--navy)" }}>
              {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–
              {Math.min(page * perPage, filtered.length)}
            </strong>{" "}
            de {filtered.length}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 11,
            }}
          >
            <span>
              Win rate{" "}
              <strong className="tabular" style={{ color: "#10B981" }}>
                {winRate}%
              </strong>
            </span>
            <span>·</span>
            <div className="pager__nums">
              <button onClick={() => setPage(Math.max(1, page - 1))}>‹</button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={p === page ? "active" : ""}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(Math.min(pages, page + 1))}>
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelBar({
  counts,
  total,
}: {
  counts: Record<string, number>;
  total: number;
}) {
  const order = STAGES.filter(
    (s) => s.key !== "novo" && s.key !== "perdido" && s.key !== "reuniao"
  );
  const max = total || 1;
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${order.length}, 1fr)`,
          gap: 4,
          marginBottom: 14,
        }}
      >
        {order.map((s) => {
          const v = counts[s.key] || 0;
          const pct = (v / max) * 100;
          return (
            <div key={s.key}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "var(--ink-soft)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {s.label}
                </span>
                <span
                  className="tabular"
                  style={{ fontSize: 11, color: s.color, fontWeight: 700 }}
                >
                  {v}
                </span>
              </div>
              <div
                style={{
                  position: "relative",
                  height: 6,
                  background: "var(--slate-100)",
                  borderRadius: 999,
                  overflow: "hidden",
                  marginBottom: 3,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${Math.max(pct, 4)}%`,
                    background: s.color,
                    borderRadius: 999,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--ink-mute)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {Math.round(pct)}% do funil
              </span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${order.length - 1}, 1fr)`,
          gap: 4,
        }}
      >
        {order.slice(0, -1).map((s, i) => {
          const from = counts[s.key] || 0;
          const to = counts[order[i + 1].key] || 0;
          const rate = from > 0 ? Math.round((to / from) * 100) : 0;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 11,
                color: "var(--ink-mute)",
              }}
            >
              <span>{rate}%</span>
              <span style={{ color: "var(--cyan-deep)" }}>→</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CRMRowEl({
  lead,
  selected,
  onToggle,
}: {
  lead: CRMLeadRow;
  selected: boolean;
  onToggle: () => void;
}) {
  const owner = lead.assignee
    ? TEAM_COLORS[lead.assignee] || {
        initials: "?",
        color: "#94A3B8",
        name: "-",
      }
    : { initials: "·", color: "#94A3B8", name: "Sem owner" };
  const stage = lookupStageForLead(lead.status);
  const days = Math.floor(
    (Date.now() - new Date(lead.created).getTime()) / 86400000
  );
  const aging = days > 14 ? "var(--danger-rose)" : days > 7 ? "#F59E0B" : "var(--ink-soft)";
  return (
    <tr className={"row" + (selected ? " selected" : "")}>
      <td className="cb">
        <input type="checkbox" checked={selected} onChange={onToggle} />
      </td>
      <td>
        <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: 13 }}>
          {lead.name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--ink-mute)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {lead.email}
        </div>
      </td>
      <td>
        <div style={{ fontWeight: 600 }}>{lead.company || "-"}</div>
      </td>
      <td>
        {lead.category ? (
          <span className={`tag ${lead.category}`}>
            {SECTORS_LABEL[lead.category as DashCategory] || lead.category}
          </span>
        ) : (
          <span style={{ color: "var(--ink-mute)" }}>-</span>
        )}
      </td>
      <td>
        {typeof lead.score === "number" ? (
          <ScoreChip value={lead.score} />
        ) : (
          <span style={{ color: "var(--ink-mute)" }}>-</span>
        )}
      </td>
      <td>
        <span className="pill" style={{ background: stage.soft, color: stage.color }}>
          <span className="dot" style={{ background: stage.color }} />
          {stage.label}
        </span>
      </td>
      <td>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span className="avatar" style={{ background: owner.color }}>
            {owner.initials}
          </span>
          <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
            {owner.name}
          </span>
        </span>
      </td>
      <td className="num" style={{ color: aging, fontWeight: 600 }}>
        {days}d
      </td>
      <td>
        <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
          {NEXT_ACTIONS[parseInt(lead.id.slice(-2), 16) % NEXT_ACTIONS.length]}
        </span>
      </td>
      <td>
        <button className="tb__icon" style={{ width: 26, height: 26 }}>
          ⋯
        </button>
      </td>
    </tr>
  );
}
