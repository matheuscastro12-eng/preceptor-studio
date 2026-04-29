"use client";

export interface Tab {
  key: string;
  label: string;
  icon?: string;
  badge?: string;
}

export function StudyTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="surface rounded-xl p-1 inline-flex flex-wrap gap-1 mb-6 max-w-full overflow-x-auto">
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`relative px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap inline-flex items-center gap-2 ${
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
  );
}
