"use client";

import { Download, Loader2 } from "lucide-react";
import { downloadStudyPDF, PDFKind } from "@/lib/pdfClient";
import { StudyWithClient } from "@/lib/store";
import { useState } from "react";

export function PDFButton({
  study,
  kind,
  variant = "primary",
  label,
}: {
  study: StudyWithClient;
  kind: PDFKind;
  variant?: "primary" | "ghost";
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      await downloadStudyPDF(study, kind);
    } catch (e: any) {
      alert(`Erro ao gerar PDF: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  const Icon = loading ? Loader2 : Download;

  return (
    <button
      onClick={go}
      disabled={loading}
      className={`${variant === "primary" ? "btn-primary" : "btn-ghost"} inline-flex items-center gap-2 text-xs disabled:opacity-50`}
    >
      <Icon className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Gerando..." : label || "Baixar PDF"}
    </button>
  );
}
