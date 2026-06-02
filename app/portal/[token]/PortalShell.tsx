"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarkdownView } from "@/components/MarkdownView";

type TabKey = "estudo" | "marca" | "comercial" | "execucao";

interface StudyShape {
  id: string;
  title: string;
  category: string;
  output_md: string | null;
  brand_brief_md: string | null;
  commercial_plan_md: string | null;
  client?: { name?: string | null; email?: string | null } | null;
  created_at: string;
}

interface TaskShape {
  id: string;
  sprint: number;
  title: string;
  status: string;
  milestone: boolean;
  order_index: number;
}

interface WorkspaceShape {
  studio_name?: string | null;
  studio_email?: string | null;
  calcom_url?: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  todo: "A fazer",
  doing: "Em andamento",
  done: "Concluído",
  blocked: "Bloqueado",
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "estudo", label: "Estudo" },
  { key: "marca", label: "Marca" },
  { key: "comercial", label: "Comercial" },
  { key: "execucao", label: "Execução" },
];

export function PortalShell({
  token,
  tab,
  study,
  tasks,
  workspace,
}: {
  token: string;
  tab: TabKey;
  study: StudyShape;
  tasks: TaskShape[];
  workspace: WorkspaceShape | null;
}) {
  const router = useRouter();
  const clientName = study.client?.name || "Cliente";
  const studioName = workspace?.studio_name || "PRECEPTOR! Venture Studio";
  const studioEmail = workspace?.studio_email || "studio@preceptor.com.br";
  const calcom = workspace?.calcom_url;

  const md =
    tab === "estudo"
      ? study.output_md
      : tab === "marca"
        ? study.brand_brief_md
        : tab === "comercial"
          ? study.commercial_plan_md
          : null;

  function switchTab(next: TabKey) {
    router.push(`/portal/${token}?tab=${next}`);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-30 bg-navy-deep border-b border-cyan/30">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-80" />
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-cyan rounded-sm rotate-45" />
            <div className="flex items-baseline gap-2">
              <span className="text-white font-black text-base tracking-tight">
                PRECEPTOR!
              </span>
              <span className="text-cyan text-[10px] font-bold tracking-[0.25em] hidden sm:inline">
                STUDIO
              </span>
            </div>
            <span className="ml-4 text-white/80 text-sm font-semibold truncate max-w-[280px]">
              {study.title}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-cyan/80 font-bold px-3 py-1 rounded-full border border-cyan/30">
            Portal do cliente · {clientName}
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        <div className="min-w-0">
          <div
            className="surface"
            style={{
              padding: "6px 8px",
              display: "inline-flex",
              gap: 4,
              borderRadius: 12,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => switchTab(t.key)}
                  style={{
                    border: 0,
                    background: active
                      ? "linear-gradient(180deg,#0A1F44,#06122A)"
                      : "transparent",
                    color: active ? "#fff" : "var(--ink-soft)",
                    padding: "10px 16px",
                    borderRadius: 8,
                    fontWeight: active ? 800 : 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="surface rounded-2xl p-8 lg:p-10">
            {md ? (
              <MarkdownView md={md} />
            ) : (
              <div className="text-center py-12">
                <p className="text-ink-soft">
                  Esse conteúdo ainda não está disponível.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="surface rounded-2xl p-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-mute mb-3">
              Próximas entregas
            </div>
            {tasks.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Sem entregas planejadas no momento.
              </p>
            ) : (
              <ul className="space-y-3">
                {tasks.slice(0, 12).map((t) => (
                  <li
                    key={t.id}
                    className="flex items-start gap-3 text-sm leading-snug"
                  >
                    <span
                      className="mt-1 inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background:
                          t.status === "done"
                            ? "var(--cyan)"
                            : t.status === "doing"
                              ? "var(--purple)"
                              : "var(--ink-mute)",
                      }}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-navy">
                        {t.title}
                        {t.milestone && (
                          <span className="ml-2 text-[9px] uppercase tracking-widest text-purple font-bold">
                            Milestone
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-mute">
                        Sprint {t.sprint} · {STATUS_LABEL[t.status] || t.status}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="surface rounded-2xl p-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-mute mb-3">
              Próximos passos
            </div>
            <div className="flex flex-col gap-2">
              {calcom && (
                <a
                  href={calcom}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary text-center text-sm"
                  style={{ padding: "10px 16px" }}
                >
                  Marcar reunião
                </a>
              )}
              <a
                href={`mailto:${studioEmail}?subject=${encodeURIComponent(study.title)}`}
                className="btn-ghost text-center text-sm"
                style={{ padding: "10px 16px" }}
              >
                Falar com o estúdio
              </a>
            </div>
            <p className="mt-4 text-[11px] text-ink-mute">
              {studioName}
              <br />
              <a
                href={`mailto:${studioEmail}`}
                className="text-navy hover:text-cyan transition"
              >
                {studioEmail}
              </a>
            </p>
          </div>
        </aside>
      </div>

      <footer className="border-t border-slate-200/70 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[11px] uppercase tracking-widest text-ink-mute font-bold">
            <Link
              href="/"
              className="hover:text-navy transition"
            >
              PRECEPTOR! Studio · Venture Studio
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
