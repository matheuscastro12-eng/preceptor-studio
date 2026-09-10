-- Depois de tests/opera.sql, somente banco isolado.
\ir ../db/opera_v3_reunioes.sql
do $$ declare p jsonb; r jsonb; n integer; begin
 p='{"slug":"reuniao-sem-lp","nome":"Reunião","cliente":"Empresa","processo":"Pedidos","responsavel":"Pessoa","tipo":"agente","colheita_publica":false,"painel_publico":false,"colheita":{},"venture_id":null,"processo_slug":"pedidos"}';
 r=jsonb_build_object('titulo','Descoberta','transcricao',repeat('Texto da fonte ',5),'leitura','{}'::jsonb,'revisada',false);
 perform opera_cadastrar_com_reuniao(p,r,'fonte-a','registro-a','11111111-1111-4111-8111-111111111111');
 assert exists(select from opera_projetos where slug='reuniao-sem-lp' and venture_id is null), 'não depende de Venture/lead';
 assert exists(select from opera_reunioes where projeto='reuniao-sem-lp'), 'fonte junto do projeto';
 begin
   perform opera_cadastrar_com_reuniao(jsonb_set(p,'{slug}','"falha-reuniao"'),jsonb_set(r,'{transcricao}','"curta"'),'fonte-b','registro-b','11111111-1111-4111-8111-111111111111');
   raise exception 'deveria recusar fonte curta';
 exception when check_violation then null; end;
 assert not exists(select from opera_projetos where slug='falha-reuniao'), 'rollback do cadastro';
 insert into opera_reunioes(projeto,titulo,transcricao,fonte_hash,registro_hash,leitura,revisada,criado_por)
 select projeto,titulo,transcricao,fonte_hash,'registro-revisado',leitura,true,criado_por from opera_reunioes where projeto='reuniao-sem-lp';
 select count(*) into n from opera_reunioes where projeto='reuniao-sem-lp'; assert n=2, 'revisão preserva versão anterior';
 assert not has_table_privilege('anon','opera_reunioes','select'), 'transcrição nunca pública';
 assert not has_table_privilege('authenticated','opera_reunioes','select'), 'acesso somente pela autorização do projeto';
 assert not has_function_privilege('authenticated','opera_cadastrar_com_reuniao(jsonb,jsonb,text,text,uuid)','execute'), 'RPC não acessível ao browser';
end $$;
select 'Reunião sem LP: cadastro atômico, histórico e privacidade passaram' as resultado;
