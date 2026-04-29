"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listStudies, StudyWithClient } from "@/lib/store";
import { CATEGORIES } from "@/lib/questions";
import { scoreColor } from "@/components/ScoreCard";

export default function Dashboard() {
  const [studies, setStudies] = useState<StudyWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterClient, setFilterClient] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    loadStudies();
  }, [filterCategory, filterClient, filterDateFrom, filterDateTo, minScore]);

  function loadStudies() {
    setLoading(true);
    let result = listStudies().sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    );

    if (filterCategory !== "all")
      result = result.filter((s) => s.category === filterCategory);
    if (filterDateFrom)
      result = result.filter((s) => s.created_at >= filterDateFrom);
    if (filterDateTo)
      result = result.filter((s) => s.created_at <= filterDateTo + "T23:59:59");
    if (filterClient.trim()) {
      const term = filterClient.toLowerCase();
      result = result.filter((s) =>
        s.client?.name.toLowerCase().includes(term)
      );
    }
    if (minScore > 0) {
      result = result.filter((s) => (s.scores?.client_facing?.overall ?? 0) >= minScore);
    }

    setStudies(result);
    setLoading(false);
  }

  const totalStudies = listStudies().length;

  return (
    <div>
      {/* Hero */}
      <div className="mb-10 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="eyebrow mb-2">Dashboard</div>
          <h1 className="text-4xl font-black text-navy tracking-tight">
            Estudos Estratégicos
          </h1>
          <p className="text-ink-soft mt-1.5 max-w-xl">
            Histórico completo de diagnósticos gerados pela plataforma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Stat label="Total" value={totalStudies} />
          <Stat label="Filtrados" value={studies.length} accent />
        </div>
      </div>

      {/* Filtros */}
      <div className="surface rounded-2xl p-5 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        <FilterField label="Categoria">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field appearance-none cursor-pointer pr-9 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2394A3B8%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]"
          >
            <option value="all">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Cliente">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="input-field"
          />
        </FilterField>
        <FilterField label="De">
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="input-field"
          />
        </FilterField>
        <FilterField label="Até">
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="input-field"
          />
        </FilterField>
        <FilterField label={`Score mín. ${minScore}`}>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-full accent-cyan-deep"
          />
        </FilterField>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface rounded-2xl h-24 shimmer" />
          ))}
        </div>
      ) : studies.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3">
          {studies.map((study) => (
            <StudyRow key={study.id} study={study} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Components ──────────────────────────────────────────────────────────
function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`surface rounded-xl px-4 py-2.5 min-w-[88px] ${accent ? "ring-1 ring-cyan/40" : ""}`}>
      <div className="text-[10px] uppercase tracking-widest text-ink-mute font-bold">{label}</div>
      <div className={`text-2xl font-black tracking-tight ${accent ? "text-blue" : "text-navy"}`}>{value}</div>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-mute mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function StudyRow({ study }: { study: StudyWithClient }) {
  const cat = CATEGORIES.find((c) => c.value === study.category);
  const overall = study.scores?.client_facing?.overall;
  return (
    <Link
      href={`/dashboard/study/${study.id}`}
      className="surface surface-hover rounded-2xl p-5 flex items-center gap-5 group"
    >
      <CategoryIcon category={study.category} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue">
            {cat?.label || study.category}
          </span>
          <span className="w-1 h-1 rounded-full bg-ink-mute" />
          <StatusBadge status={study.status} />
        </div>
        <h3 className="text-lg font-bold text-navy mb-0.5 truncate group-hover:text-blue transition-colors">
          {study.title}
        </h3>
        <p className="text-sm text-ink-soft truncate">
          {study.client?.name || "Sem cliente"} ·{" "}
          {new Date(study.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>
      {typeof overall === "number" && <ScoreMini value={overall} />}
      <div className="text-ink-mute group-hover:text-cyan group-hover:translate-x-1 transition text-2xl shrink-0">
        →
      </div>
    </Link>
  );
}

function ScoreMini({ value }: { value: number }) {
  const c = scoreColor(value);
  return (
    <div className="hidden sm:flex items-center gap-2 shrink-0">
      <div className="text-right">
        <div className="text-[9px] uppercase tracking-widest text-ink-mute font-bold">Score</div>
        <div className="text-xl font-black tabular-nums" style={{ color: c.bg }}>{value}</div>
      </div>
      <div className="w-1 h-10 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="w-full"
          style={{ background: c.bg, height: `${value}%`, marginTop: `${100 - value}%` }}
        />
      </div>
    </div>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const map: Record<string, { bg: string; ring: string; letter: string }> = {
    saude: { bg: "from-emerald-400 to-emerald-600", ring: "ring-emerald-200", letter: "S" },
    educacao: { bg: "from-blue-400 to-blue-600", ring: "ring-blue-200", letter: "E" },
    juridico: { bg: "from-purple to-blue", ring: "ring-purple/30", letter: "J" },
    tech: { bg: "from-cyan to-blue", ring: "ring-cyan/30", letter: "T" },
    outro: { bg: "from-slate-400 to-slate-600", ring: "ring-slate-200", letter: "O" },
  };
  const m = map[category] || map.outro;
  return (
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.bg} ring-4 ${m.ring} flex items-center justify-center text-white font-black text-lg shrink-0`}>
      {m.letter}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { c: string; label: string; dot: string }> = {
    draft: { c: "bg-slate-100 text-slate-700", label: "Rascunho", dot: "bg-slate-400" },
    questionnaire: { c: "bg-blue-50 text-blue", label: "Questionário", dot: "bg-blue" },
    generating: { c: "bg-purple/10 text-purple", label: "Gerando", dot: "bg-purple animate-pulse" },
    completed: { c: "bg-success-soft text-success", label: "Concluído", dot: "bg-success" },
    archived: { c: "bg-slate-100 text-slate-500", label: "Arquivado", dot: "bg-slate-300" },
  };
  const m = map[status] || map.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${m.c}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="surface rounded-3xl p-16 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 via-transparent to-purple/5 pointer-events-none" />
      <div className="relative">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-gradient mb-5 shadow-cardLg">
          <span className="text-cyan text-3xl font-black">+</span>
        </div>
        <h3 className="text-2xl font-black text-navy mb-2 tracking-tight">
          Nenhum estudo ainda
        </h3>
        <p className="text-ink-soft mb-6 max-w-sm mx-auto">
          Crie o primeiro diagnóstico estratégico para começar a usar a plataforma.
        </p>
        <Link href="/dashboard/new" className="btn-primary inline-flex items-center gap-2">
          Criar Primeiro Estudo →
        </Link>
      </div>
    </div>
  );
}
