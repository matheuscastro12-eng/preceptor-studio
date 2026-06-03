import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export interface AuthedUser {
  id: string;
  email: string | null;
}

// Defesa em profundidade: além do middleware, cada rota sensível confirma a sessão.
// Retorna o usuário autenticado ou null.
export async function getAuthedUser(): Promise<AuthedUser | null> {
  try {
    const supabase = getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
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
