"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { TEAM_COLORS } from "@/lib/teamColors";
import { relativeDate } from "@/lib/dashboardData";

export interface Viewer {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
  team_key: string | null;
}

export interface WorkspaceStats {
  members: number;
  studies: number;
  leads: number;
}

export interface IntegrationStatus {
  anthropic: boolean;
  supabase: boolean;
  vercel: boolean;
  vercelEnv: string | null;
}

type TabKey = "perfil" | "workspace" | "convites" | "integracoes";

const TABS: { key: TabKey; label: string }[] = [
  { key: "perfil", label: "Perfil" },
  { key: "workspace", label: "Workspace" },
  { key: "convites", label: "Convites" },
  { key: "integracoes", label: "Integrações" },
];

const TEAM_KEYS = [
  "matheus",
  "luciano",
  "ana_flavia",
  "thiago",
  "leonardo",
  "marco",
  "kalley",
] as const;

export function ConfigView({
  viewer,
  stats,
  integrations,
}: {
  viewer: Viewer;
  stats: WorkspaceStats;
  integrations: IntegrationStatus;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = (sp.get("tab") as TabKey | null) || "perfil";
  const [tab, setTab] = useState<TabKey>(
    TABS.some((t) => t.key === initial) ? initial : "perfil"
  );

  useEffect(() => {
    const cur = sp.get("tab");
    if (cur !== tab) {
      const params = new URLSearchParams(sp.toString());
      params.set("tab", tab);
      router.replace(`/dashboard/config?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="page" data-screen-label="Configurações">
      <div className="page-head">
        <div>
          <h1 className="h-page">Configurações</h1>
          <p className="sub">Conta, workspace, convites e integrações.</p>
        </div>
      </div>

      <div
        style={{
          marginBottom: 22,
          display: "inline-flex",
          gap: 4,
          background: "#fff",
          border: "1px solid var(--slate-200)",
          padding: 4,
          borderRadius: 10,
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                border: 0,
                background: active
                  ? "linear-gradient(180deg,#0A1F44,#06122A)"
                  : "transparent",
                color: active ? "#fff" : "var(--ink-soft)",
                padding: "8px 14px",
                borderRadius: 7,
                fontFamily: "var(--font-sans)",
                fontWeight: active ? 800 : 600,
                fontSize: 12.5,
                cursor: "pointer",
                transition: "all 160ms",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "perfil" && <PerfilTab viewer={viewer} />}
      {tab === "workspace" && <WorkspaceTab stats={stats} viewer={viewer} />}
      {tab === "convites" && <ConvitesTab viewer={viewer} />}
      {tab === "integracoes" && <IntegracoesTab integrations={integrations} />}
    </div>
  );
}

function SectionHeader({
  num,
  title,
  sub,
}: {
  num: number;
  title: string;
  sub?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        className="overline"
        style={{ color: "var(--blue)", marginBottom: 4 }}
      >
        {String(num).padStart(2, "0")} · {title}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{sub}</div>
      )}
    </div>
  );
}

function PerfilTab({ viewer }: { viewer: Viewer }) {
  const router = useRouter();
  const [name, setName] = useState(viewer.name);
  const [teamKey, setTeamKey] = useState(viewer.team_key || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  const isOwner = viewer.role === "owner";

  async function saveProfile() {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const body: Record<string, string | null> = { name };
      if (isOwner) body.team_key = teamKey || null;
      const res = await fetch(`/api/profiles/${viewer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Falha");
      }
      setProfileMsg({ kind: "ok", text: "Dados atualizados." });
      router.refresh();
    } catch (e) {
      setProfileMsg({
        kind: "err",
        text: e instanceof Error ? e.message : "Erro",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setPwMsg(null);
    if (pwNew.length < 8) {
      setPwMsg({ kind: "err", text: "A nova senha precisa ter ao menos 8 caracteres." });
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwMsg({ kind: "err", text: "As senhas não conferem." });
      return;
    }
    setPwSaving(true);
    try {
      const sb = getBrowserSupabase();
      const { error } = await sb.auth.updateUser({ password: pwNew });
      if (error) throw error;
      setPwMsg({ kind: "ok", text: "Senha atualizada." });
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
    } catch (e) {
      setPwMsg({
        kind: "err",
        text: e instanceof Error ? e.message : "Erro",
      });
    } finally {
      setPwSaving(false);
    }
  }

  async function signOutAll() {
    if (!confirm("Sair de todos os dispositivos?")) return;
    const sb = getBrowserSupabase();
    await sb.auth.signOut({ scope: "global" });
    router.push("/login");
  }

  return (
    <div className="surface" style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <SectionHeader
        num={1}
        title="Dados pessoais"
        sub="Visíveis para o time."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          <div className="overline" style={{ marginBottom: 6 }}>
            Nome
          </div>
          <input
            className="ds-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          <div className="overline" style={{ marginBottom: 6 }}>
            Email
          </div>
          <input className="ds-input" value={viewer.email} disabled />
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-mute)",
              marginTop: 4,
            }}
          >
            Para mudar, contate o owner.
          </div>
        </label>
        <label>
          <div className="overline" style={{ marginBottom: 6 }}>
            Team key
          </div>
          <select
            className="ds-input"
            value={teamKey}
            disabled={!isOwner}
            onChange={(e) => setTeamKey(e.target.value)}
          >
            <option value="">sem team_key</option>
            {TEAM_KEYS.map((k) => (
              <option key={k} value={k}>
                {TEAM_COLORS[k].name}
              </option>
            ))}
          </select>
          {!isOwner && (
            <div
              style={{
                fontSize: 11,
                color: "var(--ink-mute)",
                marginTop: 4,
              }}
            >
              Apenas owner pode mudar.
            </div>
          )}
        </label>
        {profileMsg && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 12,
              background: profileMsg.kind === "ok" ? "#D1FAE5" : "#FEE2E2",
              color: profileMsg.kind === "ok" ? "#047857" : "#B91C1C",
            }}
          >
            {profileMsg.text}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="ds-btn ds-btn-primary"
            onClick={saveProfile}
            disabled={savingProfile}
          >
            {savingProfile ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: "var(--slate-200)",
          margin: "26px 0",
        }}
      />

      <SectionHeader num={2} title="Senha" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          <div className="overline" style={{ marginBottom: 6 }}>
            Senha atual
          </div>
          <input
            className="ds-input"
            type="password"
            value={pwCurrent}
            onChange={(e) => setPwCurrent(e.target.value)}
          />
        </label>
        <label>
          <div className="overline" style={{ marginBottom: 6 }}>
            Nova senha
          </div>
          <input
            className="ds-input"
            type="password"
            value={pwNew}
            onChange={(e) => setPwNew(e.target.value)}
          />
        </label>
        <label>
          <div className="overline" style={{ marginBottom: 6 }}>
            Confirmar
          </div>
          <input
            className="ds-input"
            type="password"
            value={pwConfirm}
            onChange={(e) => setPwConfirm(e.target.value)}
          />
        </label>
        {pwMsg && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 12,
              background: pwMsg.kind === "ok" ? "#D1FAE5" : "#FEE2E2",
              color: pwMsg.kind === "ok" ? "#047857" : "#B91C1C",
            }}
          >
            {pwMsg.text}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="ds-btn ds-btn-primary"
            onClick={changePassword}
            disabled={pwSaving}
          >
            {pwSaving ? "Atualizando..." : "Atualizar senha"}
          </button>
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: "var(--slate-200)",
          margin: "26px 0",
        }}
      />

      <SectionHeader
        num={3}
        title="Sair"
        sub="Termina a sessão neste e em todos os dispositivos."
      />
      <div>
        <button
          onClick={signOutAll}
          style={{
            background: "#FEE2E2",
            color: "#B91C1C",
            border: "1px solid #FCA5A5",
            padding: "8px 14px",
            borderRadius: 7,
            fontWeight: 700,
            fontSize: 12.5,
            cursor: "pointer",
          }}
        >
          Sair de todos os dispositivos
        </button>
      </div>
    </div>
  );
}

interface WorkspaceSettingsForm {
  slack_digest_webhook: string;
  calcom_url: string;
  studio_name: string;
  studio_email: string;
}

function WorkspaceTab({
  stats,
  viewer,
}: {
  stats: WorkspaceStats;
  viewer: Viewer;
}) {
  const canEdit = viewer.role === "owner" || viewer.role === "admin";
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<WorkspaceSettingsForm>({
    slack_digest_webhook: "",
    calcom_url: "",
    studio_name: "",
    studio_email: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/workspace");
        if (!res.ok) throw new Error("Falha ao carregar workspace.");
        const data = (await res.json()) as {
          settings: {
            slack_digest_webhook: string | null;
            calcom_url: string | null;
            studio_name: string | null;
            studio_email: string | null;
          };
        };
        if (!active) return;
        setForm({
          slack_digest_webhook: data.settings.slack_digest_webhook || "",
          calcom_url: data.settings.calcom_url || "",
          studio_name: data.settings.studio_name || "",
          studio_email: data.settings.studio_email || "",
        });
      } catch (e) {
        if (active) {
          setMsg({
            kind: "err",
            text: e instanceof Error ? e.message : "Erro",
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof WorkspaceSettingsForm>(
    key: K,
    value: WorkspaceSettingsForm[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Falha ao salvar.");
      setMsg({ kind: "ok", text: "Workspace atualizada." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Erro" });
    } finally {
      setSaving(false);
    }
  }

  async function testDigest() {
    setTesting(true);
    setTestMsg(null);
    try {
      const res = await fetch("/api/cron/daily-digest", { method: "POST" });
      const data = (await res.json()) as {
        ok?: boolean;
        skipped?: boolean;
        error?: string;
        sent?: number;
      };
      if (!res.ok) throw new Error(data.error || "Falha ao enviar digest.");
      if (data.skipped) {
        setTestMsg({
          kind: "ok",
          text: "Webhook não configurado. Configure e tente novamente.",
        });
      } else {
        setTestMsg({
          kind: "ok",
          text: `Digest enviado (${data.sent ?? 0} blocos).`,
        });
      }
    } catch (e) {
      setTestMsg({
        kind: "err",
        text: e instanceof Error ? e.message : "Erro",
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div
      className="ds-surface"
      style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: "linear-gradient(135deg,#52E1E7,#5D57EB)",
            color: "#0A1F44",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 20,
          }}
        >
          P
        </div>
        <div>
          <div
            style={{
              fontWeight: 800,
              color: "var(--navy)",
              fontSize: 17,
            }}
          >
            PRECEPTOR! Venture Studio
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-soft)",
              fontFamily: "var(--font-mono)",
            }}
          >
            preceptor-studio
          </div>
        </div>
        <span
          className="pill"
          style={{
            marginLeft: "auto",
            background: "rgba(82,225,231,0.15)",
            color: "#0E7490",
          }}
        >
          <span className="dot" style={{ background: "#0E7490" }} />
          Internal · Free
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 18,
        }}
      >
        {[
          { label: "Membros", value: stats.members },
          { label: "Estudos", value: stats.studies },
          { label: "Leads", value: stats.leads },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              border: "1px solid var(--slate-200)",
              padding: "12px 14px",
              borderRadius: 10,
            }}
          >
            <div className="overline" style={{ marginBottom: 6 }}>
              {s.label}
            </div>
            <div
              className="tabular"
              style={{
                fontWeight: 800,
                fontSize: 22,
                color: "var(--navy)",
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          height: 1,
          background: "var(--slate-200)",
          margin: "10px 0 22px",
        }}
      />

      <SectionHeader
        num={1}
        title="Identidade"
        sub="Aparecem em emails e PDFs."
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <label>
          <div className="overline" style={{ marginBottom: 6 }}>
            Studio name
          </div>
          <input
            className="ds-input"
            value={form.studio_name}
            disabled={!canEdit || loading}
            placeholder="PRECEPTOR! Venture Studio"
            onChange={(e) => update("studio_name", e.target.value)}
          />
        </label>
        <label>
          <div className="overline" style={{ marginBottom: 6 }}>
            Studio email
          </div>
          <input
            className="ds-input"
            type="email"
            value={form.studio_email}
            disabled={!canEdit || loading}
            placeholder="studio@preceptor.com.br"
            onChange={(e) => update("studio_email", e.target.value)}
          />
        </label>
      </div>

      <SectionHeader
        num={2}
        title="Integrações de funil"
        sub="Conecte Cal.com no resultado do diagnóstico e Slack para o digest diário."
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <label>
          <div className="overline" style={{ marginBottom: 6 }}>
            Cal.com URL
          </div>
          <input
            className="ds-input"
            value={form.calcom_url}
            disabled={!canEdit || loading}
            placeholder="https://cal.com/seu-time/diagnostico"
            onChange={(e) => update("calcom_url", e.target.value)}
          />
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-mute)",
              marginTop: 4,
            }}
          >
            URL do seu link de agendamento.
          </div>
        </label>
        <label>
          <div className="overline" style={{ marginBottom: 6 }}>
            Slack digest webhook
          </div>
          <input
            className="ds-input"
            value={form.slack_digest_webhook}
            disabled={!canEdit || loading}
            placeholder="https://hooks.slack.com/services/..."
            onChange={(e) => update("slack_digest_webhook", e.target.value)}
          />
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-mute)",
              marginTop: 4,
            }}
          >
            Webhook do canal interno onde chega o digest diário.
          </div>
        </label>
      </div>

      {msg && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 12,
            marginBottom: 12,
            background: msg.kind === "ok" ? "#D1FAE5" : "#FEE2E2",
            color: msg.kind === "ok" ? "#047857" : "#B91C1C",
          }}
        >
          {msg.text}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="ds-btn ds-btn-ghost"
          onClick={testDigest}
          disabled={testing || !canEdit}
        >
          {testing ? "Enviando..." : "Testar digest"}
        </button>
        <button
          className="ds-btn ds-btn-primary"
          onClick={save}
          disabled={saving || !canEdit || loading}
        >
          {saving ? "Salvando..." : "Salvar workspace"}
        </button>
      </div>
      {testMsg && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 12,
            background: testMsg.kind === "ok" ? "#D1FAE5" : "#FEE2E2",
            color: testMsg.kind === "ok" ? "#047857" : "#B91C1C",
          }}
        >
          {testMsg.text}
        </div>
      )}

      {!canEdit && (
        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            color: "var(--ink-mute)",
          }}
        >
          Apenas owner ou admin pode editar.
        </div>
      )}
    </div>
  );
}

interface InviteRow {
  token: string;
  email: string | null;
  role: "owner" | "admin" | "member";
  team_key: string | null;
  expires_at: string;
  created_at: string;
}

function ConvitesTab({ viewer }: { viewer: Viewer }) {
  const canManage = viewer.role === "owner" || viewer.role === "admin";
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "admin" | "member">("member");
  const [teamKey, setTeamKey] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [generated, setGenerated] = useState<{
    token: string;
    url: string;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/invites");
      if (res.ok) {
        const data = (await res.json()) as { invites: InviteRow[] };
        setInvites(data.invites);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canManage) void load();
    else setLoading(false);
  }, [canManage]);

  async function createInvite() {
    setCreating(true);
    setErr(null);
    setGenerated(null);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || null,
          role,
          team_key: teamKey || null,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        invite?: InviteRow;
        url?: string;
      };
      if (!res.ok || !data.invite || !data.url) {
        throw new Error(data.error || "Falha");
      }
      setGenerated({ token: data.invite.token, url: data.url });
      setEmail("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro");
    } finally {
      setCreating(false);
    }
  }

  async function revoke(token: string) {
    if (!confirm("Revogar este convite?")) return;
    const res = await fetch(`/api/invites/${token}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  }

  if (!canManage) {
    return (
      <div
        className="ds-surface"
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: 32,
          textAlign: "center",
        }}
      >
        <div className="overline" style={{ color: "#B91C1C", marginBottom: 6 }}>
          Acesso restrito
        </div>
        <div style={{ color: "var(--ink-soft)", fontSize: 13 }}>
          Apenas owner e admin podem gerenciar convites.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <div className="ds-surface" style={{ padding: 22, marginBottom: 14 }}>
        <SectionHeader
          num={1}
          title="Gerar convite"
          sub="Cria um token de signup com 14 dias de validade."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr auto",
            gap: 10,
            alignItems: "end",
          }}
        >
          <label>
            <div className="overline" style={{ marginBottom: 6 }}>
              Email (opcional)
            </div>
            <input
              className="ds-input"
              placeholder="pessoa@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            <div className="overline" style={{ marginBottom: 6 }}>
              Função
            </div>
            <select
              className="ds-input"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "owner" | "admin" | "member")
              }
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
              <option value="owner">owner</option>
            </select>
          </label>
          <label>
            <div className="overline" style={{ marginBottom: 6 }}>
              Team key
            </div>
            <select
              className="ds-input"
              value={teamKey}
              onChange={(e) => setTeamKey(e.target.value)}
            >
              <option value="">sem team_key</option>
              {TEAM_KEYS.map((k) => (
                <option key={k} value={k}>
                  {TEAM_COLORS[k].name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="ds-btn ds-btn-primary"
            onClick={createInvite}
            disabled={creating}
          >
            {creating ? "Gerando..." : "Gerar convite"}
          </button>
        </div>
        {err && (
          <div
            style={{
              marginTop: 12,
              padding: "8px 12px",
              background: "#FEE2E2",
              color: "#B91C1C",
              fontSize: 12,
              borderRadius: 8,
            }}
          >
            {err}
          </div>
        )}
        {generated && (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              background: "rgba(82,225,231,0.1)",
              border: "1px solid rgba(82,225,231,0.4)",
              borderRadius: 10,
            }}
          >
            <div
              className="overline"
              style={{ color: "#0E7490", marginBottom: 6 }}
            >
              Convite gerado
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <code
                style={{
                  flex: 1,
                  fontSize: 12,
                  background: "#fff",
                  border: "1px solid var(--slate-200)",
                  padding: "8px 10px",
                  borderRadius: 7,
                  fontFamily: "var(--font-mono)",
                  color: "var(--navy)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {generated.url}
              </code>
              <button
                className="ds-btn ds-btn-ghost"
                onClick={() => copy(generated.url, "new")}
              >
                {copied === "new" ? "Copiado" : "⧉ Copiar"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="tablewrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 220 }}>Token</th>
              <th>Email</th>
              <th style={{ width: 100 }}>Função</th>
              <th style={{ width: 140 }}>Team key</th>
              <th style={{ width: 120 }}>Expira em</th>
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: 24,
                    color: "var(--ink-mute)",
                  }}
                >
                  Carregando...
                </td>
              </tr>
            )}
            {!loading && invites.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: 24,
                    color: "var(--ink-mute)",
                  }}
                >
                  Nenhum convite pendente.
                </td>
              </tr>
            )}
            {!loading &&
              invites.map((i) => {
                const tc = i.team_key ? TEAM_COLORS[i.team_key] : null;
                return (
                  <tr key={i.token} className="row">
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <code
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--navy)",
                          }}
                        >
                          {i.token.slice(0, 12)}…
                        </code>
                        <button
                          className="tb__icon"
                          style={{ width: 22, height: 22, fontSize: 11 }}
                          onClick={() => copy(i.token, i.token)}
                          aria-label="Copiar token"
                        >
                          {copied === i.token ? "✓" : "⧉"}
                        </button>
                      </span>
                    </td>
                    <td style={{ color: "var(--ink-soft)" }}>
                      {i.email || "—"}
                    </td>
                    <td>
                      <span
                        className="pill"
                        style={{ background: "#F1F5F9", color: "#475569" }}
                      >
                        {i.role}
                      </span>
                    </td>
                    <td>
                      {tc ? (
                        <span
                          className="pill"
                          style={{
                            background: `${tc.color}22`,
                            color: tc.color,
                          }}
                        >
                          <span
                            className="dot"
                            style={{ background: tc.color }}
                          />
                          {tc.name}
                        </span>
                      ) : (
                        <span style={{ color: "var(--ink-mute)" }}>—</span>
                      )}
                    </td>
                    <td style={{ color: "var(--ink-soft)", fontSize: 12 }}>
                      {relativeDate(i.expires_at)}
                    </td>
                    <td>
                      <button
                        className="ds-btn ds-btn-ghost ds-btn-sm"
                        onClick={() => revoke(i.token)}
                      >
                        Revogar
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IntegracoesTab({
  integrations,
}: {
  integrations: IntegrationStatus;
}) {
  const cards = [
    {
      key: "anthropic",
      name: "Anthropic",
      letter: "A",
      bg: "linear-gradient(135deg,#D97757,#A14E36)",
      ok: integrations.anthropic,
      info: integrations.anthropic
        ? "ANTHROPIC_API_KEY configurada · ok há 2 min"
        : "Chave não configurada",
    },
    {
      key: "supabase",
      name: "Supabase",
      letter: "S",
      bg: "linear-gradient(135deg,#3ECF8E,#1E7A4E)",
      ok: integrations.supabase,
      info: "Auth + Postgres · ok há 2 min",
    },
    {
      key: "vercel",
      name: "Vercel",
      letter: "V",
      bg: "linear-gradient(135deg,#0A1F44,#000)",
      ok: integrations.vercel,
      info: integrations.vercel
        ? `Ambiente: ${integrations.vercelEnv || "production"} · ok`
        : "Rodando fora da Vercel",
    },
  ];

  const checks = [
    {
      label: "Geração de estudos",
      detail: "Claude Sonnet · prompts em prompts/",
      ok: integrations.anthropic,
    },
    {
      label: "Auth",
      detail: "Supabase cookies via @supabase/ssr",
      ok: true,
    },
    {
      label: "Storage de PDFs",
      detail: "Supabase Storage · bucket studies",
      ok: true,
    },
    {
      label: "Banco",
      detail: "Postgres · RLS ativo",
      ok: true,
    },
  ];

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.key}
            className="ds-surface"
            style={{
              padding: 18,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 38,
                height: 38,
                borderRadius: 10,
                background: c.bg,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 17,
              }}
            >
              {c.letter}
            </div>
            <div className="overline" style={{ marginBottom: 6 }}>
              Integração
            </div>
            <div
              style={{
                fontWeight: 800,
                color: "var(--navy)",
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              {c.name}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: c.ok ? "#10B981" : "#94A3B8",
                  boxShadow: c.ok ? "0 0 0 3px rgba(16,185,129,0.18)" : "none",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: c.ok ? "#047857" : "var(--ink-mute)",
                }}
              >
                {c.ok ? "Online" : "Offline"}
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
              {c.info}
            </div>
          </div>
        ))}
      </div>

      <div className="ds-surface" style={{ padding: 18 }}>
        <SectionHeader num={1} title="Health checks" />
        <div
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          {checks.map((ch) => (
            <div
              key={ch.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 10px",
                border: "1px solid var(--slate-200)",
                borderRadius: 8,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: ch.ok ? "#10B981" : "#E11D48",
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "var(--navy)",
                  }}
                >
                  {ch.label}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                  {ch.detail}
                </div>
              </div>
              <span
                className="pill"
                style={{
                  background: ch.ok ? "#D1FAE5" : "#FEE2E2",
                  color: ch.ok ? "#047857" : "#B91C1C",
                }}
              >
                {ch.ok ? "ok" : "off"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
