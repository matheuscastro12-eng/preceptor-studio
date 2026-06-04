"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

export interface SidebarProfile {
  name: string;
  initials: string;
  role: string;
  teamKey: string | null;
}

interface Item {
  k: string;
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string;
  badgeNew?: string;
}

function Ico({ children }: { children: ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const IconHome = () => (
  <Ico>
    <path d="M3 12L12 4l9 8" />
    <path d="M5 10v10h14V10" />
  </Ico>
);
const IconList = () => (
  <Ico>
    <line x1="8" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="20" y2="12" />
    <line x1="8" y1="18" x2="20" y2="18" />
    <line x1="4" y1="6" x2="4.01" y2="6" />
    <line x1="4" y1="12" x2="4.01" y2="12" />
    <line x1="4" y1="18" x2="4.01" y2="18" />
  </Ico>
);
const IconUsers = () => (
  <Ico>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Ico>
);
const IconPipeline = () => (
  <Ico>
    <rect x="3" y="3" width="6" height="18" rx="1" />
    <rect x="11" y="6" width="6" height="14" rx="1" />
    <rect x="19" y="9" width="3" height="10" rx="1" />
  </Ico>
);
const IconCalendar = () => (
  <Ico>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Ico>
);
const IconBoard = () => (
  <Ico>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M15 3v18" />
  </Ico>
);
const IconTeam = () => (
  <Ico>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Ico>
);
const IconBook = () => (
  <Ico>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </Ico>
);
const IconBeaker = () => (
  <Ico>
    <path d="M9 3h6" />
    <path d="M10 3v6.5L4.5 18a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9.5V3" />
    <path d="M7 14h10" />
  </Ico>
);
const IconWallet = () => (
  <Ico>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h3v-4z" />
  </Ico>
);
const IconCog = () => (
  <Ico>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.05.42.27.79.6 1.05" />
  </Ico>
);
const IconFunnel = () => (
  <Ico>
    <path d="M3 5h18l-7 8v6l-4 2v-8z" />
  </Ico>
);

export function Sidebar({
  studiesBadge,
  leadsBadge,
  profile,
}: {
  studiesBadge?: number;
  leadsBadge?: number;
  profile?: SidebarProfile;
}) {
  const pathname = usePathname() || "";
  const items: Item[] = [
    { k: "home", href: "/dashboard", label: "Home", icon: <IconHome /> },
    {
      k: "estudos",
      href: "/dashboard/estudos",
      label: "Estudos",
      icon: <IconList />,
      badge: studiesBadge ? String(studiesBadge) : undefined,
    },
    {
      k: "leads",
      href: "/dashboard/leads",
      label: "Leads",
      icon: <IconUsers />,
      badgeNew: leadsBadge ? String(leadsBadge) : undefined,
    },
    { k: "crm", href: "/dashboard/crm", label: "CRM", icon: <IconPipeline /> },
    { k: "funil", href: "/dashboard/funil", label: "Funil", icon: <IconFunnel /> },
    {
      k: "cronograma",
      href: "/dashboard/cronograma",
      label: "Cronograma",
      icon: <IconCalendar />,
    },
    {
      k: "kanban",
      href: "/dashboard/kanban",
      label: "Execução",
      icon: <IconBoard />,
    },
    {
      k: "financeiro",
      href: "/dashboard/financeiro",
      label: "Financeiro",
      icon: <IconWallet />,
    },
  ];
  const secondary: Item[] = [
    { k: "time", href: "/dashboard/time", label: "Time", icon: <IconTeam /> },
    {
      k: "biblioteca",
      href: "/dashboard/biblioteca",
      label: "Biblioteca",
      icon: <IconBook />,
    },
    {
      k: "experimentos",
      href: "/dashboard/experimentos",
      label: "Experimentos",
      icon: <IconBeaker />,
    },
    {
      k: "config",
      href: "/dashboard/config",
      label: "Configurações",
      icon: <IconCog />,
    },
  ];

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const [mobileOpen, setMobileOpen] = useState(false);

  // Abre/fecha o drawer ao receber evento do hambúrguer (TopBar).
  useEffect(() => {
    const toggle = () => setMobileOpen((o) => !o);
    window.addEventListener("ps:toggle-sidebar", toggle);
    return () => window.removeEventListener("ps:toggle-sidebar", toggle);
  }, []);

  // Fecha o drawer ao navegar para outra rota.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {mobileOpen && (
        <div
          className="sb-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    <aside className={"sb" + (mobileOpen ? " sb--open" : "")}>
      <div className="sb__top">
        <Link href="/dashboard" className="sb__brand">
          <span className="mark" />
          <span>
            <div className="sb__word">PRECEPTOR!</div>
            <div className="sb__sub">Studio</div>
          </span>
        </Link>
        <span className="sb__kbd">
          <kbd>⌘</kbd>
          <kbd>K</kbd>
        </span>
      </div>

      <div className="sb__search">
        <input
          placeholder="Buscar..."
          readOnly
          onFocus={(e) => {
            e.currentTarget.blur();
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
            );
          }}
          onClick={() => {
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
            );
          }}
        />
      </div>

      <div className="sb__group">
        <div className="sb__heading">Workspace</div>
        {items.map((it) => (
          <Link
            key={it.k}
            href={it.href}
            className={"sb__item" + (isActive(it.href) ? " active" : "")}
            style={isActive(it.href) ? { background: "transparent" } : undefined}
          >
            {isActive(it.href) && (
              <motion.span
                layoutId="sidebar-active-pill"
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 10,
                  background: "rgba(82, 225, 231, 0.10)",
                  zIndex: 0,
                }}
                transition={{ type: "spring", stiffness: 480, damping: 40 }}
              />
            )}
            <span className="ic" style={{ position: "relative", zIndex: 1 }}>{it.icon}</span>
            <span style={{ position: "relative", zIndex: 1 }}>{it.label}</span>
            {it.badgeNew && <span className="badge new" style={{ position: "relative", zIndex: 1 }}>{it.badgeNew}</span>}
            {it.badge && !it.badgeNew && <span className="badge" style={{ position: "relative", zIndex: 1 }}>{it.badge}</span>}
          </Link>
        ))}
      </div>

      <div className="sb__group">
        <div className="sb__heading">Studio</div>
        {secondary.map((it) => (
          <Link
            key={it.k}
            href={it.href}
            className={"sb__item" + (isActive(it.href) ? " active" : "")}
          >
            <span className="ic">{it.icon}</span>
            {it.label}
          </Link>
        ))}
      </div>

      <div className="sb__bottom">
        <UserMenu profile={profile} />
      </div>
    </aside>
    </>
  );
}

function UserMenu({ profile }: { profile?: SidebarProfile }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await getBrowserSupabase().auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  const name = profile?.name || "Studio";
  const initials = profile?.initials || "ST";
  const role = profile?.role || "member";
  const team = profile?.teamKey ? ` · ${profile.teamKey}` : "";

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Abrir menu do usuário"
        aria-expanded={open}
        className="sb__user"
        style={{ width: "100%", background: "transparent", border: 0, cursor: "pointer", textAlign: "left" }}
      >
        <span className="av">{initials}</span>
        <span>
          <div className="nm">{name}</div>
          <div className="ro">{role.toLowerCase()}{team}</div>
        </span>
        <span className="more" aria-hidden="true">⋯</span>
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid var(--line-strong)",
            borderRadius: 12,
            boxShadow: "0 16px 40px -16px rgba(10,31,68,0.25)",
            padding: 6,
            zIndex: 10,
          }}
        >
          <Link
            href="/dashboard/config"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              padding: "10px 12px",
              fontSize: 13.5,
              color: "var(--ink)",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Perfil e configurações
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              fontSize: 13.5,
              color: "var(--danger)",
              borderRadius: 8,
              background: "transparent",
              border: 0,
              cursor: signingOut ? "wait" : "pointer",
            }}
          >
            {signingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      )}
    </div>
  );
}
