"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { StudyWithClient } from "@/lib/store";
import { getStudyRemote } from "@/lib/storeApi";
import { StudySidebar } from "@/components/StudySidebar";
import { DiagnosticView } from "@/components/DiagnosticView";
import { StudyViewer } from "@/components/StudyViewer";
import { OutputView } from "@/components/OutputView";
import { ExecutionView } from "@/components/ExecutionView";
import { CATEGORIES } from "@/lib/questions";

type TabKey = "diagnostico" | "estudo" | "marca" | "comercial" | "cronograma";

export default function SharePage() {
  const { id } = useParams();
  const [study, setStudy] = useState<StudyWithClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("diagnostico");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getStudyRemote(id as string)
      .then((s) => setStudy(s))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="surface rounded-2xl p-12 text-center">
          <div className="inline-block w-10 h-10 border-4 border-cyan border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-ink-soft">Carregando estudo...</p>
        </div>
      </div>
    );
  }

  if (!study || study.status !== "completed") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="surface rounded-2xl p-12 text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-black text-navy mb-2">
            Estudo indisponível
          </h1>
          <p className="text-ink-soft text-sm">
            Esse link pode estar quebrado, expirado ou o estudo ainda não foi
            concluído. Pergunte pra Preceptor! pra confirmar.
          </p>
        </div>
      </div>
    );
  }

  const cat = CATEGORIES.find((c) => c.value === study.category);

  return (
    <div>
      {/* Header simplificado pra share */}
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
          </div>
          <span className="text-[10px] uppercase tracking-widest text-cyan/70 font-bold">
            Visão Compartilhada
          </span>
        </div>
      </header>

      <div className="flex gap-0 items-start">
        <StudySidebar
          tabs={[
            { key: "diagnostico", label: "Diagnóstico", icon: "◎" },
            { key: "estudo", label: "Estudo", icon: "▤" },
            { key: "marca", label: "Marca", icon: "✦" },
            { key: "comercial", label: "Comercial", icon: "↗" },
            { key: "cronograma", label: "Cronograma", icon: "▦" },
          ]}
          active={tab}
          onChange={(k) => setTab(k as TabKey)}
          publicMode
          publicLabel={`Conteúdo entregue ao cliente${study.client?.name ? ` ${study.client.name}` : ""}.`}
        />

        <div className="flex-1 min-w-0 px-6 lg:px-10 py-8 max-w-[1400px] mx-auto w-full">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="eyebrow">{cat?.label}</span>
              <span className="w-1 h-1 rounded-full bg-ink-mute" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">
                {new Date(study.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <h1 className="text-4xl font-black text-navy tracking-tight">
              {study.title}
            </h1>
            <p className="text-ink-soft mt-1.5">
              Cliente:{" "}
              <span className="font-semibold text-navy">
                {study.client?.name}
              </span>
            </p>
          </div>

          {tab === "diagnostico" && <DiagnosticView study={study} />}
          {tab === "estudo" && study.output_md && (
            <StudyViewer study={study} onUpdate={() => {}} publicMode />
          )}
          {tab === "marca" && (
            <OutputView
              study={study}
              field="brand_brief_md"
              outputType="brand"
              emptyLabel="Briefing de Marca"
              assigneeLabel="Kalley · Designer"
              onUpdate={() => {}}
              publicMode
            />
          )}
          {tab === "comercial" && (
            <OutputView
              study={study}
              field="commercial_plan_md"
              outputType="commercial"
              emptyLabel="Plano Comercial"
              assigneeLabel="Thiago, Leonardo, Marco · Growth/Tráfego"
              onUpdate={() => {}}
              publicMode
            />
          )}
          {tab === "cronograma" && <ExecutionView study={study} publicMode />}

          <div className="mt-12 pt-6 border-t border-slate-200/70 text-center">
            <p className="text-[11px] uppercase tracking-widest text-ink-mute font-bold">
              <Link href="https://preceptor-studio.vercel.app" className="hover:text-navy transition">
                Preceptor! Studio · Venture Studio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
