import { createClient } from "@supabase/supabase-js";
import { getAuthedUser } from "@/lib/apiAuth";
import { OASIS, type ProjetoOpera } from "./model";

export function operaDB() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Conexão com o Cérebro não configurada.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

// Both session and profile are checked before any service-role read of internal data.
export async function membroOpera(req?: Request) {
  const token = req?.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  const user = token ? (await operaDB().auth.getUser(token)).data.user : await getAuthedUser();
  if (!user) return null;
  const { data, error } = await operaDB().from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (error || !data || !["owner", "admin", "member"].includes(data.role)) return null;
  return { id: user.id, role: data.role as string };
}

export async function projetoOpera(slug: string): Promise<ProjetoOpera | null> {
  if (slug === OASIS.slug && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) return OASIS;
  const { data, error } = await operaDB().from("opera_projetos").select("*").eq("slug", slug).maybeSingle();
  // Only the historical, explicitly public OASIS instrument has a fallback.
  if (error && !["42P01", "PGRST205"].includes(error.code)) throw error;
  return data ?? (slug === OASIS.slug ? OASIS : null);
}

export async function listarProjetos(membro?: {id:string;role:string}|null): Promise<{ projetos: ProjetoOpera[]; aviso: string | null }> {
  try {
    const m = membro ?? await membroOpera();
    if(!m) return {projetos:[],aviso:null};
    const { data, error } = await operaDB().from("opera_projetos").select("*").order("atualizado_em", { ascending: false });
    if (error) throw error;
    let projetos = (data ?? []) as ProjetoOpera[];
    if(!['owner','admin'].includes(m.role)) {
      const {data:permissoes,error:e}=await operaDB().from('opera_membros').select('projeto').eq('usuario',m.id);
      if(e) throw e;
      projetos=projetos.filter(p=>p.criado_por===m.id||permissoes?.some(x=>x.projeto===p.slug));
    }
    return { projetos, aviso: null };
  } catch {
    return { projetos: [], aviso: "Cadastro de projetos indisponível. Configure o banco e aplique as migrações OPERA antes de acompanhar os projetos." };
  }
}

export async function evidenciaProjeto(slug: string) {
  const db = operaDB();
  const [painel, respostas] = await Promise.all([
    db.from("painel_construcao").select("atualizado_em").eq("venture", slug).maybeSingle(),
    db.from("colheita_respostas").select("id", { count: "exact", head: true }).eq("venture", slug),
  ]);
  return {
    painelEm: painel.data?.atualizado_em as string | undefined,
    respostas: respostas.error ? null : respostas.count ?? 0,
    falhaPainel: !!painel.error, falhaColheita: !!respostas.error,
  };
}
