import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface WorkspaceSettingsRow {
  slack_digest_webhook: string | null;
}

interface LeadRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  diagnostic_score: number | null;
  requested_contact_at: string | null;
  created_at: string;
}

interface StudyRow {
  id: string;
  title: string;
  completed_at: string | null;
  client: { name: string | null } | { name: string | null }[] | null;
}

function studyClientName(s: StudyRow): string | null {
  if (!s.client) return null;
  if (Array.isArray(s.client)) return s.client[0]?.name ?? null;
  return s.client.name ?? null;
}

interface TaskRow {
  id: string;
  title: string;
  status: string;
  created_at: string;
  study_id: string;
}

interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  elements?: Array<{ type: string; text: string }>;
}

function baseUrl(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (!env) return "https://preceptor-studio.vercel.app";
  return env.startsWith("http") ? env : `https://${env}`;
}

function formatDateBR(d: Date): string {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function runDigest(): Promise<NextResponse> {
  const admin = createSupabaseServiceClient();

  const { data: settings } = await admin
    .from("workspace_settings")
    .select("slack_digest_webhook")
    .eq("id", "default")
    .maybeSingle();

  const webhook = ((settings || null) as WorkspaceSettingsRow | null)
    ?.slack_digest_webhook?.trim();

  if (!webhook) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(
    now.getTime() - 14 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [newLeadsRes, contactLeadsRes, studiesRes, lateTasksRes] =
    await Promise.all([
      admin
        .from("leads")
        .select("id, name, email, company, diagnostic_score, requested_contact_at, created_at")
        .gte("created_at", since)
        .order("diagnostic_score", { ascending: false, nullsFirst: false })
        .limit(20),
      admin
        .from("leads")
        .select("id, name, email, company, diagnostic_score, requested_contact_at, created_at")
        .gte("requested_contact_at", since)
        .order("requested_contact_at", { ascending: false })
        .limit(20),
      admin
        .from("studies")
        .select("id, title, completed_at, client:clients(name)")
        .eq("status", "completed")
        .gte("completed_at", since)
        .order("completed_at", { ascending: false })
        .limit(20),
      admin
        .from("tasks")
        .select("id, title, status, created_at, study_id")
        .in("status", ["todo", "doing"])
        .lte("created_at", twoWeeksAgo)
        .limit(20),
    ]);

  const newLeads = (newLeadsRes.data || []) as LeadRow[];
  const contactLeads = (contactLeadsRes.data || []) as LeadRow[];
  const studies = (studiesRes.data || []) as StudyRow[];
  const lateTasks = (lateTasksRes.data || []) as TaskRow[];

  const base = baseUrl();
  const blocks: SlackBlock[] = [];

  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: `📊 Digest PRECEPTOR! · ${formatDateBR(now)}`,
    },
  });

  const kpiLines = [
    `*Leads novos (24h):* ${newLeads.length}`,
    `*Pediram contato:* ${contactLeads.length}`,
    `*Estudos completos:* ${studies.length}`,
    `*Tasks atrasadas:* ${lateTasks.length}`,
  ];
  blocks.push({
    type: "section",
    text: { type: "mrkdwn", text: kpiLines.join("\n") },
  });

  if (newLeads.length > 0) {
    const top = newLeads.slice(0, 5).map((l) => {
      const score = l.diagnostic_score ?? "—";
      const company = l.company ? ` · ${l.company}` : "";
      return `• <${base}/dashboard/leads/${l.id}|${l.name}>${company} · score *${score}*`;
    });
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Top leads novos*\n${top.join("\n")}`,
      },
    });
  }

  if (contactLeads.length > 0) {
    const lines = contactLeads.slice(0, 10).map((l) => {
      const score = l.diagnostic_score ?? "—";
      const company = l.company ? ` · ${l.company}` : "";
      return `• <${base}/dashboard/leads/${l.id}|${l.name}>${company} · score *${score}*`;
    });
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Pediram contato (24h)*\n${lines.join("\n")}`,
      },
    });
  }

  if (studies.length > 0) {
    const lines = studies.slice(0, 10).map((s) => {
      const name = studyClientName(s);
      const client = name ? ` · ${name}` : "";
      return `• <${base}/dashboard/study/${s.id}|${s.title}>${client}`;
    });
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Estudos prontos (24h)*\n${lines.join("\n")}`,
      },
    });
  }

  if (lateTasks.length > 0) {
    const lines = lateTasks.slice(0, 10).map((t) => {
      const days = Math.floor(
        (now.getTime() - new Date(t.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return `• <${base}/dashboard/study/${t.study_id}|${t.title}> · ${days}d aberta · ${t.status}`;
    });
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Tasks atrasadas (>14d)*\n${lines.join("\n")}`,
      },
    });
  }

  blocks.push({ type: "divider" });
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `<${base}/dashboard|Abrir dashboard PRECEPTOR!>`,
      },
    ],
  });

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { ok: false, error: `Slack ${res.status}: ${text.slice(0, 200)}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, sent: blocks.length });
}

function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = req.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  try {
    if (!isAuthorizedCron(req)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return await runDigest();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erro" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!isAuthorizedCron(req)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return await runDigest();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erro" },
      { status: 500 }
    );
  }
}
