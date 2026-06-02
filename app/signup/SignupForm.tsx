"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { AuthError, AuthSuccess } from "@/components/auth/AuthShell";
import { FormField } from "../login/LoginForm";

export function SignupForm({
  token,
  defaultEmail,
  roleHint,
}: {
  token: string;
  defaultEmail: string;
  roleHint: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("Configuração do Supabase ausente no build. Avise o owner.");
      }
      const supabase = getBrowserSupabase();
      let signUpData;
      try {
        const result = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (result.error) throw result.error;
        signUpData = result.data;
      } catch (netErr) {
        const msg = netErr instanceof Error ? netErr.message : String(netErr);
        if (msg.toLowerCase().includes("failed to fetch")) {
          throw new Error(
            "Não conseguimos conectar ao servidor de autenticação. Verifique sua conexão ou tente novamente em 1 minuto."
          );
        }
        throw netErr;
      }
      const userId = signUpData.user?.id;
      if (userId) {
        const res = await fetch("/api/auth/redeem-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, userId }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => null);
          throw new Error(j?.error || `Falha ao consumir convite (HTTP ${res.status}).`);
        }
      }
      if (signUpData.session) {
        setDone(true);
        router.replace("/dashboard");
        router.refresh();
      } else {
        setDone(true);
        setLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Falha no cadastro.";
      setError(message);
      setLoading(false);
    }
  }

  if (done && !error) {
    return (
      <AuthSuccess message="Conta criada. Confirme pelo email se for solicitado e faça login." />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField id="name" label="Nome" type="text" value={name} onChange={setName} autoFocus />
      <FormField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
      />
      <FormField
        id="password"
        label="Senha (mínimo 8 caracteres)"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-mute)",
          margin: "0 0 8px",
        }}
      >
        papel pré-definido: <strong>{roleHint}</strong>
      </p>
      {error && <AuthError message={error} />}
      <button
        type="submit"
        disabled={loading}
        className="btn-pill btn-pill--primary"
        style={{ marginTop: 18, width: "100%", justifyContent: "space-between" }}
        aria-label="Criar conta"
      >
        {loading ? "Criando..." : "Criar conta"}
        <span className="btn-pill__icon" aria-hidden="true">→</span>
      </button>
    </form>
  );
}
