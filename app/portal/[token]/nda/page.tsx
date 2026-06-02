import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { NdaForm } from "./NdaForm";

export const dynamic = "force-dynamic";

export default async function NdaPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createSupabaseServiceClient();

  const { data: tokenRow } = await supabase
    .from("client_portal_tokens")
    .select("*")
    .eq("token", params.token)
    .maybeSingle();

  if (!tokenRow) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="surface rounded-2xl p-12 text-center max-w-md">
          <h1 className="text-xl font-black text-navy mb-2">Link inválido</h1>
          <p className="text-ink-soft text-sm">Esse acesso não foi encontrado.</p>
        </div>
      </div>
    );
  }

  if (
    tokenRow.expires_at &&
    new Date(tokenRow.expires_at).getTime() < Date.now()
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="surface rounded-2xl p-12 text-center max-w-md">
          <h1 className="text-xl font-black text-navy mb-2">Acesso expirado</h1>
          <p className="text-ink-soft text-sm">Entre em contato com o estúdio.</p>
        </div>
      </div>
    );
  }

  const { data: existing } = await supabase
    .from("nda_signatures")
    .select("id")
    .eq("study_id", tokenRow.study_id)
    .eq("signed_by_email", tokenRow.client_email)
    .maybeSingle();

  if (existing) {
    redirect(`/portal/${params.token}`);
  }

  const { data: study } = await supabase
    .from("studies")
    .select("id, title, client:clients(name, email)")
    .eq("id", tokenRow.study_id)
    .maybeSingle();

  const clientRel = study?.client as { name?: string | null } | null;
  const defaultName = clientRel?.name || "";

  return (
    <NdaForm
      token={params.token}
      studyTitle={study?.title || "Estudo"}
      defaultName={defaultName}
      defaultEmail={tokenRow.client_email}
    />
  );
}
