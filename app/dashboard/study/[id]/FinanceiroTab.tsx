"use client";

import { useState } from "react";
import { StudyWithClient } from "@/lib/store";
import { updateStudyRemote } from "@/lib/storeApi";
import { Eyebrow } from "@/components/dashboard/Shared";
import { MarkdownView } from "@/components/MarkdownView";
import { VersionPicker } from "@/components/dashboard/VersionPicker";

export function FinanceiroTab({
  study,
  onUpdate,
}: {
  study: StudyWithClient;
  onUpdate: () => void;
}) {
  const md = study.financial_md;
  const [generating, setGenerating] = useState(false);

  async function generate() {
    if (!study.output_md) {
      alert("Estudo do cliente é necessário para gerar o financeiro.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/studies/regenerate-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outputType: "financial",
          category: study.category,
          studyMd: study.output_md,
          commercialMd: study.commercial_plan_md || null,
          clientName: study.client?.name || null,
          title: study.title,
          studyId: study.id,
        }),
      });
      if (!res.ok) {
        const e = (await res.json()) as { error?: string };
        throw new Error(e.error || "Erro");
      }
      const { md: newMd } = (await res.json()) as { md?: string };
      await updateStudyRemote(study.id, {
        financial_md: newMd || null,
      });
      onUpdate();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro";
      alert(`Erro: ${msg}`);
    } finally {
      setGenerating(false);
    }
  }

  if (!md) {
    return (
      <div
        className="surface"
        style={{ padding: 40, borderRadius: 16, textAlign: "center" }}
      >
        <Eyebrow>Financeiro · DRE e Forecast</Eyebrow>
        <h2
          style={{
            marginTop: 12,
            fontSize: 22,
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            color: "var(--navy)",
            letterSpacing: "-0.022em",
          }}
        >
          Financeiro ainda não foi gerado.
        </h2>
        <p
          style={{
            color: "var(--ink-soft)",
            margin: "10px auto 18px",
            fontSize: 14,
            maxWidth: 480,
          }}
        >
          A IA monta a DRE projetada, o forecast mensal de 12 meses, cenários e
          os KPIs financeiros a partir do estudo e do plano comercial.
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={generate}
          disabled={generating}
          style={{ fontSize: 13 }}
        >
          {generating ? "Gerando..." : "✨ Gerar DRE e Forecast"}
        </button>
      </div>
    );
  }

  return (
    <div
      className="surface"
      style={{ padding: 40, borderRadius: 16, position: "relative" }}
    >
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <VersionPicker studyId={study.id} outputType="financial" currentMd={md} />
        <button
          type="button"
          className="btn-ghost"
          onClick={generate}
          disabled={generating}
          style={{ fontSize: 12 }}
        >
          {generating ? "Gerando..." : "↻ Regenerar"}
        </button>
      </div>
      <Eyebrow>Financeiro · DRE e Forecast</Eyebrow>
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
        Onde o dinheiro entra, sai e vira lucro.
      </h2>
      <div style={{ marginTop: 28 }}>
        <MarkdownView md={md} />
      </div>
    </div>
  );
}
