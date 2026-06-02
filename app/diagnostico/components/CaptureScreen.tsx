"use client";

import { Chrome } from "./Chrome";
import { Sparkle, CircleRing, MeshTexture, MiniDiamond } from "@/components/Ornaments";
import { LEAD_CATEGORIES, type LeadCategory } from "@/lib/leads";

export interface CaptureContact {
  nome: string;
  email: string;
  empresa: string;
  telefone: string;
}

interface CaptureScreenProps {
  contact: CaptureContact;
  setContact: (c: CaptureContact) => void;
  category: LeadCategory | "";
  setCategory: (c: LeadCategory | "") => void;
  onContinue: () => void;
  onBack: () => void;
  onHome: () => void;
  submitting?: boolean;
  errorMessage?: string | null;
}

export function CaptureScreen({
  contact,
  setContact,
  category,
  setCategory,
  onContinue,
  onBack,
  onHome,
  submitting,
  errorMessage,
}: CaptureScreenProps) {
  const valid =
    contact.nome.trim() && /.+@.+\..+/.test(contact.email) && contact.empresa.trim();
  const setField = (k: keyof CaptureContact) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setContact({ ...contact, [k]: e.target.value });

  return (
    <div className="screen" data-screen-label="03 Captura">
      <Chrome onHome={onHome} cta="Voltar à home" onCta={onHome} inset />

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 0, minHeight: 600 }}>
        <div className="padx" style={{ padding: "32px 56px 56px" }}>
          <span className="eyebrow eyebrow--purple">Quase lá</span>
          <h1 className="display-md" style={{ marginTop: 14 }}>
            Pra onde mandamos o<br />
            <span className="it">seu score?</span>
          </h1>
          <p className="lead" style={{ marginTop: 14 }}>
            Score na hora, na próxima tela. O email é para um especialista do estúdio acompanhar
            caso faça sentido.
          </p>

          <div
            style={{
              marginTop: 32,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
            }}
          >
            <Field label="Seu nome" required>
              <input
                className="input"
                placeholder="Maria Oliveira"
                value={contact.nome}
                onChange={setField("nome")}
              />
            </Field>
            <Field label="Email de trabalho" required>
              <input
                className="input"
                type="email"
                placeholder="maria@suaempresa.com"
                value={contact.email}
                onChange={setField("email")}
              />
            </Field>
            <Field label="Empresa ou projeto" required>
              <input
                className="input"
                placeholder="Nome da sua startup ou ideia"
                value={contact.empresa}
                onChange={setField("empresa")}
              />
            </Field>
            <Field label="Telefone (com DDD)">
              <input
                className="input"
                placeholder="(11) 99999-0000"
                value={contact.telefone}
                onChange={setField("telefone")}
              />
            </Field>
            <Field label="Categoria">
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value as LeadCategory | "")}
                style={{ appearance: "none", cursor: "pointer" }}
              >
                <option value="">Selecione</option>
                {LEAD_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {errorMessage && (
            <p style={{ marginTop: 16, color: "var(--danger-rose)", fontSize: 13, fontWeight: 600 }}>
              {errorMessage}
            </p>
          )}

          <div
            style={{
              marginTop: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <button type="button" className="btn-pill btn-pill--ghost" onClick={onBack}>
              <span className="btn-pill__icon">←</span>
              Voltar ao questionário
            </button>
            <button
              type="button"
              className="btn-pill btn-pill--primary"
              onClick={onContinue}
              disabled={!valid || submitting}
            >
              {submitting ? "Calculando..." : "Gerar meu score"}
              <span className="btn-pill__icon">→</span>
            </button>
          </div>

          <p
            style={{
              marginTop: 28,
              color: "var(--ink-mute)",
              fontSize: 11.5,
              fontFamily: "var(--font-mono)",
            }}
          >
            ao continuar você concorda com nossa política de privacidade · LGPD compliant
          </p>
        </div>

        <div
          style={{
            position: "relative",
            background:
              "radial-gradient(ellipse 70% 50% at 30% 0%, rgba(82,225,231,0.16), transparent 60%)," +
              "radial-gradient(ellipse 60% 50% at 100% 100%, rgba(93,87,235,0.18), transparent 60%)," +
              "linear-gradient(160deg, #0F2A55 0%, #06122A 70%)",
            color: "#fff",
            padding: "48px 48px 56px",
            overflow: "hidden",
            borderTopRightRadius: 28,
            borderBottomRightRadius: 28,
            margin: "-1px -1px -1px 0",
          }}
        >
          <MeshTexture />
          <Sparkle size={22} style={{ top: 48, right: 56 }} />
          <Sparkle size={12} style={{ top: 90, right: 110, opacity: 0.7 }} />
          <CircleRing size={70} dashed style={{ bottom: 40, right: -30 }} />

          <div style={{ position: "relative" }}>
            <span className="eyebrow" style={{ color: "var(--cyan)" }}>
              O que você recebe agora
            </span>
            <h2 className="display-md" style={{ marginTop: 14, color: "#fff", fontSize: "1.9rem" }}>
              Score na hora,
              <br />
              <span className="cyan">2 insights na medida.</span>
            </h2>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "28px 0 0",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {[
                { t: "Score Geral 0 a 100", s: "Média ponderada por 5 eixos de análise." },
                {
                  t: "Radar dos 5 eixos",
                  s: "Mercado, execução, diferenciação, modelo, regulatório.",
                },
                { t: "2 insights da IA", s: "Um padrão positivo e um risco prioritário." },
                {
                  t: "Convite para falar com um especialista",
                  s: "Sem cobrança, sem compromisso, em até 2 dias úteis.",
                },
              ].map((x, i) => (
                <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(82,225,231,0.12)",
                      border: "1px solid rgba(82,225,231,0.3)",
                      color: "var(--cyan)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "#fff" }}>{x.t}</div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "rgba(255,255,255,0.65)",
                        marginTop: 2,
                        lineHeight: 1.45,
                      }}
                    >
                      {x.s}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div
              style={{
                marginTop: 36,
                padding: 18,
                borderRadius: 16,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <MiniDiamond size={10} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--cyan)",
                  }}
                >
                  Confidencial
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.55,
                }}
              >
                Suas respostas nunca aparecem em material público. Tratamos cada diagnóstico como
                conversa de sócios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-mute)",
          marginBottom: 8,
        }}
      >
        {label}
        {required && <span style={{ color: "var(--purple)", marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  );
}
