"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStudy, StudyWithClient } from "@/lib/store";
import { Questionnaire } from "@/components/Questionnaire";
import { StudyViewer } from "@/components/StudyViewer";
import { StudyTabs } from "@/components/StudyTabs";
import { DiagnosticView } from "@/components/DiagnosticView";
import { ThesisView } from "@/components/ThesisView";
import { OutputView } from "@/components/OutputView";
import { ExecutionView } from "@/components/ExecutionView";
import { CATEGORIES } from "@/lib/questions";

type TabKey = "diagnostico" | "estudo" | "marca" | "comercial" | "cronograma" | "tese";

export default function StudyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [study, setStudy] = useState<StudyWithClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("diagnostico");

  useEffect(() => {
    if (id) loadStudy();
  }, [id]);

  function loadStudy() {
    setLoading(true);
    setStudy(getStudy(id as string));
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-10 w-72 shimmer rounded-lg" />
        <div className="h-72 surface rounded-2xl shimmer" />
      </div>
    );
  }

  if (!study) {
    return (
      <div className="surface rounded-2xl p-12 text-center">
        <p className="text-ink-soft mb-4">Estudo não encontrado.</p>
        <button onClick={() => router.push("/dashboard")} className="btn-ghost">
          ← Voltar para o dashboard
        </button>
      </div>
    );
  }

  const cat = CATEGORIES.find((c) => c.value === study.category);
  const isCompleted = study.status === "completed";

  return (
    <div>
      <button
        onClick={() => router.push("/dashboard")}
        className="text-sm text-ink-soft hover:text-navy mb-4 inline-flex items-center gap-1.5 transition"
      >
        <span>←</span> Todos os estudos
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="eyebrow">{cat?.label}</span>
          <span className="w-1 h-1 rounded-full bg-ink-mute" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">
            {new Date(study.created_at).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <h1 className="text-4xl font-black text-navy tracking-tight">{study.title}</h1>
        <p className="text-ink-soft mt-1.5">
          Cliente: <span className="font-semibold text-navy">{study.client?.name}</span>
        </p>
      </div>

      {study.status === "questionnaire" && (
        <Questionnaire study={study} onUpdate={loadStudy} />
      )}

      {study.status === "generating" && (
        <div className="surface rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple/5 via-cyan/5 to-transparent" />
          <div className="relative">
            <div className="inline-block w-10 h-10 border-4 border-cyan border-t-transparent rounded-full animate-spin mb-5" />
            <h3 className="text-xl font-black text-navy mb-2 tracking-tight">
              Gerando os 5 outputs...
            </h3>
            <p className="text-ink-soft mb-6 max-w-md mx-auto">
              Estudo, Marca, Comercial, Cronograma e Tese Interna em pipeline. Pode levar 2-4 minutos.
            </p>
            <button onClick={loadStudy} className="btn-ghost">
              Atualizar status
            </button>
          </div>
        </div>
      )}

      {isCompleted && (
        <>
          <StudyTabs
            tabs={[
              { key: "diagnostico", label: "Diagnóstico", icon: "◎" },
              { key: "estudo", label: "Estudo", icon: "▤" },
              { key: "marca", label: "Marca", icon: "✦" },
              { key: "comercial", label: "Comercial", icon: "↗" },
              { key: "cronograma", label: "Cronograma", icon: "▦" },
              { key: "tese", label: "Tese Interna", icon: "🔒", badge: "INT" },
            ]}
            active={tab}
            onChange={(k) => setTab(k as TabKey)}
          />

          {tab === "diagnostico" && <DiagnosticView study={study} />}
          {tab === "estudo" && study.output_md && (
            <StudyViewer study={study} onUpdate={loadStudy} />
          )}
          {tab === "marca" && (
            <OutputView
              study={study}
              field="brand_brief_md"
              outputType="brand"
              emptyLabel="Briefing de Marca"
              assigneeLabel="Kalley · Designer"
              onUpdate={loadStudy}
            />
          )}
          {tab === "comercial" && (
            <OutputView
              study={study}
              field="commercial_plan_md"
              outputType="commercial"
              emptyLabel="Plano Comercial"
              assigneeLabel="Thiago, Leonardo, Marco · Growth/Tráfego"
              onUpdate={loadStudy}
            />
          )}
          {tab === "cronograma" && <ExecutionView study={study} />}
          {tab === "tese" && <ThesisView study={study} />}
        </>
      )}
    </div>
  );
}
