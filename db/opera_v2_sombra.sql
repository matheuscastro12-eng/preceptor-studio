-- Sombra do OPERA: o par cego entre a decisão de uma pessoa e a do agente.
--
-- A regra que dá valor a esta tabela é uma só: a pessoa decide ANTES do agente,
-- e sem ver a resposta dele. Concordância com quem aprova quase tudo não mede
-- nada. Por isso a cegueira aqui não é convenção nem comentário: é a forma da
-- tabela.
--
--   1. `humano` é NOT NULL. Uma linha nasce da decisão da pessoa, e só dela.
--      O agente não tem onde escrever antes de existir a metade humana.
--   2. `agente_em > humano_em` é constraint. A decisão do agente é sempre
--      posterior, e o banco recusa qualquer outra ordem.
--   3. A metade humana é congelada por gatilho. Depois de gravada, ninguém
--      reescreve decisão, quem decidiu, entrada ou hora. Não dá para ver a
--      resposta do agente e voltar para consertar a sua.
--   4. `cega` é coluna gerada. Ninguém envia esse campo; o banco o calcula.
--   5. A leitura de um par pela porta do agente (`abrir_sombra_para_o_agente`)
--      não devolve `humano`, `quem` nem `nota`. Quem pede o caso para decidir
--      recebe o caso, não a resposta.
--
-- Aplicar depois de db/opera_v1_portal.sql. Não altera nenhuma outra tabela.
begin;

create table if not exists public.sombra_pares (
  id uuid primary key default gen_random_uuid(),
  venture text not null,
  -- O caso, na língua da operação: um carregamento é uma ordem mais a nota.
  caso_id text not null,
  ordem_carregamento text not null check (length(btrim(ordem_carregamento)) > 0),
  chave_nfe text not null check (chave_nfe ~ '^[0-9]{44}$'),
  -- Um dos dezessete tipos de ação da política (opera/politica.ts da venture).
  tipo text not null check (length(btrim(tipo)) > 0),

  -- A metade humana. Existe sempre, e existe primeiro.
  humano text not null check (length(btrim(humano)) > 0),
  quem text not null check (length(btrim(quem)) > 0),
  nota text,
  entrada jsonb not null default '{}'::jsonb check (jsonb_typeof(entrada) = 'object'),
  humano_em timestamptz not null default now(),

  -- A metade do agente. Só entra depois, e só uma vez.
  agente text,
  agente_em timestamptz,

  -- Espelha o campo `cega` da classe Sombra, mas quem decide é o banco.
  cega boolean not null generated always as (agente_em is null or agente_em > humano_em) stored,

  ip text,
  user_agent text,
  criado_em timestamptz not null default now(),

  constraint sombra_pares_um_par_por_caso unique (venture, caso_id, tipo),
  constraint sombra_pares_agente_depois_da_humana check (
    (agente is null and agente_em is null)
    or (agente is not null and agente_em is not null and agente_em > humano_em)
  )
);

create index if not exists sombra_pares_venture_tipo_idx on public.sombra_pares (venture, tipo);
create index if not exists sombra_pares_a_decidir_idx on public.sombra_pares (venture, humano_em) where agente is null;

-- Um par nunca nasce com as duas metades. Sem isto, uma única escrita com as
-- duas decisões juntas passaria pelas constraints e a ordem seria só uma data.
create or replace function public.sombra_pares_nascem_da_pessoa()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.agente is not null or new.agente_em is not null then
    raise exception 'o par nasce da decisao da pessoa; a do agente entra depois, por gravar_decisao_do_agente' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists sombra_pares_nascimento on public.sombra_pares;
create trigger sombra_pares_nascimento
  before insert on public.sombra_pares
  for each row execute function public.sombra_pares_nascem_da_pessoa();

-- A metade humana é escrita uma vez. Sem isto, bastaria ler a decisão do agente
-- e reescrever a sua para que a apuração passasse a medir cópia.
create or replace function public.sombra_pares_congelar_a_metade_humana()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.venture is distinct from old.venture
     or new.caso_id is distinct from old.caso_id
     or new.tipo is distinct from old.tipo
     or new.humano is distinct from old.humano
     or new.quem is distinct from old.quem
     or new.nota is distinct from old.nota
     or new.entrada is distinct from old.entrada
     or new.humano_em is distinct from old.humano_em then
    raise exception 'a metade humana do par nao se reescreve' using errcode = '23514';
  end if;
  if old.agente is not null and (new.agente is distinct from old.agente or new.agente_em is distinct from old.agente_em) then
    raise exception 'a decisao do agente ja foi gravada e nao se reescreve' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists sombra_pares_congelar on public.sombra_pares;
create trigger sombra_pares_congelar
  before update on public.sombra_pares
  for each row execute function public.sombra_pares_congelar_a_metade_humana();

-- Política: ninguém lê nem escreve esta tabela direto do navegador. A escrita
-- entra pela rota oficial com service role; a leitura, pelas RPCs do segredo.
alter table public.sombra_pares enable row level security;
revoke all on public.sombra_pares from anon, authenticated;
grant all on public.sombra_pares to service_role;
drop policy if exists sombra_pares_sem_porta_direta on public.sombra_pares;
create policy sombra_pares_sem_porta_direta on public.sombra_pares
  as restrictive for all to anon, authenticated
  using (false) with check (false);

-- Porta 1: a apuração. Devolve o par inteiro, depois do fato, para quem colhe.
create or replace function public.ler_sombra_pares(p_venture text, p_segredo text)
returns table(
  id uuid, venture text, caso_id text, ordem_carregamento text, chave_nfe text,
  tipo text, humano text, quem text, nota text, entrada jsonb, humano_em timestamptz,
  agente text, agente_em timestamptz, cega boolean, criado_em timestamptz
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  hash_esperado constant text := 'a335c24cfdaf65c33c5784e550f725dbbb827bac04b460083ea737c97d278093';
begin
  if encode(sha256(convert_to(coalesce(p_segredo, ''), 'UTF8')), 'hex') <> hash_esperado then
    raise exception 'segredo invalido' using errcode = '28000';
  end if;
  return query
    select s.id, s.venture, s.caso_id, s.ordem_carregamento, s.chave_nfe,
           s.tipo, s.humano, s.quem, s.nota, s.entrada, s.humano_em,
           s.agente, s.agente_em, s.cega, s.criado_em
    from public.sombra_pares s
    where s.venture = p_venture
    order by s.humano_em asc;
end;
$$;

-- Porta 2: o agente. Recebe o caso para decidir e nada mais. Não há `humano`,
-- `quem` nem `nota` no retorno, então não existe leitura que vaze a resposta
-- da pessoa para quem ainda vai decidir.
create or replace function public.abrir_sombra_para_o_agente(p_venture text, p_segredo text, p_limite integer default 50)
returns table(
  id uuid, caso_id text, ordem_carregamento text, chave_nfe text,
  tipo text, entrada jsonb, humano_em timestamptz
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  hash_esperado constant text := 'a335c24cfdaf65c33c5784e550f725dbbb827bac04b460083ea737c97d278093';
begin
  if encode(sha256(convert_to(coalesce(p_segredo, ''), 'UTF8')), 'hex') <> hash_esperado then
    raise exception 'segredo invalido' using errcode = '28000';
  end if;
  return query
    select s.id, s.caso_id, s.ordem_carregamento, s.chave_nfe,
           s.tipo, s.entrada, s.humano_em
    from public.sombra_pares s
    where s.venture = p_venture and s.agente is null
    order by s.humano_em asc
    limit greatest(1, least(coalesce(p_limite, 50), 500));
end;
$$;

-- Porta 3: a decisão do agente. Só fecha um par que já nasceu da pessoa, e o
-- retorno não conta o que ela decidiu, só se o par ficou cego.
create or replace function public.gravar_decisao_do_agente(p_id uuid, p_decisao text, p_segredo text)
returns table(id uuid, cega boolean, agente_em timestamptz)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  hash_esperado constant text := 'a335c24cfdaf65c33c5784e550f725dbbb827bac04b460083ea737c97d278093';
begin
  if encode(sha256(convert_to(coalesce(p_segredo, ''), 'UTF8')), 'hex') <> hash_esperado then
    raise exception 'segredo invalido' using errcode = '28000';
  end if;
  if p_decisao is null or length(btrim(p_decisao)) = 0 then
    raise exception 'decisao do agente vazia' using errcode = '23514';
  end if;
  return query
    update public.sombra_pares s
      set agente = btrim(p_decisao), agente_em = now()
      where s.id = p_id and s.agente is null
      returning s.id, s.cega, s.agente_em;
end;
$$;

grant execute on function public.ler_sombra_pares(text, text) to anon, authenticated, service_role;
grant execute on function public.abrir_sombra_para_o_agente(text, text, integer) to anon, authenticated, service_role;
grant execute on function public.gravar_decisao_do_agente(uuid, text, text) to anon, authenticated, service_role;

commit;
