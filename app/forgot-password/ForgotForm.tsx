"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { AuthError, AuthSuccess } from "@/components/auth/AuthShell";
import { FormField } from "../login/LoginForm";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getBrowserSupabase();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );
      if (resetErr) throw resetErr;
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Falha ao enviar.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthSuccess message="Se a conta existir, você vai receber o link em instantes. Cheque seu email." />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField
        id="email"
        label="Email da conta"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        autoFocus
      />
      {error && <AuthError message={error} />}
      <button
        type="submit"
        disabled={loading}
        className="btn-pill btn-pill--primary"
        style={{ marginTop: 18, width: "100%", justifyContent: "space-between" }}
        aria-label="Enviar link de recuperação"
      >
        {loading ? "Enviando..." : "Enviar link"}
        <span className="btn-pill__icon" aria-hidden="true">→</span>
      </button>
    </form>
  );
}
