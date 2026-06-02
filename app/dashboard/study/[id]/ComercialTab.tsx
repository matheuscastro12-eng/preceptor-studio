"use client";

import { useState } from "react";
import { StudyWithClient } from "@/lib/store";
import { updateStudyRemote } from "@/lib/storeApi";
import { Eyebrow } from "@/components/dashboard/Shared";
import { MarkdownView } from "@/components/MarkdownView";
import { ResearchCard } from "./ResearchCard";
import { VersionPicker } from "@/components/dashboard/VersionPicker";

interface ProposalResponse {
  md?: string;
  version_id?: string;
  generated_at?: string;
  error?: string;
}

export function ComercialTab({
  study,
  onUpdate,
}: {
  study: StudyWithClient;
  onUpdate: () => void;
}) {
  const md = study.commercial_plan_md;
  const [generating, setGenerating] = useState(false);

  const meta = (study.generation_metadata || {}) as Record<string, unknown>;
  const initialProposal =
    typeof meta.last_proposal_md === "string"
      ? (meta.last_proposal_md as string)
      : null;
  const initialProposalAt =
    typeof meta.last_proposal_at === "string"
      ? (meta.last_proposal_at as string)
      : null;

  const [proposalMd, setProposalMd] = useState<string | null>(initialProposal);
  const [proposalAt, setProposalAt] = useState<string | null>(initialProposalAt);
  const [proposalGenerating, setProposalGenerating] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!study.output_md) {
      alert("Estudo do cliente é necessário para gerar o plano comercial.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/studies/regenerate-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outputType: "commercial",
          category: study.category,
          studyMd: study.output_md,
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
        commercial_plan_md: newMd || null,
      });
      onUpdate();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro";
      alert(`Erro: ${msg}`);
    } finally {
      setGenerating(false);
    }
  }

  async function generateProposal() {
    setProposalGenerating(true);
    setProposalError(null);
    try {
      const res = await fetch(`/api/studies/${study.id}/generate-proposal`, {
        method: "POST",
      });
      const data = (await res.json()) as ProposalResponse;
      if (!res.ok || !data.md) {
        throw new Error(data.error || "Falha ao gerar proposta.");
      }
      setProposalMd(data.md);
      setProposalAt(data.generated_at || new Date().toISOString());
      setModalOpen(true);
      onUpdate();
    } catch (e: unknown) {
      setProposalError(e instanceof Error ? e.message : "Erro");
    } finally {
      setProposalGenerating(false);
    }
  }

  async function copyMarkdown() {
    if (!proposalMd) return;
    try {
      await navigator.clipboard.writeText(proposalMd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setProposalError("Não conseguimos copiar pro clipboard.");
    }
  }

  function downloadMarkdown() {
    if (!proposalMd) return;
    const safe = (study.client?.name || study.title).replace(/[^a-z0-9]/gi, "_");
    const blob = new Blob([proposalMd], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proposta-${safe}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Card de proposta IA */}
      <div
        className="surface"
        style={{
          padding: 28,
          borderRadius: 16,
          border: "1px solid rgba(82,225,231,0.35)",
          background:
            "linear-gradient(135deg, rgba(82,225,231,0.06), rgba(93,87,235,0.06))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 240 }}>
            <Eyebrow>Proposta comercial</Eyebrow>
            <h3
              style={{
                marginTop: 8,
                fontSize: 20,
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                color: "var(--navy)",
                letterSpacing: "-0.022em",
              }}
            >
              Gerar proposta pronta pra enviar.
            </h3>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: 13.5,
                margin: "8px 0 0",
                lineHeight: 1.5,
                maxWidth: 560,
              }}
            >
              IA usa diagnóstico, estudo e plano comercial para gerar uma proposta
              de 12 a 24 semanas com escopo, milestones e pricing sugerido. Sempre
              revise antes de enviar.
            </p>
            {proposalAt && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--ink-mute)",
                }}
              >
                Última geração:{" "}
                {new Date(proposalAt).toLocaleString("pt-BR")}
              </div>
            )}
            {proposalError && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  background: "#FEE2E2",
                  color: "#B91C1C",
                }}
              >
                {proposalError}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {proposalMd && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setModalOpen(true)}
                style={{ fontSize: 12 }}
              >
                Ver última
              </button>
            )}
            <button
              type="button"
              className="btn-primary"
              onClick={generateProposal}
              disabled={proposalGenerating}
              style={{ fontSize: 13 }}
            >
              {proposalGenerating
                ? "Gerando..."
                : proposalMd
                  ? "↻ Regenerar"
                  : "✨ Gerar proposta comercial"}
            </button>
          </div>
        </div>
      </div>

      {/* Plano comercial padrão */}
      {!md ? (
        <div
          className="surface"
          style={{ padding: 40, borderRadius: 16, textAlign: "center" }}
        >
          <Eyebrow>Plano comercial</Eyebrow>
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
            Plano comercial ainda não foi gerado.
          </h2>
          <p
            style={{
              color: "var(--ink-soft)",
              margin: "10px auto 18px",
              fontSize: 14,
              maxWidth: 480,
            }}
          >
            Gere agora para liberar o canal, pricing, motion e funil.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={generate}
            disabled={generating}
            style={{ fontSize: 13 }}
          >
            {generating ? "Gerando..." : "Gerar plano comercial"}
          </button>
        </div>
      ) : (
        <div className="surface" style={{ padding: 40, borderRadius: 16, position: "relative" }}>
          <div style={{ position: "absolute", top: 16, right: 16 }}>
            <VersionPicker studyId={study.id} outputType="commercial" currentMd={md} />
          </div>
          <Eyebrow>Plano comercial</Eyebrow>
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
            De 0 a 100 leads em 90 dias.
          </h2>
          <div style={{ marginTop: 28 }}>
            <MarkdownView md={md} />
          </div>
        </div>
      )}

      <ResearchCard studyId={study.id} />

      {/* Modal proposta */}
      {modalOpen && proposalMd && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(6,18,42,0.72)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "40px 16px",
            zIndex: 100,
            overflowY: "auto",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 880,
              width: "100%",
              boxShadow: "0 24px 80px -16px rgba(0,0,0,0.4)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "calc(100vh - 80px)",
            }}
          >
            <div
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid var(--slate-200)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 220 }}>
                <Eyebrow>Proposta gerada</Eyebrow>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--navy)",
                    marginTop: 4,
                  }}
                >
                  {study.client?.name || study.title}
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={copyMarkdown}
                style={{ fontSize: 12 }}
              >
                {copied ? "Copiado" : "⧉ Copiar markdown"}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={downloadMarkdown}
                style={{ fontSize: 12 }}
              >
                ↓ Baixar .md
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setModalOpen(false)}
                style={{ fontSize: 12 }}
              >
                Fechar
              </button>
            </div>
            <div style={{ overflowY: "auto", padding: "20px 28px 28px" }}>
              <MarkdownView md={proposalMd} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
