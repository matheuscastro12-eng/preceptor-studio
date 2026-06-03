"use client";

import { useCallback, useEffect, useState } from "react";

interface MoodBoard {
  id: string;
  prompt: string;
  metadata: { images?: string[]; count?: number };
  created_at: string;
}

export function MoodBoardCard({ studyId }: { studyId: string }) {
  const [boards, setBoards] = useState<MoodBoard[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/studies/${studyId}/mood-board`);
      const data = (await res.json()) as { moodBoards?: MoodBoard[] };
      setBoards(data.moodBoards || []);
    } catch {
      // ignore
    }
  }, [studyId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function generate() {
    setGenerating(true);
    setError(null);
    setUnavailable(false);
    try {
      const res = await fetch(`/api/studies/${studyId}/mood-board`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        if (data.error === "imagen_unavailable" || res.status === 402) {
          setUnavailable(true);
          return;
        }
        throw new Error(data.error || "Erro");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setGenerating(false);
    }
  }

  const latest = boards[0];
  const images = latest?.metadata?.images || [];

  return (
    <div
      className="surface"
      style={{ padding: 24, borderRadius: 16, marginTop: 20 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
          }}
        >
          Mood board visual
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={generate}
          disabled={generating}
          style={{ fontSize: 12, padding: "6px 14px" }}
        >
          {generating
            ? "Gerando..."
            : latest
              ? "✦ Regenerar"
              : "✦ Gerar mood board"}
        </button>
      </div>

      {unavailable && (
        <div
          style={{
            padding: 16,
            background: "rgba(185,100,255,0.08)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--ink-soft)",
          }}
        >
          Imagen 3 requer cota paga. Contate o owner para ativar a API na conta
          Google.
        </div>
      )}

      {error && (
        <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 8 }}>
          {error}
        </div>
      )}

      {images.length > 0 ? (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            {images.slice(0, 4).map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(src)}
                style={{
                  border: 0,
                  padding: 0,
                  cursor: "pointer",
                  borderRadius: 12,
                  overflow: "hidden",
                  aspectRatio: "1 / 1",
                  background: "#f1f5f9",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Mood board ${i + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </button>
            ))}
          </div>
          <p
            style={{
              fontSize: 11,
              color: "var(--ink-mute)",
              marginTop: 10,
              fontFamily: "var(--font-mono)",
            }}
          >
            {latest?.prompt}
          </p>
        </div>
      ) : (
        !unavailable &&
        !generating && (
          <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
            Gere 4 referências visuais a partir do brand brief usando Imagen 3.
          </p>
        )
      )}

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            cursor: "zoom-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Mood board ampliado"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 12,
            }}
          />
        </div>
      )}
    </div>
  );
}
