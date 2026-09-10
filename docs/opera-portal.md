# OPERA no preceptorstudio.com

> Histórico da primeira entrega. Para instalação, permissões e publicação atuais, seguir [OPERA conectado](./opera-conexao.md). O contrato v2 substitui os trechos de integração abaixo.

O portal mora neste site. `/opera` encaminha para `/dashboard/opera`, dentro da autenticação e navegação existentes. Comercial e Ventures continuam nas suas áreas atuais.

## O que acompanha todos os projetos

Cada cadastro cria uma identidade estável e dois endereços: `/colheita/<slug>` e `/painel/<slug>`. A colheita tem um instrumento versionado com grupos, perguntas, tipos de ocorrência, fichas e listas. O painel apresenta a última publicação estruturada do Construtor: etapa, próxima ação, ensaios, corpus, achados e atividade. Não infere dados ausentes nem considera envio de formulário como caso validado.

A equipe lê as respostas em `/dashboard/opera/<slug>`. Os dois links externos começam privados e precisam ser liberados no cadastro. Público aqui significa acessível a quem conhece o endereço, não autenticação por convite. Não coloque conteúdo confidencial em um painel liberado dessa forma.

## Compatibilidade OASIS

O instrumento OASIS continua em `lib/colheita/oasis.ts`, adaptado pelo mesmo contrato dos próximos projetos. IDs de perguntas, fichas e rascunho v1 permanecem iguais. Envios antigos sem versão só são aceitos para a OASIS v1. Fichas enviadas precisam ter os campos obrigatórios preenchidos; perguntas podem ser respondidas parcialmente.

`/painel/oasis-cte#motor` mantém a reescrita para o HTML atual em `painel_construcao`. O portal informa a data da publicação, mas não tenta inferir métricas a partir do HTML. Outros painéis legados podem ser acessados pela rota de publicação. A revisão interna não substitui nem publica por conta própria o artefato da venture.

## Instalação

1. Configurar as variáveis Supabase já usadas pelo site. Nunca incluir service role no navegador ou nos manifests.
2. Revisar e aplicar `db/opera_v1_portal.sql` depois de `db/schema.sql`. O SQL cria o cadastro, garante as tabelas do painel e colheita em instalação nova e adiciona a versão do instrumento. Não insere respostas nem migra dados fictícios.
3. Validar perfis da equipe: `owner`, `admin` ou `member`. Sessão sem perfil ativo não acessa as novas APIs.
4. Rodar `npm run test:opera`, `npx tsc --noEmit` e `npm run build`.
5. Publicar o site pelo fluxo normal deste repositório.

As telas distinguem ausência de dado de falha de consulta. Sem migração, a OASIS continua como referência e o cadastro mostra que a conexão precisa ser preparada. Não há modo de demonstração ou bypass de autenticação em produção.

## Criar e conectar a próxima venture

Pode ser feito pela tela “Novo projeto” ou pela API. O corpo de `POST /api/opera/projetos` é um `ProjetoOpera` de `lib/opera/model.ts`, sem campos de autoria. O servidor identifica o membro pela sessão, ou por um Bearer token Supabase de membro. A publicação não altera a visibilidade existente.

No repositório da venture, versionar `.opera/portal.json` com a configuração do projeto e `.opera/painel.json` com a evidência gerada pelo seu construtor. `portal.json` contém slug, nome, cliente, processo, responsável, tipo, as duas permissões públicas, colheita e snapshot inicialmente nulo. `colheitaInicial()` produz um instrumento inicial que deve ser revisado para cada processo.

Exemplo de `.opera/painel.json` (exemplo de contrato, não estado real):

```json
{
  "atualizadoEm": "2026-09-09T17:30:00.000Z",
  "etapa": "corpus",
  "resumo": "A partitura foi revisada; a coleta de casos começou.",
  "proximaAcao": "Revisar as ocorrências com o responsável pela operação.",
  "testes": null,
  "corpus": null,
  "achados": [],
  "atividades": []
}
```

Um teste é `{ "passaram": 12, "total": 12 }`; corpus é `{ "validados": 4, "meta": 20 }`. Não usar contagem de formulários para preencher validados. Datas de publicação são UTC canônico (`toISOString()`). Uma publicação anterior à atual é recusada.

O campo opcional `artefatos` recebe documentos `{ "id": "motor", "titulo": "Motor determinístico", "estado": "informativo", "conteudo": "Conteúdo em Markdown" }`. IDs únicos viram âncoras, como `/painel/<slug>#motor`. Os estados permitidos são `proposto`, `aprovado`, `recusado` e `informativo`; são evidências declaradas pelo publicador, não uma aprovação executada pelo portal.

Com `OPERA_PORTAL_TOKEN` e, opcionalmente, `OPERA_PORTAL_URL` fornecidos pelo ambiente:

```sh
node /caminho/preceptor-studio/scripts/opera-publicar.mjs /caminho/venture
```

O comando cadastra o projeto se necessário e publica o snapshot; não insere aprovações. Ele deve integrar o gerador de evidências da venture/CI. O token de membro expira; renovar por autenticação. Uma credencial própria de integração, restrita por projeto, será evolução separada. Não substituir pelo service role do banco.

## Critérios e limites desta entrega

- Cadastro e instrumento por projeto, links estáveis, formulário comum, envio persistido e leitura interna.
- Templates nativos para novas publicações; HTML OASIS preservado.
- API de publicação com validação, vínculo à sessão da equipe e proteção contra atualização antiga.
- Identidade visual compartilhada com o Studio; navegação conecta o Comercial existente.

Não implementa ainda envio automático a partir do pacote `opera-construtor`, aprovação remota de portões, promoção automática de corpus, integração das tabelas do schema `opera`, editor visual completo do instrumento ou CRM novo. Esses fluxos exigem contratos adicionais; o registro de uma publicação não deve fingir que eles aconteceram. Para editar um instrumento cadastrado, a próxima evolução é revisão versionada com histórico, antes de permitir alteração de perguntas já respondidas.

O skill `frontend-design` deste repositório orientou uma interface de acompanhamento: navy e teal institucionais, trilha por etapa sem inferir aprovações, próxima ação em destaque e indicadores com sua data. Não há atividade simulada na interface.

## Verificação local isolada

`tests/opera.mock.ts` fornece um backend fictício somente em localhost, sem credenciais ou dados reais. Para repetir a verificação de navegador, iniciar `npx tsx tests/opera.mock.ts`; construir e iniciar o Next na porta 3100 com `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54329`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=fixture-anon` e `SUPABASE_SERVICE_ROLE_KEY=fixture-service`; depois executar `node tests/opera.browser.mjs`. Não reconstruir `.next` enquanto o teste usa o servidor. O teste exige Chrome instalado (ou `CHROME_PATH`) e gera capturas em diretório temporário. Nunca publicar um build com essas variáveis fictícias.
