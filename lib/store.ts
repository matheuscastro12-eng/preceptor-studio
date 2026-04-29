"use client";

export type Category = "saude" | "educacao" | "juridico" | "tech" | "outro";

export type StudyStatus =
  | "draft"
  | "questionnaire"
  | "generating"
  | "completed"
  | "archived";

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientFacingScores {
  mercado: number;
  execucao: number;
  diferenciacao: number;
  modelo_receita: number;
  risco_regulatorio: number;
  overall: number;
  rationale?: {
    mercado?: string;
    execucao?: string;
    diferenciacao?: string;
    modelo_receita?: string;
    risco_regulatorio?: string;
    overall?: string;
  };
}

export interface InternalScores {
  potencial_portfolio: number;
  fit_stack_preceptor: number;
  compromisso_fundador: number;
  potencial_recorrencia: number;
  risco_reputacional: number;
  overall: number;
  recommendation: "entrar" | "observar" | "nao_entrar";
  rationale?: {
    potencial_portfolio?: string;
    fit_stack_preceptor?: string;
    compromisso_fundador?: string;
    potencial_recorrencia?: string;
    risco_reputacional?: string;
    overall?: string;
  };
}

export interface StudyScores {
  client_facing?: ClientFacingScores;
  internal?: InternalScores;
}

export interface InsightItem {
  type: "insight" | "warning" | "force" | "fragility";
  title: string;
  body: string;
}

export interface Study {
  id: string;
  client_id: string | null;
  title: string;
  category: Category;
  status: StudyStatus;
  answers: Record<string, any>;
  output_md: string | null;
  output_html: string | null;
  brand_brief_md: string | null;
  commercial_plan_md: string | null;
  internal_thesis_md: string | null;
  insights_chave: InsightItem[];
  scores: StudyScores;
  // Mantido para compatibilidade com estudos antigos (briefing_dev/financial/prospecting)
  artifacts: Record<string, any>;
  generation_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface StudyWithClient extends Study {
  client?: Client | null;
}

const STUDIES_KEY = "preceptor:studies";
const CLIENTS_KEY = "preceptor:clients";
const TASKS_KEY = "preceptor:tasks";

export type TaskStatus = "todo" | "doing" | "done" | "blocked";
export type Assignee =
  | "matheus"
  | "luciano"
  | "ana_flavia"
  | "thiago"
  | "leonardo"
  | "marco"
  | "kalley";

export interface Task {
  id: string;
  study_id: string;
  sprint: number;
  title: string;
  description: string | null;
  assignee: Assignee | null;
  estimated_hours: number | null;
  status: TaskStatus;
  order_index: number;
  milestone?: boolean;
  created_at: string;
  updated_at: string;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
  );
}

// ─── Clients ──────────────────────────────────────────────────────────
export function listClients(): Client[] {
  return read<Client>(CLIENTS_KEY);
}

export function createClient(input: {
  name: string;
  email?: string | null;
}): Client {
  const now = new Date().toISOString();
  const client: Client = {
    id: uid(),
    name: input.name,
    email: input.email || null,
    phone: null,
    notes: null,
    created_at: now,
    updated_at: now,
  };
  const all = listClients();
  all.push(client);
  write(CLIENTS_KEY, all);
  return client;
}

export function getClient(id: string): Client | null {
  return listClients().find((c) => c.id === id) || null;
}

// ─── Studies ──────────────────────────────────────────────────────────
export function listStudies(): StudyWithClient[] {
  const studies = read<Study>(STUDIES_KEY);
  const clients = listClients();
  return studies.map((s) => ({
    ...s,
    client: clients.find((c) => c.id === s.client_id) || null,
  }));
}

export function getStudy(id: string): StudyWithClient | null {
  const s = read<Study>(STUDIES_KEY).find((x) => x.id === id);
  if (!s) return null;
  return { ...s, client: s.client_id ? getClient(s.client_id) : null };
}

export function createStudy(input: {
  client_id: string | null;
  title: string;
  category: Category;
  status?: StudyStatus;
}): Study {
  const now = new Date().toISOString();
  const study: Study = {
    id: uid(),
    client_id: input.client_id,
    title: input.title,
    category: input.category,
    status: input.status || "questionnaire",
    answers: {},
    output_md: null,
    output_html: null,
    brand_brief_md: null,
    commercial_plan_md: null,
    internal_thesis_md: null,
    insights_chave: [],
    scores: {},
    artifacts: {},
    generation_metadata: {},
    created_at: now,
    updated_at: now,
    completed_at: null,
  };
  const all = read<Study>(STUDIES_KEY);
  all.push(study);
  write(STUDIES_KEY, all);
  return study;
}

export function updateStudy(id: string, patch: Partial<Study>): Study | null {
  const all = read<Study>(STUDIES_KEY);
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
  write(STUDIES_KEY, all);
  return all[idx];
}

export function deleteStudy(id: string) {
  const all = read<Study>(STUDIES_KEY).filter((s) => s.id !== id);
  write(STUDIES_KEY, all);
  // also drop related tasks
  const remaining = read<Task>(TASKS_KEY).filter((t) => t.study_id !== id);
  write(TASKS_KEY, remaining);
}

// ─── Tasks ────────────────────────────────────────────────────────────
export function listTasks(studyId: string): Task[] {
  return read<Task>(TASKS_KEY)
    .filter((t) => t.study_id === studyId)
    .sort((a, b) => {
      if (a.sprint !== b.sprint) return a.sprint - b.sprint;
      return a.order_index - b.order_index;
    });
}

export function createTask(input: Omit<Task, "id" | "created_at" | "updated_at">): Task {
  const now = new Date().toISOString();
  const task: Task = {
    ...input,
    id: uid(),
    created_at: now,
    updated_at: now,
  };
  const all = read<Task>(TASKS_KEY);
  all.push(task);
  write(TASKS_KEY, all);
  return task;
}

export function updateTask(id: string, patch: Partial<Task>): Task | null {
  const all = read<Task>(TASKS_KEY);
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
  write(TASKS_KEY, all);
  return all[idx];
}

export function deleteTask(id: string) {
  const all = read<Task>(TASKS_KEY).filter((t) => t.id !== id);
  write(TASKS_KEY, all);
}

export function replaceStudyTasks(
  studyId: string,
  tasks: Omit<Task, "id" | "study_id" | "created_at" | "updated_at">[]
) {
  const others = read<Task>(TASKS_KEY).filter((t) => t.study_id !== studyId);
  const now = new Date().toISOString();
  const fresh: Task[] = tasks.map((t) => ({
    ...t,
    id: uid(),
    study_id: studyId,
    created_at: now,
    updated_at: now,
  }));
  write(TASKS_KEY, [...others, ...fresh]);
}
