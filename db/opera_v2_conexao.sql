-- After opera_v1_portal.sql and erp_v1_ventures.sql. Additive; no automatic client matching.
begin;
alter table public.opera_projetos add column if not exists construcao_id uuid not null default gen_random_uuid();
create unique index if not exists opera_construcao_identity on public.opera_projetos(construcao_id);
alter table public.opera_projetos add column if not exists venture_id text references public.ventures(id);
alter table public.opera_projetos add column if not exists processo_slug text;
alter table public.opera_projetos add column if not exists ultimo_contato timestamptz;
alter table public.opera_projetos add column if not exists cerebro_construcao_id uuid;
create table if not exists public.opera_membros (
  projeto text not null references public.opera_projetos(slug), usuario uuid not null references auth.users(id),
  papel text not null check(papel in ('leitor','operador','revisor')), primary key(projeto,usuario)
);
create table if not exists public.opera_integracoes (
  id uuid primary key default gen_random_uuid(), projeto text not null references public.opera_projetos(slug),
  token_hash text not null unique, criado_por uuid not null references auth.users(id),
  criado_em timestamptz not null default now(), expira_em timestamptz not null, revogado_em timestamptz
);
create table if not exists public.opera_publicacoes (
  id uuid primary key default gen_random_uuid(), projeto text not null references public.opera_projetos(slug),
  evento_id uuid not null, digest text not null, autor text not null,
  snapshot jsonb not null, artefatos jsonb not null default '[]', diario jsonb not null default '[]',
  recebido_em timestamptz not null default now(), unique(projeto,evento_id)
);
create index if not exists opera_publicacoes_timeline on public.opera_publicacoes(projeto,recebido_em desc);
create table if not exists public.opera_decisoes (
  id uuid primary key default gen_random_uuid(), projeto text not null references public.opera_projetos(slug),
  publicacao uuid not null references public.opera_publicacoes(id), proposta_id text not null,
  chave text not null, hash text not null, decisao text not null check(decisao in ('aprovar','recusar')),
  motivo text not null, autor uuid not null references auth.users(id), criado_em timestamptz not null default now(),
  estado text not null default 'pendente' check(estado in ('pendente','aplicada','conflito')),
  resultado text, confirmado_em timestamptz, unique(projeto,proposta_id)
);
create table if not exists public.opera_entregas (
  id uuid primary key default gen_random_uuid(), projeto text not null references public.opera_projetos(slug),
  versao integer not null, escopo text not null, exclusoes text not null, aceite text not null,
  dependencias text not null, capacidade text not null, autor uuid not null references auth.users(id),
  criado_em timestamptz not null default now(), aceito_por uuid references auth.users(id), aceito_em timestamptz,
  unique(projeto,versao)
);
create table if not exists public.opera_auditoria (
  id uuid primary key default gen_random_uuid(), projeto text not null references public.opera_projetos(slug),
  tipo text not null, autor text not null, detalhe jsonb not null, criado_em timestamptz not null default now()
);
-- Only server-side, scoped authorization. No direct browser or anonymous access.
do $$ declare t text; begin
  foreach t in array array['opera_membros','opera_integracoes','opera_publicacoes','opera_decisoes','opera_entregas','opera_auditoria'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;
-- One project lock serializes publication, review and handoff. Retried events are idempotent.
create or replace function public.opera_publicar(p_projeto text,p_evento uuid,p_digest text,p_autor text,p_snapshot jsonb,p_artefatos jsonb,p_diario jsonb)
returns uuid language plpgsql set search_path=public,pg_temp as $$
declare p opera_projetos; anterior opera_publicacoes; resultado uuid; e jsonb; hash_existente text;
begin
  select * into p from opera_projetos where slug=p_projeto for update;
  if not found then raise exception 'Projeto ausente' using errcode='P0002'; end if;
  select * into anterior from opera_publicacoes where projeto=p_projeto and evento_id=p_evento;
  if found then
    if anterior.digest<>p_digest then raise exception 'Evento reutilizado com outro conteúdo' using errcode='23505'; end if;
    return anterior.id;
  end if;
  if p.snapshot is not null and (p.snapshot->>'atualizadoEm')::timestamptz >= (p_snapshot->>'atualizadoEm')::timestamptz then
    raise exception 'Publicação anterior ao estado atual' using errcode='23505';
  end if;
  if p.cerebro_construcao_id is not null then
    for e in select value from jsonb_array_elements(p_diario) loop
      execute 'select hash from opera.construcao_entrada where construcao_id=$1 and seq=$2' into hash_existente using p.cerebro_construcao_id,(e->>'seq')::integer;
      if hash_existente is not null and hash_existente<>e->>'hash' then raise exception 'Diário divergiu do Cérebro' using errcode='23505'; end if;
      execute 'insert into opera.construcao_entrada(construcao_id,seq,tipo,etapa,artefato,quando,quem,motivo,segundos_para_decidir,carimbo,anterior,hash) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) on conflict(construcao_id,seq) do nothing'
        using p.cerebro_construcao_id,(e->>'seq')::integer,e->>'tipo',e->>'etapa',e->>'artefato',(e->>'quando')::timestamptz,e->>'quem',e->>'motivo',(e->>'segundosParaDecidir')::integer,(e->>'carimbo')::boolean,e->>'anterior',e->>'hash';
    end loop;
    execute 'update opera.construcao set sincronizada_em=now() where id=$1' using p.cerebro_construcao_id;
  end if;
  insert into opera_publicacoes(projeto,evento_id,digest,autor,snapshot,artefatos,diario)
    values(p_projeto,p_evento,p_digest,p_autor,p_snapshot,p_artefatos,p_diario) returning id into resultado;
  update opera_projetos set snapshot=p_snapshot,atualizado_em=now(),ultimo_contato=now() where slug=p_projeto;
  return resultado;
end $$;
create or replace function public.opera_decidir(p_projeto text,p_publicacao uuid,p_proposta text,p_hash text,p_decisao text,p_motivo text,p_autor uuid)
returns uuid language plpgsql set search_path=public,pg_temp as $$
declare atual opera_publicacoes; artefato jsonb; resultado uuid;
begin
  perform 1 from opera_projetos where slug=p_projeto for update;
  select * into atual from opera_publicacoes where projeto=p_projeto order by recebido_em desc,id desc limit 1;
  if atual.id is distinct from p_publicacao then raise exception 'A publicação mudou. Reabra a revisão.' using errcode='23505'; end if;
  select a into artefato from jsonb_array_elements(atual.artefatos) a where a->>'propostaId'=p_proposta and a->>'hash'=p_hash and a->>'situacao'='proposta';
  if artefato is null then raise exception 'Proposta ausente ou alterada' using errcode='23505'; end if;
  insert into opera_decisoes(projeto,publicacao,proposta_id,chave,hash,decisao,motivo,autor)
    values(p_projeto,p_publicacao,p_proposta,artefato->>'chave',p_hash,p_decisao,p_motivo,p_autor) returning id into resultado;
  return resultado;
end $$;
create or replace function public.opera_entrega_revisar(p_projeto text,p_autor uuid,p_dados jsonb,p_aceitar uuid default null)
returns uuid language plpgsql set search_path=public,pg_temp as $$
declare ultima opera_entregas; resultado uuid;
begin
  perform 1 from opera_projetos where slug=p_projeto and venture_id is not null for update;
  if not found then raise exception 'Vincule a Venture antes do compromisso de entrega' using errcode='23505'; end if;
  select * into ultima from opera_entregas where projeto=p_projeto order by versao desc limit 1;
  if p_aceitar is not null then
    if ultima.id is distinct from p_aceitar or ultima.aceito_em is not null then raise exception 'Revisão já aceita ou desatualizada' using errcode='23505'; end if;
    update opera_entregas set aceito_por=p_autor,aceito_em=now() where id=p_aceitar;
    return p_aceitar;
  end if;
  insert into opera_entregas(projeto,versao,escopo,exclusoes,aceite,dependencias,capacidade,autor)
  values(p_projeto,coalesce(ultima.versao,0)+1,p_dados->>'escopo',p_dados->>'exclusoes',p_dados->>'aceite',p_dados->>'dependencias',p_dados->>'capacidade',p_autor) returning id into resultado;
  return resultado;
end $$;
create or replace function public.opera_ligar_cerebro(p_projeto text,p_construcao uuid,p_autor uuid)
returns void language plpgsql set search_path=public,pg_temp as $$
declare p opera_projetos; v public.ventures; destino record;
begin
  select * into p from opera_projetos where slug=p_projeto for update;
  select * into v from ventures where id=p.venture_id;
  if p.cerebro_construcao_id is not null and p.cerebro_construcao_id<>p_construcao then raise exception 'Cérebro já vinculado' using errcode='23505'; end if;
  if to_regclass('opera.construcao') is null then raise exception 'Schema do Cérebro não instalado'; end if;
  execute 'select pr.slug::text processo,v.slug::text venture from opera.construcao c join opera.processo pr on pr.id=c.processo_id join opera.venture v on v.id=pr.venture_id where c.id=$1' into destino using p_construcao;
  if destino.processo is distinct from p.processo_slug or destino.venture is distinct from v.slug or v.slug is null then raise exception 'Venture ou processo não corresponde ao Cérebro' using errcode='23505'; end if;
  update opera_projetos set cerebro_construcao_id=p_construcao where slug=p_projeto;
  insert into opera_auditoria(projeto,tipo,autor,detalhe) values(p_projeto,'cerebro_vinculado',p_autor::text,jsonb_build_object('construcao',p_construcao));
end $$;
revoke all on function public.opera_publicar(text,uuid,text,text,jsonb,jsonb,jsonb), public.opera_decidir(text,uuid,text,text,text,text,uuid), public.opera_entrega_revisar(text,uuid,jsonb,uuid), public.opera_ligar_cerebro(text,uuid,uuid) from public,anon,authenticated;
grant execute on function public.opera_publicar(text,uuid,text,text,jsonb,jsonb,jsonb), public.opera_decidir(text,uuid,text,text,text,text,uuid), public.opera_entrega_revisar(text,uuid,jsonb,uuid), public.opera_ligar_cerebro(text,uuid,uuid) to service_role;
commit;
