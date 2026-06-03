"use client";

import { useCallback, useEffect, useState } from "react";

interface PortalToken {
  token: string;
  client_email: string;
  expires_at: string | null;
  last_accessed_at: string | null;
  created_at: string;
}

export function PortalAccessCard({
  studyId,
  defaultClientEmail,
}: {
  studyId: string;
  defaultClientEmail?: string | null;
}) {
  const [tokens, setTokens] = useState<PortalToken[]>([]);
  const [email, setEmail] = useState(defaultClientEmail || "");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/studies/${studyId}/portal-tokens`);
      const data = (await res.json()) as { tokens?: PortalToken[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Erro");
      setTokens(data.tokens || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [studyId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function generate() {
    if (!email) {
      setError("Informe o email do cliente.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email inválido. Use o formato nome@dominio.com.");
      return;
    }
    setCreating(true);
    setError(null);
    setSentTo(null);
    try {
      const res = await fetch(`/api/studies/${studyId}/portal-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_email: email, send_email: sendEmail }),
      });
      const data = (await res.json()) as {
        error?: string;
        url?: string;
        email_sent?: boolean;
      };
      if (!res.ok) throw new Error(data.error || "Erro ao gerar");
      if (data.email_sent) setSentTo(email);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setCreating(false);
    }
  }

  async function revoke(token: string) {
    if (!confirm("Revogar este acesso? O cliente perde acesso imediatamente.")) return;
    try {
      const res = await fetch(`/api/portal-tokens/${token}`, { method: "DELETE" });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error || "Erro");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    }
  }

  function copyUrl(token: string) {
    const url = `${window.location.origin}/portal/${token}`;
    void navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 1500);
  }

  function isActive(t: PortalToken) {
    if (!t.expires_at) return true;
    return new Date(t.expires_at).getTime() > Date.now();
  }

  const activeTokens = tokens.filter(isActive);

  return (
    <div
      className="surface"
      style={{ padding: 20, borderRadius: 12, marginTop: 16 }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-mute)",
          marginBottom: 12,
        }}
      >
        Acesso do cliente
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          type="email"
          value={email}
          placeholder="email@cliente.com"
          onChange={(e) => setEmail(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 10px",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        <button
          type="button"
          className="btn-primary"
          onClick={generate}
          disabled={creating || !email}
          style={{ fontSize: 12, padding: "8px 14px" }}
        >
          {creating ? "Gerando..." : "Gerar link"}
        </button>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "var(--ink-mute)",
          marginBottom: 12,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={sendEmail}
          onChange={(e) => setSendEmail(e.target.checked)}
        />
        Enviar link por email pro cliente
      </label>

      {error && (
        <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 8 }}>
          {error}
        </div>
      )}

      {sentTo && (
        <div style={{ color: "#0f766e", fontSize: 12, marginBottom: 8 }}>
          Link enviado para {sentTo}
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 12, color: "var(--ink-mute)" }}>Carregando...</p>
      ) : activeTokens.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--ink-mute)" }}>
          Nenhum acesso ativo.
        </p>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0, margin: 0 }}>
          {activeTokens.map((t) => (
            <li
              key={t.token}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 10,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>
                {t.client_email}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                Último acesso:{" "}
                {t.last_accessed_at
                  ? new Date(t.last_accessed_at).toLocaleString("pt-BR")
                  : "Nunca"}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => copyUrl(t.token)}
                  style={{ fontSize: 11, padding: "4px 10px" }}
                >
                  {copied === t.token ? "Copiado!" : "Copiar URL"}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => revoke(t.token)}
                  style={{ fontSize: 11, padding: "4px 10px", color: "#dc2626" }}
                >
                  Revogar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
