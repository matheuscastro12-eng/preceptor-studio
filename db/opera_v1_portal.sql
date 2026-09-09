-- Portal OPERA: cadastro e contrato reutilizável de acompanhamento.
-- Aplicar depois de db/schema.sql. Não insere dados de exemplo ou altera OASIS.
begin;
create table if not exists public.opera_projetos (
  slug text primary key check (slug ~ '^[a-z0-9][a-z0-9-]{1,60}$'),
  nome text not null, cliente text not null, processo text not null,
  responsavel text not null,
  tipo text not null check (tipo in ('agente','plataforma','automacao')),
  colheita_publica boolean not null default false,
  painel_publico boolean not null default false,
  colheita jsonb not null check (jsonb_typeof(colheita) = 'object'),
  snapshot jsonb,
  criado_por uuid not null references auth.users(id),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
alter table public.opera_projetos enable row level security;
-- No browser policy: routes validate an active member before service-role access.
revoke all on public.opera_projetos from anon, authenticated;
grant all on public.opera_projetos to service_role;

-- Historical publication/collection tables may already exist in production.
create table if not exists public.painel_construcao (
  venture text primary key, html text not null,
  atualizado_em timestamptz not null default now()
);
create table if not exists public.colheita_respostas (
  id uuid primary key default gen_random_uuid(), venture text not null,
  respondente_nome text not null, respondente_funcao text, respondente_empresa text,
  respondente_contato text, grupos jsonb not null default '[]',
  respostas jsonb not null default '{}', ocorrencias jsonb not null default '[]',
  rotulos jsonb not null default '{}', ip text, user_agent text,
  criado_em timestamptz not null default now()
);
alter table public.colheita_respostas add column if not exists instrumento_versao integer;
create index if not exists colheita_respostas_venture_idx on public.colheita_respostas(venture);
alter table public.colheita_respostas enable row level security;
alter table public.painel_construcao enable row level security;
grant all on public.colheita_respostas, public.painel_construcao to service_role;
commit;
