import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";
import { TEAM_COLORS } from "@/lib/teamColors";
import { TeamView, type MemberRow, type CapacityRow } from "./TeamView";

export const dynamic = "force-dynamic";

interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  role: "owner" | "admin" | "member";
  team_key: string | null;
  created_at: string;
  updated_at: string;
}

interface TaskAgg {
  assignee: string | null;
  status: string;
  estimated_hours: number | null;
  updated_at: string;
}

interface LeadAgg {
  assignee: string | null;
  status: string;
  updated_at: string;
}

const TEAM_KEYS = [
  "matheus",
  "luciano",
  "ana_flavia",
  "thiago",
  "leonardo",
  "marco",
  "kalley",
] as const;

const SPRINT_CAPACITY_HOURS = 80;

export default async function TimePage() {
  const supabase = createSupabaseServiceClient();

  const sb = getServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  let viewerRole: "owner" | "admin" | "member" = "member";
  if (user) {
    const { data: meRow } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (meRow?.role) viewerRole = meRow.role as typeof viewerRole;
  }

  const [profilesRes, tasksRes, leadsRes] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: true }),
    supabase
      .from("tasks")
      .select("assignee,status,estimated_hours,updated_at"),
    supabase.from("leads").select("assignee,status,updated_at"),
  ]);

  const profiles = (profilesRes.data ?? []) as ProfileRow[];
  const tasks = (tasksRes.data ?? []) as TaskAgg[];
  const leads = (leadsRes.data ?? []) as LeadAgg[];

  function aggForKey(key: string | null) {
    const myTasks = key ? tasks.filter((t) => t.assignee === key) : [];
    const activeTasks = myTasks.filter((t) => t.status !== "done");
    const hoursAllocated = activeTasks.reduce(
      (a, t) => a + (Number(t.estimated_hours) || 0),
      0
    );
    const myLeads = key
      ? leads.filter(
          (l) =>
            l.assignee === key &&
            l.status !== "ganho" &&
            l.status !== "perdido"
        )
      : [];
    const allTouches = [
      ...myTasks.map((t) => t.updated_at),
      ...(key
        ? leads.filter((l) => l.assignee === key).map((l) => l.updated_at)
        : []),
    ].filter(Boolean);
    const lastActivity =
      allTouches.length > 0
        ? allTouches.reduce((a, b) => (a > b ? a : b))
        : null;
    return {
      activeTasks: activeTasks.length,
      hoursAllocated,
      leadsInFunnel: myLeads.length,
      lastActivity,
    };
  }

  const members: MemberRow[] = profiles.map((p) => {
    const agg = aggForKey(p.team_key);
    const tc = p.team_key ? TEAM_COLORS[p.team_key] : null;
    return {
      id: p.id,
      email: p.email,
      name: p.name || p.email,
      role: p.role,
      team_key: p.team_key,
      teamName: tc?.name ?? null,
      teamColor: tc?.color ?? "#94A3B8",
      teamInitials: tc?.initials ?? "·",
      activeTasks: agg.activeTasks,
      leadsInFunnel: agg.leadsInFunnel,
      hoursAllocated: agg.hoursAllocated,
      lastActivity: agg.lastActivity,
    };
  });

  const capacity: CapacityRow[] = TEAM_KEYS.map((k) => {
    const tc = TEAM_COLORS[k];
    const agg = aggForKey(k);
    return {
      key: k,
      name: tc.name,
      color: tc.color,
      hours: agg.hoursAllocated,
      capacity: SPRINT_CAPACITY_HOURS,
    };
  });

  const activeMembers = members.filter((m) => m.team_key !== null).length;
  const totalActiveTasks = tasks.filter((t) => t.status !== "done").length;
  const totalLeadsInFunnel = leads.filter(
    (l) => l.status !== "ganho" && l.status !== "perdido" && l.assignee
  ).length;
  const totalHours = capacity.reduce((a, c) => a + c.hours, 0);

  return (
    <TeamView
      members={members}
      capacity={capacity}
      kpis={{
        activeMembers,
        totalActiveTasks,
        totalLeadsInFunnel,
        totalHours,
      }}
      viewerRole={viewerRole}
    />
  );
}
