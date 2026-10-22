import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { isActiveMember } from "@/lib/memberRole";

export interface AuthedUser {
  id: string;
  email: string | null;
}

// Defesa em profundidade: além do middleware, cada rota sensível confirma a sessão.
// Retorna o usuário autenticado e provisionado (papel owner/admin/member) ou null.
// Contas 'pending' (cadastro sem convite resgatado) são tratadas como não autenticadas.
export async function getAuthedUser(): Promise<AuthedUser | null> {
  try {
    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    if (!(await isActiveMember(user.id))) return null;
    return { id: user.id, email: user.email ?? null };
  } catch {
    return null;
  }
}

// Helper para rotas: lança um Response 401 se não autenticado.
// Uso:
//   const guard = await requireUser();
//   if (guard) return guard; // 401
export async function requireUser(): Promise<NextResponse | null> {
  const user = await getAuthedUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  return null;
}
