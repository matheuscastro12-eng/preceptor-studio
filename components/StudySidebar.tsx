"use client";

import { Tab } from "./StudyTabs";

export function StudySidebar({
  tabs,
  active,
  onChange,
  publicMode = false,
  publicLabel,
}: {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
  publicMode?: boolean;
  publicLabel?: string;
}) {
  // Em modo público, esconde tabs internas (tese, slides).
  const INTERNAL_KEYS = new Set(["tese", "slides"]);
  const visibleTabs = publicMode
    ? tabs.filter((t) => !INTERNAL_KEYS.has(t.key))
    : tabs;
  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="lg:hidden surface rounded-xl p-1 inline-flex flex-nowrap gap-1 mb-4 max-w-full overflow-x-auto w-full">
        {visibleTabs.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`shrink-0 px-3 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap inline-flex items-center gap-1.5 ${
                isActive
                  ? "text-white shadow-card"
                  : "text-navy hover:bg-slate-100"
              }`}
              style={
                isActive
                  ? { background: "linear-gradient(180deg, #0A1F44 0%, #06122A 100%)" }
                  : undefined
              }
            >
              {t.icon && <span className="text-base leading-none">{t.icon}</span>}
              <span>{t.label}</span>
              {t.badge && (
                <span
                  className="text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider"
                  style={
                    isActive
                      ? { background: "#52E1E7", color: "#06122A" }
                      : { background: "#E11D48", color: "white" }
                  }
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Desktop: full-height sticky sidebar flush left */}
      <aside
        className="hidden lg:block w-60 shrink-0 sticky self-start"
        style={{ top: "4rem", height: "calc(100vh - 4rem)" }}
      >
        <div className="bg-white border-r border-slate-200/70 p-3 h-full flex flex-col overflow-hidden shadow-[2px_0_8px_-4px_rgba(15,23,41,0.06)]">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-mute px-3 py-2 mb-1 shrink-0">
            Navegação
          </div>
          <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
            {visibleTabs.map((t) => {
              const isActive = t.key === active;
              return (
                <button
                  key={t.key}
                  onClick={() => onChange(t.key)}
                  className={`relative w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition inline-flex items-center gap-2.5 shrink-0 ${
                    isActive
                      ? "text-white shadow-card"
                      : "text-navy hover:bg-slate-100"
                  }`}
                  style={
                    isActive
                      ? { background: "linear-gradient(180deg, #0A1F44 0%, #06122A 100%)" }
                      : undefined
                  }
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r"
                      style={{ background: "#52E1E7" }}
                    />
                  )}
                  {t.icon && <span className="text-base leading-none w-5 text-center">{t.icon}</span>}
                  <span className="flex-1">{t.label}</span>
                  {t.badge && (
                    <span
                      className="text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider"
                      style={
                        isActive
                          ? { background: "#52E1E7", color: "#06122A" }
                          : { background: "#E11D48", color: "white" }
                      }
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="mt-3 pt-3 border-t border-slate-200/70 text-[10px] text-ink-mute px-3 leading-relaxed shrink-0">
            <div className="font-bold uppercase tracking-widest mb-1">
              {publicMode ? "Visão Compartilhada" : "Preceptor!"}
            </div>
            {publicMode
              ? publicLabel || "Você está visualizando a versão pública. Conteúdo interno não aparece aqui."
              : "Estudo gerado com IA. Cada output pode ser regenerado individualmente."}
          </div>
        </div>
      </aside>
    </>
  );
}
