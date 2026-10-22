-- ═══════════════════════════════════════════════════════════════════════════
-- PRECEPTOR! Studio - Security v4: contas 'pending' sem acesso a dados (auditoria 2026-10-22, S3)
-- Rode no SQL Editor do Supabase DEPOIS de schema.sql, finance_*.sql e security_v3_portal_rls.sql.
-- Idempotente. Antes do deploy do código desta mesma correção.
--
-- Fecha:
--  1. Policies `to authenticated using (true)` em finance_categories, study_pricing,
--     transactions, pricing_installments, client_portal_tokens e nda_signatures:
--     qualquer conta recém-criada (papel 'pending') lia/escrevia direto pela chave anon.
--  2. `users update own profile` + grant de update na tabela inteira: a própria conta
--     'pending' podia fazer `update profiles set role='owner'` pela chave anon.
--     Agora o usuário só altera o próprio `name`; papel e time mudam só via service role.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- Helper (mesmo de schema.sql; recriado aqui caso o schema antigo não o tenha).
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

-- 1. Finance: troca using (true) por membro ativo. Remove as duas variantes de nome
--    (schema.sql usa "authenticated manage ...", finance_*.sql usa "authenticated can manage ...").
drop policy if exists "authenticated manage finance categories" on public.finance_categories;
drop policy if exists "authenticated can manage finance categories" on public.finance_categories;
create policy "authenticated manage finance categories" on public.finance_categories
for all to authenticated using (public.is_active_member()) with check (public.is_active_member());

drop policy if exists "authenticated manage study pricing" on public.study_pricing;
drop policy if exists "authenticated can manage study pricing" on public.study_pricing;
create policy "authenticated manage study pricing" on public.study_pricing
for all to authenticated using (public.is_active_member()) with check (public.is_active_member());

drop policy if exists "authenticated manage transactions" on public.transactions;
drop policy if exists "authenticated can manage transactions" on public.transactions;
create policy "authenticated manage transactions" on public.transactions
for all to authenticated using (public.is_active_member()) with check (public.is_active_member());

drop policy if exists "authenticated manage pricing installments" on public.pricing_installments;
drop policy if exists "authenticated can manage pricing installments" on public.pricing_installments;
create policy "authenticated manage pricing installments" on public.pricing_installments
for all to authenticated using (public.is_active_member()) with check (public.is_active_member());

-- Portal: tokens dão acesso aos portais de clientes; assinaturas de NDA têm PII.
drop policy if exists "authenticated read portal tokens" on public.client_portal_tokens;
create policy "authenticated read portal tokens" on public.client_portal_tokens
for select to authenticated using (public.is_active_member());

drop policy if exists "authenticated read nda signatures" on public.nda_signatures;
create policy "authenticated read nda signatures" on public.nda_signatures
for select to authenticated using (public.is_active_member());

-- 2. profiles: o usuário só pode editar o próprio nome. Papel e time só via service role
--    (api/profiles/[id], api/auth/redeem-invite), que ignora grants e RLS.
revoke update on public.profiles from authenticated;
grant update (name) on public.profiles to authenticated;

commit;
