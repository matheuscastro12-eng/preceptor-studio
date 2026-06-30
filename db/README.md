# Supabase database

Schema do Preceptor! Studio.

## Como criar no Supabase

1. Abra o projeto no Supabase.
2. Va em **SQL Editor**.
3. Cole o conteudo de `db/schema.sql`.
4. Execute.

O schema cria:

- `clients`, `studies`, `tasks`, `study_files`, `output_versions`, `audit_reports`
- `leads`, `public_rate_limit`
- `profiles` (1:1 com `auth.users`), `invites` (signup gated)

Trigger `on_auth_user_created` cria um `profile` automaticamente sempre que um usuario novo aparece em `auth.users`.

## Seguranca

RLS habilitado em todas as tabelas. `service_role` continua bypassando RLS para rotas server-side.

`profiles`:
- `users read own profile`
- `owners read all profiles` (owner/admin)
- `users update own profile`

`invites`: sem policies (apenas service role).

## Auth via Supabase

A autenticacao usa Supabase Auth (email + senha) atraves de `@supabase/ssr`.

Helpers em `lib/supabase`:
- `server.ts`: server components / route handlers
- `middleware.ts`: usado por `middleware.ts` da raiz
- `client.ts`: browser

Rotas publicas: `/`, `/diagnostico/*`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/api/public/*`, `/api/auth/callback`, `/api/auth/redeem-invite`, `/share/*`.

Tudo abaixo de `/dashboard` e a maioria das rotas mutaveis em `/api/*` exigem usuario autenticado.

## Seed dos 7 membros

No painel Supabase, **Authentication > Users > Add user**, crie cada conta com senha temporaria. Depois, rode no SQL Editor:

```sql
update public.profiles set role='owner', team_key='luciano' where email='luciano@preceptor.com.br';
update public.profiles set role='admin', team_key='matheus' where email='matheus@preceptor.com.br';
update public.profiles set role='member', team_key='ana_flavia' where email='ana.flavia@preceptor.com.br';
update public.profiles set role='member', team_key='thiago' where email='thiago@preceptor.com.br';
update public.profiles set role='member', team_key='leonardo' where email='leonardo@preceptor.com.br';
update public.profiles set role='member', team_key='marco' where email='marco@preceptor.com.br';
update public.profiles set role='member', team_key='kalley' where email='kalley@preceptor.com.br';
```

Para um signup com convite, crie um invite primeiro:

```sql
insert into public.invites (email, role, team_key)
values ('nova.pessoa@preceptor.com.br', 'member', 'kalley')
returning token;
```

E mande o link `https://preceptor-studio.vercel.app/signup?token=<TOKEN>`.

## Migrations adicionais (rodar nesta ordem, depois do schema.sql)

Cada arquivo `.sql` é aditivo e idempotente. Cole no SQL Editor e execute.

1. `finance_migration.sql` - financeiro (categorias, pricing, transações)
2. `finance_v2_installments.sql` - parcelas do pricing
3. `funnel_migration.sql` - eventos de funil
4. `security_v3_portal_rls.sql` - RLS do portal do cliente
5. `erp_v1_ventures.sql` - **ERP Onda 1**: entidade central `ventures` (lead -> equity), `time_entries`, `cost_entries`, `media_spend`, e backfill de 1 venture por client existente, ligando estudos e tarefas. Habilita a aba `/dashboard/ventures` (margem real por venture).

## Env vars

```env
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` so no servidor.
