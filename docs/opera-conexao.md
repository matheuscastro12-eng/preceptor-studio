# OPERA conectado — implementação e ativação

Esta é a especificação vigente. Substitui o contrato de publicação e as permissões da primeira entrega (`opera-portal.md`).

## Fluxo implementado

Venture do Studio → projeto/processo → identidade estável da construção → publicação com histórico → revisão autenticada → confirmação no diário local. O compromisso comercial tem escopo, exclusões, aceite, dependências e capacidade; cada revisão é preservada e a operação aceita uma versão específica.

### Outra entrada: transcrição de reunião

No Comercial há um atalho para o cadastro OPERA. Em **Novo projeto**, marque **Começar por uma transcrição**. Cole texto ou importe TXT/Markdown/VTT/SRT (não áudio, vídeo ou PDF; até 120.000 caracteres). Não exige lead nem LP, e a Venture pode ser vinculada depois. Nenhum lead é fabricado, duplicado ou marcado como ganho.

Preencha a leitura manualmente ou solicite leitura assistida, com consentimento explícito de envio ao provedor Anthropic já usado pelo Studio. Exige `ANTHROPIC_API_KEY`; sem chave, o caminho manual continua disponível. O servidor verifica que as citações existem literalmente na fonte; isso não prova que a interpretação está correta. A pessoa confere a leitura antes de usar processo e lacunas no cadastro. As perguntas são adicionadas à colheita inicial, que permanece revisável e privada por padrão.

Projeto e primeira fonte são gravados na mesma transação pela migração `db/opera_v3_reunioes.sql` (aplicar após v1/v2). Fontes não entram no snapshot, no painel público nem na API do token de integração. Só membros com acesso ao projeto leem; operadores/revisores registram. Revisões criam registros novos, preservando os anteriores; repetições idênticas são recusadas. A fonte tem hash, autor autenticado e horário. O hash evidencia integridade, não consentimento dos participantes ou veracidade da conversa.

Em `/dashboard/opera/<slug>/reunioes`, registre reuniões posteriores ou retome uma leitura para revisar. Exporte Markdown privado e entregue ao Construtor com `opera-construtor pensar --fonte /caminho/reuniao.md --dir /caminho/solucao`. O comando de leitura já existe no Construtor. A importação não aprova etapas, promove corpus nem muda o contrato comercial. Reuniões posteriores também não sobrescrevem automaticamente o instrumento de colheita.

Revise e minimize dados pessoais antes do envio. Defina retenção e acesso com a operação antes do piloto: não há exclusão automática nem captura de gravações nesta entrega. A limitação de uso da leitura assistida reutiliza o limitador do Studio (10 solicitações por membro/hora, com a limitação existente de falhar aberto se o banco estiver indisponível).

Validação adicional: 14 testes do Studio aprovados, incluindo resposta de IA simulada, consentimento, citação inventada e bloqueio de token de integração. `tests/opera.reuniao.sql`, após `tests/opera.sql` em banco isolado, testa cadastro sem Venture, rollback, histórico e privilégios. A qualidade da leitura por IA com transcrições reais ainda precisa de avaliação autorizada; não foi realizada chamada paga ao provedor nesta tarefa.

Build e TypeScript também passaram após essa extensão. No navegador, o cadastro pela transcrição sem Venture, consulta privada, exportação da fonte e layout desktop/mobile foram verificados junto aos fluxos anteriores. A skill de frontend do projeto orientou a continuidade visual: mesma tipografia e paleta, com interpretação e trecho da fonte agrupados para revisão.

- `/dashboard/opera`: somente projetos acessíveis ao membro, atualização enquanto a aba está visível.
- `/dashboard/opera/<slug>`: acompanhamento e respostas da colheita.
- `/dashboard/opera/<slug>/conexao`: vínculo à Venture/Cérebro, evidências exatas, decisões, compromisso, credenciais e acesso.
- `/dashboard/ventures/<id>`: construções vinculadas e início de uma nova construção sem perder a Venture de origem.
- `/colheita/<slug>` e `/painel/<slug>`: projeções públicas somente quando liberadas. O conteúdo técnico enviado para revisão, o diário e as decisões não entram automaticamente na projeção pública.

## Identidade e acesso

`construcao_id` é UUID atribuído pelo portal. Não depende da pasta ou da máquina. `venture_id` referencia o cadastro existente de Ventures; `processo_slug` diferencia processos. O vínculo, uma vez feito, não pode ser transferido pelo formulário comum.

Criador e administradores gerenciam. Demais membros precisam de papel por projeto: leitor, operador ou revisor. Credenciais `opr_…` têm escopo de um projeto, validade de 30 dias e revogação; só o hash fica no banco. Permitem publicar, consultar comandos e confirmar resultado, nunca registrar aprovação humana. Não substitua por service role nem grave credenciais em Git.

Não é ainda um portal autenticado para clientes externos: os papéis acima são para membros ativos do Studio. Um painel público pode ser acessado por qualquer pessoa que conheça o endereço. Não publique informação confidencial nele.

## Ativar em ambiente real

1. Revisar o diff do Studio, do OPERA de origem e do Construtor extraído; fazer backup do banco pelo procedimento da equipe.
2. Configurar as variáveis Supabase do Studio. Nesta tarefa não havia `.env.local` nem acesso ao banco de produção; nenhum dado real foi migrado.
3. Aplicar `db/opera_v1_portal.sql` e `db/opera_v2_conexao.sql` após o schema do site e a migração de Ventures. As migrações não fabricam clientes, usuários, respostas ou evidências.
4. Publicar o Studio pelo fluxo normal. Não publicar o build de teste: ele usa variáveis fictícias de localhost.
5. Cadastrar cada construção, vinculá-la à Venture e atribuir os membros. Para OASIS, reutilizar o instrumento `OASIS.colheita` de `lib/opera/model.ts`, mantendo IDs e versão 1; não trocar pelo questionário genérico.
6. Na página de conexão, copiar o manifesto e gerar a credencial. O manifesto da solução é `.opera/portal.json`:

```json
{"slug":"identificador-do-projeto","construcaoId":"UUID exibido no portal"}
```

7. No checkout atualizado de `opera-construtor`, com `OPERA_PORTAL_TOKEN` fornecido pelo ambiente:

```sh
node bin/opera-portal.ts --dir /caminho/da/solucao --acompanhar
```

Sem `--acompanhar`, roda um ciclo e termina com status de erro se falhar. O worker contínuo verifica a cada 30 segundos; hospede-o no supervisor de processos da máquina responsável e mantenha uma única instância por construção. Não expõe porta local à internet. Não foi instalado como serviço na máquina do usuário nesta tarefa.

## Publicação e retorno

O Construtor gera publicações a partir de seu estado, arquivos e diário, não de métricas digitadas no dashboard. `.opera/envios` guarda a fila; envios confirmados são movidos para `confirmados`. Esse diretório contém dados internos e deve ficar fora do Git e dentro da política de backup/retenção da solução.

O conector `studio.ts` reutiliza o gerador de snapshot `portal.ts` da origem, preservando personas, corpus provisório e achados de revisão. Markdown de `.opera/artefatos` não é publicado por padrão: exige `publicarDocumentos: true` no manifesto e revisão da audiência. O runtime gerado está em `construtor@5`; a proteção do corpus em construção permanece ativa.

O servidor recebe `POST /api/opera/projetos/<slug>/conexao`: `eventoId`, `construcaoId`, `snapshot`, `artefatos` e `diario`. Confere identidades, hash do conteúdo, cadeia do diário e proposta correspondente. Um evento repetido com conteúdo igual é idempotente; conteúdo diferente ou estado antigo é conflito. Publicação e histórico são gravados na mesma transação.

O MCP tenta sincronizar após cada chamada ligada a uma pasta com manifesto. O worker contínuo também percebe mudanças feitas por CLI e outras ferramentas. Sem credencial ou rede, a fila não é descartada. Alterações do diário registram uma publicação local; alterações avulsas de arquivos são percebidas no próximo ciclo.

Uma decisão identifica publicação, proposta e hash, com pessoa vinda da sessão e motivo. O Construtor só a aplica se a proposta e o conteúdo ainda coincidirem. Resultados: `pendente`, `aplicada`, `conflito`. Repetir uma confirmação não duplica uma aprovação. O painel mostra o último contato; após 15 minutos sem contato, pede verificação (não afirma que o processo morreu).

O publicador manual `scripts/opera-publicar.mjs` usa `.opera/painel.json` e o mesmo histórico, sem gerar aprovações. O antigo PATCH sem identidade retorna 410: atualizar integrações antigas antes da ativação. Não misturar publicações manuais e worker concorrentes da mesma construção sem coordenar a fonte autoritativa; um envio antigo fica bloqueado para investigação.

## Ponte com o schema `opera`

Quando o Cérebro já existe **no mesmo banco**, informar o ID da construção na página de conexão. O vínculo confere os slugs da Venture e do processo. O diário é espelhado em `opera.construcao_entrada` junto da publicação; divergência de hash aborta a transação. A ponte não recria processos nem substitui o restante do schema de conhecimento.

Se o Cérebro real estiver em outro banco, esta ponte transacional não basta. É necessário configurar ingestão entre os ambientes; não inventar IDs nem copiar credenciais de produção para os operadores. A infraestrutura real precisa ser confirmada antes do rollout.

## Construtor: garantias e limites

- Executor e sombra têm estado persistido em arquivos privados ao lado do registro. Reabertura recupera pendências, agenda, revisões e deduplicação. Há exclusão entre escritores do mesmo estado.
- Uma chamada externa com resultado desconhecido permanece incerta e não é repetida automaticamente. Reconciliação exige pessoa e evidência; isso não é promessa de execução exatamente uma vez em todo serviço externo.
- A persistência é local: requer disco durável, backup e supervisor. Não é uma fila distribuída ou coordenação entre máquinas.
- Saída fora do catálogo ou confiança inválida é defeito separado da abstenção e reprova o ensaio.
- Graduação consulta apuração no registro e a política medida. Checksum sozinho não prova origem nem autentica pessoas; o runtime e seu registro continuam dentro da fronteira confiável.
- `calibrar()` seleciona o limiar em um conjunto e avalia em outro sem sobreposição. Mede política de decisão seletiva, não transforma scores em probabilidades calibradas. O limiar 0.8 sem avaliação permanece explicitamente de smoke test; não é evidência de produção.
- `prepararRelease()` vincula templates, corpos, testes e prompts ao ensaio e à verificação. Modo autônomo exige calibração correspondente ao modelo/prompt; modo assistido não concede autonomia. Preparar release não faz deploy nem libera operação por conta própria.

Essas mudanças afetam novos runtimes gerados. Sistemas já gerados, inclusive OASIS, precisam de regeneração e comparação revisadas; não foram sobrescritos automaticamente.

## Testes reproduzíveis

- Studio: `npm run test:opera`, `npx tsc --noEmit`, build com ambiente configurado.
- Construtor: `npm test`, `npm run typecheck`.
- PostgreSQL: `psql -v ON_ERROR_STOP=1 -f tests/opera.sql` **somente em banco vazio de teste**. Cria fixtures, testa idempotência, conflitos, privilégio, compromisso e ponte com Cérebro.
- Navegador: backend `npx tsx tests/opera.mock.ts`; Next na porta 3100 com Supabase fictício `http://127.0.0.1:54329`; depois `node tests/opera.browser.mjs`.
- Integração dos dois repositórios: com os mesmos serviços locais, `CONSTRUTOR_REPO=/caminho/opera-construtor npx tsx tests/opera.e2e.ts`. Usa rotas Next e Construtor reais, persistência HTTP simulada; PostgreSQL é testado separadamente.

## Critérios do piloto real

Conectar OASIS e uma segunda construção com seus dados autorizados; conferir identidade e audiência; publicar um artefato; um revisor decide; o worker confirma; verificar que versão alterada é recusada; reiniciar worker e executor; conferir recuperação e backup; aceitar uma versão do compromisso comercial. Só então ampliar para os demais projetos.

Não confundir código testado com rollout concluído. Credenciais reais, implantação, vínculo da OASIS, casos de calibração, responsáveis e política de recuperação precisam existir no ambiente da operação.

## Verificação local — 10/09/2026

- Studio: 10 testes aprovados, TypeScript e build aprovados (variáveis fictícias locais).
- Construtor extraído: 96 testes aprovados e TypeScript aprovado.
- Origem OPERA: 245 testes aprovados, 11 ignorados pela suíte, nenhum reprovado; TypeScript aprovado. Workbench compilado como pré-requisito dos testes de acordo.
- Paridade da extração conferida. Corrigidos os imports do comando de painel no extrator; mantidos personas, papéis e modo de corpus provisório da origem.
- Fluxos ponta a ponta: publicação, aprovação, retorno ao diário, repetição sem duplicação, conflito de versão e aceite comercial.
- Banco PostgreSQL isolado: migrações, idempotência, permissões, conflitos, compromisso e ponte do Cérebro aprovados. Não substitui a validação do schema real do Supabase.
- Navegador desktop/mobile: autenticação, portal, conexão, colheita, criação e links históricos OASIS aprovados.

Alterações locais nas branches `codex/opera-portal` (Studio) e `codex/opera-integracao` (origem e extraído). Sem push, implantação ou migração de produção. A correção de tipagem do parâmetro opcional `raioKm` no Caçador preserva o comportamento e permite validar a origem inteira.
