import { NextRequest, NextResponse } from "next/server";
import { callGemini, extractJSON } from "@/lib/gemini";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  buildLiveScoreSystemPrompt,
  buildLiveScoreUserPrompt,
  type LiveScoreExecutionSprint,
} from "@/prompts/liveScore";
import type { Category } from "@/lib/store";

export const maxDuration = 60;

// Detecção de queda de score.
const AXIS_DROP_THRESHOLD = 10; // queda de eixo individual em pontos
const OVERALL_DROP_THRESHOLD = 8; // queda do overall em pontos

interface ScoreAxis {
  label: string;
  value: number;
  hint?: string;
}

interface LiveScoreResult {
  overall: number;
  axes: ScoreAxis[];
  note: string;
}

interface AxisDelta {
  label: string;
  from: number;
  to: number;
  delta: number;
}

function clampInt(v: unknown, fallback = 50): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function validateResult(raw: unknown): LiveScoreResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.axes) || r.axes.length === 0) return null;
  const axes: ScoreAxis[] = r.axes
    .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
    .map((a) => ({
      label: typeof a.label === "string" ? a.label : "Eixo",
      value: clampInt(a.value),
      hint: typeof a.hint === "string" ? a.hint : undefined,
    }));
  if (axes.length === 0) return null;
  return {
    overall: clampInt(r.overall),
    axes,
    note: typeof r.note === "string" ? r.note : "",
  };
}

// Converte o objeto scores.client_facing antigo (chaves) em axes (labels) para comparação.
function scoresToAxes(
  cf: Record<string, unknown> | null | undefined
): { axes: ScoreAxis[]; overall: number } | null {
  if (!cf || typeof cf !== "object") return null;
  const map: { key: string; label: string }[] = [
    { key: "mercado", label: "Mercado" },
    { key: "execucao", label: "Execução" },
    { key: "diferenciacao", label: "Diferenciação" },
    { key: "modelo_receita", label: "Modelo" },
    { key: "risco_regulatorio", label: "Regulatório" },
  ];
  const axes: ScoreAxis[] = [];
  for (const m of map) {
    const v = cf[m.key];
    if (typeof v === "number") axes.push({ label: m.label, value: clampInt(v) });
  }
  if (axes.length === 0) return null;
  return { axes, overall: clampInt(cf.overall, 0) };
}

function baseUrl(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (!env) return "https://preceptorstudio.com";
  return env.startsWith("http") ? env : `https://${env}`;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getServerSupabase();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const apiKey = (process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY);
    if (!apiKey) {
      return NextResponse.json({ error: "GOOGLE_API_KEY não configurada" }, { status: 500 });
    }

    const supabase = createSupabaseServiceClient();

    const { data: study, error } = await supabase
      .from("studies")
      .select("id, title, category, answers, output_md, scores, generation_metadata")
      .eq("id", params.id)
      .maybeSingle();
    if (error) throw error;
    if (!study) return NextResponse.json({ error: "Estudo não encontrado" }, { status: 404 });

    // Progresso de execução: % done por sprint.
    const { data: tasks } = await supabase
      .from("tasks")
      .select("sprint, status")
      .eq("study_id", params.id);

    const sprintMap = new Map<number, { total: number; done: number }>();
    for (const t of (tasks ?? []) as { sprint: number | null; status: string }[]) {
      const sprint = typeof t.sprint === "number" ? t.sprint : 0;
      const cur = sprintMap.get(sprint) ?? { total: 0, done: 0 };
      cur.total += 1;
      if (t.status === "done") cur.done += 1;
      sprintMap.set(sprint, cur);
    }
    const execution: LiveScoreExecutionSprint[] = Array.from(sprintMap.entries())
      .map(([sprint, v]) => ({ sprint, total: v.total, done: v.done }))
      .sort((a, b) => a.sprint - b.sprint);

    // Respostas novas (perguntas de aprofundamento respondidas).
    const meta = (study.generation_metadata as Record<string, unknown> | null) || {};
    const nextRoundQuestions = Array.isArray(meta.next_round_questions)
      ? (meta.next_round_questions as string[])
      : [];
    const nextRoundAnswers =
      meta.next_round_answers && typeof meta.next_round_answers === "object"
        ? (meta.next_round_answers as Record<string, string>)
        : {};
    const answeredFollowUps: { question: string; answer: string }[] = [];
    for (const q of nextRoundQuestions) {
      const a = nextRoundAnswers[q];
      if (typeof a === "string" && a.trim().length > 0) {
        answeredFollowUps.push({ question: q, answer: a.trim() });
      }
    }

    // Último ponto do histórico, ou scores atuais como baseline.
    const { data: lastRow } = await supabase
      .from("study_score_history")
      .select("overall, axes")
      .eq("study_id", params.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let previousAxes: ScoreAxis[] | null = null;
    let previousOverall: number | null = null;
    if (lastRow && Array.isArray((lastRow as { axes?: unknown }).axes)) {
      const row = lastRow as { overall: number | null; axes: ScoreAxis[] };
      previousAxes = row.axes.map((a) => ({
        label: a.label,
        value: clampInt(a.value),
      }));
      previousOverall = typeof row.overall === "number" ? row.overall : null;
    } else {
      const fromScores = scoresToAxes(
        (study.scores as { client_facing?: Record<string, unknown> } | null)
          ?.client_facing
      );
      if (fromScores) {
        previousAxes = fromScores.axes;
        previousOverall = fromScores.overall;
      }
    }

    const systemPrompt = buildLiveScoreSystemPrompt(study.category as Category);
    const userPrompt = buildLiveScoreUserPrompt({
      title: (study.title as string) || "Projeto",
      outputMd: (study.output_md as string | null) || null,
      answers: (study.answers as Record<string, unknown>) || {},
      execution,
      previousScores: previousAxes
        ? previousAxes.map((a) => ({ label: a.label, value: a.value }))
        : null,
      previousOverall,
      answeredFollowUps,
    });

    const gemini = await callGemini(systemPrompt, userPrompt, apiKey, {
      temperature: 0.5,
      maxOutputTokens: 2048,
      thinking: false,
    });

    const parsed = validateResult(extractJSON(gemini.content));
    if (!parsed) {
      return NextResponse.json(
        { error: "Não foi possível extrair o score reavaliado do modelo." },
        { status: 502 }
      );
    }

    // Comparação eixo a eixo com a medição anterior.
    const prevByLabel = new Map<string, number>(
      (previousAxes ?? []).map((a) => [a.label, a.value])
    );
    const deltas: AxisDelta[] = parsed.axes.map((a) => {
      const from = prevByLabel.get(a.label);
      const fromVal = typeof from === "number" ? from : a.value;
      return { label: a.label, from: fromVal, to: a.value, delta: a.value - fromVal };
    });
    const overallDelta =
      previousOverall !== null ? parsed.overall - previousOverall : 0;

    const droppedAxes = deltas.filter((d) => d.delta <= -AXIS_DROP_THRESHOLD);
    const overallDropped = overallDelta <= -OVERALL_DROP_THRESHOLD;
    const shouldAlert =
      previousOverall !== null && (droppedAxes.length > 0 || overallDropped);

    // Persiste no histórico.
    await supabase.from("study_score_history").insert({
      study_id: params.id,
      overall: parsed.overall,
      axes: parsed.axes,
      note: parsed.note || null,
      source: "manual",
    });

    // Atualiza scores.client_facing mantendo as chaves originais usadas pela UI.
    const labelToKey: Record<string, string> = {
      Mercado: "mercado",
      Execução: "execucao",
      Diferenciação: "diferenciacao",
      Modelo: "modelo_receita",
      Regulatório: "risco_regulatorio",
    };
    const existingScores =
      (study.scores as { client_facing?: Record<string, unknown> } | null) || {};
    const existingCf =
      (existingScores.client_facing as Record<string, unknown> | undefined) || {};
    const updatedCf: Record<string, unknown> = { ...existingCf };
    for (const a of parsed.axes) {
      const key = labelToKey[a.label];
      if (key) updatedCf[key] = a.value;
    }
    updatedCf.overall = parsed.overall;

    await supabase
      .from("studies")
      .update({
        scores: { ...existingScores, client_facing: updatedCf },
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    // Alerta de queda.
    if (shouldAlert) {
      const worst =
        droppedAxes.length > 0
          ? [...droppedAxes].sort((a, b) => a.delta - b.delta)[0]
          : null;
      const bodyParts: string[] = [];
      if (worst) {
        bodyParts.push(
          `O eixo ${worst.label} caiu de ${worst.from} para ${worst.to} (${worst.delta} pontos).`
        );
      }
      if (overallDropped) {
        bodyParts.push(
          `O score geral caiu de ${previousOverall} para ${parsed.overall} (${overallDelta} pontos).`
        );
      }
      const studyTitle = (study.title as string) || "estudo";
      await supabase.from("notifications").insert({
        type: "custom",
        title: "Score da tese caiu",
        body: `${studyTitle}: ${bodyParts.join(" ")}`.trim(),
        link: `/dashboard/study/${params.id}`,
        recipient_role: "all",
        metadata: {
          kind: "score_drop",
          study_id: params.id,
          overall: parsed.overall,
          previous_overall: previousOverall,
          dropped_axes: droppedAxes,
          base_url: baseUrl(),
        },
      });
    }

    return NextResponse.json({
      overall: parsed.overall,
      axes: parsed.axes,
      note: parsed.note,
      deltas,
      overall_delta: overallDelta,
      alerted: shouldAlert,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
