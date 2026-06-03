import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getServerSupabase } from "@/lib/supabase/server";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell
      eyebrow="STUDIO , acesso interno"
      title={
        <>
          Entre no <span style={{ color: "var(--cyan-deep)" }}>workspace.</span>
        </>
      }
      lead="O dashboard, os estudos e o CRM ficam atrás dessa porta. Visitantes com link de share acessam direto."
      panelTitle="Engenharia humana, em camadas."
      panelLead="Cada conta aqui dentro pertence a uma pessoa do time. Sem usuário compartilhado."
      bullets={[
        "Estudos estratégicos versionados",
        "CRM com pipeline em tempo real",
        "Kanban de execução por sprint",
        "Diagnóstico contínuo do cliente",
      ]}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <div
        style={{
          marginTop: 28,
          paddingTop: 22,
          borderTop: "1px solid var(--line)",
          fontSize: 13,
          color: "var(--ink-soft)",
        }}
      >
        Sem conta?{" "}
        <a
          href="mailto:studio@thepreceptor.com.br?subject=Solicito%20acesso%20ao%20Studio"
          style={{ color: "var(--blue)", fontWeight: 700 }}
        >
          Solicite acesso
        </a>
        .{" "}
        <Link
          href="/forgot-password"
          style={{ color: "var(--ink-soft)", marginLeft: 8 }}
        >
          Esqueci minha senha
        </Link>
      </div>
    </AuthShell>
  );
}
