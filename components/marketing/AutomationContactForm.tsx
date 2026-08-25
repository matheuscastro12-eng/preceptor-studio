"use client";

import { useEffect, useRef, useState } from "react";
import { getAttribution } from "@/lib/funnelTrack";
import { fbqTrack } from "@/lib/metaEvents";

const SETORES = [
  { value: "", label: "Selecione (opcional)" },
  { value: "logistica", label: "Logística e Transportes" },
  { value: "agro", label: "Agro" },
  { value: "medicina", label: "Medicina" },
  { value: "outro", label: "Outro" },
];

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
  const wrapRef = useRef<HTMLElement | null>(null);

  // Meta Pixel: dispara ViewContent quando a seção do formulário entra na tela
  // (uma vez), para metrificar o funil de automação no pixel. Robusto ao timing:
  // se o pixel ainda não carregou quando a seção aparece, espera (poll) e dispara
  // assim que o fbq existir, em vez de virar no-op.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let fired = false;
    let poll: ReturnType<typeof setInterval> | null = null;

    const fire = () => {
      if (fired) return;
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        fired = true;
        fbqTrack("ViewContent", { content_name: "automacao_form" });
        if (poll) clearInterval(poll);
        obs.disconnect();
      } else if (!poll) {
        // pixel ainda não carregou: tenta a cada 500ms (máx ~10s)
        let tries = 0;
        poll = setInterval(() => {
          tries += 1;
          if (fired || tries > 20) {
            if (poll) clearInterval(poll);
            return;
          }
          fire();
        }, 500);
      }
    };

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            fire();
            break;
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -15% 0px" }
    );
    obs.observe(el);
    return () => {
      if (poll) clearInterval(poll);
      obs.disconnect();
    };
  }, []);

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
      // Sucesso: navegação REAL (não SPA) pra página de obrigado, pra o Pixel
      // disparar o PageView da URL /obrigado/automacao e a conversão pegar.
      window.location.assign("/obrigado/automacao");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar.");
      setSending(false);
    }
  }

  return (
    <form
      ref={(node) => { wrapRef.current = node; }}
      onSubmit={submit}
      className="mkt-card"
      style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div className="mkt-field">
        <label htmlFor="auto-nome">
          Nome <span style={{ color: "var(--blue)" }}>*</span>
        </label>
        <input
          id="auto-nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
          autoComplete="name"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="mkt-field">
          <label htmlFor="auto-email">
            Email <span style={{ color: "var(--blue)" }}>*</span>
          </label>
          <input
            id="auto-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            autoComplete="email"
          />
        </div>
        <div className="mkt-field">
          <label htmlFor="auto-tel">Telefone / WhatsApp</label>
          <input
            id="auto-tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
            autoComplete="tel"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="mkt-field">
          <label htmlFor="auto-empresa">Empresa</label>
          <input
            id="auto-empresa"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Nome da empresa"
            autoComplete="organization"
          />
        </div>
        <div className="mkt-field">
          <label htmlFor="auto-setor">Segmento</label>
          <select
            id="auto-setor"
            value={setor}
            onChange={(e) => setSetor(e.target.value)}
          >
            {SETORES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mkt-field">
        <label htmlFor="auto-msg">O que você quer automatizar?</label>
        <textarea
          id="auto-msg"
          style={{ minHeight: 96, resize: "vertical" }}
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
          color: "var(--ink-soft)",
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
        <div style={{ fontSize: 13, color: "#DC2626" }} role="alert">
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
