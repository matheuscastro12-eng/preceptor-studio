import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type {
  Category,
  Client,
  InsightItem,
  Study,
  StudyScores,
  StudyStatus,
  StudyWithClient,
  Task,
  TaskStatus,
  Assignee,
} from "./store";

export type {
  Category,
  StudyStatus,
  Client,
  Study,
  StudyWithClient,
  Task,
  TaskStatus,
  Assignee,
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface StudyFile {
  id: string;
  study_id: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  pages: number | null;
  character_count: number | null;
  storage_bucket: string | null;
  storage_path: string | null;
  extracted_text: string | null;
  extraction_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OutputVersion {
  id: string;
  study_id: string;
  output_type:
    | "diagnostic"
    | "study"
    | "brand"
    | "commercial"
    | "execution"
    | "thesis"
    | "slides"
    | "artifact";
  content_md: string | null;
  content_json: Record<string, any> | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AuditReport {
  id: string;
  study_id: string;
  report_type: "study_quality" | "client_safe" | "slide_prompt" | "output_health";
  score: number | null;
  findings: any[];
  metadata: Record<string, any>;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      clients: Table<
        Client,
        Partial<Omit<Client, "id" | "created_at" | "updated_at">> & {
          id?: string;
          name: string;
        }
      >;
      studies: Table<
        Study,
        Partial<
          Omit<
            Study,
            | "id"
            | "answers"
            | "insights_chave"
            | "scores"
            | "artifacts"
            | "generation_metadata"
            | "created_at"
            | "updated_at"
          >
        > & {
          id?: string;
          title: string;
          category: Category;
          client_id?: string | null;
          status?: StudyStatus;
          answers?: Record<string, any>;
          insights_chave?: InsightItem[];
          scores?: StudyScores;
          artifacts?: Record<string, any>;
          generation_metadata?: Record<string, any>;
        }
      >;
      tasks: Table<
        Task,
        Partial<Omit<Task, "id" | "created_at" | "updated_at">> & {
          id?: string;
          study_id: string;
          sprint: number;
          title: string;
          status?: TaskStatus;
        }
      >;
      study_files: Table<StudyFile>;
      output_versions: Table<OutputVersion>;
      audit_reports: Table<AuditReport>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} nao configurada`);
  }
  return value;
}

export function createSupabaseBrowserClient() {
  return createSupabaseClient<any>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

export function createSupabaseServiceClient() {
  return createSupabaseClient<any>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
