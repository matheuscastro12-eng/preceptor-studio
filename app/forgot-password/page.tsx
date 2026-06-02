import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = {
  title: "Recuperar senha",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="STUDIO , recuperar senha"
      title={
        <>
          Mandamos o link em <span style={{ color: "var(--cyan-deep)" }}>segundos.</span>
        </>
      }
      lead="Informe o email da sua conta. Você recebe um link para definir nova senha."
      panelTitle="Reset rápido, sem ticket."
      panelLead="Tudo via Supabase. Token expira em uma hora, descartável após uso."
      bullets={[
        "Email com link único",
        "Expira em 1h",
        "Sem reset manual",
        "Sessão atualizada na hora",
      ]}
    >
      <ForgotForm />
      <div
        style={{
          marginTop: 28,
          paddingTop: 22,
          borderTop: "1px solid var(--line)",
          fontSize: 13,
          color: "var(--ink-soft)",
        }}
      >
        Lembrou?{" "}
        <Link href="/login" style={{ color: "var(--blue)", fontWeight: 700 }}>
          Voltar para entrar
        </Link>
      </div>
    </AuthShell>
  );
}
