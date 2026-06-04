"use client";

import { useEffect, useRef, useState } from "react";
import { fbqTrack, newEventId, readFbCookies } from "@/lib/metaEvents";
import { trackFunnel, getAttribution } from "@/lib/funnelTrack";
import { HeroScreen } from "./components/HeroScreen";
import { QuestionnaireScreen } from "./components/QuestionnaireScreen";
import { CaptureScreen, type CaptureContact } from "./components/CaptureScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { ResultScreen } from "./components/ResultScreen";
import type { DiagnosticAnswers, DiagnosticResult } from "@/lib/diagnosticScore";
import type { LeadCategory } from "@/lib/leads";

type Step = "hero" | "quiz" | "capture" | "loading" | "result";

// Tempo mínimo na tela de loading. Faz a IA parecer pensativa, dá tempo da
// animação se completar e evita aquela sensação de "respondeu rápido demais
// pra ter analisado de verdade".
const MIN_LOADING_MS = 2500;

function initialStep(): Step {
  if (typeof window === "undefined") return "hero";
  const params = new URLSearchParams(window.location.search);
  if (params.get("start") === "1" || params.get("step") === "quiz") return "quiz";
  return "hero";
}

export function DiagnosticApp({ calcomUrl }: { calcomUrl?: string | null } = {}) {
  const [step, setStep] = useState<Step>("hero");

  useEffect(() => {
    const next = initialStep();
    if (next !== "hero") setStep(next);
  }, []);
  const [section, setSection] = useState(0);
  const [answers, setAnswers] = useState<DiagnosticAnswers>({});
  const [contact, setContact] = useState<CaptureContact>({
    nome: "",
    email: "",
    empresa: "",
    telefone: "",
  });
  const [category, setCategory] = useState<LeadCategory | "">("");
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Se o usuário voltar (browser back) durante o loading, reseta pra capture
  // pra não ficar preso numa tela transitória sem estado de result ainda.
  useEffect(() => {
    function onPop() {
      setStep((current) => (current === "loading" ? "capture" : current));
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ─── Meta Pixel: eventos de funil (ViewContent → InitiateCheckout → Lead) ─
  const firedInitiate = useRef(false);
  useEffect(() => {
    fbqTrack("ViewContent", { content_name: "diagnostico" });
    trackFunnel("diagnostic_view");
  }, []);
  useEffect(() => {
    if (step === "quiz" && !firedInitiate.current) {
      firedInitiate.current = true;
      fbqTrack("InitiateCheckout", { content_name: "diagnostico" });
      trackFunnel("diagnostic_start");
    }
  }, [step]);

  function reset() {
    setStep("hero");
    setSection(0);
    setAnswers({});
    setContact({ nome: "", email: "", empresa: "", telefone: "" });
    setCategory("");
    setResult(null);
    setLeadId(null);
    setErrorMessage(null);
  }

  function home() {
    setStep("hero");
  }

  async function submit() {
    setSubmitting(true);
    setErrorMessage(null);
    setStep("loading");
    const start = Date.now();

    // Contexto Meta para deduplicar o Lead do browser com o da CAPI (servidor).
    const eventId = newEventId();
    const { fbp, fbc } = readFbCookies();
    const eventSourceUrl =
      typeof window !== "undefined" ? window.location.href : undefined;

    async function settleLoading() {
      const elapsed = Date.now() - start;
      const remaining = MIN_LOADING_MS - elapsed;
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
    }

    try {
      const res = await fetch("/api/public/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          contact,
          consent,
          category: category || null,
          meta: { event_id: eventId, fbp, fbc, event_source_url: eventSourceUrl },
          attribution: getAttribution(),
        }),
      });
      const data = (await res.json()) as DiagnosticResult & { error?: string; id?: string };
      if (!res.ok) {
        await settleLoading();
        setErrorMessage(data.error || "Não conseguimos gerar o score. Tente novamente.");
        setSubmitting(false);
        setStep("capture");
        return;
      }
      await settleLoading();
      setResult({
        overall: data.overall,
        headline: data.headline,
        bucket: data.bucket,
        axes: data.axes,
        lockedAxes: data.lockedAxes,
        insights: data.insights,
        lockedInsights: data.lockedInsights,
        recommendation: data.recommendation,
        recommendationReason: data.recommendationReason,
        nextSteps: data.nextSteps,
        strategicQuestions: data.strategicQuestions,
        benchmark: data.benchmark,
      });
      setLeadId(data.id ?? null);
      setStep("result");
      // Evento de conversao (browser). A CAPI dispara o mesmo Lead no servidor,
      // deduplicado pelo eventId. Esse e o evento que o Meta vai otimizar.
      fbqTrack(
        "Lead",
        {
          content_name: "diagnostico",
          content_category: category || "geral",
          predicted_score: data.overall,
        },
        eventId
      );
    } catch (err) {
      await settleLoading();
      setErrorMessage(
        err instanceof Error ? err.message : "Não conseguimos gerar o score. Tente novamente."
      );
      setStep("capture");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="diag-app">
      {step === "hero" && <HeroScreen onStart={() => setStep("quiz")} />}
      {step === "quiz" && (
        <QuestionnaireScreen
          answers={answers}
          setAnswers={setAnswers}
          currentSection={section}
          setCurrentSection={setSection}
          onSubmit={() => setStep("capture")}
          onHome={home}
        />
      )}
      {step === "capture" && (
        <CaptureScreen
          contact={contact}
          setContact={setContact}
          category={category}
          setCategory={setCategory}
          consent={consent}
          setConsent={setConsent}
          onContinue={submit}
          onBack={() => setStep("quiz")}
          onHome={home}
          submitting={submitting}
          errorMessage={errorMessage}
        />
      )}
      {step === "loading" && <LoadingScreen onHome={home} />}
      {step === "result" && result && (
        <ResultScreen
          result={result}
          contact={contact}
          leadId={leadId}
          calcomUrl={calcomUrl ?? null}
          onRestart={reset}
          onHome={home}
        />
      )}
    </div>
  );
}
