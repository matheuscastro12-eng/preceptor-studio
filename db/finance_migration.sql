-- ═══════════════════════════════════════════════════════════════════════════
-- PRECEPTOR! Studio - Finance module (study pricing + cashflow)
-- Rode este arquivo no SQL Editor do Supabase APÓS o schema.sql principal.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- Finance categories ---------------------------------------------------------

create table if not exists public.finance_categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  kind text not null check (kind in ('revenue', 'expense')),
  color text not null default '#94a3b8',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists finance_categories_name_kind_idx
  on public.finance_categories using btree (name, kind);

-- Study pricing --------------------------------------------------------------

create table if not exists public.study_pricing (
  id text primary key default gen_random_uuid()::text,
  study_id text not null unique references public.studies(id) on delete cascade,

  archetype text not null default 'empreendimento' check (
    archetype in ('empreendimento', 'automacao', 'consultoria', 'hibrido')
  ),

  pricing_model text not null default 'fixed' check (
    pricing_model in ('fixed', 'recurring', 'equity', 'mixed')
  ),

  fixed_amount_brl numeric(12, 2) not null default 0 check (fixed_amount_brl >= 0),
  recurring_amount_brl numeric(12, 2) not null default 0 check (recurring_amount_brl >= 0),
  recurring_period text check (
    recurring_period is null or recurring_period in ('monthly', 'quarterly', 'yearly')
  ),
  equity_pct numeric(5, 2) not null default 0 check (equity_pct >= 0 and equity_pct <= 100),

  estimated_cost_brl numeric(12, 2) not null default 0 check (estimated_cost_brl >= 0),

  payment_status text not null default 'pending' check (
    payment_status in ('pending', 'partial', 'paid', 'overdue', 'cancelled')
  ),
  paid_amount_brl numeric(12, 2) not null default 0 check (paid_amount_brl >= 0),

  start_date date,
  end_date date,

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_pricing_study_id_idx on public.study_pricing using btree (study_id);
create index if not exists study_pricing_archetype_idx on public.study_pricing using btree (archetype);
create index if not exists study_pricing_status_idx on public.study_pricing using btree (payment_status);

drop trigger if exists set_study_pricing_updated_at on public.study_pricing;
create trigger set_study_pricing_updated_at
before update on public.study_pricing
for each row execute function public.set_updated_at();

-- Transactions ---------------------------------------------------------------

create table if not exists public.transactions (
  id text primary key default gen_random_uuid()::text,

  kind text not null check (kind in ('inflow', 'outflow')),
  amount_brl numeric(12, 2) not null check (amount_brl >= 0),
  description text not null,

  category_id text references public.finance_categories(id) on delete set null,
  study_id text references public.studies(id) on delete set null,
  client_id text references public.clients(id) on delete set null,

  occurred_at date not null default current_date,
  payment_method text check (
    payment_method is null or payment_method in (
      'pix', 'boleto', 'cartao', 'transferencia', 'dinheiro', 'outro'
    )
  ),

  is_recurring boolean not null default false,
  recurring_period text check (
    recurring_period is null or recurring_period in ('monthly', 'quarterly', 'yearly')
  ),

  attachment_url text,
  notes text,

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_occurred_at_idx on public.transactions using btree (occurred_at desc);
create index if not exists transactions_kind_idx on public.transactions using btree (kind);
create index if not exists transactions_study_id_idx on public.transactions using btree (study_id);
create index if not exists transactions_category_id_idx on public.transactions using btree (category_id);

drop trigger if exists set_transactions_updated_at on public.transactions;
create trigger set_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

-- RLS ------------------------------------------------------------------------

alter table public.finance_categories enable row level security;
alter table public.study_pricing enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "authenticated can manage finance categories" on public.finance_categories;
create policy "authenticated can manage finance categories"
on public.finance_categories
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated can manage study pricing" on public.study_pricing;
create policy "authenticated can manage study pricing"
on public.study_pricing
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated can manage transactions" on public.transactions;
create policy "authenticated can manage transactions"
on public.transactions
for all
to authenticated
using (true)
with check (true);

-- Seed default categories (only on first run) --------------------------------

insert into public.finance_categories (name, kind, color, is_default) values
  ('Estudo Estratégico', 'revenue', '#52e1e7', true),
  ('Execução de projeto', 'revenue', '#10b981', true),
  ('Manutenção / Assinatura', 'revenue', '#5d57eb', true),
  ('Equity / Distribuição', 'revenue', '#f59e0b', true),
  ('Receita avulsa', 'revenue', '#06b6d4', true),
  ('Salários e prolabore', 'expense', '#ef4444', true),
  ('Ferramentas (IA / SaaS)', 'expense', '#8b5cf6', true),
  ('Marketing / Tráfego', 'expense', '#ec4899', true),
  ('Infraestrutura (hosting / DB)', 'expense', '#0ea5e9', true),
  ('Impostos', 'expense', '#dc2626', true),
  ('Despesas administrativas', 'expense', '#64748b', true),
  ('Contratação externa (freelance)', 'expense', '#a855f7', true)
on conflict (name, kind) do nothing;

commit;
