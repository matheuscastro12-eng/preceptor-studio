import { createSupabaseServiceClient } from "@/lib/supabase";

export interface FunnelRow {
  label: string;
  leads?: number;
  visitors?: number;
  score?: number;
}

export interface FunnelSummary {
  days: number;
  visitors: number;
  page_views: number;
  diag_views: number;
  diag_starts: number;
  leads: number;
  contacts: number;
  by_source: FunnelRow[];
  by_campaign: FunnelRow[];
  by_content: FunnelRow[];
  traffic_by_source: FunnelRow[];
}

const EMPTY = (days: number): FunnelSummary => ({
  days,
  visitors: 0,
  page_views: 0,
  diag_views: 0,
  diag_starts: 0,
  leads: 0,
  contacts: 0,
  by_source: [],
  by_campaign: [],
  by_content: [],
  traffic_by_source: [],
});

export async function getFunnelSummary(days: number): Promise<FunnelSummary> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.rpc("funnel_summary", { days });
    if (error || !data) return EMPTY(days);
    return { ...EMPTY(days), ...(data as Partial<FunnelSummary>) };
  } catch {
    return EMPTY(days);
  }
}
