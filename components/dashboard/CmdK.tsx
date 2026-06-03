"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface StudyHit {
  id: string;
  title: string;
  category: string;
  status: string;
  client?: { name: string | null } | null;
}
interface LeadHit {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: string;
}
interface ClientHit {
  id: string;
  name: string;
  email: string | null;
}
interface TaskHit {
  id: string;
  title: string;
  study_id: string;
  status: string;
  sprint: number;
}

interface SearchResults {
  studies: StudyHit[];
  leads: LeadHit[];
  clients: ClientHit[];
  tasks: TaskHit[];
}

type FlatItem =
  | { kind: "study"; data: StudyHit }
  | { kind: "lead"; data: LeadHit }
  | { kind: "client"; data: ClientHit }
  | { kind: "task"; data: TaskHit };

const EMPTY: SearchResults = { studies: [], leads: [], clients: [], tasks: [] };

export function CmdK() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  // Global hotkey
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery("");
      setResults(EMPTY);
      setActiveIdx(0);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const myReq = ++reqIdRef.current;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as SearchResults;
        if (myReq === reqIdRef.current) {
          setResults(data);
          setActiveIdx(0);
        }
      } finally {
        if (myReq === reqIdRef.current) setLoading(false);
      }
    }, 180);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  const flat: FlatItem[] = useMemo(() => {
    const out: FlatItem[] = [];
    for (const s of results.studies) out.push({ kind: "study", data: s });
    for (const l of results.leads) out.push({ kind: "lead", data: l });
    for (const c of results.clients) out.push({ kind: "client", data: c });
    for (const t of results.tasks) out.push({ kind: "task", data: t });
    return out;
  }, [results]);

  const navigateTo = useCallback(
    (item: FlatItem) => {
      let href = "";
      if (item.kind === "study") href = `/dashboard/study/${item.data.id}`;
      else if (item.kind === "lead") href = `/dashboard/leads?id=${item.data.id}`;
      else if (item.kind === "client") href = `/dashboard/crm?client=${item.data.id}`;
      else if (item.kind === "task") href = `/dashboard/study/${item.data.study_id}`;
      if (href) {
        setOpen(false);
        router.push(href);
      }
    },
    [router]
  );

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[activeIdx];
      if (item) navigateTo(item);
    }
  }

  if (!open) return null;

  let runningIdx = -1;
  function renderGroup<T>(
    label: string,
    items: T[],
    render: (item: T, idx: number) => React.ReactNode
  ) {
    if (items.length === 0) return null;
    return (
      <div style={{ padding: "6px 0" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--ink-mute)",
            textTransform: "uppercase",
            padding: "6px 14px",
          }}
        >
          {label}
        </div>
        {items.map((it) => {
          runningIdx += 1;
          return render(it, runningIdx);
        })}
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(6,18,42,0.8)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "10vh",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 640,
          maxWidth: "calc(100% - 32px)",
          maxHeight: 540,
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 30px 80px -20px rgba(6,18,42,0.6)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(82,225,231,0.3)",
        }}
      >
        <div
          style={{
            padding: 12,
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: "var(--ink-mute)", fontSize: 16 }}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Buscar estudos, leads, clientes, tasks..."
            style={{
              flex: 1,
              border: 0,
              outline: 0,
              fontSize: 15,
              fontFamily: "var(--font-sans)",
              color: "var(--ink)",
              background: "transparent",
            }}
          />
          <kbd
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--ink-mute)",
              border: "1px solid var(--line-strong, #CBD5E1)",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            ESC
          </kbd>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading && (
            <div style={{ padding: 16, fontSize: 12, color: "var(--ink-mute)" }}>
              Buscando...
            </div>
          )}
          {!loading && query.trim() && flat.length === 0 && (
            <div style={{ padding: 16, fontSize: 13, color: "var(--ink-mute)" }}>
              Nenhum resultado para "{query}".
            </div>
          )}
          {!loading && !query.trim() && (
            <div style={{ padding: 16, fontSize: 12, color: "var(--ink-mute)" }}>
              Digite para buscar entre estudos, leads, clientes e tasks.
            </div>
          )}
          {renderGroup("Estudos", results.studies, (s, idx) => (
            <Row
              key={`s-${s.id}`}
              active={idx === activeIdx}
              icon="📄"
              title={s.title}
              subtitle={`${s.category} · ${s.status}${s.client?.name ? ` · ${s.client.name}` : ""}`}
              onClick={() => navigateTo({ kind: "study", data: s })}
              onMouseEnter={() => setActiveIdx(idx)}
            />
          ))}
          {renderGroup("Leads", results.leads, (l, idx) => (
            <Row
              key={`l-${l.id}`}
              active={idx === activeIdx}
              icon="◐"
              title={l.name}
              subtitle={`${l.email}${l.company ? ` · ${l.company}` : ""} · ${l.status}`}
              onClick={() => navigateTo({ kind: "lead", data: l })}
              onMouseEnter={() => setActiveIdx(idx)}
            />
          ))}
          {renderGroup("Clientes", results.clients, (c, idx) => (
            <Row
              key={`c-${c.id}`}
              active={idx === activeIdx}
              icon="◇"
              title={c.name}
              subtitle={c.email || "sem email"}
              onClick={() => navigateTo({ kind: "client", data: c })}
              onMouseEnter={() => setActiveIdx(idx)}
            />
          ))}
          {renderGroup("Tasks", results.tasks, (t, idx) => (
            <Row
              key={`t-${t.id}`}
              active={idx === activeIdx}
              icon="▦"
              title={t.title}
              subtitle={`sprint ${t.sprint} · ${t.status}`}
              onClick={() => navigateTo({ kind: "task", data: t })}
              onMouseEnter={() => setActiveIdx(idx)}
            />
          ))}
        </div>
        <div
          style={{
            padding: "8px 14px",
            borderTop: "1px solid var(--line)",
            background: "var(--slate-50, #F8FAFC)",
            display: "flex",
            gap: 14,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--ink-mute)",
          }}
        >
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>esc fechar</span>
        </div>
      </div>
    </div>
  );
}

function Row({
  active,
  icon,
  title,
  subtitle,
  onClick,
  onMouseEnter,
}: {
  active: boolean;
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: active ? "rgba(82,225,231,0.12)" : "transparent",
        border: 0,
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
      }}
    >
      <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--navy)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </span>
        <span
          style={{
            display: "block",
            fontSize: 11.5,
            color: "var(--ink-mute)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {subtitle}
        </span>
      </span>
    </button>
  );
}
