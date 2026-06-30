"use client";

import { useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Como está o caixa do mês?",
  "Qual a margem real do Sal Express?",
  "Quais leads quentes eu não toquei?",
  "Quanto de IA cada venture consumiu?",
  "Receita por camada do studio",
];

export function CopilotView() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((m) => [...m, { role: "assistant", content: data.reply || data.error || "Erro ao responder." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Falha ao consultar o copiloto." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10" style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 120px)" }}>
      <div className="mb-5">
        <div className="eyebrow">Copiloto do studio</div>
        <h1 className="display-md mt-2" style={{ color: "var(--navy)" }}>
          Pergunte sobre a operação
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Responde com dados reais das ventures, leads e financeiro. Não inventa números.
        </p>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.length === 0 && (
          <div className="surface rounded-2xl p-6">
            <div className="text-[10px] uppercase tracking-widest font-bold text-ink-mute mb-3">Sugestões</div>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="text-left text-sm rounded-xl px-4 py-3 hover:bg-cyan-50"
                  style={{ border: "1px solid var(--line)", color: "var(--navy)", fontWeight: 600 }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius: 16,
                fontSize: 14,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                background: m.role === "user" ? "var(--cyan, #52E1E7)" : "var(--surface, #fff)",
                color: m.role === "user" ? "var(--navy-deep, #06122A)" : "var(--ink)",
                border: m.role === "user" ? "none" : "1px solid var(--line)",
                fontWeight: m.role === "user" ? 600 : 400,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div className="surface rounded-2xl" style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-mute)", border: "1px solid var(--line)" }}>
              Consultando os dados...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        style={{ display: "flex", gap: 10, marginTop: 16, position: "sticky", bottom: 16 }}
      >
        <input
          className="input-field"
          placeholder="Pergunte sobre ventures, leads, margem, caixa..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button type="submit" className="btn-pill btn-pill--primary" disabled={loading || !input.trim()}>
          {loading ? "..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
