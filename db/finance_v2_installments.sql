-- ═══════════════════════════════════════════════════════════════════════════
-- PRECEPTOR! Studio - Finance v2: parcelamento de pricing
-- Rode APÓS finance_migration.sql.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- Adiciona campos de parcelamento ao pricing existente -----------------------

alter table public.study_pricing
  add column if not exists installments_count integer not null default 1
    check (installments_count >= 1 and installments_count <= 36);

alter table public.study_pricing
  add column if not exists first_installment_date date;

-- Tabela de parcelas ---------------------------------------------------------

create table if not exists public.pricing_installments (
  id text primary key default gen_random_uuid()::text,
  pricing_id text not null references public.study_pricing(id) on delete cascade,
  study_id text not null references public.studies(id) on delete cascade,

  installment_number integer not null check (installment_number > 0),
  total_installments integer not null check (total_installments > 0),

  due_date date not null,
  amount_brl numeric(12, 2) not null check (amount_brl >= 0),

  status text not null default 'pending' check (
    status in ('pending', 'paid', 'overdue', 'cancelled')
  ),
  paid_at date,
  transaction_id text references public.transactions(id) on delete set null,

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pricing_installments_pricing_id_idx
  on public.pricing_installments using btree (pricing_id);
create index if not exists pricing_installments_study_id_idx
  on public.pricing_installments using btree (study_id);
create index if not exists pricing_installments_due_date_idx
  on public.pricing_installments using btree (due_date);
create index if not exists pricing_installments_status_idx
  on public.pricing_installments using btree (status);

drop trigger if exists set_pricing_installments_updated_at on public.pricing_installments;
create trigger set_pricing_installments_updated_at
before update on public.pricing_installments
for each row execute function public.set_updated_at();

alter table public.pricing_installments enable row level security;

drop policy if exists "authenticated can manage pricing installments" on public.pricing_installments;
create policy "authenticated can manage pricing installments"
on public.pricing_installments
for all
to authenticated
using (true)
with check (true);

-- Backfill: pricings sem parcelas ganham 1 parcela única ---------------------

insert into public.pricing_installments
  (pricing_id, study_id, installment_number, total_installments, due_date, amount_brl, status)
select
  sp.id,
  sp.study_id,
  1,
  1,
  coalesce(sp.start_date, current_date),
  sp.fixed_amount_brl,
  case when sp.payment_status = 'paid' then 'paid' else 'pending' end
from public.study_pricing sp
where not exists (
  select 1 from public.pricing_installments pi where pi.pricing_id = sp.id
);

commit;
