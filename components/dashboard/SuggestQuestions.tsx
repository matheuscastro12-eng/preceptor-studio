"use client";

import { useEffect, useState } from "react";

export function SuggestQuestionsButton({ studyId }: { studyId: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  async function trigger() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/studies/${studyId}/suggest-questions`, {
        method: "POST",
      });
      const data = (await res.json()) as { questions?: string[]; error?: string };
      if (!res.ok || !data.questions) {
        throw new Error(data.error || "Erro ao sugerir perguntas.");
      }
      setQuestions(data.questions);
      setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function copyQ(idx: number, q: string) {
    try {
      await navigator.clipboard.writeText(q);
      setCopied(idx);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn-ghost"
        onClick={trigger}
        disabled={loading}
        style={{ fontSize: 12 }}
        title="Sugerir próximas perguntas via IA"
      >
        ✨ {loading ? "Sugerindo..." : "Sugerir próximas perguntas"}
      </button>
      {error && (
        <span style={{ fontSize: 11, color: "var(--danger, #DC2626)", marginLeft: 8 }}>
          {error}
        </span>
      )}
      {open && (
        <QuestionsModal
          questions={questions}
          copied={copied}
          onCopy={copyQ}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function QuestionsModal({
  questions,
  copied,
  onCopy,
  onClose,
}: {
  questions: string[];
  copied: number | null;
  onCopy: (idx: number, q: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6,18,42,0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "min(620px, 100%)",
          maxHeight: "85vh",
          overflow: "auto",
          border: "1px solid var(--line)",
          padding: 24,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--purple, #B964FF)",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          PRÓXIMAS PERGUNTAS · IA
        </div>
        <h3
          style={{
            fontSize: 20,
            fontFamily: "var(--font-sans)",
            fontWeight: 900,
            color: "var(--navy)",
            margin: 0,
            letterSpacing: "-0.022em",
          }}
        >
          Três perguntas pra aprofundar a tese.
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--ink-soft)",
            margin: "8px 0 18px",
          }}
        >
          Lacunas identificadas a partir do estudo gerado. Use na próxima rodada com o cliente.
        </p>
        <ol
          style={{
            listStyle: "decimal",
            paddingLeft: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            margin: 0,
          }}
        >
          {questions.map((q, idx) => (
            <li key={idx} style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.5 }}>
              <div style={{ marginBottom: 6 }}>{q}</div>
              <button
                type="button"
                onClick={() => onCopy(idx, q)}
                className="btn-ghost"
                style={{ fontSize: 11, padding: "4px 10px" }}
              >
                {copied === idx ? "✓ Copiado" : "Copiar para clipboard"}
              </button>
            </li>
          ))}
        </ol>
        <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ fontSize: 12 }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
