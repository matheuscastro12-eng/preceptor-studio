"use client";

import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Flag,
  Lock,
  Palette,
  ShieldAlert,
  Target,
  Users,
} from "lucide-react";
import { StudyWithClient } from "@/lib/store";

export type OutputKind = "diagnostic" | "study" | "brand" | "commercial" | "execution" | "slides" | "thesis";

export interface OutputMetric {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
}

const META: Record<
  OutputKind,
  {
    title: string;
    eyebrow: string;
    description: string;
    audience: string;
    Icon: typeof FileText;
    accent: string;
    confidential?: boolean;
  }
> = {
  diagnostic: {
    title: "Diagnóstico Estratégico",
    eyebrow: "Leitura executiva",
    description: "Scores, forças, fragilidades e leitura rápida do potencial do projeto.",
    audience: "Preceptor! + cliente",
    Icon: BarChart3,
    accent: "#52E1E7",
  },
  study: {
    title: "Estudo Estratégico",
    eyebrow: "Documento do cliente",
    description: "Relatório consultivo com mercado, riscos, modelo de negócio e próximos passos.",
    audience: "Cliente",
    Icon: FileText,
    accent: "#5D57EB",
  },
  brand: {
    title: "Briefing de Marca",
    eyebrow: "Handoff criativo",
    description: "Direção de posicionamento, tom de voz, identidade visual e aplicações.",
    audience: "Kalley",
    Icon: Palette,
    accent: "#B964FF",
  },
  commercial: {
    title: "Plano Comercial e de Tráfego",
    eyebrow: "Go-to-market",
    description: "Oferta, funil, canais, criativos, CAC, budget e metas de tração.",
    audience: "Thiago, Leonardo e Marco",
    Icon: Target,
    accent: "#10B981",
  },
  execution: {
    title: "Cronograma de Execução",
    eyebrow: "Operação",
    description: "Plano de 12 semanas em sprints, responsáveis, marcos e horas estimadas.",
    audience: "Time Preceptor!",
    Icon: CalendarDays,
    accent: "#F59E0B",
  },
  slides: {
    title: "Prompt de Slides Estrategicos",
    eyebrow: "Claude",
    description: "Prompt completo para estruturar um deck estrategico com dados externos e operacionais.",
    audience: "Cliente",
    Icon: FileText,
    accent: "#5D57EB",
  },
  thesis: {
    title: "Tese Interna",
    eyebrow: "Confidencial",
    description: "Leitura de portfólio, risco, fit interno e recomendação societária.",
    audience: "Sócios",
    Icon: Lock,
    accent: "#E11D48",
    confidential: true,
  },
};

const toneClass: Record<NonNullable<OutputMetric["tone"]>, string> = {
  default: "text-navy",
  accent: "text-blue",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export function OutputHeader({
  kind,
  study,
  metrics = [],
  actions,
}: {
  kind: OutputKind;
  study: StudyWithClient;
  metrics?: OutputMetric[];
  actions?: React.ReactNode;
}) {
  const meta = META[kind];
  const Icon = meta.Icon;
  const date = study.completed_at || study.updated_at || study.created_at;

  return (
    <section
      className={`surface rounded-2xl p-5 md:p-6 mb-5 overflow-hidden ${
        meta.confidential ? "border-danger/25" : ""
      }`}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex gap-4 min-w-0">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: meta.confidential
                  ? "linear-gradient(180deg, #7F1D1D 0%, #450A0A 100%)"
                  : "linear-gradient(180deg, #0A1F44 0%, #06122A 100%)",
                color: meta.accent,
              }}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="eyebrow">{meta.eyebrow}</span>
                {meta.confidential && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-danger-soft px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-danger">
                    <ShieldAlert className="w-3 h-3" />
                    Interno
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-navy tracking-normal leading-tight">
                {meta.title}
              </h2>
              <p className="text-sm text-ink-soft mt-1 max-w-2xl">{meta.description}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness className="w-3.5 h-3.5" />
                  {study.client?.name || "Sem cliente"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {meta.audience}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" />
                  {new Date(date).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </div>

          {actions && <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div>}
        </div>

        {metrics.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">
                  {metric.label}
                </div>
                <div className={`mt-0.5 text-xl font-black tabular-nums ${toneClass[metric.tone || "default"]}`}>
                  {metric.value}
                </div>
                {metric.hint && <div className="text-[11px] text-ink-soft leading-tight mt-0.5">{metric.hint}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
