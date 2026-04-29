"use client";

import { RECOMMENDATION_COLORS, RecommendationKey } from "@/lib/scoreColors";

const ICON: Record<RecommendationKey, string> = {
  ENTRAR: "↑",
  OBSERVAR: "◐",
  NAO_ENTRAR: "✕",
};

function normalize(value: any): RecommendationKey | null {
  if (!value) return null;
  const v = String(value).toUpperCase().replace(/\s+/g, "_").replace("Ã", "A");
  if (v === "ENTRAR" || v === "OBSERVAR" || v === "NAO_ENTRAR") return v as RecommendationKey;
  if (v === "NÃO_ENTRAR" || v === "NAO__ENTRAR") return "NAO_ENTRAR";
  return null;
}

export function RecommendationBadge({
  recommendation,
}: {
  recommendation: any;
}) {
  const key = normalize(recommendation);
  if (!key) {
    return (
      <div className="surface rounded-2xl p-6">
        <div className="eyebrow mb-1">Recomendação</div>
        <div className="text-2xl font-black text-ink-mute">Não disponível</div>
      </div>
    );
  }
  const r = RECOMMENDATION_COLORS[key];
  return (
    <div
      className="relative rounded-2xl p-6 shadow-cardLg overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${r.bg} 0%, ${shade(r.bg, -25)} 100%)`,
        color: r.text,
        textShadow: r.text === "#FFFFFF" ? "0 1px 2px rgba(0,0,0,0.25)" : "none",
      }}
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 -left-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
      <div className="relative">
        <div
          className="text-[11px] font-black uppercase tracking-[0.25em] mb-3"
          style={{ opacity: 0.95 }}
        >
          Recomendação Interna
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-black tracking-tight">{r.label}</span>
          <span className="text-3xl opacity-80">{ICON[key]}</span>
        </div>
        <p className="text-sm font-medium mt-2 max-w-sm" style={{ opacity: 0.95 }}>
          {r.sub}
        </p>
      </div>
    </div>
  );
}

function shade(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
