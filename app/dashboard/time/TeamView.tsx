"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Kpi } from "@/components/dashboard/Kpi";
import { TEAM_COLORS } from "@/lib/teamColors";
import { relativeDate } from "@/lib/dashboardData";

export interface MemberRow {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
  team_key: string | null;
  teamName: string | null;
  teamColor: string;
  teamInitials: string;
  activeTasks: number;
  leadsInFunnel: number;
  hoursAllocated: number;
  lastActivity: string | null;
}

export interface CapacityRow {
  key: string;
  name: string;
  color: string;
  hours: number;
  capacity: number;
}

interface TeamViewProps {
  members: MemberRow[];
  capacity: CapacityRow[];
  kpis: {
    activeMembers: number;
    totalActiveTasks: number;
    totalLeadsInFunnel: number;
    totalHours: number;
  };
  viewerRole: "owner" | "admin" | "member";
}

const TEAM_KEYS = [
  "matheus",
  "luciano",
  "ana_flavia",
  "thiago",
  "leonardo",
  "marco",
  "kalley",
] as const;

const ROLE_STYLES: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  owner: { bg: "rgba(82,225,231,0.18)", color: "#0A1F44", label: "OWNER" },
  admin: { bg: "rgba(185,100,255,0.18)", color: "#6D28D9", label: "ADMIN" },
  member: { bg: "#F1F5F9", color: "#475569", label: "MEMBER" },
};

function RolePill({ role }: { role: string }) {
  const s = ROLE_STYLES[role] || ROLE_STYLES.member;
  return (
    <span className="pill" style={{ background: s.bg, color: s.color }}>
      <span className="dot" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

function TeamKeyChip({
  team_key,
  color,
  name,
}: {
  team_key: string | null;
  color: string;
  name: string | null;
}) {
  if (!team_key) {
    return (
      <span
        className="pill"
        style={{ background: "#F1F5F9", color: "#94A3B8" }}
      >
        sem team_key
      </span>
    );
  }
  return (
    <span
      className="pill"
      style={{ background: `${color}22`, color: color }}
    >
      <span className="dot" style={{ background: color }} />
      {name || team_key}
    </span>
  );
}

export function TeamView({
  members,
  capacity,
  kpis,
  viewerRole,
}: TeamViewProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>("member");
  const [editTeamKey, setEditTeamKey] = useState<string>("");
  const [editName, setEditName] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxTasks = useMemo(
    () => Math.max(1, ...members.map((m) => m.activeTasks)),
    [members]
  );

  const editing = members.find((m) => m.id === editingId) || null;
  const isOwner = viewerRole === "owner";

  function openEdit(m: MemberRow) {
    setEditingId(m.id);
    setEditRole(m.role);
    setEditTeamKey(m.team_key || "");
    setEditName(m.name);
    setError(null);
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string | null> = { name: editName };
      if (isOwner) {
        body.role = editRole;
        body.team_key = editTeamKey || null;
      }
      const res = await fetch(`/api/profiles/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Falha ao salvar");
      }
      setEditingId(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page" data-screen-label="Time">
      <div className="page-head">
        <div>
          <h1 className="h-page">
            Time{" "}
            <span style={{ color: "var(--ink-mute)", fontWeight: 500 }}>
              · {members.length}
            </span>
          </h1>
          <p className="sub">
            Os 7 membros do estúdio. Owner edita papel e atribuição.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            className="ds-btn ds-btn-primary"
            href="/dashboard/config?tab=convites"
          >
            + Convidar membro
          </a>
        </div>
      </div>

      <div className="kpis">
        <Kpi
          label="Membros ativos"
          value={kpis.activeMembers}
          delta={`${members.length} total`}
          deltaDir="up"
          icon="◉"
          spark={[2, 3, 4, 5, 6, 7, kpis.activeMembers]}
        />
        <Kpi
          label="Tasks em execução"
          value={kpis.totalActiveTasks}
          delta="pelo time"
          deltaDir="up"
          icon="▦"
          spark={[5, 8, 10, 12, 14, 13, kpis.totalActiveTasks]}
        />
        <Kpi
          label="Leads atribuídos"
          value={kpis.totalLeadsInFunnel}
          delta="no funil"
          deltaDir="up"
          icon="◐"
          spark={[3, 4, 6, 7, 8, 9, kpis.totalLeadsInFunnel]}
        />
        <Kpi
          label="Horas alocadas"
          value={`${Math.round(kpis.totalHours)}h`}
          delta="na sprint"
          deltaDir="up"
          icon="⌚"
          spark={[20, 40, 60, 80, 90, 100, Math.round(kpis.totalHours)]}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 14,
          alignItems: "start",
        }}
      >
        <div className="tablewrap" style={{ borderRadius: 10 }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 240 }}>Membro</th>
                <th style={{ width: 110 }}>Função</th>
                <th style={{ width: 140 }}>Time key</th>
                <th style={{ width: 150 }}>Tasks ativas</th>
                <th style={{ width: 110 }}>Leads no funil</th>
                <th style={{ width: 110, textAlign: "right" }}>
                  Horas
                </th>
                <th style={{ width: 110, textAlign: "right" }}>
                  Última atividade
                </th>
                <th style={{ width: 36 }} />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.id}
                  className="row"
                  onClick={() => openEdit(m)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        className="avatar"
                        style={{
                          width: 32,
                          height: 32,
                          fontSize: 11,
                          background: m.teamColor,
                        }}
                      >
                        {m.teamInitials}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--navy)",
                            fontSize: 13,
                          }}
                        >
                          {m.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--ink-soft)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {m.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <RolePill role={m.role} />
                  </td>
                  <td>
                    <TeamKeyChip
                      team_key={m.team_key}
                      color={m.teamColor}
                      name={m.teamName}
                    />
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        className="tabular"
                        style={{
                          fontWeight: 700,
                          minWidth: 22,
                          color: "var(--navy)",
                        }}
                      >
                        {m.activeTasks}
                      </span>
                      <span className="stagebar" style={{ flex: 1 }}>
                        <div
                          style={{
                            background: m.teamColor,
                            width: `${(m.activeTasks / maxTasks) * 100}%`,
                          }}
                        />
                      </span>
                    </div>
                  </td>
                  <td className="tabular" style={{ color: "var(--navy)" }}>
                    {m.leadsInFunnel}
                  </td>
                  <td className="num">
                    {Math.round(m.hoursAllocated)}h
                  </td>
                  <td
                    className="num"
                    style={{ color: "var(--ink-soft)", fontWeight: 500 }}
                  >
                    {relativeDate(m.lastActivity)}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="tb__icon"
                      style={{ width: 26, height: 26 }}
                      onClick={() => openEdit(m)}
                      aria-label="Editar membro"
                    >
                      ⋯
                    </button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "var(--ink-mute)",
                    }}
                  >
                    Nenhum membro cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ds-surface" style={{ padding: 16 }}>
          <div
            className="overline"
            style={{ marginBottom: 4, color: "var(--ink-soft)" }}
          >
            Capacidade do time
          </div>
          <h3 className="h-section" style={{ marginBottom: 14 }}>
            Sprint atual
          </h3>
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-mute)",
              marginBottom: 10,
            }}
          >
            Horas alocadas vs {capacity[0]?.capacity ?? 80}h por pessoa (2
            semanas).
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {capacity.map((c) => {
              const pct = Math.min(100, (c.hours / c.capacity) * 100);
              const bar =
                pct > 90 ? "#E11D48" : pct > 60 ? "#F59E0B" : "#10B981";
              return (
                <div key={c.key}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: c.color,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--ink)",
                        }}
                      >
                        {c.name}
                      </span>
                    </div>
                    <span
                      className="tabular"
                      style={{
                        fontSize: 11,
                        color: "var(--ink-soft)",
                        fontWeight: 700,
                      }}
                    >
                      {Math.round(c.hours)}h / {c.capacity}h
                    </span>
                  </div>
                  <span className="stagebar">
                    <div style={{ background: bar, width: `${pct}%` }} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setEditingId(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,31,68,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="ds-surface"
            style={{
              width: "min(520px, 100%)",
              padding: 22,
              borderRadius: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <span
                className="avatar"
                style={{
                  width: 40,
                  height: 40,
                  fontSize: 13,
                  background: editing.teamColor,
                }}
              >
                {editing.teamInitials}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: "var(--navy)",
                  }}
                >
                  {editing.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ink-soft)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {editing.email}
                </div>
              </div>
              <button
                className="tb__icon"
                style={{ width: 28, height: 28 }}
                onClick={() => setEditingId(null)}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <label style={{ display: "block" }}>
                <div className="overline" style={{ marginBottom: 6 }}>
                  Nome
                </div>
                <input
                  className="ds-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </label>

              <label style={{ display: "block" }}>
                <div className="overline" style={{ marginBottom: 6 }}>
                  Função
                </div>
                <select
                  className="ds-input"
                  value={editRole}
                  disabled={!isOwner}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="owner">owner</option>
                  <option value="admin">admin</option>
                  <option value="member">member</option>
                </select>
                {!isOwner && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--ink-mute)",
                      marginTop: 4,
                    }}
                  >
                    Apenas owner pode alterar a função.
                  </div>
                )}
              </label>

              <label style={{ display: "block" }}>
                <div className="overline" style={{ marginBottom: 6 }}>
                  Team key
                </div>
                <select
                  className="ds-input"
                  value={editTeamKey}
                  disabled={!isOwner}
                  onChange={(e) => setEditTeamKey(e.target.value)}
                >
                  <option value="">sem team_key</option>
                  {TEAM_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {TEAM_COLORS[k].name}
                    </option>
                  ))}
                </select>
              </label>

              {error && (
                <div
                  style={{
                    background: "#FEE2E2",
                    color: "#B91C1C",
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 6,
                }}
              >
                <button
                  className="ds-btn ds-btn-ghost"
                  onClick={() => setEditingId(null)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className="ds-btn ds-btn-primary"
                  onClick={save}
                  disabled={saving}
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
