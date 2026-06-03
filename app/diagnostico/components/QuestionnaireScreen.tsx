"use client";

import { Chrome } from "./Chrome";
import { LikertField, LongText, SingleChoice } from "./QuestionFields";
import type { DiagnosticAnswers } from "@/lib/diagnosticScore";

type QuestionItem =
  | { id: keyof DiagnosticAnswers; kind: "long"; q: string; helper?: string; placeholder?: string }
  | { id: keyof DiagnosticAnswers; kind: "likert"; q: string; helper?: string }
  | { id: keyof DiagnosticAnswers; kind: "single"; q: string; helper?: string; options: string[] };

interface Section {
  name: string;
  helper: string;
  items: QuestionItem[];
}

const QUESTIONS: Section[] = [
  {
    name: "Sua ideia",
    helper: "O que é, para quem.",
    items: [
      {
        id: "ideia",
        kind: "long",
        q: "Em uma frase, qual é a sua ideia?",
        helper: "Quem é, o que faz e pra quem.",
        placeholder:
          "Plataforma de teleconsulta para nutricionistas e operadoras de saúde corporativa.",
      },
      {
        id: "problema",
        kind: "long",
        q: "Qual problema você resolve, e por que dói hoje?",
        helper: "Quanto mais concreto, melhor.",
        placeholder:
          "Operadoras gastam tempo em agendamento manual; pacientes desistem antes da consulta.",
      },
    ],
  },
  {
    name: "Mercado e cliente",
    helper: "Quem paga e qual o tamanho.",
    items: [
      {
        id: "cliente",
        kind: "long",
        q: "Quem é o cliente que paga, e qual o tamanho dele?",
        helper: "Persona, porte (número de vidas, receita ou volume).",
        placeholder: "Operadoras de médio porte, 50 a 500 mil vidas.",
      },
      {
        id: "mercado_tamanho",
        kind: "single",
        q: "Quantos clientes em potencial existem no Brasil?",
        helper: "Estimativa do universo total endereçável.",
        options: [
          "Menos de 10 mil",
          "10 mil a 100 mil",
          "100 mil a 1 milhão",
          "Mais de 1 milhão",
          "Ainda não sei medir",
        ],
      },
      {
        id: "demanda",
        kind: "likert",
        q: "Já temos sinais concretos de demanda (pilotos, conversas, lista de espera).",
      },
    ],
  },
  {
    name: "Modelo e execução",
    helper: "Como cobra, como entrega.",
    items: [
      {
        id: "receita",
        kind: "single",
        q: "Como você cobra hoje (ou pretende cobrar)?",
        options: [
          "Assinatura mensal (SaaS)",
          "Cobrança por uso ou por consulta",
          "Licenciamento anual",
          "Comissão sobre transações",
          "Modelo híbrido (serviço + software)",
        ],
      },
      {
        id: "execucao",
        kind: "likert",
        q: "Já temos clareza técnica de como construir nos próximos 90 dias.",
      },
      {
        id: "capital",
        kind: "single",
        q: "Quanto capital você tem disponível pra próxima fase?",
        helper: "Caixa próprio ou já comprometido.",
        options: [
          "Menos de R$ 20k (bootstrap)",
          "R$ 20k a 100k (próprio ou amigos)",
          "R$ 100k a 500k (anjo/pre-seed)",
          "Mais de R$ 500k (seed+)",
          "Ainda captando",
        ],
      },
    ],
  },
  {
    name: "Diferencial e risco",
    helper: "Defesa, regulação, timing.",
    items: [
      {
        id: "diferencial",
        kind: "likert",
        q: "Temos uma vantagem defensável que concorrentes levariam mais de 12 meses para copiar.",
      },
      {
        id: "regulacao",
        kind: "single",
        q: "Qual o nível de regulação no seu setor?",
        options: [
          "Nenhuma / muito leve",
          "Média (precisa de adaptação)",
          "Alta (LGPD, CFM, ANVISA, etc.)",
          "Crítica (saúde, financeiro pesado)",
        ],
      },
      {
        id: "urgencia",
        kind: "likert",
        q: "Existe uma janela de mercado que vai fechar nos próximos 12 meses se a gente não agir.",
      },
    ],
  },
];

function sectionLead(name: string): string {
  if (name === "Sua ideia")
    return "Quanto mais concreto você for, melhor a leitura que a IA devolve. Não precisa de pitch perfeito.";
  if (name === "Mercado e cliente")
    return "A gente quer entender se já existe demanda de verdade ou se ainda é hipótese.";
  if (name === "Modelo e execução")
    return "Aqui medimos modelo de receita, capital disponível e quanto da entrega você já consegue desenhar tecnicamente.";
  return "Defensibilidade, regulação e timing. Os 3 que mais derrubam tese boa em fase inicial.";
}

export function QuestionnaireScreen({
  answers,
  setAnswers,
  currentSection,
  setCurrentSection,
  onSubmit,
  onHome,
}: {
  answers: DiagnosticAnswers;
  setAnswers: (a: DiagnosticAnswers) => void;
  currentSection: number;
  setCurrentSection: (n: number) => void;
  onSubmit: () => void;
  onHome: () => void;
}) {
  const total = QUESTIONS.length;
  const section = QUESTIONS[currentSection]!;
  const valid = section.items.every((q) => {
    const v = answers[q.id];
    return v !== undefined && v !== null && String(v).trim() !== "";
  });
  const setVal = (id: keyof DiagnosticAnswers, v: string) =>
    setAnswers({ ...answers, [id]: v });

  function next() {
    if (!valid) return;
    if (currentSection < total - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onSubmit();
    }
  }
  function prev() {
    if (currentSection > 0) setCurrentSection(currentSection - 1);
  }

  const pct = Math.round(((currentSection + 1) / total) * 100);

  return (
    <div className="screen" data-screen-label="02 Questionário">
      <Chrome onHome={onHome} cta="Voltar à home" onCta={onHome} inset />

      <div
        className="padx"
        style={{
          paddingTop: 24,
          paddingBottom: 24,
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 40,
          alignItems: "end",
          borderBottom: "1px solid rgba(15,23,41,0.05)",
        }}
      >
        <div>
          <span className="eyebrow">
            Diagnóstico, parte {currentSection + 1} de {total}
          </span>
          <h1 className="display-md" style={{ marginTop: 14 }}>
            {section.name === "Sua ideia" && (
              <>
                Conta pra gente sobre <span className="it">a sua ideia.</span>
              </>
            )}
            {section.name === "Mercado e cliente" && (
              <>
                Quem paga, <span className="it">e quanto vale.</span>
              </>
            )}
            {section.name === "Modelo e execução" && (
              <>
                Como cobra, <span className="cyan">como entrega.</span>
              </>
            )}
            {section.name === "Diferencial e risco" && (
              <>
                Defesa, regulação, <span className="cyan">timing.</span>
              </>
            )}
          </h1>
          <p className="lead" style={{ marginTop: 12 }}>
            {sectionLead(section.name)}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="overline">Progresso</span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 22,
                color: "var(--navy)",
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {pct}
              <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>%</span>
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 6,
              background: "#E2E8F0",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: "linear-gradient(90deg,#52E1E7,#5D57EB)",
                transition: "width 500ms var(--ease-out)",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {QUESTIONS.map((s, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: i === currentSection ? "rgba(82,225,231,0.1)" : "transparent",
                  border:
                    i === currentSection
                      ? "1px solid rgba(82,225,231,0.4)"
                      : "1px solid rgba(15,23,41,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color:
                      i < currentSection
                        ? "var(--cyan-deep)"
                        : i === currentSection
                          ? "var(--blue)"
                          : "var(--ink-mute)",
                  }}
                >
                  {i < currentSection ? "✓ feito" : `Parte ${i + 1}`}
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--navy)", fontWeight: 600, marginTop: 2 }}
                >
                  {s.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="padx"
        style={{
          paddingTop: 40,
          paddingBottom: 32,
          display: "flex",
          flexDirection: "column",
          gap: 36,
          maxWidth: 820,
        }}
      >
        {section.items.map((q, idx) => (
          <div key={q.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--ink-mute)",
                  fontWeight: 600,
                }}
              >
                0{idx + 1}
              </span>
              <span style={{ flex: 1, height: 1, background: "rgba(15,23,41,0.06)" }} />
            </div>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                color: "var(--navy)",
                fontSize: 22,
                letterSpacing: "-0.015em",
                lineHeight: 1.25,
                marginBottom: 6,
              }}
            >
              {q.q}
            </label>
            {q.helper && (
              <p
                style={{
                  fontSize: 14,
                  color: "var(--ink-soft)",
                  margin: "0 0 18px",
                  maxWidth: 560,
                }}
              >
                {q.helper}
              </p>
            )}
            {q.kind === "long" && (
              <LongText
                value={answers[q.id] as string | undefined}
                onChange={(v) => setVal(q.id, v)}
                placeholder={q.placeholder}
              />
            )}
            {q.kind === "likert" && (
              <LikertField
                value={answers[q.id] as string | undefined}
                onChange={(v) => setVal(q.id, v)}
              />
            )}
            {q.kind === "single" && (
              <SingleChoice
                options={q.options}
                value={answers[q.id] as string | undefined}
                onChange={(v) => setVal(q.id, v)}
              />
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "22px 56px",
          borderTop: "1px solid rgba(15,23,41,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(247,249,252,0.6)",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="btn-pill btn-pill--ghost"
          onClick={prev}
          disabled={currentSection === 0}
        >
          <span className="btn-pill__icon">←</span>
          Anterior
        </button>
        <span
          style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-mute)" }}
        >
          1 envio por IP a cada 24h
        </span>
        <button
          type="button"
          className={`btn-pill ${currentSection === total - 1 ? "btn-pill--cyan" : "btn-pill--primary"}`}
          onClick={next}
          disabled={!valid}
        >
          {currentSection === total - 1 ? "Ver meu score" : "Próxima parte"}
          <span className="btn-pill__icon">→</span>
        </button>
      </div>
    </div>
  );
}
