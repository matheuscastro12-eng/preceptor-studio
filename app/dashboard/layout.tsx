import "./dashboard.css";
import { redirect } from "next/navigation";
import { Sidebar, type SidebarProfile } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { CmdK } from "@/components/dashboard/CmdK";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";

async function fetchBadges() {
  try {
    const supabase = createSupabaseServiceClient();
    const [studies, leads] = await Promise.all([
      supabase.from("studies").select("id", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "novo"),
    ]);
    return {
      studies: studies.count ?? 0,
      leads: leads.count ?? 0,
    };
  } catch {
    return { studies: 0, leads: 0 };
  }
}

function initialsFromName(name: string, email: string) {
  const source = name?.trim() || email?.split("@")[0] || "ST";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

async function fetchProfile(): Promise<SidebarProfile | undefined> {
  try {
    const supabase = getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return undefined;

    const admin = createSupabaseServiceClient();
    const { data } = await admin
      .from("profiles")
      .select("name, email, role, team_key")
      .eq("id", user.id)
      .maybeSingle();

    const name = (data?.name as string) || user.email || "Studio";
    const email = (data?.email as string) || user.email || "";
    return {
      name,
      initials: initialsFromName(name, email),
      role: (data?.role as string) || "member",
      teamKey: (data?.team_key as string | null) ?? null,
    };
  } catch {
    return undefined;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware should already redirect anonymous users, but double-check for safety.
  const supabase = getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [badges, profile] = await Promise.all([fetchBadges(), fetchProfile()]);

  return (
    <div className="dashboard-shell">
      <Sidebar
        studiesBadge={badges.studies}
        leadsBadge={badges.leads}
        profile={profile}
      />
      <div className="ds-main">
        <TopBar />
        <div className="ds-content">{children}</div>
      </div>
      <CmdK />
    </div>
  );
}
