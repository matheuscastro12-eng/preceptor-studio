"use client";

import { useState } from "react";
import { getAttribution } from "@/lib/funnelTrack";

const SETORES = [
  { value: "", label: "Selecione (opcional)" },
  { value: "saude", label: "Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "juridico", label: "Jurídico" },
  { value: "tech", label: "Tecnologia" },
  { value: "outro", label: "Outro" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 14.5,
  fontFamily: "var(--font-sans)",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.6)",
  marginBottom: 8,
};

export function AutomationContactForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [telefone, setTelefone] = useState("");
  const [setor, setSetor] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nome.trim()) return setError("Informe seu nome.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError("Informe um email válido.");
    if (!consent) return setError("É preciso aceitar a política de privacidade.");

    setSending(true);
    try {
      const res = await fetch("/api/public/automation-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: { nome, email, telefone, empresa },
          mensagem,
          category: setor || undefined,
          consent: true,
          attribution: getAttribution(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Falha ao enviar.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div
        className="mkt-card mkt-card--dark"
        style={{ padding: 28, maxWidth: 560 }}
        role="status"
      >
        <h3 style={{ margin: 0, color: "#fff", fontSize: 20, fontWeight: 800 }}>
          Recebemos o seu contato. ✅
        </h3>
        <p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.72)", fontSize: 14.5, lineHeight: 1.55 }}>
          O time entra em contato em breve para entender sua operação e onde a
          automação se paga mais rápido.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mkt-card mkt-card--dark"
      style={{ padding: 28, maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div>
        <label style={labelStyle} htmlFor="auto-nome">
          Nome <span style={{ color: "var(--cyan)" }}>*</span>
        </label>
        <input
          id="auto-nome"
          style={inputStyle}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
          autoComplete="name"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle} htmlFor="auto-email">
            Email <span style={{ color: "var(--cyan)" }}>*</span>
          </label>
          <input
            id="auto-email"
            type="email"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="auto-tel">
            Telefone / WhatsApp
          </label>
          <input
            id="auto-tel"
            style={inputStyle}
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
            autoComplete="tel"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle} htmlFor="auto-empresa">
            Empresa
          </label>
          <input
            id="auto-empresa"
            style={inputStyle}
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Nome da empresa"
            autoComplete="organization"
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="auto-setor">
            Setor
          </label>
          <select
            id="auto-setor"
            style={inputStyle}
            value={setor}
            onChange={(e) => setSetor(e.target.value)}
          >
            {SETORES.map((s) => (
              <option key={s.value} value={s.value} style={{ color: "#000" }}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle} htmlFor="auto-msg">
          O que você quer automatizar?
        </label>
        <textarea
          id="auto-msg"
          style={{ ...inputStyle, minHeight: 96, resize: "vertical" }}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Ex.: triagem de atendimento no WhatsApp, integração ERP + CRM, relatório automático..."
        />
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          fontSize: 12.5,
          color: "rgba(255,255,255,0.7)",
          lineHeight: 1.5,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          style={{ marginTop: 3 }}
        />
        <span>
          Concordo em ser contatado e com o tratamento dos meus dados conforme a
          política de privacidade.
        </span>
      </label>

      {error && (
        <div style={{ fontSize: 13, color: "#fca5a5" }} role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="mkt-btn mkt-btn--cyan mkt-btn--lg"
        disabled={sending}
        style={{ alignSelf: "flex-start", opacity: sending ? 0.7 : 1 }}
      >
        {sending ? "Enviando..." : "Quero falar sobre automação"}
        <span className="mkt-btn__icon" aria-hidden="true">→</span>
      </button>
    </form>
  );
}
