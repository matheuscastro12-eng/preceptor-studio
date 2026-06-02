"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CategoryIcon,
  StatusPill,
  ScoreChip,
  RecPill,
  SECTORS_LABEL,
  type DashCategory,
} from "@/components/dashboard/Shared";
import { Kpi } from "@/components/dashboard/Kpi";

export interface StudyRow {
  id: string;
  title: string;
  client: string;
  category: string;
  status: string;
  created_at: string;
  overall: number | null;
  recommendation: "ENTRAR" | "OBSERVAR" | "NAO_ENTRAR" | null;
}

export function StudiesView({ rows }: { rows: StudyRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");

  const filtered = useMemo(() => {
    const out = rows.filter((s) => {
      if (filterCat !== "all" && s.category !== filterCat) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !s.title.toLowerCase().includes(q) &&
          !s.client.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
    if (sortBy === "score")
      out.sort((a, b) => (b.overall ?? -1) - (a.overall ?? -1));
    else out.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return out;
  }, [rows, filterCat, filterStatus, search, sortBy]);

  const completed = rows.filter((s) => s.status === "completed").length;
  const generating = rows.filter((s) => s.status === "generating").length;
  const withScore = rows.filter((s) => s.overall !== null);
  const avgScore =
    withScore.length > 0
      ? Math.round(
          withScore.reduce((a, b) => a + (b.overall || 0), 0) /
            withScore.length
        )
      : 0;

  const allSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  function toggleAll() {
    const n = new Set(selected);
    if (allSelected) filtered.forEach((s) => n.delete(s.id));
    else filtered.forEach((s) => n.add(s.id));
    setSelected(n);
  }
  function toggleOne(id: string) {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setSelected(n);
  }

  return (
    <div className="page" data-screen-label="Estudos">
      <div className="page-head">
        <div>
          <h1 className="h-page">
            Estudos{" "}
            <span style={{ color: "var(--ink-mute)", fontWeight: 500 }}>
              · {filtered.length}
            </span>
          </h1>
          <p className="sub">
            Histórico completo de diagnósticos estratégicos. Filtre, busque,
            exporte ou crie um novo do zero.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ds-btn ds-btn-ghost">▾ Visão</button>
          <button className="ds-btn ds-btn-ghost">↗ Exportar</button>
          <Link className="ds-btn ds-btn-primary" href="/dashboard/new">
            + Novo Estudo
          </Link>
        </div>
      </div>

      <div className="kpis">
        <Kpi
          label="Total de estudos"
          value={rows.length}
          delta={`${rows.length} no acervo`}
          deltaDir="up"
          icon="◆"
          spark={[3, 5, 6, 7, 7, 8, rows.length]}
        />
        <Kpi
          label="Concluídos"
          value={completed}
          delta={
            rows.length > 0
              ? `${Math.round((completed / rows.length) * 100)}% taxa`
              : "0% taxa"
          }
          deltaDir="up"
          icon="✓"
          spark={[1, 2, 2, 3, 3, 4, completed]}
        />
        <Kpi
          label="Em geração"
          value={generating}
          delta={generating > 0 ? "atenção" : "tranquilo"}
          deltaDir={generating > 0 ? "down" : "up"}
          icon="◐"
          sparkColor="#B964FF"
          spark={[0, 1, 0, 1, 1, 1, generating]}
        />
        <Kpi
          label="Score médio"
          value={avgScore}
          delta="dos finalizados"
          deltaDir="up"
          icon="↑"
          spark={[58, 60, 62, 63, 64, 65, avgScore]}
        />
      </div>

      <div className="toolbar">
        <div className="toolbar__search">
          <span className="mag">⌕</span>
          <input
            className="ds-input"
            placeholder="Buscar estudo, cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="divider" />
        <button
          className={"chipfilter" + (filterCat === "all" ? " active" : "")}
          onClick={() => setFilterCat("all")}
        >
          Todos <span className="count">{rows.length}</span>
        </button>
        {(["saude", "educacao", "juridico", "tech"] as DashCategory[]).map((s) => (
          <button
            key={s}
            className={"chipfilter" + (filterCat === s ? " active" : "")}
            onClick={() => setFilterCat(s)}
          >
            {SECTORS_LABEL[s]}{" "}
            <span className="count">
              {rows.filter((x) => x.category === s).length}
            </span>
          </button>
        ))}
        <div className="divider" />
        <select
          className="ds-input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: 150 }}
        >
          <option value="all">Todos status</option>
          <option value="draft">Rascunho</option>
          <option value="questionnaire">Questionário</option>
          <option value="generating">Gerando</option>
          <option value="completed">Concluído</option>
          <option value="archived">Arquivado</option>
        </select>
        <div className="grow" />
        <select
          className="ds-input"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "score")}
          style={{ width: 130 }}
        >
          <option value="date">Mais recentes</option>
          <option value="score">Maior score</option>
        </select>
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
            <span style={{ fontSize: 13 }}>estudos selecionados</span>
            <span
              style={{
                width: 1,
                height: 18,
                background: "rgba(255,255,255,0.15)",
              }}
            />
            <button className="act">↓ Baixar PDFs</button>
            <button className="act">↻ Regenerar</button>
            <button className="act">↦ Mover para arquivo</button>
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
              <th>Estudo</th>
              <th style={{ width: 140 }}>Cliente</th>
              <th style={{ width: 90 }}>Setor</th>
              <th style={{ width: 130 }}>Status</th>
              <th style={{ width: 110 }}>Score</th>
              <th style={{ width: 140 }}>Recomendação</th>
              <th style={{ width: 110, textAlign: "right" }}>Criado</th>
              <th style={{ width: 36 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <StudyRowEl
                key={s.id}
                study={s}
                selected={selected.has(s.id)}
                onToggle={() => toggleOne(s.id)}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: 40, color: "var(--ink-mute)" }}>
                  Nenhum estudo bate com os filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pager">
          <span>
            Mostrando{" "}
            <strong style={{ color: "var(--navy)" }}>{filtered.length}</strong>{" "}
            de {rows.length}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
            atualizado há instantes
          </span>
        </div>
      </div>
    </div>
  );
}

function StudyRowEl({
  study,
  selected,
  onToggle,
}: {
  study: StudyRow;
  selected: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  return (
    <tr
      className={"row" + (selected ? " selected" : "")}
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t.tagName === "INPUT" || t.tagName === "BUTTON") return;
        router.push(`/dashboard/study/${study.id}`);
      }}
    >
      <td className="cb" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={onToggle} />
      </td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CategoryIcon category={study.category} size={28} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                color: "var(--navy)",
                fontSize: 13,
                lineHeight: 1.3,
              }}
            >
              {study.title}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--ink-mute)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {study.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </div>
      </td>
      <td>
        <span style={{ fontWeight: 600 }}>{study.client}</span>
      </td>
      <td>
        <span className={`tag ${study.category}`}>
          {SECTORS_LABEL[study.category as DashCategory] || study.category}
        </span>
      </td>
      <td>
        <StatusPill status={study.status} />
      </td>
      <td>
        {typeof study.overall === "number" ? (
          <ScoreChip value={study.overall} />
        ) : (
          <span style={{ color: "var(--ink-mute)" }}>-</span>
        )}
      </td>
      <td>
        {study.recommendation ? (
          <RecPill rec={study.recommendation} />
        ) : (
          <span style={{ color: "var(--ink-mute)" }}>-</span>
        )}
      </td>
      <td className="num" style={{ color: "var(--ink-soft)" }}>
        {new Date(study.created_at).toLocaleDateString("pt-BR")}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <button className="tb__icon" style={{ width: 26, height: 26 }}>
          ⋯
        </button>
      </td>
    </tr>
  );
}
