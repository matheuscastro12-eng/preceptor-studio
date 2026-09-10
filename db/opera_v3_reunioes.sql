-- Depois de OPERA v1/v2. Fontes privadas, independentes de LP/lead.
begin;
create table if not exists public.opera_reunioes (
  id uuid primary key default gen_random_uuid(),
  projeto text not null references public.opera_projetos(slug),
  titulo text not null check (length(titulo) between 1 and 160),
  transcricao text not null check (length(transcricao) between 40 and 120000),
  fonte_hash text not null,
  registro_hash text not null,
  leitura jsonb not null,
  revisada boolean not null default false,
  criado_por uuid not null references auth.users(id),
  criado_em timestamptz not null default now(),
  unique(projeto, registro_hash)
);
alter table public.opera_reunioes enable row level security;
revoke all on public.opera_reunioes from anon, authenticated;
grant all on public.opera_reunioes to service_role;

-- Cadastro e primeira fonte juntos: nenhuma construção órfã em falha parcial.
create or replace function public.opera_cadastrar_com_reuniao(p_projeto jsonb, p_reuniao jsonb, p_hash text, p_registro_hash text, p_autor uuid)
returns void language plpgsql set search_path = public, pg_temp as $$
begin
  insert into opera_projetos(slug,nome,cliente,processo,responsavel,tipo,colheita_publica,painel_publico,colheita,snapshot,venture_id,processo_slug,criado_por)
  values(p_projeto->>'slug',p_projeto->>'nome',p_projeto->>'cliente',p_projeto->>'processo',p_projeto->>'responsavel',p_projeto->>'tipo',
    (p_projeto->>'colheita_publica')::boolean,(p_projeto->>'painel_publico')::boolean,p_projeto->'colheita',null,p_projeto->>'venture_id',p_projeto->>'processo_slug',p_autor);
  insert into opera_reunioes(projeto,titulo,transcricao,fonte_hash,registro_hash,leitura,revisada,criado_por)
  values(p_projeto->>'slug',p_reuniao->>'titulo',p_reuniao->>'transcricao',p_hash,p_registro_hash,p_reuniao->'leitura',(p_reuniao->>'revisada')::boolean,p_autor);
end $$;
revoke all on function public.opera_cadastrar_com_reuniao(jsonb,jsonb,text,text,uuid) from public, anon, authenticated;
grant execute on function public.opera_cadastrar_com_reuniao(jsonb,jsonb,text,text,uuid) to service_role;
commit;
