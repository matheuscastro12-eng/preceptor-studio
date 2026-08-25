"use client";

import { useEffect, useRef } from "react";
import { Chrome } from "./Chrome";
import { LikertField, LongText, SingleChoice } from "./QuestionFields";
import { fbqTrack } from "@/lib/metaEvents";
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
    name: "Sua operação",
    helper: "O que a empresa faz, onde dói.",
    items: [
      {
        id: "operacao",
        kind: "long",
        q: "Em uma frase, o que a sua empresa faz e pra quem?",
        helper: "Segmento, o que entrega e pra que tipo de cliente.",
        placeholder:
          "Transportadora de carga fracionada atendendo indústrias do Sul de Minas.",
      },
      {
        id: "processo_critico",
        kind: "long",
        q: "Qual processo mais consome tempo do seu time hoje, e como ele funciona?",
        helper: "Descreva a rotina como ela acontece de verdade, sem embelezar.",
        placeholder:
          "Conferência de canhotos e faturamento: o motorista entrega o papel, alguém digita no sistema, outra pessoa confere na planilha antes de faturar.",
      },
    ],
  },
  {
    name: "Rotina e sistemas",
    helper: "Ferramentas, retrabalho, volume.",
    items: [
      {
        id: "sistemas",
        kind: "single",
        q: "O que roda a sua operação hoje?",
        options: [
          "Papel, caderno e WhatsApp",
          "Principalmente planilhas",
          "Planilhas + um sistema (ERP ou CRM)",
          "Vários sistemas que não conversam entre si",
          "Sistemas integrados",
        ],
      },
      {
        id: "retrabalho",
        kind: "likert",
        q: "Meu time digita o mesmo dado em mais de um lugar (planilha, sistema, WhatsApp).",
      },
      {
        id: "volume",
        kind: "single",
        q: "Quantas vezes esse processo crítico roda por mês?",
        helper: "Pedidos, cargas, laudos, atendimentos, o que fizer sentido.",
        options: [
          "Até 100 por mês",
          "100 a 1 mil por mês",
          "1 mil a 10 mil por mês",
          "Mais de 10 mil por mês",
          "Não sei medir",
        ],
      },
    ],
  },
  {
    name: "Dados e medição",
    helper: "Onde o dado vive, quem responde por ele.",
    items: [
      {
        id: "indicadores",
        kind: "likert",
        q: "Sei quanto custa uma execução desse processo, em tempo e dinheiro.",
      },
      {
        id: "dados",
        kind: "single",
        q: "Onde vivem os dados da sua operação?",
        options: [
          "Na cabeça das pessoas",
          "Em planilhas espalhadas",
          "Num sistema, mas incompletos",
          "Centralizados e confiáveis",
        ],
      },
      {
        id: "dependencia",
        kind: "likert",
        q: "Se uma pessoa específica faltar, uma parte da operação para.",
      },
    ],
  },
  {
    name: "Prontidão para IA",
    helper: "Histórico, porte, urgência.",
    items: [
      {
        id: "tentativas",
        kind: "single",
        q: "Qual a sua experiência com automação até aqui?",
        options: [
          "Nunca tentamos automatizar",
          "Tentamos e não pegou",
          "Temos algumas automações simples",
          "Já usamos IA em parte da operação",
        ],
      },
      {
        id: "equipe",
        kind: "single",
        q: "Quantas pessoas trabalham na operação?",
        options: [
          "Até 5 pessoas",
          "6 a 20 pessoas",
          "21 a 100 pessoas",
          "Mais de 100 pessoas",
        ],
      },
      {
        id: "urgencia",
        kind: "likert",
        q: "Se nada mudar, o custo desse processo vira um problema sério nos próximos 12 meses.",
      },
    ],
  },
];

function sectionLead(name: string): string {
  if (name === "Sua operação")
    return "Quanto mais concreto você for, melhor a leitura que a IA devolve. Descreva a rotina como ela é, não como deveria ser.";
  if (name === "Rotina e sistemas")
    return "A gente quer entender o que já roda em ferramenta e onde o time ainda paga o preço do manual.";
  if (name === "Dados e medição")
    return "Automação boa depende de dado confiável. Aqui medimos onde o dado vive e se alguém mede o custo do processo.";
  return "Histórico de automação, porte do time e urgência. É o que define por onde a IA deveria começar na sua operação.";
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

  // URL por passo + Meta Pixel por etapa. A URL vira #etapa-N-slug a cada
  // passo do questionário (replaceState, sem reload), e o pixel registra o
  // avanço/abandono (deduplicado por etapa).
  const firedEtapas = useRef<Set<number>>(new Set());
  useEffect(() => {
    const slug =
      "etapa-" +
      (currentSection + 1) +
      "-" +
      section.name
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    try {
      history.replaceState(null, "", "#" + slug);
    } catch {
      /* no-op */
    }
    if (firedEtapas.current.has(currentSection)) return;
    firedEtapas.current.add(currentSection);
    fbqTrack("ViewContent", {
      content_name: "diag_etapa",
      etapa: currentSection + 1,
      total_etapas: total,
      secao: section.name,
    });
  }, [currentSection, total, section.name]);

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
            {section.name === "Sua operação" && (
              <>
                Conta pra gente sobre <span className="it">a sua operação.</span>
              </>
            )}
            {section.name === "Rotina e sistemas" && (
              <>
                O que roda em ferramenta, <span className="it">o que roda na mão.</span>
              </>
            )}
            {section.name === "Dados e medição" && (
              <>
                Onde o dado vive, <span className="cyan">quem mede o custo.</span>
              </>
            )}
            {section.name === "Prontidão para IA" && (
              <>
                Histórico, porte, <span className="cyan">urgência.</span>
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
