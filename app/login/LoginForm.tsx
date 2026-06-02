"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { AuthError } from "@/components/auth/AuthShell";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getBrowserSupabase();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signErr) throw signErr;
      router.replace(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Falha ao entrar.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        autoFocus
      />
      <FormField
        id="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />
      {error && <AuthError message={error} />}
      <button
        type="submit"
        disabled={loading}
        className="btn-pill btn-pill--primary"
        style={{ marginTop: 22, width: "100%", justifyContent: "space-between" }}
        aria-label="Entrar"
      >
        {loading ? "Entrando..." : "Entrar"}
        <span className="btn-pill__icon" aria-hidden="true">→</span>
      </button>
    </form>
  );
}

export function FormField({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  autoFocus,
  required = true,
  placeholder,
  defaultValue,
}: {
  id: string;
  label: string;
  type: string;
  value?: string;
  onChange?: (v: string) => void;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink-mute)",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required={required}
        placeholder={placeholder}
        className="input"
      />
    </div>
  );
}
