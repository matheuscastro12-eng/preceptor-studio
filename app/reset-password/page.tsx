import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = {
  title: "Definir nova senha",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="STUDIO , nova senha"
      title={
        <>
          Defina uma <span style={{ color: "var(--cyan-deep)" }}>senha forte.</span>
        </>
      }
      lead="Use pelo menos 8 caracteres. Depois disso, sua sessão fica ativa e te levamos para o dashboard."
      panelTitle="Sessão renovada, contexto preservado."
      panelLead="Você troca a senha sem perder o que estava fazendo. Tudo vive no Supabase."
      bullets={[
        "Token de uso único",
        "Sessão atualizada na hora",
        "Sem reset por suporte",
        "Voltamos para o dashboard",
      ]}
    >
      <ResetForm />
    </AuthShell>
  );
}
