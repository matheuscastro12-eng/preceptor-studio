"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { AuthError } from "@/components/auth/AuthShell";
import { FormField } from "../login/LoginForm";

export function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("A senha precisa ter no mínimo 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const supabase = getBrowserSupabase();
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) throw updErr;
      router.replace("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Falha ao atualizar senha.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField
        id="password"
        label="Nova senha"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        autoFocus
      />
      <FormField
        id="confirm"
        label="Confirmar senha"
        type="password"
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
      />
      {error && <AuthError message={error} />}
      <button
        type="submit"
        disabled={loading}
        className="btn-pill btn-pill--primary"
        style={{ marginTop: 18, width: "100%", justifyContent: "space-between" }}
        aria-label="Salvar nova senha"
      >
        {loading ? "Salvando..." : "Salvar nova senha"}
        <span className="btn-pill__icon" aria-hidden="true">→</span>
      </button>
    </form>
  );
}
