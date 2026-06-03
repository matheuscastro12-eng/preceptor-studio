"use client";

import {
  createClient as createLocalClient,
  createStudy as createLocalStudy,
  createTask as createLocalTask,
  deleteTask as deleteLocalTask,
  getStudy as getLocalStudy,
  listStudies as listLocalStudies,
  listTasks as listLocalTasks,
  replaceStudyTasks as replaceLocalStudyTasks,
  updateStudy as updateLocalStudy,
  updateTask as updateLocalTask,
  type Category,
  type Client,
  type Study,
  type StudyStatus,
  type StudyWithClient,
  type Task,
} from "@/lib/store";

type StudyInput = {
  client_id: string | null;
  title: string;
  category: Category;
  status?: StudyStatus;
};

type TaskInput = Omit<Task, "id" | "created_at" | "updated_at">;
type ReplaceTaskInput = Omit<Task, "id" | "study_id" | "created_at" | "updated_at">;

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

export async function listStudiesRemote(): Promise<StudyWithClient[]> {
  try {
    const data = await requestJson<{ studies: StudyWithClient[] }>("/api/studies");
    return data.studies;
  } catch {
    return listLocalStudies().sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

export async function getStudyRemote(id: string): Promise<StudyWithClient | null> {
  try {
    const data = await requestJson<{ study: StudyWithClient | null }>(`/api/studies/${id}`);
    return data.study;
  } catch {
    return getLocalStudy(id);
  }
}

export async function createClientRemote(input: { name: string; email?: string | null }): Promise<Client> {
  try {
    const data = await requestJson<{ client: Client }>("/api/clients", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return data.client;
  } catch {
    return createLocalClient(input);
  }
}

export async function createStudyRemote(input: StudyInput): Promise<Study> {
  try {
    const data = await requestJson<{ study: Study }>("/api/studies", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return data.study;
  } catch {
    return createLocalStudy(input);
  }
}

export async function updateStudyRemote(id: string, patch: Partial<Study>): Promise<Study | null> {
  try {
    const data = await requestJson<{ study: Study }>(`/api/studies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return data.study;
  } catch {
    return updateLocalStudy(id, patch);
  }
}

export async function listTasksRemote(studyId: string): Promise<Task[]> {
  try {
    const data = await requestJson<{ tasks: Task[] }>(`/api/studies/${studyId}/tasks`);
    return data.tasks;
  } catch {
    return listLocalTasks(studyId);
  }
}

export async function createTaskRemote(input: TaskInput): Promise<Task> {
  try {
    const data = await requestJson<{ task: Task }>(`/api/studies/${input.study_id}/tasks`, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return data.task;
  } catch {
    return createLocalTask(input);
  }
}

export async function replaceStudyTasksRemote(studyId: string, tasks: ReplaceTaskInput[]): Promise<Task[]> {
  try {
    const data = await requestJson<{ tasks: Task[] }>(`/api/studies/${studyId}/tasks`, {
      method: "PUT",
      body: JSON.stringify({ tasks }),
    });
    return data.tasks;
  } catch {
    replaceLocalStudyTasks(studyId, tasks);
    return listLocalTasks(studyId);
  }
}

export async function updateTaskRemote(id: string, patch: Partial<Task>): Promise<Task | null> {
  try {
    const data = await requestJson<{ task: Task }>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return data.task;
  } catch {
    return updateLocalTask(id, patch);
  }
}

export async function deleteTaskRemote(id: string): Promise<void> {
  try {
    await requestJson<{ ok: true }>(`/api/tasks/${id}`, { method: "DELETE" });
  } catch {
    deleteLocalTask(id);
  }
}
