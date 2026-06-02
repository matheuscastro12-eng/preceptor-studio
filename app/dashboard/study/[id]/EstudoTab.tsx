"use client";

import { useMemo } from "react";
import { StudyWithClient } from "@/lib/store";
import { Eyebrow } from "@/components/dashboard/Shared";
import { MarkdownView } from "@/components/MarkdownView";
import { extractMarkdownHeadings } from "@/lib/markdownExtensions";
import { VersionPicker } from "@/components/dashboard/VersionPicker";

export function EstudoTab({ study }: { study: StudyWithClient }) {
  const md = study.output_md;
  const headings = useMemo(
    () => extractMarkdownHeadings(md, 2),
    [md]
  );

  if (!md) {
    return (
      <div
        className="surface"
        style={{ padding: 40, borderRadius: 16, textAlign: "center" }}
      >
        <Eyebrow>Estudo do cliente</Eyebrow>
        <p
          style={{
            color: "var(--ink-soft)",
            marginTop: 12,
            fontSize: 14,
          }}
        >
          O documento do estudo ainda não foi gerado.
        </p>
      </div>
    );
  }

  return (
    <div
      className="surface"
      style={{ padding: 40, borderRadius: 16, position: "relative" }}
    >
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <VersionPicker studyId={study.id} outputType="study" currentMd={md} />
      </div>
      <Eyebrow>Estudo do cliente</Eyebrow>
      <h2
        style={{
          marginTop: 12,
          fontSize: 32,
          fontFamily: "var(--font-sans)",
          fontWeight: 900,
          color: "var(--navy)",
          letterSpacing: "-0.025em",
          lineHeight: 1.1,
        }}
      >
        Diagnóstico técnico, em camadas.
      </h2>
      <p
        style={{
          color: "var(--ink-soft)",
          margin: "14px 0 32px",
          maxWidth: 640,
          fontSize: 16,
          lineHeight: 1.65,
        }}
      >
        Documento gerado pela ferramenta da PRECEPTOR! sobre as perguntas
        respondidas. Inclui análise por eixo, contexto regulatório do setor,
        modelo de receita e plano de execução de curto prazo.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: headings.length >= 2 ? "auto 1fr" : "1fr",
          gap: 32,
          alignItems: "start",
        }}
      >
        {headings.length >= 2 && (
          <aside
            style={{
              width: 220,
              position: "sticky",
              top: 16,
              alignSelf: "start",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
            }}
          >
            <div
              className="overline"
              style={{ marginBottom: 12, color: "var(--ink-mute)" }}
            >
              Conteúdo
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    style={{
                      fontSize: 13,
                      color: "var(--ink-soft)",
                      padding: "6px 10px",
                      borderRadius: 6,
                      borderLeft: "2px solid transparent",
                      display: "block",
                      textDecoration: "none",
                    }}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
        <div
          style={{
            borderLeft:
              headings.length >= 2 ? "1px solid var(--line)" : "0",
            paddingLeft: headings.length >= 2 ? 32 : 0,
          }}
        >
          <MarkdownView md={md} />
        </div>
      </div>
    </div>
  );
}
