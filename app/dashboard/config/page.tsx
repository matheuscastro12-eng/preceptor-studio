import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";
import { ConfigView, type WorkspaceStats, type Viewer } from "./ConfigView";

export const dynamic = "force-dynamic";

interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  role: "owner" | "admin" | "member";
  team_key: string | null;
}

export default async function ConfigPage() {
  const sb = getServerSupabase();
  const admin = createSupabaseServiceClient();

  const {
    data: { user },
  } = await sb.auth.getUser();

  let viewer: Viewer = {
    id: "",
    email: "",
    name: "",
    role: "member",
    team_key: null,
  };

  if (user) {
    const { data } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (data) {
      const p = data as ProfileRow;
      viewer = {
        id: p.id,
        email: p.email,
        name: p.name || p.email,
        role: p.role,
        team_key: p.team_key,
      };
    } else {
      viewer = {
        id: user.id,
        email: user.email || "",
        name: user.email || "",
        role: "member",
        team_key: null,
      };
    }
  }

  const [membersCount, studiesCount, leadsCount] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("studies").select("id", { count: "exact", head: true }),
    admin.from("leads").select("id", { count: "exact", head: true }),
  ]);

  const stats: WorkspaceStats = {
    members: membersCount.count ?? 0,
    studies: studiesCount.count ?? 0,
    leads: leadsCount.count ?? 0,
  };

  const integrations = {
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    supabase: true,
    vercel: Boolean(process.env.VERCEL || process.env.VERCEL_ENV),
    vercelEnv: process.env.VERCEL_ENV || null,
  };

  return (
    <ConfigView viewer={viewer} stats={stats} integrations={integrations} />
  );
}
