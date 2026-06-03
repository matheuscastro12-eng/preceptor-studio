import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Criar conta",
  robots: { index: false, follow: false },
};

interface Invite {
  token: string;
  email: string | null;
  role: string;
  team_key: string | null;
}

async function loadInvite(token: string | undefined): Promise<Invite | null> {
  if (!token) return null;
  try {
    const admin = createSupabaseServiceClient();
    const { data } = await admin
      .from("invites")
      .select("token, email, role, team_key, used_at, expires_at")
      .eq("token", token)
      .maybeSingle();
    if (!data) return null;
    if (data.used_at) return null;
    if (new Date(data.expires_at) < new Date()) return null;
    return {
      token: data.token,
      email: data.email,
      role: data.role,
      team_key: data.team_key,
    };
  } catch {
    return null;
  }
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const invite = await loadInvite(searchParams.token);

  return (
    <AuthShell
      eyebrow="STUDIO , criar conta"
      title={
        invite ? (
          <>
            Bem-vindo ao <span style={{ color: "var(--cyan-deep)" }}>time.</span>
          </>
        ) : (
          <>Acesso por <span style={{ color: "var(--cyan-deep)" }}>convite.</span></>
        )
      }
      lead={
        invite
          ? "Defina seu nome e senha. O convite já reservou seu papel no workspace."
          : "Não abrimos cadastro público. Solicite acesso para receber um link com token de convite."
      }
      panelTitle="Sete pessoas, um estúdio."
      panelLead="Cada membro tem identidade real no workspace. Nada de logins compartilhados."
      bullets={[
        "Owner, admin e member com permissões reais",
        "Estudos atribuídos por pessoa",
        "Audit log nativo via Supabase",
        "Onboarding em minutos com token",
      ]}
    >
      {invite ? (
        <Suspense fallback={null}>
          <SignupForm
            token={invite.token}
            defaultEmail={invite.email ?? ""}
            roleHint={invite.role}
          />
        </Suspense>
      ) : (
        <div
          style={{
            padding: "20px 22px",
            border: "1px dashed var(--line-strong)",
            borderRadius: 14,
            background: "var(--surface-2)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "var(--ink-soft)",
              fontSize: 14.5,
              lineHeight: 1.55,
            }}
          >
            Para entrar no workspace, peça um convite ao owner. Cada token vale
            por 14 dias.
          </p>
          <a
            href="mailto:studio@thepreceptor.com.br?subject=Solicito%20acesso%20ao%20Studio"
            className="btn-pill btn-pill--primary"
            style={{ marginTop: 18, justifyContent: "space-between" }}
            aria-label="Solicitar acesso por email"
          >
            Solicitar acesso
            <span className="btn-pill__icon" aria-hidden="true">→</span>
          </a>
        </div>
      )}
      <div
        style={{
          marginTop: 28,
          paddingTop: 22,
          borderTop: "1px solid var(--line)",
          fontSize: 13,
          color: "var(--ink-soft)",
        }}
      >
        Já tem conta?{" "}
        <Link href="/login" style={{ color: "var(--blue)", fontWeight: 700 }}>
          Entrar
        </Link>
      </div>
    </AuthShell>
  );
}
