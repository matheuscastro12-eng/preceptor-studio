"use client";

import { useCallback, useEffect, useState } from "react";
import { TEAM_COLORS } from "@/lib/teamColors";

export interface StudyComment {
  id: string;
  study_id: string;
  section: string | null;
  anchor: string | null;
  body: string;
  author_id: string | null;
  author_name: string | null;
  parent_id: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return date.toLocaleDateString("pt-BR");
}

function initialsFor(name: string | null): string {
  const n = (name || "?").trim();
  if (!n) return "?";
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFor(name: string | null): { bg: string; fg: string } {
  if (!name) return { bg: "#E2E8F0", fg: "#0A1F44" };
  const slug = name.toLowerCase().split(/\s+/)[0];
  const team = TEAM_COLORS[slug];
  if (team) return { bg: team.color, fg: team.textColor };
  return { bg: "#E2E8F0", fg: "#0A1F44" };
}

const SECTION_LABEL: Record<string, string> = {
  estudo: "ESTUDO",
  diagnostico: "DIAGNÓSTICO",
  tese: "TESE INTERNA",
  marca: "MARCA",
  comercial: "COMERCIAL",
  execucao: "EXECUÇÃO",
};

export function CommentsSidebar({
  studyId,
  section,
}: {
  studyId: string;
  section: string;
}) {
  const [comments, setComments] = useState<StudyComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/studies/${studyId}/comments?section=${encodeURIComponent(section)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = (await res.json()) as { comments: StudyComment[] };
        setComments(data.comments || []);
      }
    } finally {
      setLoading(false);
    }
  }, [studyId, section]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    const body = draft.trim();
    if (!body || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/studies/${studyId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, body, parent_id: replyTo }),
      });
      if (res.ok) {
        setDraft("");
        setReplyTo(null);
        await load();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleResolved(c: StudyComment) {
    const next = !c.resolved_at;
    const res = await fetch(`/api/comments/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: next }),
    });
    if (res.ok) await load();
  }

  const roots = comments.filter((c) => !c.parent_id);
  const repliesByParent = new Map<string, StudyComment[]>();
  for (const c of comments) {
    if (c.parent_id) {
      const arr = repliesByParent.get(c.parent_id) || [];
      arr.push(c);
      repliesByParent.set(c.parent_id, arr);
    }
  }

  const visibleRoots = showResolved
    ? roots
    : roots.filter((r) => !r.resolved_at);
  const total = comments.length;

  return (
    <aside
      style={{
        width: 360,
        position: "sticky",
        top: 80,
        maxHeight: "calc(100vh - 100px)",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 16,
        overflow: "hidden",
      }}
      aria-label="Comentários"
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--ink-mute)",
              textTransform: "uppercase",
            }}
          >
            COMENTÁRIOS · SEÇÃO {SECTION_LABEL[section] || section.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-soft)",
              marginTop: 4,
            }}
          >
            {total} {total === 1 ? "comentário" : "comentários"}
          </div>
        </div>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "var(--ink-soft)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            style={{ accentColor: "var(--cyan)" }}
          />
          Resolvidos
        </label>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {loading && (
          <div style={{ color: "var(--ink-mute)", fontSize: 12, padding: 12 }}>
            Carregando...
          </div>
        )}
        {!loading && visibleRoots.length === 0 && (
          <div
            style={{
              color: "var(--ink-mute)",
              fontSize: 12,
              padding: 16,
              textAlign: "center",
            }}
          >
            Sem comentários nesta seção ainda. Seja o primeiro.
          </div>
        )}
        {visibleRoots.map((c) => (
          <CommentBlock
            key={c.id}
            comment={c}
            replies={repliesByParent.get(c.id) || []}
            onToggleResolve={() => toggleResolved(c)}
            onReply={() => setReplyTo(c.id)}
          />
        ))}
      </div>

      <div
        style={{
          borderTop: "1px solid var(--line)",
          padding: 12,
          background: "var(--slate-50, #F8FAFC)",
        }}
      >
        {replyTo && (
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-mute)",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Respondendo comentário</span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              style={{
                border: 0,
                background: "transparent",
                color: "var(--ink-soft)",
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              cancelar
            </button>
          </div>
        )}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escreva um comentário..."
          rows={3}
          style={{
            width: "100%",
            border: "1px solid var(--line-strong, #CBD5E1)",
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 13,
            fontFamily: "var(--font-sans)",
            resize: "vertical",
            background: "#fff",
            color: "var(--ink)",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 8,
          }}
        >
          <button
            type="button"
            className="btn-primary"
            onClick={submit}
            disabled={submitting || !draft.trim()}
            style={{ fontSize: 12, padding: "6px 12px" }}
          >
            {submitting ? "Enviando..." : "Comentar"}
          </button>
        </div>
      </div>
    </aside>
  );
}

function CommentBlock({
  comment,
  replies,
  onToggleResolve,
  onReply,
}: {
  comment: StudyComment;
  replies: StudyComment[];
  onToggleResolve: () => void;
  onReply: () => void;
}) {
  const resolved = !!comment.resolved_at;
  return (
    <div style={{ opacity: resolved ? 0.5 : 1 }}>
      <CommentRow
        c={comment}
        onReply={onReply}
        onToggleResolve={onToggleResolve}
        showActions
        rootResolved={resolved}
      />
      {replies.length > 0 && (
        <div style={{ marginLeft: 24, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          {replies.map((r) => (
            <CommentRow key={r.id} c={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentRow({
  c,
  onReply,
  onToggleResolve,
  showActions,
  rootResolved,
}: {
  c: StudyComment;
  onReply?: () => void;
  onToggleResolve?: () => void;
  showActions?: boolean;
  rootResolved?: boolean;
}) {
  const { bg, fg } = colorFor(c.author_name);
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: bg,
            color: fg,
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {initialsFor(c.author_name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginBottom: 2,
            }}
          >
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--navy)",
              }}
            >
              {c.author_name || "Anônimo"}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--ink-mute)",
              }}
            >
              {relativeTime(c.created_at)}
            </span>
            {rootResolved && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "rgba(16,185,129,0.15)",
                  color: "#10B981",
                }}
              >
                resolvido
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--ink)",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {c.body}
          </div>
          {showActions && (
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              {onReply && (
                <button
                  type="button"
                  onClick={onReply}
                  style={{
                    border: 0,
                    background: "transparent",
                    color: "var(--ink-soft)",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Responder
                </button>
              )}
              {onToggleResolve && (
                <button
                  type="button"
                  onClick={onToggleResolve}
                  style={{
                    border: 0,
                    background: "transparent",
                    color: "var(--ink-soft)",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {rootResolved ? "Reabrir" : "Resolver"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
