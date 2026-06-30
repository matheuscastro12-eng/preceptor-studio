"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ScoreDonut } from "@/components/ScoreDonut";
import { ScoreRadarKit } from "@/components/ScoreRadarKit";
import { LeadStatusPill } from "@/components/LeadStatusPill";
import { LEAD_STATUSES, categoryLabel, type Lead, type LeadStatus } from "@/lib/leads";
import { TEAM_COLORS } from "@/lib/teamColors";
import { scoreLabel } from "@/lib/diagnosticScore";

type InternalMeta = {
  recommendation?: "ENTRAR" | "OBSERVAR" | "NAO_ENTRAR" | string;
  recommendationReason?: string;
  headline?: string;
};

function recPillStyle(rec: string | undefined): { bg: string; fg: string; label: string } {
  if (rec === "ENTRAR") return { bg: "#D1FAE5", fg: "#10B981", label: "ENTRAR" };
  if (rec === "NAO_ENTRAR") return { bg: "#FEE2E2", fg: "#E11D48", label: "NÃO ENTRAR" };
  return { bg: "#CFFAFE", fg: "#3BC8CF", label: "OBSERVAR" };
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [answersOpen, setAnswersOpen] = useState(false);
  const [regenSummary, setRegenSummary] = useState(false);
  const [promoting, setPromoting] = useState(false);

  async function promote() {
    if (!lead || promoting) return;
    setPromoting(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/promote`, { method: "POST" });
      const data = (await res.json()) as { venture?: { id: string }; error?: string };
      if (data.venture) router.push(`/dashboard/ventures/${data.venture.id}`);
      else if (data.error) alert(data.error);
    } finally {
      setPromoting(false);
    }
  }

  async function regenerateSummary() {
    if (!lead || regenSummary) return;
    setRegenSummary(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/summary`, { method: "POST" });
      const data = (await res.json()) as { lead?: Lead; error?: string };
      if (data.lead) setLead(data.lead);
      else if (data.error) alert(data.error);
    } finally {
      setRegenSummary(false);
    }
  }

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    fetch(`/api/leads/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.lead) {
          setLead(d.lead);
          setNotes(d.lead.notes || "");
        } else {
          setError(d.error || "Lead não encontrado");
        }
      })
      .finally(() => setLoading(false));
  }, [params?.id]);

  async function patch(update: Partial<Lead>) {
    if (!lead) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      const data = await res.json();
      if (data.lead) setLead(data.lead);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!lead) return;
    if (!confirm("Excluir este lead? A ação é irreversível.")) return;
    await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
    router.push("/dashboard/leads");
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="surface rounded-2xl h-40 shimmer" />
      </div>
    );
  }
  if (!lead) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-ink-soft">{error || "Lead não encontrado."}</p>
        <Link href="/dashboard/leads" className="btn-pill btn-pill--ghost mt-4 inline-flex">
          <span className="btn-pill__icon">←</span>
          Voltar à lista
        </Link>
      </div>
    );
  }

  const score = lead.diagnostic_score ?? 0;
  const assignee = lead.assignee ? TEAM_COLORS[lead.assignee] : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <Link
        href="/dashboard/leads"
        className="text-xs uppercase tracking-widest font-bold text-ink-mute hover:text-blue inline-flex items-center gap-2"
      >
        ← Voltar para leads
      </Link>

      <div
        className="rounded-3xl p-8"
        style={{
          background: "var(--grad-ambient-dark)",
          color: "#fff",
          boxShadow: "var(--sh-card-lg)",
        }}
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-0">
            <span className="eyebrow" style={{ color: "var(--cyan)" }}>
              Lead
            </span>
            <h1 className="display-md mt-3" style={{ color: "#fff" }}>
              {lead.name}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              {lead.company || "Sem empresa"} · {categoryLabel(lead.category)}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <LeadStatusPill status={lead.status} />
              {assignee && (
                <span
                  className="pill-status"
                  style={{ background: assignee.color, color: assignee.textColor }}
                >
                  {assignee.initials} {assignee.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            {typeof lead.diagnostic_score === "number" && (
              <>
                <ScoreDonut value={score} size={120} strokeWidth={10} light />
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-cyan">
                    Score
                  </div>
                  <div className="text-3xl font-black text-white tabular-nums">
                    {scoreLabel(score)}
                  </div>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={promote}
              disabled={promoting}
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                padding: "12px 18px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.25)",
                cursor: promoting ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
            >
              {promoting ? "Convertendo..." : "Virar venture"}
              <span style={{ fontWeight: 900 }}>→</span>
            </button>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/new?lead_id=${lead.id}`)}
              style={{
                background: "var(--cyan)",
                color: "var(--navy-deep)",
                fontWeight: 800,
                fontSize: 13,
                padding: "12px 18px",
                borderRadius: 999,
                border: 0,
                cursor: "pointer",
                boxShadow: "var(--glow-cyan)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
            >
              Gerar estudo estratégico
              <span style={{ fontWeight: 900 }}>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resumo do lead em 1 frase */}
      <div
        className="rounded-2xl p-5 flex items-start justify-between gap-4 flex-wrap"
        style={{
          background: "rgba(82,225,231,0.08)",
          border: "1px solid rgba(82,225,231,0.28)",
        }}
      >
        <div className="min-w-0">
          <div
            className="text-[10px] uppercase tracking-widest font-bold mb-1"
            style={{ color: "var(--cyan-deep, #1FB6BD)" }}
          >
            Resumo comercial
          </div>
          <p className="text-sm font-semibold text-ink m-0">
            {lead.summary_line || "Resumo ainda não gerado para este lead."}
          </p>
        </div>
        <button
          type="button"
          className="btn-pill btn-pill--ghost shrink-0"
          style={{ fontSize: 11.5 }}
          onClick={regenerateSummary}
          disabled={regenSummary}
        >
          {regenSummary ? "Gerando..." : "Regenerar resumo"}
          <span className="btn-pill__icon">↻</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Diagnóstico recap */}
          {(typeof lead.diagnostic_score === "number" ||
            (Array.isArray(lead.diagnostic_axes) && lead.diagnostic_axes.length > 0)) && (
            <div className="surface rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="eyebrow">Diagnóstico do lead</div>
                {(() => {
                  const internal = (lead.diagnostic_answers?.__internal ?? {}) as InternalMeta;
                  if (!internal.recommendation) return null;
                  const s = recPillStyle(internal.recommendation);
                  return (
                    <span
                      style={{
                        background: s.bg,
                        color: s.fg,
                        fontWeight: 800,
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        padding: "4px 10px",
                        borderRadius: 999,
                      }}
                    >
                      {s.label}
                    </span>
                  );
                })()}
              </div>
              <div className="flex items-center gap-5 flex-wrap">
                {typeof lead.diagnostic_score === "number" && (
                  <ScoreDonut value={score} size={80} strokeWidth={8} />
                )}
                <div style={{ flex: 1, minWidth: 220 }}>
                  {(() => {
                    const internal = (lead.diagnostic_answers?.__internal ?? {}) as InternalMeta;
                    return internal.headline ? (
                      <p className="text-sm text-ink leading-relaxed m-0">{internal.headline}</p>
                    ) : (
                      <p className="text-sm text-ink-soft m-0">
                        Score {scoreLabel(score)} a partir do diagnóstico público.
                      </p>
                    );
                  })()}
                </div>
              </div>
              {Array.isArray(lead.diagnostic_axes) && lead.diagnostic_axes.length > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 8,
                  }}
                >
                  {lead.diagnostic_axes.slice(0, 5).map((a) => (
                    <div
                      key={a.label}
                      style={{
                        padding: "8px 10px",
                        background: "rgba(82,225,231,0.06)",
                        border: "1px solid rgba(82,225,231,0.18)",
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--ink-mute)",
                        }}
                      >
                        {a.label}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 16,
                          fontWeight: 800,
                          color: "var(--navy)",
                          marginTop: 2,
                        }}
                      >
                        {a.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {lead.diagnostic_answers && Object.keys(lead.diagnostic_answers).length > 0 && (
                <button
                  type="button"
                  onClick={() => setAnswersOpen((v) => !v)}
                  className="btn-pill btn-pill--ghost"
                  style={{ marginTop: 14, fontSize: 11.5 }}
                >
                  {answersOpen ? "Ocultar respostas completas" : "Ver respostas completas"}
                  <span className="btn-pill__icon">{answersOpen ? "↑" : "↓"}</span>
                </button>
              )}
            </div>
          )}

          {/* Radar */}
          {Array.isArray(lead.diagnostic_axes) && lead.diagnostic_axes.length > 0 && (
            <div className="surface rounded-2xl p-6">
              <div className="eyebrow mb-3">Visão geral · 5 eixos</div>
              <div className="flex justify-center">
                <ScoreRadarKit data={lead.diagnostic_axes} size={360} />
              </div>
            </div>
          )}

          {/* Q&A */}
          {answersOpen && lead.diagnostic_answers && Object.keys(lead.diagnostic_answers).length > 0 && (
            <div className="surface rounded-2xl p-6">
              <div className="eyebrow mb-4">Respostas do diagnóstico</div>
              <div className="space-y-4">
                {Object.entries(lead.diagnostic_answers)
                  .filter(([k]) => !k.startsWith("__"))
                  .map(([k, v]) => (
                    <div key={k} className="border-l-2 border-cyan-soft pl-4">
                      <div className="text-[10px] uppercase tracking-widest font-bold text-ink-mute font-mono">
                        {k}
                      </div>
                      <div className="text-sm text-ink mt-1">
                        {typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "")}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {Array.isArray(lead.diagnostic_insights) && lead.diagnostic_insights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lead.diagnostic_insights.map((ins, i) => {
                const isWarning = ins.kind === "warning";
                return (
                  <div
                    key={i}
                    className="rounded-xl p-4"
                    style={{
                      background: isWarning ? "rgba(245,158,11,0.08)" : "rgba(82,225,231,0.08)",
                      borderLeft: `3px solid ${isWarning ? "#F59E0B" : "#52E1E7"}`,
                    }}
                  >
                    <div
                      className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded mb-2"
                      style={{
                        background: isWarning ? "#F59E0B" : "#52E1E7",
                        color: "#06122A",
                      }}
                    >
                      {ins.label}
                    </div>
                    <p className="text-sm text-ink-soft leading-relaxed m-0">{ins.body}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Contato */}
          <div className="surface rounded-2xl p-5">
            <div className="eyebrow mb-3">Contato</div>
            <dl className="space-y-2 text-sm">
              <ContactRow label="Email" value={lead.email} mono />
              <ContactRow label="Telefone" value={lead.phone || "-"} mono />
              <ContactRow label="Empresa" value={lead.company || "-"} />
              <ContactRow label="Categoria" value={categoryLabel(lead.category)} />
              <ContactRow label="Origem" value={lead.source} mono />
            </dl>
          </div>

          {/* Pipeline */}
          <div className="surface rounded-2xl p-5">
            <div className="eyebrow mb-3">Pipeline</div>
            <div className="grid grid-cols-2 gap-2">
              {LEAD_STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  disabled={saving || s.value === lead.status}
                  onClick={() => patch({ status: s.value as LeadStatus })}
                  className="text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition border"
                  style={{
                    background: s.value === lead.status ? s.color : "#fff",
                    color: s.value === lead.status ? "#fff" : s.color,
                    borderColor: s.color,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Atribuição */}
          <div className="surface rounded-2xl p-5">
            <div className="eyebrow mb-3">Atribuído a</div>
            <select
              value={lead.assignee || ""}
              onChange={(e) => patch({ assignee: e.target.value || null })}
              className="input-field"
              disabled={saving}
            >
              <option value="">Sem atribuição</option>
              {Object.entries(TEAM_COLORS).map(([key, t]) => (
                <option key={key} value={key}>
                  {t.name} · {t.role}
                </option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div className="surface rounded-2xl p-5">
            <div className="eyebrow mb-3">Notas internas</div>
            <textarea
              className="input"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contexto, próximo passo, contatos..."
            />
            <button
              type="button"
              className="btn-pill btn-pill--primary mt-3"
              disabled={saving || notes === (lead.notes || "")}
              onClick={() => patch({ notes })}
            >
              Salvar notas
              <span className="btn-pill__icon">✓</span>
            </button>
          </div>

          <button
            type="button"
            className="text-xs uppercase tracking-widest font-bold text-danger-rose hover:underline"
            onClick={remove}
          >
            Excluir lead
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[10px] uppercase tracking-widest font-bold text-ink-mute shrink-0">
        {label}
      </dt>
      <dd className={`text-ink ${mono ? "font-mono text-xs" : "text-sm"} text-right truncate`}>
        {value}
      </dd>
    </div>
  );
}
