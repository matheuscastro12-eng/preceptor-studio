-- Preceptor! Studio - Supabase schema
-- Run this file in Supabase SQL Editor, or through Supabase CLI.
--
-- Design notes:
-- - IDs are TEXT with gen_random_uuid() defaults so existing localStorage ids can be migrated.
-- - RLS is enabled. Authenticated users can manage data. Service role bypasses RLS for server routes.
-- - The schema covers the current app: clients, studies, outputs, scores, insights, artifacts and tasks.

begin;

create extension if not exists pgcrypto;

-- Helper de RLS: o usuário autenticado é um membro provisionado (não 'pending')?
-- SECURITY DEFINER lê public.profiles sem disparar as policies (evita recursão de RLS).
create or replace function public.is_active_member()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('owner', 'admin', 'member')
  );
end;
$$;
grant execute on function public.is_active_member() to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Clients --------------------------------------------------------------------

create table if not exists public.clients (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_name_idx on public.clients using btree (name);
create index if not exists clients_created_at_idx on public.clients using btree (created_at desc);

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

-- Studies --------------------------------------------------------------------

create table if not exists public.studies (
  id text primary key default gen_random_uuid()::text,
  client_id text references public.clients(id) on delete set null,
  title text not null,
  category text not null check (category in ('saude', 'educacao', 'juridico', 'tech', 'outro')),
  status text not null default 'questionnaire' check (status in ('draft', 'questionnaire', 'generating', 'completed', 'archived')),

  answers jsonb not null default '{}'::jsonb,

  output_md text,
  output_html text,
  brand_brief_md text,
  commercial_plan_md text,
  internal_thesis_md text,

  insights_chave jsonb not null default '[]'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  artifacts jsonb not null default '{}'::jsonb,
  generation_metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists studies_client_id_idx on public.studies using btree (client_id);
create index if not exists studies_category_idx on public.studies using btree (category);
create index if not exists studies_status_idx on public.studies using btree (status);
create index if not exists studies_created_at_idx on public.studies using btree (created_at desc);
create index if not exists studies_answers_gin_idx on public.studies using gin (answers);
create index if not exists studies_scores_gin_idx on public.studies using gin (scores);

drop trigger if exists set_studies_updated_at on public.studies;
create trigger set_studies_updated_at
before update on public.studies
for each row execute function public.set_updated_at();

-- Tasks / execution plan -----------------------------------------------------

create table if not exists public.tasks (
  id text primary key default gen_random_uuid()::text,
  study_id text not null references public.studies(id) on delete cascade,
  sprint integer not null default 1 check (sprint > 0),
  title text not null,
  description text,
  assignee text check (
    assignee is null or assignee in (
      'matheus',
      'luciano',
      'ana_flavia',
      'thiago',
      'leonardo',
      'marco',
      'kalley'
    )
  ),
  estimated_hours numeric(8, 2) check (estimated_hours is null or estimated_hours >= 0),
  status text not null default 'todo' check (status in ('todo', 'doing', 'done', 'blocked')),
  order_index integer not null default 0,
  milestone boolean not null default false,
  depends_on jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_study_id_idx on public.tasks using btree (study_id);
create index if not exists tasks_study_sprint_order_idx on public.tasks using btree (study_id, sprint, order_index);
create index if not exists tasks_status_idx on public.tasks using btree (status);
create index if not exists tasks_assignee_idx on public.tasks using btree (assignee);

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- Uploaded / extracted study files ------------------------------------------

create table if not exists public.study_files (
  id text primary key default gen_random_uuid()::text,
  study_id text not null references public.studies(id) on delete cascade,
  filename text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  pages integer check (pages is null or pages >= 0),
  character_count integer check (character_count is null or character_count >= 0),
  storage_bucket text,
  storage_path text,
  extracted_text text,
  extraction_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_files_study_id_idx on public.study_files using btree (study_id);
create index if not exists study_files_created_at_idx on public.study_files using btree (created_at desc);

drop trigger if exists set_study_files_updated_at on public.study_files;
create trigger set_study_files_updated_at
before update on public.study_files
for each row execute function public.set_updated_at();

-- Output versions ------------------------------------------------------------

create table if not exists public.output_versions (
  id text primary key default gen_random_uuid()::text,
  study_id text not null references public.studies(id) on delete cascade,
  output_type text not null check (
    output_type in (
      'diagnostic',
      'study',
      'brand',
      'commercial',
      'execution',
      'thesis',
      'slides',
      'artifact'
    )
  ),
  content_md text,
  content_json jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists output_versions_study_id_idx on public.output_versions using btree (study_id);
create index if not exists output_versions_type_created_at_idx on public.output_versions using btree (study_id, output_type, created_at desc);

-- Audit reports --------------------------------------------------------------

create table if not exists public.audit_reports (
  id text primary key default gen_random_uuid()::text,
  study_id text not null references public.studies(id) on delete cascade,
  report_type text not null check (
    report_type in (
      'study_quality',
      'client_safe',
      'slide_prompt',
      'output_health'
    )
  ),
  score integer check (score is null or (score >= 0 and score <= 100)),
  findings jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_reports_study_id_idx on public.audit_reports using btree (study_id);
create index if not exists audit_reports_type_created_at_idx on public.audit_reports using btree (study_id, report_type, created_at desc);

-- RLS ------------------------------------------------------------------------

alter table public.clients enable row level security;
alter table public.studies enable row level security;
alter table public.tasks enable row level security;
alter table public.study_files enable row level security;
alter table public.output_versions enable row level security;
alter table public.audit_reports enable row level security;

drop policy if exists "authenticated can manage clients" on public.clients;
create policy "authenticated can manage clients"
on public.clients
for all
to authenticated
using (public.is_active_member())
with check (public.is_active_member());

drop policy if exists "authenticated can manage studies" on public.studies;
create policy "authenticated can manage studies"
on public.studies
for all
to authenticated
using (public.is_active_member())
with check (public.is_active_member());

drop policy if exists "authenticated can manage tasks" on public.tasks;
create policy "authenticated can manage tasks"
on public.tasks
for all
to authenticated
using (public.is_active_member())
with check (public.is_active_member());

drop policy if exists "authenticated can manage study files" on public.study_files;
create policy "authenticated can manage study files"
on public.study_files
for all
to authenticated
using (public.is_active_member())
with check (public.is_active_member());

drop policy if exists "authenticated can manage output versions" on public.output_versions;
create policy "authenticated can manage output versions"
on public.output_versions
for all
to authenticated
using (public.is_active_member())
with check (public.is_active_member());

drop policy if exists "authenticated can manage audit reports" on public.audit_reports;
create policy "authenticated can manage audit reports"
on public.audit_reports
for all
to authenticated
using (public.is_active_member())
with check (public.is_active_member());

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.clients,
  public.studies,
  public.tasks,
  public.study_files,
  public.output_versions,
  public.audit_reports
to authenticated;

-- Leads (CRM público + funil diagnóstico) ----------------------------------

create table if not exists public.leads (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null,
  phone text,
  company text,
  category text,
  source text not null default 'diagnostic_public',
  status text not null default 'novo' check (status in ('novo','contatado','qualificado','proposta','ganho','perdido')),
  assignee text check (assignee is null or assignee in ('matheus','luciano','ana_flavia','thiago','leonardo','marco','kalley')),
  diagnostic_answers jsonb not null default '{}'::jsonb,
  diagnostic_score integer check (diagnostic_score is null or (diagnostic_score >= 0 and diagnostic_score <= 100)),
  diagnostic_axes jsonb not null default '[]'::jsonb,
  diagnostic_insights jsonb not null default '[]'::jsonb,
  notes text,
  ip_address text,
  user_agent text,
  contacted_at timestamptz,
  qualified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_status_idx on public.leads using btree (status);
create index if not exists leads_assignee_idx on public.leads using btree (assignee);
create index if not exists leads_score_idx on public.leads using btree (diagnostic_score desc);
create index if not exists leads_created_at_idx on public.leads using btree (created_at desc);

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

drop policy if exists "authenticated can manage leads" on public.leads;
create policy "authenticated can manage leads"
on public.leads
for all
to authenticated
using (public.is_active_member())
with check (public.is_active_member());

grant select, insert, update, delete on public.leads to authenticated;

-- Rate limit por IP (endpoint público de diagnóstico) ---------------------

create table if not exists public.public_rate_limit (
  ip text primary key,
  hits integer not null default 0,
  window_start timestamptz not null default now()
);

-- Acesso só via service role (endpoint público de diagnóstico). RLS ligado fecha a API anônima.
alter table public.public_rate_limit enable row level security;

-- Profiles (1:1 com auth.users) ------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'member' check (role in ('owner','admin','member')),
  team_key text check (team_key is null or team_key in ('matheus','luciano','ana_flavia','thiago','leonardo','marco','kalley')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_team_key_idx on public.profiles(team_key);

-- Cadastros novos entram como 'pending' (sem acesso a dados) até resgatar um convite.
-- Resgatar o convite (api/auth/redeem-invite) eleva o papel para member/admin/owner.
alter table public.profiles alter column role set default 'pending';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('owner', 'admin', 'member', 'pending'));

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Trigger: criar profile automaticamente ao criar auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, email, name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email), 'pending');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS profiles
alter table public.profiles enable row level security;

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "owners read all profiles" on public.profiles;
create policy "owners read all profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('owner','admin')
  )
);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

grant select, insert, update on public.profiles to authenticated;

-- Invite tokens (signup gated) -------------------------------------------

create table if not exists public.invites (
  token text primary key default encode(gen_random_bytes(18),'hex'),
  email text,
  role text not null default 'member' check (role in ('owner','admin','member')),
  team_key text,
  used_by uuid references auth.users(id),
  used_at timestamptz,
  expires_at timestamptz not null default now() + interval '14 days',
  created_at timestamptz not null default now()
);

alter table public.invites enable row level security;
-- Sem policies: service role only.

-- Notifications ----------------------------------------------------------

create table if not exists public.notifications (
  id text primary key default gen_random_uuid()::text,
  type text not null check (type in ('lead_requested_contact','lead_qualified','study_completed','task_assigned','custom')),
  title text not null,
  body text,
  link text,
  metadata jsonb not null default '{}'::jsonb,
  recipient_role text check (recipient_role is null or recipient_role in ('owner','admin','member','all')),
  recipient_id uuid references auth.users(id) on delete cascade,
  read_by jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);
create index if not exists notifications_recipient_role_idx on public.notifications (recipient_role);
create index if not exists notifications_recipient_id_idx on public.notifications (recipient_id);

alter table public.notifications enable row level security;
drop policy if exists "authenticated read notifications" on public.notifications;
create policy "authenticated read notifications" on public.notifications
for select to authenticated using (
  recipient_id = auth.uid()
  or recipient_role = 'all'
  or (
    recipient_role in ('owner','admin','member')
    and exists (
      select 1 from public.profiles p where p.id = auth.uid()
      and (p.role = recipient_role or p.role = 'owner')
    )
  )
);
drop policy if exists "authenticated update own read state" on public.notifications;
create policy "authenticated update own read state" on public.notifications
for update to authenticated using (public.is_active_member()) with check (public.is_active_member());
grant select, update on public.notifications to authenticated;

-- Leads: track contact request from public diagnostic
alter table public.leads add column if not exists requested_contact_at timestamptz;

-- ─── Study comments (inline collab) ──────────────────────────────────────────
create table if not exists public.study_comments (
  id text primary key default gen_random_uuid()::text,
  study_id text not null references public.studies(id) on delete cascade,
  section text,
  anchor text,
  body text not null,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  parent_id text references public.study_comments(id) on delete cascade,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists study_comments_study_idx on public.study_comments (study_id, created_at desc);
create index if not exists study_comments_parent_idx on public.study_comments (parent_id);
drop trigger if exists set_study_comments_updated_at on public.study_comments;
create trigger set_study_comments_updated_at before update on public.study_comments
for each row execute function public.set_updated_at();
alter table public.study_comments enable row level security;
drop policy if exists "authenticated can manage comments" on public.study_comments;
create policy "authenticated can manage comments" on public.study_comments
for all to authenticated using (public.is_active_member()) with check (public.is_active_member());
grant select, insert, update, delete on public.study_comments to authenticated;

-- ─── Workspace settings (single row, Slack + Cal.com + branding) ─────────────
create table if not exists public.workspace_settings (
  id text primary key default 'default' check (id = 'default'),
  slack_digest_webhook text,
  calcom_url text,
  studio_name text default 'PRECEPTOR! Venture Studio',
  studio_email text default 'studio@thepreceptor.com.br',
  updated_at timestamptz not null default now()
);
insert into public.workspace_settings (id) values ('default') on conflict (id) do nothing;
drop trigger if exists set_workspace_settings_updated_at on public.workspace_settings;
create trigger set_workspace_settings_updated_at before update on public.workspace_settings
for each row execute function public.set_updated_at();
alter table public.workspace_settings enable row level security;
drop policy if exists "authenticated read workspace" on public.workspace_settings;
create policy "authenticated read workspace" on public.workspace_settings
for select to authenticated using (public.is_active_member());
drop policy if exists "owners write workspace" on public.workspace_settings;
create policy "owners write workspace" on public.workspace_settings
for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','admin'))
) with check (public.is_active_member());
grant select, update on public.workspace_settings to authenticated;

-- ─── NDA signatures ──────────────────────────────────────────────────────────
create table if not exists public.nda_signatures (
  id text primary key default gen_random_uuid()::text,
  study_id text not null references public.studies(id) on delete cascade,
  signed_by_name text not null,
  signed_by_email text not null,
  ip text,
  user_agent text,
  signed_at timestamptz not null default now()
);
create index if not exists nda_signatures_study_idx on public.nda_signatures (study_id);
-- Acesso só via service role (rotas server). RLS ligado + sem policy fecha a API anônima.
alter table public.nda_signatures enable row level security;

-- ─── Client portal tokens ────────────────────────────────────────────────────
create table if not exists public.client_portal_tokens (
  token text primary key default encode(gen_random_bytes(24), 'hex'),
  study_id text not null references public.studies(id) on delete cascade,
  client_email text not null,
  expires_at timestamptz not null default (now() + interval '90 days'),
  last_accessed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists client_portal_tokens_study_idx on public.client_portal_tokens (study_id);
-- Acesso só via service role (rotas server). RLS ligado + sem policy fecha a API anônima.
alter table public.client_portal_tokens enable row level security;

-- ─── Mood boards ─────────────────────────────────────────────────────────────
create table if not exists public.mood_boards (
  id text primary key default gen_random_uuid()::text,
  study_id text not null references public.studies(id) on delete cascade,
  prompt text not null,
  image_url text,
  image_bytes_base64 text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists mood_boards_study_idx on public.mood_boards (study_id, created_at desc);
alter table public.mood_boards enable row level security;
drop policy if exists "authenticated read mood boards" on public.mood_boards;
create policy "authenticated read mood boards" on public.mood_boards
for select to authenticated using (public.is_active_member());
grant select on public.mood_boards to authenticated;

-- ─── Market research cache ───────────────────────────────────────────────────
create table if not exists public.market_research (
  id text primary key default gen_random_uuid()::text,
  study_id text not null references public.studies(id) on delete cascade,
  query text not null,
  results_md text,
  sources jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists market_research_study_idx on public.market_research (study_id, created_at desc);
alter table public.market_research enable row level security;
drop policy if exists "authenticated read research" on public.market_research;
create policy "authenticated read research" on public.market_research
for select to authenticated using (public.is_active_member());
grant select on public.market_research to authenticated;

-- ─── A/B testing events (landing CTA) ────────────────────────────────────────
create table if not exists public.ab_events (
  id text primary key default gen_random_uuid()::text,
  experiment text not null,
  variant text not null,
  event_type text not null check (event_type in ('impression', 'click')),
  session_id text,
  created_at timestamptz not null default now()
);
create index if not exists ab_events_exp_idx on public.ab_events (experiment, variant, event_type);
create index if not exists ab_events_created_idx on public.ab_events (created_at desc);
alter table public.ab_events enable row level security;
drop policy if exists "authenticated read ab events" on public.ab_events;
create policy "authenticated read ab events" on public.ab_events
for select to authenticated using (public.is_active_member());
grant select on public.ab_events to authenticated;

-- ─── Lead intelligence (scoring, resumo, valor) ──────────────────────────────
alter table public.leads add column if not exists priority_score integer;
alter table public.leads add column if not exists summary_line text;
alter table public.leads add column if not exists estimated_value numeric(12, 2);
create index if not exists leads_priority_idx on public.leads (priority_score desc);

-- ─── Study score history (estudo vivo) ───────────────────────────────────────
create table if not exists public.study_score_history (
  id text primary key default gen_random_uuid()::text,
  study_id text not null references public.studies(id) on delete cascade,
  overall integer,
  axes jsonb not null default '[]'::jsonb,
  note text,
  source text default 'manual',
  created_at timestamptz not null default now()
);
create index if not exists study_score_history_study_idx on public.study_score_history (study_id, created_at desc);
alter table public.study_score_history enable row level security;
drop policy if exists "authenticated manage score history" on public.study_score_history;
create policy "authenticated manage score history" on public.study_score_history
for all to authenticated using (public.is_active_member()) with check (public.is_active_member());
grant select, insert, delete on public.study_score_history to authenticated;

-- ─── Finance: categorias ─────────────────────────────────────────────────────
create table if not exists public.finance_categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  kind text not null check (kind in ('revenue', 'expense')),
  color text not null default '#52E1E7',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.finance_categories enable row level security;
drop policy if exists "authenticated manage finance categories" on public.finance_categories;
create policy "authenticated manage finance categories" on public.finance_categories
for all to authenticated using (true) with check (true);
grant select, insert, update, delete on public.finance_categories to authenticated;

-- ─── Finance: pricing por estudo ─────────────────────────────────────────────
create table if not exists public.study_pricing (
  id text primary key default gen_random_uuid()::text,
  study_id text not null references public.studies(id) on delete cascade,
  archetype text not null default 'empreendimento' check (archetype in ('empreendimento', 'automacao', 'consultoria', 'hibrido')),
  pricing_model text not null default 'fixed' check (pricing_model in ('fixed', 'recurring', 'equity', 'mixed')),
  fixed_amount_brl numeric(14, 2) not null default 0,
  recurring_amount_brl numeric(14, 2) not null default 0,
  recurring_period text check (recurring_period is null or recurring_period in ('monthly', 'quarterly', 'yearly')),
  equity_pct numeric(6, 3) not null default 0,
  estimated_cost_brl numeric(14, 2) not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  paid_amount_brl numeric(14, 2) not null default 0,
  installments_count integer not null default 1,
  first_installment_date date,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists study_pricing_study_idx on public.study_pricing (study_id);
drop trigger if exists set_study_pricing_updated_at on public.study_pricing;
create trigger set_study_pricing_updated_at before update on public.study_pricing
for each row execute function public.set_updated_at();
alter table public.study_pricing enable row level security;
drop policy if exists "authenticated manage study pricing" on public.study_pricing;
create policy "authenticated manage study pricing" on public.study_pricing
for all to authenticated using (true) with check (true);
grant select, insert, update, delete on public.study_pricing to authenticated;

-- ─── Finance: transações ─────────────────────────────────────────────────────
create table if not exists public.transactions (
  id text primary key default gen_random_uuid()::text,
  kind text not null check (kind in ('inflow', 'outflow')),
  amount_brl numeric(14, 2) not null default 0,
  description text not null default '',
  category_id text references public.finance_categories(id) on delete set null,
  study_id text references public.studies(id) on delete set null,
  client_id text references public.clients(id) on delete set null,
  occurred_at timestamptz not null default now(),
  payment_method text check (payment_method is null or payment_method in ('pix', 'boleto', 'cartao', 'transferencia', 'dinheiro', 'outro')),
  is_recurring boolean not null default false,
  recurring_period text check (recurring_period is null or recurring_period in ('monthly', 'quarterly', 'yearly')),
  attachment_url text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists transactions_kind_idx on public.transactions (kind);
create index if not exists transactions_occurred_idx on public.transactions (occurred_at desc);
create index if not exists transactions_study_idx on public.transactions (study_id);
drop trigger if exists set_transactions_updated_at on public.transactions;
create trigger set_transactions_updated_at before update on public.transactions
for each row execute function public.set_updated_at();
alter table public.transactions enable row level security;
drop policy if exists "authenticated manage transactions" on public.transactions;
create policy "authenticated manage transactions" on public.transactions
for all to authenticated using (true) with check (true);
grant select, insert, update, delete on public.transactions to authenticated;

-- ─── Finance: parcelas do pricing ────────────────────────────────────────────
create table if not exists public.pricing_installments (
  id text primary key default gen_random_uuid()::text,
  pricing_id text not null references public.study_pricing(id) on delete cascade,
  study_id text not null references public.studies(id) on delete cascade,
  installment_number integer not null default 1,
  total_installments integer not null default 1,
  due_date date not null,
  amount_brl numeric(14, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  paid_at timestamptz,
  transaction_id text references public.transactions(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pricing_installments_pricing_idx on public.pricing_installments (pricing_id);
create index if not exists pricing_installments_study_idx on public.pricing_installments (study_id);
create index if not exists pricing_installments_due_idx on public.pricing_installments (due_date);
drop trigger if exists set_pricing_installments_updated_at on public.pricing_installments;
create trigger set_pricing_installments_updated_at before update on public.pricing_installments
for each row execute function public.set_updated_at();
alter table public.pricing_installments enable row level security;
drop policy if exists "authenticated manage pricing installments" on public.pricing_installments;
create policy "authenticated manage pricing installments" on public.pricing_installments
for all to authenticated using (true) with check (true);
grant select, insert, update, delete on public.pricing_installments to authenticated;

commit;
