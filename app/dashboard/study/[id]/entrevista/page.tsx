"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStudyRemote } from "@/lib/storeApi";
import { StudyWithClient } from "@/lib/store";
import { InterviewClient } from "./InterviewClient";

export default function EntrevistaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [study, setStudy] = useState<StudyWithClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      const s = await getStudyRemote(id as string);
      if (!alive) return;
      setStudy(s);
      setLoading(false);
    }
    if (id) load();
    return () => {
      alive = false;
    };
  }, [id]);

  // Esconde sidebar/topbar do dashboard durante a entrevista (visual limpo).
  useEffect(() => {
    if (typeof document === "undefined") return;
    const shell = document.querySelector(".dashboard-shell");
    if (!shell) return;
    shell.setAttribute("data-present", "1");
    return () => {
      shell.removeAttribute("data-present");
    };
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: 760, margin: "60px auto", padding: 24 }}>
        <div
          className="shimmer"
          style={{ height: 32, width: 320, borderRadius: 8, marginBottom: 16 }}
        />
        <div
          className="shimmer surface"
          style={{ height: 280, borderRadius: 16 }}
        />
      </div>
    );
  }

  if (!study) {
    return (
      <div style={{ maxWidth: 760, margin: "60px auto", padding: 24 }}>
        <div
          className="surface"
          style={{ padding: 32, borderRadius: 16, textAlign: "center" }}
        >
          <p style={{ color: "var(--ink-soft)", marginBottom: 16 }}>
            Estudo não encontrado.
          </p>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => router.push("/dashboard/estudos")}
          >
            ← Voltar para estudos
          </button>
        </div>
      </div>
    );
  }

  return <InterviewClient study={study} />;
}
