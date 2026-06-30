-- Preceptor! Studio - ERP v2: venture_events (timeline da ficha 360)
-- ----------------------------------------------------------------------------
-- Registra eventos de negócio por venture (mudança de estágio, notas, sistema)
-- para alimentar a timeline da ficha. A timeline combina estes eventos com
-- sinais derivados (estudos, transações, custos, horas) no read-time.
-- Aditivo e idempotente. Rode depois de db/erp_v1_ventures.sql.
-- ----------------------------------------------------------------------------

begin;

create table if not exists public.venture_events (
  id text primary key default gen_random_uuid()::text,
  venture_id text not null references public.ventures(id) on delete cascade,
  type text not null default 'nota' check (type in ('estagio','nota','sistema')),
  title text not null,
  detail text,
  actor text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists venture_events_venture_idx on public.venture_events (venture_id, created_at desc);

alter table public.venture_events enable row level security;
drop policy if exists "authenticated manage venture events" on public.venture_events;
create policy "authenticated manage venture events" on public.venture_events
for all to authenticated using (public.is_active_member()) with check (public.is_active_member());
grant select, insert, update, delete on public.venture_events to authenticated;

commit;
