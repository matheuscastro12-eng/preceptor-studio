import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { PortalShell } from "./PortalShell";

export const dynamic = "force-dynamic";

interface PortalPageProps {
  params: { token: string };
  searchParams: { tab?: string };
}

function ExpiredView({ reason }: { reason: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--bg)]">
      <div className="surface rounded-2xl p-12 text-center max-w-md">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-black text-navy mb-2">Acesso expirado</h1>
        <p className="text-ink-soft text-sm">
          {reason} Entre em contato com o estúdio para receber um novo link.
        </p>
        <p className="mt-6 text-[11px] uppercase tracking-widest text-ink-mute font-bold">
          PRECEPTOR! Studio
        </p>
      </div>
    </div>
  );
}

export default async function PortalPage({
  params,
  searchParams,
}: PortalPageProps) {
  const supabase = createSupabaseServiceClient();

  const { data: tokenRow } = await supabase
    .from("client_portal_tokens")
    .select("*")
    .eq("token", params.token)
    .maybeSingle();

  if (!tokenRow) {
    return <ExpiredView reason="Esse link não existe ou foi revogado." />;
  }

  if (
    tokenRow.expires_at &&
    new Date(tokenRow.expires_at).getTime() < Date.now()
  ) {
    return <ExpiredView reason="Esse link já expirou." />;
  }

  // Check NDA
  const { data: nda } = await supabase
    .from("nda_signatures")
    .select("id")
    .eq("study_id", tokenRow.study_id)
    .eq("signed_by_email", tokenRow.client_email)
    .maybeSingle();

  if (!nda) {
    redirect(`/portal/${params.token}/nda`);
  }

  const { data: study } = await supabase
    .from("studies")
    .select("*, client:clients(*)")
    .eq("id", tokenRow.study_id)
    .maybeSingle();

  if (!study) {
    return <ExpiredView reason="O estudo associado não foi encontrado." />;
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, sprint, title, status, milestone, order_index")
    .eq("study_id", tokenRow.study_id)
    .order("sprint", { ascending: true })
    .order("order_index", { ascending: true });

  const { data: workspace } = await supabase
    .from("workspace_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  // Update last_accessed_at (best-effort)
  await supabase
    .from("client_portal_tokens")
    .update({ last_accessed_at: new Date().toISOString() })
    .eq("token", params.token);

  const tab = (searchParams.tab || "estudo") as
    | "estudo"
    | "marca"
    | "comercial"
    | "execucao";

  return (
    <PortalShell
      token={params.token}
      tab={tab}
      study={study}
      tasks={tasks || []}
      workspace={workspace || null}
    />
  );
}
