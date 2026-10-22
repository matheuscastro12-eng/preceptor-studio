import { createSupabaseServiceClient } from "@/lib/supabase";

// Papéis com acesso a dados. Contas novas nascem 'pending' (db/schema.sql) e só
// ganham acesso ao resgatar um convite; sessão válida sozinha não basta.
export const ACTIVE_ROLES = ["owner", "admin", "member"] as const;

export function isActiveRole(role: unknown): boolean {
  return typeof role === "string" && (ACTIVE_ROLES as readonly string[]).includes(role);
}

// Lê o papel com service role (não depende das policies de profiles).
// Fail-closed: qualquer erro, ou profile ausente, conta como sem acesso.
export async function isActiveMember(userId: string): Promise<boolean> {
  try {
    const { data, error } = await createSupabaseServiceClient()
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return false;
    return isActiveRole((data as { role?: unknown }).role);
  } catch {
    return false;
  }
}
