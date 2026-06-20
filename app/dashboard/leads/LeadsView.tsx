"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ScoreChip,
  RecPill,
  SECTORS_LABEL,
  type DashCategory,
  lookupStageForLead,
  STAGES,
} from "@/components/dashboard/Shared";
import { Kpi } from "@/components/dashboard/Kpi";
import { TEAM_COLORS } from "@/lib/teamColors";
import { relativeDate, leadRecommendation } from "@/lib/dashboardData";
import { priorityColor } from "@/lib/leadScore";

export interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  category: string | null;
  source: string | null;
  score: number | null;
  priority: number | null;
  summary: string | null;
  requestedContact: string | null;
  status: string;
  assignee: string | null;
  lastTouch: string | null;
  created: string;
}

type SortKey = "priority" | "score" | "recent";

const ORIGIN_LABEL: Record<string, string> = {
  diagnostic_public: "diagnóstico",
  automacao: "automação",
  manual: "manual",
  indicacao: "indicação",
};

export function LeadsView({ rows }: { rows: LeadRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [setorFilter, setSetorFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [originFilter, setOriginFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [recomputing, setRecomputing] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const out = rows.filter((l) => {
      if (setorFilter !== "all" && l.category !== setorFilter) return false;
      if (stageFilter !== "all" && l.status !== stageFilter) return false;
      if (originFilter !== "all" && (l.source || "") !== originFilter) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        if (
          !l.name.toLowerCase().includes(s) &&
          !(l.company || "").toLowerCase().includes(s) &&
          !l.email.toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
    out.sort((a, b) => {
      if (sortKey === "recent") {
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      }
      if (sortKey === "score") {
        return (b.score ?? -1) - (a.score ?? -1);
      }
      return (b.priority ?? -1) - (a.priority ?? -1);
    });
    return out;
  }, [rows, setorFilter, stageFilter, originFilter, search, sortKey]);

  async function recomputeScores() {
    if (recomputing) return;
    setRecomputing(true);
    try {
      const res = await fetch("/api/leads/recompute-scores", { method: "POST" });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        alert(d.error || "Falha ao recalcular scores.");
        return;
      }
      window.location.reload();
    } finally {
      setRecomputing(false);
    }
  }

  const perPage = 12;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const newCount = rows.filter((l) => l.status === "novo").length;
  const recent7d = rows.filter((l) => {
    const t = new Date(l.created).getTime();
    return Date.now() - t < 7 * 86400000;
  }).length;
  const withScore = rows.filter((l) => typeof l.score === "number");
  const avgScore =
    withScore.length > 0
      ? Math.round(
          withScore.reduce((a, b) => a + (b.score || 0), 0) / withScore.length
        )
      : 0;
  const promoted = rows.filter((l) => l.status !== "novo").length;

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
    <div className="page" data-screen-label="Leads">
      <div className="page-head">
        <div>
          <h1 className="h-page">
            Leads{" "}
            <span style={{ color: "var(--ink-mute)", fontWeight: 500 }}>
              · {filtered.length}
            </span>
          </h1>
          <p className="sub">
            Inbox bruta de capturas do diagnóstico grátis. Qualifique para
            promover ao CRM.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="ds-btn ds-btn-ghost"
            onClick={recomputeScores}
            disabled={recomputing}
          >
            {recomputing ? "Recalculando..." : "↻ Recalcular scores"}
          </button>
          <button className="ds-btn ds-btn-ghost">↗ Exportar CSV</button>
          <a className="ds-btn ds-btn-primary" href="/dashboard/crm">
            Abrir CRM →
          </a>
        </div>
      </div>

      <div className="kpis">
        <Kpi
          label="Capturas (7d)"
          value={recent7d}
          delta="últimos 7 dias"
          deltaDir="up"
          icon="↑"
          spark={[3, 5, 4, 7, 6, 9, recent7d]}
        />
        <Kpi
          label="Novos sem contato"
          value={newCount}
          delta={newCount > 0 ? "atenção" : "tranquilo"}
          deltaDir={newCount > 0 ? "down" : "up"}
          icon="!"
          sparkColor="#E11D48"
          spark={[2, 3, 4, 4, 5, 6, newCount]}
        />
        <Kpi
          label="Score médio"
          value={avgScore}
          delta="dos leads"
          deltaDir="up"
          icon="◐"
          spark={[55, 58, 62, 60, 63, 64, avgScore]}
        />
        <Kpi
          label="Promovidos ao CRM"
          value={promoted}
          delta={
            rows.length > 0
              ? `${Math.round((promoted / rows.length) * 100)}% taxa`
              : "0% taxa"
          }
          deltaDir="up"
          icon="→"
          spark={[1, 2, 2, 3, 4, 3, promoted]}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 0,
          flexWrap: "wrap",
          padding: "10px 14px",
          background: "#fff",
          border: "1px solid var(--slate-200)",
          borderBottom: "0",
          borderRadius: "10px 10px 0 0",
        }}
      >
        <div className="toolbar__search" style={{ minWidth: 260 }}>
          <span className="mag">⌕</span>
          <input
            className="ds-input"
            placeholder="Buscar por nome, empresa, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div
          className="divider"
          style={{ width: 1, height: 22, background: "var(--slate-200)" }}
        />
        <button
          className={
            "chipfilter" + (setorFilter === "all" ? " active" : "")
          }
          onClick={() => setSetorFilter("all")}
        >
          Todos setores <span className="count">{rows.length}</span>
        </button>
        {(["saude", "educacao", "juridico", "tech"] as DashCategory[]).map(
          (s) => (
            <button
              key={s}
              className={"chipfilter" + (setorFilter === s ? " active" : "")}
              onClick={() => setSetorFilter(s)}
            >
              {SECTORS_LABEL[s]}{" "}
              <span className="count">
                {rows.filter((l) => l.category === s).length}
              </span>
            </button>
          )
        )}
        <div
          className="divider"
          style={{ width: 1, height: 22, background: "var(--slate-200)" }}
        />
        <select
          className="ds-input"
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          style={{ width: 160 }}
        >
          <option value="all">Todos estágios</option>
          {STAGES.filter((s) => s.key !== "reuniao").map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          className="ds-input"
          value={originFilter}
          onChange={(e) => setOriginFilter(e.target.value)}
          style={{ width: 160 }}
        >
          <option value="all">Todas origens</option>
          <option value="diagnostic_public">Diagnóstico</option>
          <option value="automacao">Automação</option>
          <option value="manual">Manual</option>
          <option value="indicacao">Indicação</option>
        </select>
        <select
          className="ds-input"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          style={{ width: 180 }}
        >
          <option value="priority">Ordenar: prioridade</option>
          <option value="score">Ordenar: score</option>
          <option value="recent">Ordenar: mais recentes</option>
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn-icon">+ Coluna</button>
        <button className="btn-icon">⤓ Importar</button>
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
            <span style={{ fontSize: 13 }}>leads selecionados</span>
            <span
              style={{
                width: 1,
                height: 18,
                background: "rgba(255,255,255,0.15)",
              }}
            />
            <button
              className="act"
              onClick={() => bulkPromote(Array.from(selected))}
            >
              → Promover ao CRM
            </button>
            <button className="act">↦ Atribuir owner</button>
            <button className="act">✉ Enviar email</button>
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
              <th style={{ width: 220 }}>
                Nome <span className="sort">↕</span>
              </th>
              <th style={{ width: 180 }}>Empresa</th>
              <th style={{ width: 90 }}>Setor</th>
              <th style={{ width: 110 }}>Score</th>
              <th style={{ width: 110 }}>Prioridade</th>
              <th style={{ width: 140 }}>Recomendação</th>
              <th style={{ width: 160 }}>Estágio</th>
              <th style={{ width: 90 }}>Owner</th>
              <th style={{ width: 110, textAlign: "right" }}>
                Última interação
              </th>
              <th style={{ width: 36 }} />
            </tr>
          </thead>
          <tbody>
            {visible.map((l) => (
              <LeadRowEl
                key={l.id}
                lead={l}
                selected={selected.has(l.id)}
                onToggle={() => toggleOne(l.id)}
                onOpen={() => router.push(`/dashboard/leads/${l.id}`)}
              />
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--ink-mute)",
                  }}
                >
                  Nenhum lead bate com os filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pager">
          <span>
            Mostrando{" "}
            <strong style={{ color: "var(--navy)" }}>
              {filtered.length === 0
                ? 0
                : (page - 1) * perPage + 1}
              –{Math.min(page * perPage, filtered.length)}
            </strong>{" "}
            de {filtered.length}
          </span>
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
            <button onClick={() => setPage(Math.min(pages, page + 1))}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function bulkPromote(ids: string[]) {
  try {
    await fetch("/api/leads/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, patch: { status: "contatado" } }),
    });
    window.location.reload();
  } catch (e) {
    alert("Falha ao promover leads.");
  }
}

function LeadRowEl({
  lead,
  selected,
  onToggle,
  onOpen,
}: {
  lead: LeadRow;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const owner = lead.assignee
    ? TEAM_COLORS[lead.assignee] || {
        initials: "?",
        color: "#94A3B8",
        name: "-",
      }
    : { initials: "·", color: "#94A3B8", name: "Sem owner" };
  const stage = lookupStageForLead(lead.status);
  const rec = leadRecommendation(lead.score);
  const isHot =
    typeof lead.priority === "number" &&
    lead.priority >= 75 &&
    Boolean(lead.requestedContact);
  return (
    <tr
      className={"row" + (selected ? " selected" : "")}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("input,button,a,label")) return;
        onOpen();
      }}
      style={{ cursor: "pointer" }}
    >
      <td className="cb" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={onToggle} />
      </td>
      <td>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 700,
            color: "var(--navy)",
            fontSize: 13,
          }}
        >
          {lead.name}
          {isHot && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#E11D48",
                background: "#FEE2E2",
                borderRadius: 999,
                padding: "1px 7px",
              }}
            >
              <span aria-hidden>★</span> Quente
            </span>
          )}
        </div>
        {lead.summary ? (
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-soft)",
              maxWidth: 280,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={lead.summary}
          >
            {lead.summary}
          </div>
        ) : (
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-soft)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {lead.email}
          </div>
        )}
      </td>
      <td>
        <div style={{ fontWeight: 600, color: "var(--ink)" }}>
          {lead.company || "-"}
        </div>
        {lead.phone && (
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-mute)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {lead.phone}
          </div>
        )}
      </td>
      <td>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
          {lead.category ? (
            <span className={`tag ${lead.category}`}>
              {SECTORS_LABEL[lead.category as DashCategory] || lead.category}
            </span>
          ) : (
            <span style={{ color: "var(--ink-mute)" }}>-</span>
          )}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.04em",
              padding: "2px 7px",
              borderRadius: 999,
              border: "1px solid var(--slate-200)",
              color: lead.source === "automacao" ? "var(--cyan-deep, #3BC8CF)" : "var(--ink-mute)",
              background: lead.source === "automacao" ? "rgba(82,225,231,0.10)" : "transparent",
            }}
          >
            {ORIGIN_LABEL[lead.source || ""] || lead.source || "—"}
          </span>
        </div>
      </td>
      <td>
        {typeof lead.score === "number" ? (
          <ScoreChip value={lead.score} />
        ) : (
          <span style={{ color: "var(--ink-mute)" }}>-</span>
        )}
      </td>
      <td>
        {typeof lead.priority === "number" ? (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 14,
              fontWeight: 800,
              color: priorityColor(lead.priority),
            }}
          >
            {lead.priority}
          </span>
        ) : (
          <span style={{ color: "var(--ink-mute)" }}>-</span>
        )}
      </td>
      <td>{rec ? <RecPill rec={rec} /> : <span style={{ color: "var(--ink-mute)" }}>-</span>}</td>
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
      <td className="num" style={{ color: "var(--ink-soft)" }}>
        {relativeDate(lead.lastTouch)}
      </td>
      <td>
        <button className="tb__icon" style={{ width: 26, height: 26 }}>
          ⋯
        </button>
      </td>
    </tr>
  );
}
