-- ═══════════════════════════════════════════════════════════════════════════
-- PRECEPTOR! Studio - Security v3: RLS em portal tokens e NDA + finance hardening
-- Rode no SQL Editor do Supabase. Fecha o gap de defense-in-depth apontado na auditoria.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- nda_signatures: estava sem RLS. Assinaturas são criadas pela rota pública
-- de portal (service-role bypassa RLS), então authenticated só precisa de leitura.
alter table public.nda_signatures enable row level security;

drop policy if exists "authenticated read nda signatures" on public.nda_signatures;
create policy "authenticated read nda signatures"
on public.nda_signatures
for select
to authenticated
using (true);

-- client_portal_tokens: estava sem RLS. Contém client_email (PII).
-- Geração/leitura passa pela rota server-side (service-role). Bloqueia acesso
-- direto via anon/authenticated key do cliente.
alter table public.client_portal_tokens enable row level security;

drop policy if exists "authenticated read portal tokens" on public.client_portal_tokens;
create policy "authenticated read portal tokens"
on public.client_portal_tokens
for select
to authenticated
using (true);

-- LGPD: registra o momento do consentimento ativo do lead no diagnóstico público.
alter table public.leads add column if not exists consent_given_at timestamptz;

-- Finance: garante RLS habilitado (caso a migration anterior não tenha rodado).
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='transactions') then
    execute 'alter table public.transactions enable row level security';
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='study_pricing') then
    execute 'alter table public.study_pricing enable row level security';
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='pricing_installments') then
    execute 'alter table public.pricing_installments enable row level security';
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='finance_categories') then
    execute 'alter table public.finance_categories enable row level security';
  end if;
end $$;

commit;
