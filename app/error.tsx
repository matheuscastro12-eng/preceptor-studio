"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(82,225,231,0.08), transparent), #f7f9fc",
      }}
    >
      <div
        role="alert"
        aria-live="assertive"
        className="surface"
        style={{
          maxWidth: 480,
          width: "100%",
          padding: 32,
          borderRadius: 20,
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              background: "var(--cyan)",
              transform: "rotate(45deg)",
              borderRadius: 2,
              display: "inline-block",
            }}
            aria-hidden="true"
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--blue)",
            }}
          >
            STUDIO , Erro inesperado
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 900,
            fontSize: 28,
            color: "var(--navy)",
            letterSpacing: "-0.025em",
            margin: "0 0 8px",
          }}
        >
          Algo quebrou aqui.
        </h1>
        <p
          style={{
            color: "var(--ink-soft)",
            fontSize: 15,
            lineHeight: 1.55,
            margin: "0 0 24px",
          }}
        >
          A engenharia humana já foi avisada. Tente recarregar ou volte para a
          home.
        </p>
        {error?.digest && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--ink-mute)",
              marginBottom: 20,
            }}
          >
            ref: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary"
            aria-label="Tentar novamente"
          >
            Tentar novamente
          </button>
          <Link href="/" className="btn-ghost" aria-label="Voltar para a home">
            Voltar para a home
          </Link>
        </div>
      </div>
    </div>
  );
}
