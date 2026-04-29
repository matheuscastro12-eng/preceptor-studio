"use client";

import { useState } from "react";
import { downloadStudyPDF, PDFKind } from "@/lib/pdfClient";
import { StudyWithClient } from "@/lib/store";

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
  return (
    <button
      onClick={go}
      disabled={loading}
      className={`${variant === "primary" ? "btn-primary" : "btn-ghost"} text-xs disabled:opacity-50`}
    >
      {loading ? "Gerando..." : label || "↓ Baixar PDF"}
    </button>
  );
}
