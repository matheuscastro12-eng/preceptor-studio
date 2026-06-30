-- Preceptor! Studio - ERP v1: Ventures (Onda 1)
-- ----------------------------------------------------------------------------
-- Promove o app a "sistema operacional do studio": introduz a entidade central
-- `ventures` (segue cada conta do lead -> estudo -> execução -> manutenção ->
-- equity), mais `time_entries`, `cost_entries` e `media_spend` para fechar a
-- MARGEM REAL por venture (receita - horas - IA).
--
-- Aditivo e idempotente. Não toca em tabelas operacionais existentes.
-- Rode no Supabase SQL Editor DEPOIS de db/schema.sql e dos db/finance_*.sql.
-- ----------------------------------------------------------------------------

begin;

-- ── Tabela central: ventures ────────────────────────────────────────────────
create table if not exists public.ventures (
  id text primary key default gen_random_uuid()::text,
  client_id text references public.clients(id) on delete set null,
  lead_id text references public.leads(id) on delete set null,
  referred_by_venture_id text references public.ventures(id) on delete set null,
  name text not null,
  slug text,
  stage text not null default 'lead' check (stage in (
    'lead','diagnostico','estudo','proposta','onboarding','execucao','manutencao','equity','encerrada'
  )),
  health text not null default 'verde' check (health in ('verde','amarelo','vermelho')),
  -- camada de receita ativa (no MVP substitui uma tabela `engagements`)
  layer text check (layer is null or layer in ('estudo','execucao','manutencao')),
  owner_team_key text check (owner_team_key is null or owner_team_key in (
    'matheus','luciano','ana_flavia','thiago','leonardo','marco','kalley'
  )),
  -- recorrência: espelho leve do Stripe (Onda 2 conecta o webhook)
  mrr_brl numeric(14,2),
  stripe_subscription_id text,
  -- equity: 3 colunas resolvem por ~18 meses; cap table só quando houver 2+ posições
  equity_pct numeric(6,3),
  fair_value_brl numeric(14,2),
  equity_status text check (equity_status is null or equity_status in (
    'negociando','assinado','vesting','exit'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ventures_stage_idx on public.ventures (stage);
create index if not exists ventures_client_idx on public.ventures (client_id);
create index if not exists ventures_created_idx on public.ventures (created_at desc);

drop trigger if exists set_ventures_updated_at on public.ventures;
create trigger set_ventures_updated_at before update on public.ventures
for each row execute function public.set_updated_at();

-- ── Ligações: estudos e tarefas pertencem a uma venture ─────────────────────
alter table public.studies add column if not exists venture_id text
  references public.ventures(id) on delete set null;
create index if not exists studies_venture_idx on public.studies (venture_id);

alter table public.tasks add column if not exists venture_id text
  references public.ventures(id) on delete set null;
create index if not exists tasks_venture_idx on public.tasks (venture_id);

-- ── time_entries: horas por venture (coração da margem) ─────────────────────
create table if not exists public.time_entries (
  id text primary key default gen_random_uuid()::text,
  venture_id text not null references public.ventures(id) on delete cascade,
  task_id text references public.tasks(id) on delete set null,
  member_key text check (member_key is null or member_key in (
    'matheus','luciano','ana_flavia','thiago','leonardo','marco','kalley'
  )),
  hours numeric(8,2) not null default 0 check (hours >= 0),
  hourly_cost_brl numeric(12,2) not null default 0 check (hourly_cost_brl >= 0),
  entry_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists time_entries_venture_idx on public.time_entries (venture_id, entry_date desc);

-- ── cost_entries: custos por venture (IA, infra, saas, freelance) ───────────
create table if not exists public.cost_entries (
  id text primary key default gen_random_uuid()::text,
  venture_id text not null references public.ventures(id) on delete cascade,
  study_id text references public.studies(id) on delete set null,
  cost_type text not null default 'ia_anthropic' check (cost_type in (
    'ia_anthropic','infra','saas','freelance','outro'
  )),
  amount_brl numeric(14,2) not null default 0,
  tokens_in integer,
  tokens_out integer,
  model text,
  description text,
  incurred_at date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists cost_entries_venture_idx on public.cost_entries (venture_id, incurred_at desc);
create index if not exists cost_entries_study_idx on public.cost_entries (study_id);

-- ── media_spend: investimento de mídia por mês (base do CAC) ────────────────
create table if not exists public.media_spend (
  id text primary key default gen_random_uuid()::text,
  channel text not null default 'meta' check (channel in ('meta','google','outro')),
  amount_brl numeric(14,2) not null default 0,
  ref_month date not null,  -- usar o dia 1 do mês de referência
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists media_spend_month_idx on public.media_spend (ref_month desc);

-- ── RLS (mesmo padrão do schema: membro provisionado gerencia tudo) ─────────
alter table public.ventures enable row level security;
alter table public.time_entries enable row level security;
alter table public.cost_entries enable row level security;
alter table public.media_spend enable row level security;

drop policy if exists "authenticated manage ventures" on public.ventures;
create policy "authenticated manage ventures" on public.ventures
for all to authenticated using (public.is_active_member()) with check (public.is_active_member());

drop policy if exists "authenticated manage time entries" on public.time_entries;
create policy "authenticated manage time entries" on public.time_entries
for all to authenticated using (public.is_active_member()) with check (public.is_active_member());

drop policy if exists "authenticated manage cost entries" on public.cost_entries;
create policy "authenticated manage cost entries" on public.cost_entries
for all to authenticated using (public.is_active_member()) with check (public.is_active_member());

drop policy if exists "authenticated manage media spend" on public.media_spend;
create policy "authenticated manage media spend" on public.media_spend
for all to authenticated using (public.is_active_member()) with check (public.is_active_member());

grant select, insert, update, delete on
  public.ventures,
  public.time_entries,
  public.cost_entries,
  public.media_spend
to authenticated;

-- Nota: os campos de equity ficam legíveis a todo membro nesta versão (cap table
-- leve). Restringir colunas de equity a owner/admin é uma evolução de Onda 3,
-- quando o portal por venture expuser dados a terceiros.

-- ── Backfill: 1 venture por client existente, ligando estudos e tarefas ─────
-- Idempotente: só cria venture para client que ainda não tem nenhuma.
insert into public.ventures (client_id, name, stage, layer)
select c.id, c.name, 'estudo', 'estudo'
from public.clients c
where not exists (select 1 from public.ventures v where v.client_id = c.id);

-- Liga estudos à venture do mesmo client (só os ainda sem venture).
update public.studies s
set venture_id = v.id
from public.ventures v
where s.client_id = v.client_id and s.venture_id is null;

-- Liga tarefas à venture do seu estudo.
update public.tasks t
set venture_id = s.venture_id
from public.studies s
where t.study_id = s.id and t.venture_id is null and s.venture_id is not null;

commit;
