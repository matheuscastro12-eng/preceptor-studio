"use client";

import { useState } from "react";
import { StudyWithClient } from "@/lib/store";
import { updateStudyRemote } from "@/lib/storeApi";
import { ARTIFACT_META, ArtifactType } from "@/prompts/artifacts";
import { ArtifactCard } from "./ArtifactCard";

const ORDER: ArtifactType[] = [
  "briefing_dev",
  "briefing_design",
  "briefing_growth",
  "financial_model",
  "prospecting_script",
];

export function ArtifactsView({
  study,
  onUpdate,
}: {
  study: StudyWithClient;
  onUpdate: () => void;
}) {
  const [regenerating, setRegenerating] = useState<string | null>(null);

  async function regenerate(type: ArtifactType) {
    setRegenerating(type);
    try {
      const res = await fetch("/api/studies/regenerate-artifact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artifactType: type,
          category: study.category,
          studyMd: study.output_md,
          clientName: study.client?.name || null,
          title: study.title,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro");
      }
      const { artifact } = await res.json();
      const next = { ...(study.artifacts || {}), [type]: artifact };
      await updateStudyRemote(study.id, { artifacts: next });
      onUpdate();
    } catch (e: any) {
      alert(`Erro regenerando: ${e.message}`);
    } finally {
      setRegenerating(null);
    }
  }

  const hasAny = ORDER.some((t) => study.artifacts?.[t]?.md);

  if (!hasAny) {
    return (
      <div className="surface rounded-2xl p-12 text-center">
        <div className="eyebrow mb-2">Artefatos</div>
        <p className="text-ink-soft">
          Nenhum artefato gerado ainda. Regenere o estudo para criar os briefings de execução.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ORDER.map((type) => (
        <ArtifactCard
          key={type}
          type={type}
          icon={ARTIFACT_META[type].icon}
          description={ARTIFACT_META[type].description}
          data={study.artifacts?.[type]}
          onRegenerate={() => regenerate(type)}
          regenerating={regenerating === type}
        />
      ))}
    </div>
  );
}
