"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

const LABELS: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/estudos": "Estudos",
  "/dashboard/leads": "Leads",
  "/dashboard/crm": "CRM Pipeline",
  "/dashboard/cronograma": "Cronograma",
  "/dashboard/kanban": "Execução",
  "/dashboard/time": "Time",
  "/dashboard/biblioteca": "Biblioteca",
  "/dashboard/config": "Configurações",
  "/dashboard/new": "Novo Estudo",
};

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Record<string, unknown>;
  read_by: string[];
  created_at: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "agora";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function iconForType(type: string): string {
  if (type === "lead_requested_contact") return "◆";
  if (type === "study_completed") return "★";
  if (type === "lead_qualified") return "✦";
  if (type === "task_assigned") return "▸";
  return "•";
}

export function TopBar({ sub }: { sub?: string }) {
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();
  const isDetail =
    pathname.startsWith("/dashboard/study/") || pathname === "/dashboard/new";

  let current = LABELS[pathname];
  if (!current) {
    if (pathname.startsWith("/dashboard/study/")) current = "Estudo";
    else if (pathname.startsWith("/dashboard/leads/")) current = "Lead";
    else current = "Workspace";
  }

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [hasUrgent, setHasUrgent] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications: NotificationItem[];
        unread_count: number;
      };
      setItems(data.notifications || []);
      setUnread(data.unread_count || 0);
      // Urgent pulse if there's an unread lead_requested_contact.
      const urgent = (data.notifications || []).some(
        (n) =>
          n.type === "lead_requested_contact" &&
          !(Array.isArray(n.read_by) && n.read_by.length > 0)
      );
      setHasUrgent(urgent);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (popRef.current && !popRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) await fetchNotifications();
  }

  async function clickNotification(n: NotificationItem) {
    try {
      await fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" });
    } catch {
      // ignore
    }
    setOpen(false);
    if (n.link) router.push(n.link);
    fetchNotifications();
  }

  async function markAllRead() {
    try {
      await fetch(`/api/notifications/read-all`, { method: "PATCH" });
    } catch {
      // ignore
    }
    fetchNotifications();
  }

  const badge = unread > 9 ? "9+" : String(unread);

  return (
    <header className="tb">
      <div className="tb__crumb">
        <button
          type="button"
          className="tb__menu"
          aria-label="Abrir menu"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("ps:toggle-sidebar"))
          }
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {isDetail && (
          <button
            type="button"
            className="tb__icon"
            onClick={() => router.back()}
            title="Voltar"
            style={{ marginRight: 4 }}
          >
            ←
          </button>
        )}
        <span>Workspace</span>
        <span className="sep">/</span>
        <span className="current">{current}</span>
        {sub && (
          <>
            <span className="sep">/</span>
            <span>{sub}</span>
          </>
        )}
        {pathname === "/dashboard/leads" && (
          <span className="pill-tag">do diagnóstico grátis</span>
        )}
        {pathname === "/dashboard/crm" && (
          <span className="pill-tag">funil comercial</span>
        )}
      </div>
      <div className="tb__right" style={{ position: "relative" }}>
        <button
          ref={btnRef}
          className="tb__icon"
          title="Notificações"
          onClick={handleOpen}
          style={{ position: "relative" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unread > 0 && (
            <span
              className={hasUrgent ? "notif-badge pulse" : "notif-badge"}
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                minWidth: 16,
                height: 16,
                padding: "0 4px",
                borderRadius: 999,
                background: "var(--cyan)",
                color: "var(--navy-deep)",
                fontSize: 9,
                fontWeight: 900,
                lineHeight: "16px",
                textAlign: "center",
                fontFamily: "var(--font-mono)",
              }}
            >
              {badge}
            </span>
          )}
        </button>
        <button className="tb__icon" title="Ajuda">
          ?
        </button>
        {open && (
          <div
            ref={popRef}
            style={{
              position: "fixed",
              top: 56,
              right: 16,
              width: "min(380px, calc(100vw - 24px))",
              maxHeight: 480,
              overflowY: "auto",
              background: "#fff",
              border: "1px solid rgba(15,23,41,0.08)",
              borderRadius: 12,
              boxShadow: "0 12px 32px -8px rgba(15,23,41,0.18)",
              zIndex: 100,
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                background: "#fff",
                borderBottom: "1px solid rgba(15,23,41,0.06)",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                zIndex: 1,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 800,
                  color: "var(--navy)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Notificações
              </h3>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  style={{
                    background: "transparent",
                    border: 0,
                    color: "var(--cyan-deep, #3BC8CF)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "var(--ink-mute)",
                  fontSize: 13,
                }}
              >
                Nenhuma notificação ainda.
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {items.map((n) => {
                  const readBy = Array.isArray(n.read_by) ? n.read_by : [];
                  // We don't know user id client-side; rely on heuristic: if any one in read_by, treat as read.
                  const isRead = readBy.length > 0;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => clickNotification(n)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "12px 14px",
                          borderBottom: "1px solid rgba(15,23,41,0.05)",
                          background: isRead ? "#fff" : "rgba(82,225,231,0.04)",
                          border: 0,
                          cursor: "pointer",
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        {!isRead && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "var(--cyan)",
                              marginTop: 6,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            background: "rgba(82,225,231,0.12)",
                            color: "var(--navy)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 900,
                            fontSize: 12,
                            flexShrink: 0,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {iconForType(n.type)}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "var(--navy)",
                              fontSize: 12.5,
                              lineHeight: 1.3,
                            }}
                          >
                            {n.title}
                          </div>
                          {n.body && (
                            <div
                              style={{
                                color: "var(--ink-soft)",
                                fontSize: 11.5,
                                lineHeight: 1.4,
                                marginTop: 2,
                              }}
                            >
                              {n.body}
                            </div>
                          )}
                          <div
                            style={{
                              color: "var(--ink-mute)",
                              fontSize: 10,
                              marginTop: 4,
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {timeAgo(n.created_at)}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes pulse-cyan {
          0% {
            box-shadow: 0 0 0 0 rgba(82, 225, 231, 0.7);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(82, 225, 231, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(82, 225, 231, 0);
          }
        }
        :global(.notif-badge.pulse) {
          animation: pulse-cyan 1.6s infinite;
        }
      `}</style>
    </header>
  );
}
