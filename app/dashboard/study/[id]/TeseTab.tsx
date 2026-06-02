"use client";

import { useState } from "react";
import { StudyWithClient } from "@/lib/store";
import { updateStudyRemote } from "@/lib/storeApi";
import { Eyebrow } from "@/components/dashboard/Shared";
import { MarkdownView } from "@/components/MarkdownView";
import { VersionPicker } from "@/components/dashboard/VersionPicker";

export function TeseTab({
  study,
  onUpdate,
}: {
  study: StudyWithClient;
  onUpdate: () => void;
}) {
  const md = study.internal_thesis_md;
  const [generating, setGenerating] = useState(false);

  async function generateThesis() {
    if (!study.output_md) {
      alert(
        "O estudo do cliente precisa existir antes de gerar a tese interna."
      );
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/studies/regenerate-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outputType: "thesis",
          category: study.category,
          studyMd: study.output_md,
          clientName: study.client?.name || null,
          title: study.title,
          answers: study.answers || {},
          studyId: study.id,
        }),
      });
      if (!res.ok) {
        const e = (await res.json()) as { error?: string };
        throw new Error(e.error || "Erro ao gerar a tese interna.");
      }
      const data = (await res.json()) as {
        md?: string;
        internal_scores?: unknown;
        metadata?: Record<string, unknown>;
      };
      await updateStudyRemote(study.id, {
        internal_thesis_md: data.md || null,
        scores: {
          ...(study.scores || {}),
          internal:
            (data.internal_scores as typeof study.scores.internal) ||
            study.scores?.internal,
        },
        generation_metadata: {
          ...(study.generation_metadata || {}),
          ...(data.metadata || {}),
          thesis_generated_manually_at: new Date().toISOString(),
        },
      });
      onUpdate();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar tese.";
      alert(`Erro: ${msg}`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div
      className="surface"
      style={{
        padding: 40,
        position: "relative",
        overflow: "hidden",
        borderRadius: 16,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "inline-flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        {md && (
          <VersionPicker
            studyId={study.id}
            outputType="thesis"
            currentMd={md}
          />
        )}
        <span
          className="pill"
          style={{
            background: "rgba(185,100,255,0.1)",
            color: "var(--purple)",
          }}
        >
          Apenas sócios
        </span>
      </div>
      <Eyebrow tone="purple">Tese interna</Eyebrow>
      <h2
        style={{
          marginTop: 12,
          fontSize: 28,
          fontFamily: "var(--font-sans)",
          fontWeight: 900,
          color: "var(--navy)",
          letterSpacing: "-0.025em",
          lineHeight: 1.1,
        }}
      >
        Confidencial entre sócios.
      </h2>
      <p
        style={{
          color: "var(--ink-soft)",
          margin: "14px 0 0",
          maxWidth: 540,
          fontSize: 15,
          lineHeight: 1.6,
        }}
      >
        Camada interna do estudo que avalia entrada como sócia: due diligence
        técnica, posicionamento de equity, riscos materiais e janela ideal de
        entrada. Nunca exposta para o cliente nem em material público.
      </p>

      {md ? (
        <div
          style={{
            marginTop: 28,
            padding: 24,
            borderRadius: 16,
            background:
              "linear-gradient(135deg, rgba(185,100,255,0.04), rgba(93,87,235,0.04))",
            border: "1px solid rgba(185,100,255,0.18)",
          }}
        >
          <MarkdownView md={md} />
        </div>
      ) : (
        <>
          <div
            style={{
              marginTop: 32,
              padding: 24,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, rgba(185,100,255,0.06), rgba(93,87,235,0.06))",
              border: "1px solid rgba(185,100,255,0.18)",
              filter: "blur(1px)",
              userSelect: "none",
            }}
          >
            <div
              style={{
                height: 14,
                background: "rgba(185,100,255,0.15)",
                borderRadius: 4,
                width: "60%",
                marginBottom: 12,
              }}
            />
            <div
              style={{
                height: 10,
                background: "rgba(185,100,255,0.1)",
                borderRadius: 4,
                width: "85%",
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 10,
                background: "rgba(185,100,255,0.1)",
                borderRadius: 4,
                width: "78%",
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 10,
                background: "rgba(185,100,255,0.1)",
                borderRadius: 4,
                width: "82%",
              }}
            />
          </div>
          <div style={{ marginTop: 18 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={generateThesis}
              disabled={generating}
              style={{ fontSize: 13 }}
            >
              {generating ? "Gerando tese..." : "Gerar tese interna"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
