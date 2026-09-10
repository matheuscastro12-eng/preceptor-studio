-- Run only in an isolated empty PostgreSQL database.
do $$ begin
 if not exists(select 1 from pg_roles where rolname='anon') then create role anon; end if;
 if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
 if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role; end if;
end $$;
create schema auth;
create table auth.users(id uuid primary key);
create table public.ventures(id text primary key,name text,slug text,client_id text);
\ir ../db/opera_v1_portal.sql
\ir ../db/opera_v2_conexao.sql
insert into auth.users values('11111111-1111-4111-8111-111111111111');
insert into ventures values('v1','Venture teste','venture-teste',null);
insert into opera_projetos(slug,nome,cliente,processo,responsavel,tipo,colheita,criado_por,venture_id,processo_slug)
values('teste','Teste','Cliente','Processo','Pessoa','agente','{}','11111111-1111-4111-8111-111111111111','v1','processo-teste');
do $$ declare p uuid; d uuid; e uuid; snap jsonb; art jsonb; begin
  snap=jsonb_build_object('atualizadoEm','2026-09-09T12:00:00.000Z');
  art=jsonb_build_array(jsonb_build_object('propostaId',repeat('a',64),'hash',repeat('b',64),'chave','escopo','situacao','proposta'));
  p=opera_publicar('teste','22222222-2222-4222-8222-222222222222','hash','pessoa',snap,art,'[]');
  assert p=opera_publicar('teste','22222222-2222-4222-8222-222222222222','hash','pessoa',snap,art,'[]'),'retry idempotente';
  assert (select count(*) from opera_publicacoes)=1,'sem duplicatas';
  begin perform opera_publicar('teste','22222222-2222-4222-8222-222222222222','outro','pessoa',snap,art,'[]');raise exception 'deveria recusar evento adulterado';exception when unique_violation then null;end;
  d=opera_decidir('teste',p,repeat('a',64),repeat('b',64),'aprovar','Revisado pela operação','11111111-1111-4111-8111-111111111111');
  begin perform opera_decidir('teste',p,repeat('a',64),repeat('b',64),'recusar','Outra decisão','11111111-1111-4111-8111-111111111111');raise exception 'deveria recusar dupla decisão';exception when unique_violation then null;end;
  perform opera_publicar('teste','33333333-3333-4333-8333-333333333333','novo','pessoa',jsonb_build_object('atualizadoEm','2026-09-09T12:01:00.000Z'),art,'[]');
  begin perform opera_decidir('teste',p,repeat('c',64),repeat('b',64),'aprovar','Versão antiga','11111111-1111-4111-8111-111111111111');raise exception 'deveria recusar revisão antiga';exception when unique_violation then null;end;
  e=opera_entrega_revisar('teste','11111111-1111-4111-8111-111111111111','{"escopo":"Escopo","exclusoes":"Fora","aceite":"Teste","dependencias":"Dados","capacidade":"Pessoa disponível"}',null);
  perform opera_entrega_revisar('teste','11111111-1111-4111-8111-111111111111','{}',e);
  assert (select aceito_por is not null from opera_entregas where id=e),'aceite autenticado';
  assert not has_table_privilege('anon','opera_publicacoes','SELECT'),'histórico privado';
  assert not has_function_privilege('authenticated','opera_publicar(text,uuid,text,text,jsonb,jsonb,jsonb)','EXECUTE'),'sem bypass pelo navegador';
end $$;
select 'OPERA PostgreSQL: publicações, revisão, compromisso e permissões passaram' as resultado;
-- Exercise the optional existing Cérebro contract without altering any production schema.
create schema opera;
create table opera.venture(id uuid primary key,slug text);
create table opera.processo(id uuid primary key,venture_id uuid,slug text);
create table opera.construcao(id uuid primary key,processo_id uuid,sincronizada_em timestamptz);
create table opera.construcao_entrada(construcao_id uuid,seq integer,tipo text,etapa text,artefato text,quando timestamptz,quem text,motivo text,segundos_para_decidir integer,carimbo boolean,anterior text,hash text,primary key(construcao_id,seq));
insert into opera.venture values('44444444-4444-4444-8444-444444444444','venture-teste');
insert into opera.processo values('55555555-5555-4555-8555-555555555555','44444444-4444-4444-8444-444444444444','processo-teste');
insert into opera.construcao values('66666666-6666-4666-8666-666666666666','55555555-5555-4555-8555-555555555555',null);
select opera_ligar_cerebro('teste','66666666-6666-4666-8666-666666666666','11111111-1111-4111-8111-111111111111');
do $$ declare diario jsonb; begin
 diario='[{"seq":1,"tipo":"proposta","etapa":"escopo","artefato":"abc","quando":"2026-09-09T12:00:00Z","quem":null,"motivo":null,"segundosParaDecidir":null,"carimbo":false,"anterior":null,"hash":"original"}]';
 perform opera_publicar('teste','77777777-7777-4777-8777-777777777777','terceiro','pessoa','{"atualizadoEm":"2026-09-09T12:02:00.000Z"}','[]',diario);
 assert (select count(*) from opera.construcao_entrada)=1,'diário espelhado no Cérebro';
 begin
  perform opera_publicar('teste','88888888-8888-4888-8888-888888888888','conflito','pessoa','{"atualizadoEm":"2026-09-09T12:03:00.000Z"}','[]',jsonb_set(diario,'{0,hash}','"alterado"'));
  raise exception 'deveria recusar divergência no Cérebro';
 exception when unique_violation then null;end;
 assert (select count(*) from opera_publicacoes)=3,'espelhamento e publicação atômicos';
end $$;
select 'Ponte do Cérebro: vínculo, espelhamento e conflito passaram' as resultado;
