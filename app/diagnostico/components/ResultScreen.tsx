"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Chrome } from "./Chrome";
import { LockedReveal } from "./LockedReveal";
import { Sparkle, DoubleCircle, CircleRing } from "@/components/Ornaments";
import { ScoreDonut } from "@/components/ScoreDonut";
import { ScoreRadarKit } from "@/components/ScoreRadarKit";
import { ScoreCardKit, InsightCard } from "@/components/ScoreCardKit";
import {
  scoreHex,
  scoreInk,
  scoreLabel,
  type DiagnosticResult,
} from "@/lib/diagnosticScore";
import type { CaptureContact } from "./CaptureScreen";

export function ResultScreen({
  result,
  contact,
  leadId,
  calcomUrl,
  onRestart,
  onHome,
}: {
  result: DiagnosticResult;
  contact: CaptureContact;
  leadId: string | null;
  calcomUrl: string | null;
  onRestart: () => void;
  onHome: () => void;
}) {
  const router = useRouter();
  const [contactState, setContactState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function requestContact() {
    if (!leadId || contactState === "loading" || contactState === "done") return;
    setContactState("loading");
    try {
      const res = await fetch(`/api/leads/${leadId}/request-contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "diagnostico_result" }),
      });
      if (!res.ok) {
        setContactState("error");
        return;
      }
      setContactState("done");
      // Conversão "começar o negócio": leva pra página de obrigado (mede no Pixel).
      router.push("/obrigado/comecar");
    } catch {
      setContactState("error");
    }
  }
  const overall = result.overall;
  const radarData = result.axes;
  const recoLabel =
    result.recommendation === "ENTRAR"
      ? "ENTRAR"
      : result.recommendation === "OBSERVAR"
        ? "OBSERVAR"
        : "NAO ENTRAR";

  return (
    <div className="screen screen--dark" data-screen-label="04 Resultado">
      <Chrome onHome={onHome} cta="Refazer" onCta={onRestart} inset />

      <Sparkle size={28} style={{ top: 80, left: 56 }} />
      <Sparkle size={14} style={{ top: 130, left: 130, opacity: 0.7 }} />
      <DoubleCircle size={140} style={{ top: 40, right: 56, opacity: 0.4 }} />
      <CircleRing size={120} dashed style={{ bottom: 220, right: 30, opacity: 0.5 }} />
      <Sparkle size={20} style={{ bottom: 360, right: 240, opacity: 0.6 }} />

      {/* 1. Title strip */}
      <div className="padx" style={{ paddingTop: 24, paddingBottom: 28, position: "relative", zIndex: 1 }}>
        <span className="eyebrow">Diagnóstico de {contact.empresa || "sua ideia"}</span>
        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 40,
            alignItems: "end",
          }}
        >
          <h1 className="display" style={{ fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)" }}>
            Seu score, <span className="it">na hora.</span>
            <br />
            <span className="cyan">Engenharia, no detalhe.</span>
          </h1>
          <p className="lead" style={{ color: "rgba(255,255,255,0.7)", maxWidth: 380 }}>
            Resultado gerado pela ferramenta da PRECEPTOR! com base nas suas 11 respostas. Para os
            10 eixos completos, plano de execução e benchmark, fale com a gente.
          </p>
        </div>
      </div>

      {/* 2. Score hero */}
      <div className="padx" style={{ paddingBottom: 28, position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 36,
            padding: "32px 36px",
            alignItems: "center",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(closest-side at 20% 50%, rgba(82,225,231,0.18), transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <ScoreDonut value={overall} size={180} strokeWidth={13} light />
          <div style={{ position: "relative" }}>
            <span className="overline" style={{ color: "var(--cyan)" }}>
              Score Geral · escala 0 a 100
            </span>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 900,
                fontSize: 48,
                color: scoreHex(overall),
                letterSpacing: "-0.03em",
                lineHeight: 1,
                marginTop: 8,
              }}
            >
              {scoreLabel(overall)}
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14.5,
                lineHeight: 1.55,
                margin: "12px 0 0",
                maxWidth: 460,
              }}
            >
              {result.headline}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "flex-end",
              position: "relative",
            }}
          >
            <span className="overline" style={{ color: "rgba(255,255,255,0.5)" }}>
              Próximo passo
            </span>
            {contactState === "done" ? (
              <ContactDoneBadge />
            ) : (
              <button
                type="button"
                className="btn-pill btn-pill--cyan"
                onClick={requestContact}
                disabled={contactState === "loading" || !leadId}
                style={{
                  opacity: contactState === "loading" || !leadId ? 0.6 : 1,
                  cursor: contactState === "loading" || !leadId ? "wait" : "pointer",
                }}
              >
                {contactState === "loading" ? "Registrando..." : "Falar com a PRECEPTOR!"}
                <span className="btn-pill__icon">→</span>
              </button>
            )}
            {contactState === "error" && (
              <span style={{ color: "#FCA5A5", fontSize: 11, marginTop: 4 }}>
                Não conseguimos registrar. Tente novamente em 1 minuto.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Recomendação peek (locked) */}
      <div className="padx" style={{ paddingBottom: 28, position: "relative", zIndex: 1 }}>
        <div
          style={{
            padding: "26px 32px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <span className="overline" style={{ color: "#B964FF" }}>
              Recomendação interna
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              veredito do estúdio
            </span>
          </div>
          <div style={{ position: "relative" }}>
            <div
              aria-hidden
              style={{
                filter: "blur(8px)",
                pointerEvents: "none",
                userSelect: "none",
                display: "flex",
                alignItems: "baseline",
                gap: 18,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 900,
                  fontSize: 64,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  color: scoreHex(overall),
                }}
              >
                {recoLabel}
              </span>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, maxWidth: 520 }}>
                {result.recommendationReason}
              </span>
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 18px",
                  background: "rgba(6,18,42,0.85)",
                  border: "1px solid var(--cyan)",
                  borderRadius: 999,
                  boxShadow: "var(--glow-cyan), 0 8px 24px -8px rgba(0,0,0,0.5)",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--cyan)",
                  }}
                >
                  Diagnóstico completo PRECEPTOR!
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                  Falar com especialista →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Radar + 3 ScoreCards (2 free + 1 locked) */}
      <div
        className="padx"
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: 18,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            padding: "22px 18px 4px",
          }}
        >
          <div
            style={{
              padding: "0 14px 6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span className="overline" style={{ color: "var(--cyan)" }}>
              Visão geral · 5 eixos
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              pesos: 25 / 20 / 25 / 20 / 10
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ScoreRadarKit data={radarData} size={360} light />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {radarData.slice(0, 2).map((a) => (
            <ScoreCardKit key={a.label} label={a.label} value={a.value} hint={a.hint} />
          ))}
          <ScoreCardKit
            label={result.lockedAxes[0]?.label ?? "Defensabilidade"}
            value={result.lockedAxes[0]?.value ?? 70}
            hint={result.lockedAxes[0]?.hint}
            locked
          />
        </div>
      </div>

      {/* 5. Mais 5 eixos avaliados (locked grid) */}
      <div
        className="padx"
        style={{
          paddingTop: 28,
          paddingBottom: 6,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <span className="eyebrow" style={{ color: "var(--cyan)" }}>
            Mais 5 eixos avaliados
          </span>
          <h2
            className="display-md"
            style={{ fontSize: "1.6rem", color: "#fff", marginTop: 8 }}
          >
            Defensabilidade, time-to-market, capital, canal, risco regulatório.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          {result.lockedAxes.map((a) => (
            <div
              key={a.label}
              style={{
                position: "relative",
                overflow: "hidden",
                padding: 16,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  filter: "blur(5px)",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
                aria-hidden
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: 8,
                  }}
                >
                  {a.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 900,
                    fontSize: 30,
                    color: scoreInk(a.value),
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {a.value}
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                    /100
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 5,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 999,
                    overflow: "hidden",
                    marginTop: 12,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${a.value}%`,
                      background: scoreInk(a.value),
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  background: "rgba(6,18,42,0.9)",
                  border: "1px solid var(--cyan)",
                  borderRadius: 999,
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--cyan)",
                }}
              >
                <span>🔒</span>
                <span>Completo</span>
              </div>
              {/* Label visível abaixo do blur, pra dar contexto */}
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  bottom: 14,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.85)",
                  letterSpacing: "-0.01em",
                }}
              >
                {a.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Insights free */}
      <div
        className="padx"
        style={{
          paddingTop: 28,
          paddingBottom: 14,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          position: "relative",
          zIndex: 1,
        }}
      >
        {result.insights.map((i, idx) => (
          <InsightCard key={idx} kind={i.kind} label={i.label} body={i.body} />
        ))}
      </div>

      {/* 7. Insights priorizados (+N locked) */}
      <div
        className="padx"
        style={{
          paddingTop: 14,
          paddingBottom: 14,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: 14 }}>
          <span className="eyebrow" style={{ color: "var(--cyan)" }}>
            Insights priorizados (+{result.lockedInsights.length} no completo)
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {result.lockedInsights.slice(0, 4).map((ins, idx) => {
            const firstSentence = ins.body.split(/(?<=[.!?])\s+/)[0] ?? ins.body;
            const rest = ins.body.slice(firstSentence.length);
            const color = ins.kind === "warning" ? "#F59E0B" : "var(--cyan)";
            const bg =
              ins.kind === "warning" ? "rgba(245,158,11,0.08)" : "rgba(82,225,231,0.08)";
            return (
              <div
                key={idx}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  background: bg,
                  borderRadius: 14,
                  borderLeft: `3px solid ${color}`,
                  padding: "14px 18px 16px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: color,
                    color: "var(--navy-deep)",
                    marginBottom: 8,
                  }}
                >
                  {ins.label}
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {firstSentence}{" "}
                  <span
                    aria-hidden
                    style={{
                      filter: "blur(6px)",
                      userSelect: "none",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {rest}
                  </span>
                </p>
                <div
                  style={{
                    marginTop: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    background: "rgba(6,18,42,0.85)",
                    border: "1px solid var(--cyan)",
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--cyan)",
                  }}
                >
                  🔒 Liberar com diagnóstico completo
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Plano de 90 dias */}
      <div className="padx" style={{ paddingTop: 14, paddingBottom: 14, position: "relative", zIndex: 1 }}>
        <div
          style={{
            padding: "26px 32px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
            <span className="overline" style={{ color: "var(--cyan)" }}>
              Plano de execução
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              próximos 90 dias
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {result.nextSteps.map((step, idx) => {
              const titleWords = step.title.split(" ");
              const visibleTitle = titleWords.slice(0, 3).join(" ");
              const hiddenTitle = titleWords.slice(3).join(" ");
              return (
                <div
                  key={idx}
                  style={{
                    padding: "16px 18px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 28,
                      fontWeight: 800,
                      color: "var(--cyan)",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    0{idx + 1}
                  </span>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.35,
                    }}
                  >
                    {visibleTitle}
                    {hiddenTitle && (
                      <span
                        aria-hidden
                        style={{
                          filter: "blur(5px)",
                          userSelect: "none",
                          marginLeft: 6,
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {hiddenTitle}
                      </span>
                    )}
                  </div>
                  <p
                    aria-hidden
                    style={{
                      filter: "blur(5px)",
                      userSelect: "none",
                      pointerEvents: "none",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.7)",
                      margin: "8px 0 0",
                      lineHeight: 1.5,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 16px",
                background: "rgba(6,18,42,0.85)",
                border: "1px solid var(--cyan)",
                borderRadius: 999,
                boxShadow: "var(--glow-cyan), 0 8px 24px -8px rgba(0,0,0,0.5)",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--cyan)",
                }}
              >
                Plano detalhado
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                Disponível no diagnóstico completo PRECEPTOR!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 9. Benchmark */}
      <div className="padx" style={{ paddingTop: 14, paddingBottom: 14, position: "relative", zIndex: 1 }}>
        <div
          style={{
            padding: "26px 32px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 36,
            alignItems: "center",
          }}
        >
          <div>
            <span className="overline" style={{ color: "var(--cyan)" }}>
              Benchmark
            </span>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 900,
                fontSize: 56,
                letterSpacing: "-0.03em",
                color: "#fff",
                lineHeight: 1,
                marginTop: 6,
              }}
            >
              Top {100 - result.benchmark.percentile}
              <span style={{ fontSize: 28, color: "var(--cyan)" }}>%</span>
            </div>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 13,
                color: "rgba(255,255,255,0.65)",
                maxWidth: 240,
                lineHeight: 1.5,
              }}
            >
              vs {result.benchmark.peers} startups do mesmo estágio que passaram pelo diagnóstico.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <BenchmarkBar
              label="Seu score"
              value={overall}
              accent="var(--cyan)"
              big
            />
            <BenchmarkBar
              label="Média do setor"
              value={result.benchmark.sectorAverage}
              accent="rgba(255,255,255,0.4)"
            />
          </div>
        </div>
      </div>

      {/* 10. 3 perguntas que faríamos */}
      <div className="padx" style={{ paddingTop: 14, paddingBottom: 28, position: "relative", zIndex: 1 }}>
        <div
          style={{
            padding: "26px 32px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <span className="overline" style={{ color: "#B964FF" }}>
              Tese interna
            </span>
            <h2
              className="display-md"
              style={{ fontSize: "1.4rem", color: "#fff", marginTop: 8 }}
            >
              3 perguntas que faríamos pra você.
            </h2>
          </div>
          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {result.strategicQuestions.map((q, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "var(--cyan)",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  Q{idx + 1}
                </span>
                {idx === 0 ? (
                  <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: "#fff" }}>
                    {q}
                  </p>
                ) : (
                  <p
                    aria-hidden
                    style={{
                      margin: 0,
                      fontSize: 14.5,
                      lineHeight: 1.5,
                      color: "rgba(255,255,255,0.85)",
                      filter: "blur(6px)",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    {q}
                  </p>
                )}
              </li>
            ))}
          </ol>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 16px",
                background: "rgba(6,18,42,0.85)",
                border: "1px solid var(--cyan)",
                borderRadius: 999,
                boxShadow: "var(--glow-cyan), 0 8px 24px -8px rgba(0,0,0,0.5)",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--cyan)",
                }}
              >
                Tese completa
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                Falar com especialista PRECEPTOR! →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 10b. Cal.com embed */}
      {calcomUrl && (
        <div
          className="padx"
          style={{ paddingTop: 14, paddingBottom: 14, position: "relative", zIndex: 1 }}
        >
          <div style={{ marginBottom: 16 }}>
            <span className="eyebrow" style={{ color: "var(--cyan)" }}>
              Agendar · 30 min
            </span>
            <h2
              className="display-md"
              style={{ fontSize: "1.6rem", color: "#fff", marginTop: 8 }}
            >
              Marca uma conversa com o estúdio.
            </h2>
            <p
              className="lead"
              style={{
                color: "rgba(255,255,255,0.7)",
                margin: "8px 0 0",
                maxWidth: 560,
              }}
            >
              Diagnóstico técnico ao vivo, sem custo, sem compromisso.
            </p>
          </div>
          <iframe
            src={calcomUrl}
            title="Agendar com PRECEPTOR! Studio"
            style={{
              width: "100%",
              minHeight: 640,
              border: 0,
              borderRadius: 18,
              background: "rgba(255,255,255,0.04)",
            }}
          />
        </div>
      )}

      {/* 11. CTA strip */}
      <div className="padx" style={{ paddingBottom: 36, position: "relative", zIndex: 1 }}>
        <div
          style={{
            padding: "28px 36px",
            borderRadius: 22,
            background: "linear-gradient(135deg, rgba(82,225,231,0.1), rgba(93,87,235,0.1))",
            border: "1px solid rgba(82,225,231,0.3)",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div>
            <span className="overline" style={{ color: "var(--cyan)" }}>
              Diagnóstico completo
            </span>
            <h2 className="display-md" style={{ fontSize: "1.6rem", color: "#fff", marginTop: 8 }}>
              10 eixos, 5 documentos, plano de execução e cronograma.
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 14,
                lineHeight: 1.55,
                margin: "10px 0 0",
                maxWidth: 580,
              }}
            >
              Engenharia humana de verdade, com IA por baixo. Apenas para teses onde fizer sentido
              para os dois lados.
            </p>
          </div>
          {contactState === "done" ? (
            <ContactDoneBadge />
          ) : (
            <button
              type="button"
              className="btn-pill btn-pill--cyan"
              onClick={requestContact}
              disabled={contactState === "loading" || !leadId}
              style={{
                opacity: contactState === "loading" || !leadId ? 0.6 : 1,
                cursor: contactState === "loading" || !leadId ? "wait" : "pointer",
              }}
            >
              {contactState === "loading" ? "Registrando..." : "Falar com um especialista"}
              <span className="btn-pill__icon">→</span>
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 56px 24px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.45)",
          fontSize: 11.5,
          fontFamily: "var(--font-mono)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span>score indicativo · gerado por modelo</span>
        <span>diagnóstico completo é trabalho de engenharia humana</span>
      </div>
    </div>
  );
}

function ContactDoneBadge() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        background: "rgba(82,225,231,0.12)",
        border: "1px solid var(--cyan)",
        borderRadius: 999,
        boxShadow: "var(--glow-cyan)",
        color: "#fff",
        maxWidth: 320,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "var(--cyan)",
          color: "var(--navy-deep)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        ✓
      </span>
      <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.4 }}>
        Especialista a caminho. Vamos te chamar em até 2 dias úteis.
      </span>
    </div>
  );
}

function BenchmarkBar({
  label,
  value,
  accent,
  big,
}: {
  label: string;
  value: number;
  accent: string;
  big?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 800,
            fontSize: big ? 18 : 14,
            color: accent,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: big ? 12 : 8,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: accent,
            transition: "width 800ms var(--ease-out)",
          }}
        />
      </div>
    </div>
  );
}
