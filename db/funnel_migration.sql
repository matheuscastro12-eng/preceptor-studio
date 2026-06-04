-- ═══════════════════════════════════════════════════════════════════════════
-- PRECEPTOR! Studio - Funil + UTM (metrificacao de aquisicao)
-- Rode no SQL Editor do Supabase APOS o schema.sql principal. Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ─── UTM + contexto de origem no lead ──────────────────────────────────────
alter table public.leads add column if not exists utm_source text;
alter table public.leads add column if not exists utm_medium text;
alter table public.leads add column if not exists utm_campaign text;
alter table public.leads add column if not exists utm_content text;
alter table public.leads add column if not exists utm_term text;
alter table public.leads add column if not exists landing_page text;
alter table public.leads add column if not exists referrer text;
create index if not exists leads_utm_source_idx on public.leads (utm_source);
create index if not exists leads_utm_campaign_idx on public.leads (utm_campaign);

-- ─── Eventos de funil (topo, sem PII) ──────────────────────────────────────
-- page_view: abriu qualquer pagina do marketing
-- diagnostic_view: abriu /diagnostico
-- diagnostic_start: comecou a responder o questionario
create table if not exists public.funnel_events (
  id text primary key default gen_random_uuid()::text,
  session_id text,
  event_type text not null check (event_type in ('page_view','diagnostic_view','diagnostic_start')),
  path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists funnel_events_type_created_idx on public.funnel_events (event_type, created_at desc);
create index if not exists funnel_events_session_idx on public.funnel_events (session_id);
create index if not exists funnel_events_utm_source_idx on public.funnel_events (utm_source);
create index if not exists funnel_events_created_idx on public.funnel_events (created_at desc);

alter table public.funnel_events enable row level security;
-- Insert so via service role (endpoint publico). Leitura para membros ativos (dashboard).
drop policy if exists "active members read funnel" on public.funnel_events;
create policy "active members read funnel" on public.funnel_events
  for select to authenticated using (public.is_active_member());
grant select on public.funnel_events to authenticated;

-- ─── Funcao de agregacao do funil (uma chamada = resumo completo) ──────────
create or replace function public.funnel_summary(days integer default 30)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with win as (select (now() - (days || ' days')::interval) as since)
  select json_build_object(
    'days', days,
    'visitors', (select count(distinct session_id) from public.funnel_events, win where event_type='page_view' and created_at > win.since),
    'page_views', (select count(*) from public.funnel_events, win where event_type='page_view' and created_at > win.since),
    'diag_views', (select count(distinct session_id) from public.funnel_events, win where event_type='diagnostic_view' and created_at > win.since),
    'diag_starts', (select count(distinct session_id) from public.funnel_events, win where event_type='diagnostic_start' and created_at > win.since),
    'leads', (select count(*) from public.leads, win where created_at > win.since),
    'contacts', (select count(*) from public.leads, win where requested_contact_at is not null and created_at > win.since),
    'by_source', (select coalesce(json_agg(t), '[]'::json) from (
      select coalesce(nullif(utm_source,''),'(direto)') as label, count(*)::int as leads, coalesce(round(avg(diagnostic_score)),0)::int as score
      from public.leads, win where created_at > win.since group by 1 order by 2 desc limit 12) t),
    'by_campaign', (select coalesce(json_agg(t), '[]'::json) from (
      select coalesce(nullif(utm_campaign,''),'(sem campanha)') as label, count(*)::int as leads, coalesce(round(avg(diagnostic_score)),0)::int as score
      from public.leads, win where created_at > win.since group by 1 order by 2 desc limit 12) t),
    'by_content', (select coalesce(json_agg(t), '[]'::json) from (
      select coalesce(nullif(utm_content,''),'(sem criativo)') as label, count(*)::int as leads
      from public.leads, win where created_at > win.since group by 1 order by 2 desc limit 12) t),
    'traffic_by_source', (select coalesce(json_agg(t), '[]'::json) from (
      select coalesce(nullif(utm_source,''),'(direto)') as label, count(distinct session_id)::int as visitors
      from public.funnel_events, win where event_type='page_view' and created_at > win.since group by 1 order by 2 desc limit 12) t)
  );
$$;
grant execute on function public.funnel_summary(integer) to authenticated;

commit;
