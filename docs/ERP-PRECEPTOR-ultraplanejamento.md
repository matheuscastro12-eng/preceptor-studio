# ULTRAPLANEJAMENTO · ERP do PRECEPTOR! Venture Studio

Blueprint de construção. Versão 1.0 · Junho 2026 · Base de verdade: `preceptor-studio` (Next.js 14 + Supabase + Anthropic + Stripe + Meta/GA).

---

## 1. Sumário executivo

O ERP do PRECEPTOR! não é um sistema novo. É a promoção do app `preceptor-studio` atual a sistema operacional do studio, pela introdução de uma única entidade central, a **Venture**, que segue cada conta do lead à participação societária. Hoje a operação vive espalhada entre o CRM próprio, planilhas, decks do Adobe Express e a cabeça do Matheus. Falta visão única de cada venture, do financeiro consolidado das três camadas de receita, do portfólio de equity e do custo real de IA e infra por projeto. A aposta central: não reescrever nada, estender o que já existe e provar a tese com o MVP mais magro possível, porque o próprio ERP é o melhor case comercial do studio. Um studio que vende IA com engenharia humana precisa de um sistema interno onde a IA faz trabalho real e mensurável.

- **Objeto central novo: `ventures`.** Acima de `clients` e `studies`, agrega leads, engagements, receitas, equity e custos. Tudo o mais liga por `venture_id`.
- **MVP brutalmente magro (Onda 1):** `ventures` + `studies.venture_id` + `time_entries` + espelho mínimo do Stripe + custo de IA automático + cabeçalho de 4 números. Nada além disso prova a tese.
- **Cortes deliberados:** sem cap table de 3 tabelas, sem `engagements` separada, sem `invoices`/`payments`/`subscriptions` paralelas ao Stripe, sem `audit_log` por trigger, sem portal multi-tenant. Tudo isso é Onda 2+, guiado por dor concreta.
- **Build no diferencial, buy no commodity:** venture core, financeiro de 3 receitas, custo de IA e copiloto são build. Gateway (Stripe), e-sign (Clicksign), NF-e (contador) e automação (n8n) são buy.
- **Regra contábil dura:** caixa realizado nunca se mistura com valor de papel (equity). DRE e Forecast consolidam one-shot mais MRR. Equity vive em dashboard separado, marcado a fair value.

---

## 2. Contexto e a dor

O modelo de negócio do studio tem três camadas de receita que coexistem na mesma conta: Estudo Estratégico pago (R$3-5k), Execução Completa (R$8-25k) e Participação Estratégica (equity 5-20% mais MRR de manutenção). O ciclo de uma conta é `lead → diagnóstico → estudo → proposta → execução → manutenção → equity → encerrada`.

A máquina de aquisição já está em produção e funciona: diagnóstico público grátis no preceptorstudio.com (quiz, score por IA, estudo que vira lead), landing de automação, tracking Meta Pixel mais CAPI mais GA, Stripe para conta vitalícia, e um CRM próprio com leads (origem, UTM), studies, score de lead, geração de estudos com Claude e abas Financeiro (DRE e Forecast).

A dor não é a aquisição. É a **falta de visão única depois do lead**. Quando um lead vira cliente, o controle se fragmenta. Onde está a margem real do projeto Sal Express, somando horas e custo de IA? Qual venture consome mais token este mês? Qual o valor marcado do portfólio de equity? Quais parcelas vencem? Qual deal esfriou parado na proposta? Nenhuma dessas respostas existe em um lugar só. O ERP fecha esse buraco sem desmontar o que já roda.

---

## 3. Visão do produto

O ERP é o sistema operacional do studio: um eixo único onde toda venture é visível do primeiro toque do lead até a posição societária, com o financeiro consolidado, o portfólio de equity, os custos por projeto e a alocação do time pequeno em um só lugar.

Três princípios de produto governam o desenho:

1. **Venture como objeto central, não cliente nem deal.** A `studies` atual mistura artefato (o estudo) com deal (o projeto). O ERP introduz um eixo acima dela. Cada venture acumula simultaneamente one-shot, MRR e equity, e tem P&L próprio.
2. **IA-native de verdade, não plugin.** A IA é insumo de produção, presente em três camadas: geração de artefatos (já existe), copiloto de leitura sobre os dados, e enriquecimento/score. Regra de ouro transversal: a IA gera rascunho e explica, o humano aprova o que vira verdade financeira ou societária. Números duros saem de cálculo determinístico e auditável. A IA narra, prioriza, recomenda. Não inventa o número que vai pro DRE.
3. **Cada peça é demonstração comercial.** O ERP rodando na própria casa é o produto que o studio vende. Construir o ERP é construir o melhor case do PRECEPTOR!.

---

## 4. Modelo de dados

Princípio: **não reescrever**. O núcleo (auth, RBAC via `profiles`/`is_active_member()`, `clients`, `studies`, finance, `leads` mais UTM, `notifications`, `nda_signatures`, `client_portal_tokens`) já existe, interligado por FKs e RLS. O ERP adiciona a camada de venture como eixo, e nada além do necessário para a onda corrente.

### Entidade central nova: `ventures`

| coluna | tipo | nota |
|---|---|---|
| `id` | text PK `gen_random_uuid()::text` | padrão do repo |
| `client_id` | FK `clients(id)` | reusa `clients` como pessoa/contato |
| `name`, `slug` | text | ex. "Sal Express", "densi" |
| `stage` | text check | `lead`→`diagnostico`→`estudo`→`proposta`→`onboarding`→`execucao`→`manutencao`→`equity`→`encerrada` |
| `health` | text | `verde`/`amarelo`/`vermelho` |
| `lead_id` | FK `leads(id)` | rastreia origem e CAC |
| `referred_by_venture_id` | FK `ventures(id)` nullable | fecha o loop de indicação |
| `owner_team_key` | text check (7 nomes) | responsável |
| `layer` | text | enum `estudo`/`execucao`/`manutencao` no MVP, no lugar de tabela `engagements` |
| `mrr_brl` | numeric nullable | MRR ativo, leitura espelhada do Stripe |
| `stripe_subscription_id` | text nullable | espelho mínimo |
| `equity_pct`, `fair_value_brl`, `equity_status` | numeric/text nullable | 3 colunas resolvem equity por 18 meses |
| `created_at/updated_at` | tz | trigger `set_updated_at` |

Note o estágio `onboarding` entre proposta e execução: é onde deals ganhos travam (assinatura, briefing, acesso, setup de repo/infra). Modelar como estágio mais um checklist por venture, não como módulo.

### Reúso direto, sem tabela nova

- **Pipeline:** reusa `leads` (status `novo→ganho/perdido`, `priority_score`, `estimated_value`, `diagnostic_*`, UTM, `funnel_events`, `funnel_summary()`). `leads` é topo de funil, `ventures.stage` é meio e fundo. Não criar tabela de pipeline.
- **Entregáveis:** já existem em `studies.output_md`/`brand_brief_md`/`commercial_plan_md`/`internal_thesis_md`, `output_versions`, `audit_reports`, `study_files` (com `extracted_text`), `mood_boards`, `market_research`.
- **Execução:** `tasks` (sprint, milestone, depends_on, assignee, estimated_hours).
- **Financeiro:** `study_pricing` (pricing_model fixed/recurring/equity/mixed), `transactions`, `pricing_installments`, `finance_categories` (já tem "Ferramentas (IA/SaaS)" e "Infraestrutura").
- **Proposta:** no MVP, `study_pricing` mais coluna `deck_url`. Não criar tabela `proposals`.

### Colunas novas em tabela existente

`studies.venture_id` (FK), `tasks.venture_id` (FK nullable, para tarefas que não nascem de estudo). Migração leve: 1 venture por client existente.

### Tabelas novas (mínimas)

- **`time_entries`** (Onda 1, coração da margem): `profile_id` FK, `venture_id` FK, `task_id` FK nullable, `hours` numeric, `entry_date`, `hourly_cost_brl`, `notes`. Sem isso a margem real é chute. Manual e brutalmente simples: horas por venture por semana.
- **`cost_entries`** (Onda 1, só IA no início): `venture_id` FK, `study_id` FK nullable, `cost_type` (`ia_anthropic` no MVP; depois `infra`, `saas`, `freelance`), `amount_brl`, `tokens_in`/`tokens_out`, `model`, `incurred_at`. **Requisito, não opção:** um job lê `studies.generation_metadata` (já guarda modelo, tokens, custo) e popula custo por venture. Custo de IA é o único custo que vale automatizar. Infra e freelance entram como linha em `transactions` com `venture_id` até doer.
- **`media_spend`** (Onda 1 leve): `channel`, `month`, `amount_brl`. Campo manual mensal de gasto por canal. Sem ele, CAC é métrica órfã. Automatizar via API da Meta é Onda 3.
- **`venture_events`** (Onda 2): timeline de negócio (lead criado, estudo entregue, proposta enviada, contrato fechado, equity registrado, estágio mudado com timestamp). Alimenta a visão única e o cálculo de tempo-em-estágio (velocity). Substitui `audit_log` no uso interno.
- **`cap_table_entries`** (Onda 3, só quando houver 2+ posições reais): `venture_id` FK, `holder_name`, `holder_type` (`studio`/`founder`/`pool`/`investor`), `pct`, `share_class`. Antes disso, as 3 colunas em `ventures` bastam.

### O que NÃO modelar agora

`engagements` separada (use `ventures.layer` mais coluna; só quando execução e manutenção faturarem em paralelo de verdade), `proposals`/`contracts` como tabelas (use `study_pricing` mais `deck_url` mais `nda_signatures`; e-sign guarda só `esign_envelope_id` mais `signed_at` em coluna), `invoices`/`payments`/`subscriptions` (Stripe é fonte de verdade; espelhe o mínimo), `portfolio_snapshots` (calcule on-the-fly; cron só quando lento), `audit_log` por trigger (adiar com o portal externo).

### RLS e perfis

Replicar o padrão existente, sem mecanismo novo.

- **Tabelas internas do ERP** (`ventures`, `time_entries`, `cost_entries`, `media_spend`, `venture_events`): `enable row level security` mais policy `for all to authenticated using (public.is_active_member())`, igual a `studies`/`tasks`. Service role faz bypass nas rotas server (webhook Stripe, cron, geração IA).
- **Equity (sensível):** colunas de equity em `ventures` e a futura `cap_table_entries` restritas a `owner`/`admin` via `exists (select 1 from profiles where id=auth.uid() and role in ('owner','admin'))`, espelhando `workspace_settings`. Cap table não é visível a `member`.
- **Tabelas só-server** (espelho Stripe bruto, se houver): RLS ligado sem policy, padrão de `invites`/`nda_signatures`/`client_portal_tokens`.
- Multi-tenant real não é necessário (uso interno). Manter RBAC por papel.

---

## 5. Módulos

Objeto central: a Venture. Cada módulo estende o app, não cria sistema novo.

| Módulo | O que faz | IA | Reusa o que existe? |
|---|---|---|---|
| **M1 · Aquisição & Diagnóstico** | Captura e qualifica topo de funil; lista e ficha de lead, funil por origem | Score híbrido, enriquecimento, estudo automático do quiz | `leads`, `leadScore.ts`, `leadEnrich.ts`, `funnelData.ts`, Meta CAPI, GA, diagnóstico público. **Já existe** |
| **M2 · Pipeline & Propostas** | Conduz lead a estudo/execução fechados; pipeline por estágio, builder de proposta | Redação de proposta a partir do diagnóstico, sugestão de preço por arquétipo | `dashboardData.ts` (stageProbability), prompts. **Parcial.** Falta e-sign (buy Clicksign) |
| **M3 · Studio de Entregáveis** | Geração assistida dos docs do estudo; editor, versões, export PDF/deck | Gera Estudo, Brand brief, Plano comercial, Tese, DRE+Forecast, Plano de execução | `gemini.ts` (wrapper Anthropic), 18 prompts, `output_versions`, `pdfClient.ts`, portal. **Núcleo, existe** |
| **M4 · Projetos & Execução** | Constrói por sprints e marcos; Kanban, cronograma, auditorias | Quebra do plano em tarefas, geração de auditoria técnica | `tasks`, Kanban, `audit_reports`, APIs `tasks/*`. **Existe** |
| **M5 · Financeiro & Faturamento** | Consolida 3 camadas, separa caixa de papel; DRE, Forecast, contas a receber, MRR | Classificação de transações, projeção de fluxo | `study_pricing`, `transactions`, `pricing_installments`, `finance.ts`, `financeAnalytics.ts`. **Embrião.** Falta Stripe (buy) |
| **M6 · Portfólio de Equity** | Posição como ativo; % studio, fair value, vesting, dashboard de carteira | Leitura de termos, alerta de vesting, marcação assistida | 3 colunas em `ventures` no MVP. **Criar leve** |
| **M7 · Custos & Margem** | Margem real por venture; IA mais infra como insumo | Atribuição de tokens via `generation_metadata` | `study_pricing`, `getMarginByStudy`. **Criar** |
| **M8 · Time & Alocação** | Capacidade e horas por venture; ventures por FTE | Sugestão de alocação, alerta de sobrecarga | `time_entries` (novo), `profiles`. **Parcial** |
| **M9 · BI / Dashboards** | Visão única: serviços mais carteira; receita por camada, MRR, CAC | Resumo executivo automático, anomalias | `dashboardData.ts`, `notifications`, cron `daily-digest`. **Parcial** |
| **M10 · Base de Conhecimento** | Memória por venture; ADRs, auditorias, runbooks, contratos | Busca semântica, runbook das entregas | `study_files` mais `extracted_text`, `audit_reports`. **Onda 3** |

---

## 6. Arquitetura técnica

**Decisão 1, estender o app atual.** Recomendação firme: estender o `preceptor-studio` no mesmo projeto Supabase. O núcleo do ERP já está construído e interligado. App separado duplicaria auth, RBAC e modelo financeiro, e exigiria sincronização entre bases. App separado é o anti-padrão número um. Organização de código: route group `app/(erp)/` reaproveitando `lib/finance*`, `dashboardData.ts`, `apiAuth.ts`. Migrations em `db/*.sql`, idempotentes, numeração sequencial estrita (o repo roda manual no SQL Editor, ver `db/README.md`).

**Decisão 2, auth e perfis.** Manter Supabase Auth mais `profiles` (owner/admin/member/pending) mais `invites`. Para cliente, não dar role interno: estender o padrão já existente de `client_portal_tokens` (token mais NDA mais RLS) para um portal read-only por venture. Acesso externo por token assinado, nunca por assento no RBAC interno. Portal só na Onda 3, quando houver cliente/investido logando.

**Decisão 3, multi-tenant não, venture-as-soft-tenant.** O studio é single-tenant interno. Não introduzir multi-tenancy real (custo de RLS por org, JWT claims) sem cliente externo pagante do ERP. `venture_id` em todas as tabelas operacionais dá o isolamento de leitura do portal sem o peso. Se um dia vender o ERP a terceiros, aí sim avaliar `org_id`. É outro projeto.

**Decisão 4, integrações.**
- **Stripe** (build novo, fonte de verdade de caixa recorrente): assinaturas para MRR e payment links para one-shot. Espelhar o padrão best-effort de `metaCapi.ts`. Webhook em `app/api/webhooks/stripe/` que escreve a `transaction` inflow e atualiza `ventures.mrr_brl`/`stripe_subscription_id`. Idempotência por `stripe_event_id` único (evita parcela dupla). O ERP reconcilia, não reimplementa cobrança.
- **Anthropic** (estender): wrapper já existe, com fallback Sonnet para Haiku. Registrar custo por venture em `cost_entries` lendo `generation_metadata`. Fecha o loop custo para margem.
- **Meta/GA** (manter): `metaCapi.ts` mais GA4 instrumentados. Ligar `funnel_events` a `venture_id` para CAC ligado a receita realizada.
- **Automação** (buy, n8n via webhook): não codar orquestração interna. Expor webhooks de eventos e deixar n8n para periféricos (Slack, e-mail). E-mail transacional no Resend já existente.
- **Custo de infra** (Vercel/Supabase): sem API limpa de custo por projeto. Capturar como linha em `transactions` com `venture_id`. Não construir digitação mensal que ninguém faz.

**Decisão 5, eventos e auditoria.** Introduzir `venture_events` (timeline de negócio) que alimenta a visão única e dispara webhooks para n8n. `audit_log` forense por trigger fica adiado: só quando o portal por venture expuser dados a terceiros. Para uso interno de 1-2 pessoas, `venture_events` basta.

**Decisão 6, IA nativa em três camadas.** (1) Geração, já existe, com prompts versionados. (2) Copiloto contextual: agente com leitura via funções server-side (nunca SQL livre) sobre `financeAnalytics.ts` e `dashboardData.ts`. Construir só após dados limpos, senão responde lixo com tom confiante. (3) Score determinístico como base auditável, IA como camada de explicação. Toda chamada grava custo, com rate limit (`rateLimit.ts` já existe) e cap por sessão.

**Riscos técnicos:** drift de schema (mitigar com numeração estrita), idempotência de webhook Stripe, bypass de `service_role` (centralizar em `apiAuth.ts`, nunca expor ao client), custo de IA sem teto (a própria métrica de custo por projeto é a defesa).

---

## 7. Diferenciais IA-native

Organizados por prioridade. P0 tem base no repo.

**P0 · Geração de artefatos comerciais por Claude (formalizar).** Wrapper e 18 prompts já existem. Fechar o ciclo: do registro único da venture, gerar com um clique e versão rastreável a proposta/deck, o DRE mais Forecast, a Tese, e o **status report mensal do cliente** (a IA lê tarefas concluídas, marcos e transações e gera o relatório). O status report é o que mais economiza tempo do Matheus e o que mais impressiona o cliente. Cada artefato guarda `generation_metadata`, que alimenta o custo por projeto.

**P0 · Lead scoring híbrido.** `leadScore.ts` determinístico mais leitura qualitativa da IA com justificativa em linguagem natural. A IA explica e prioriza, o determinístico decide o número. Nunca score 100% black-box, porque o Matheus precisa defender a priorização.

**P1 · Previsão de fechamento.** Evoluir `stageProbability` para receita esperada 30/60/90d (probabilidade x valor x tempo no estágio). O cálculo é determinístico. A IA narra ("este deal esfriou: 21 dias parado na proposta") e recomenda a próxima ação.

**P1 · Copiloto operacional.** Chat sobre os dados do ERP. "Qual a margem real do Sal Express com custo de IA?", "quais leads quentes não toquei em 7 dias?", "qual venture consome mais token este mês?". É literalmente o produto que o studio vende, rodando na própria casa. Construir só depois dos dados consolidados.

**P2 · Marcação de equity assistida.** Em evento societário, a IA sugere remarcação de fair value com memória de cálculo e fonte. A IA sugere, o Matheus aprova em segundos. Nunca automático. Mantém histórico (quem, quando, por quê). Existe justamente para manter o equity leve.

---

## 8. Roadmap em ondas

A Onda 0 não constrói: é o reconhecimento do que já roda em produção. O MVP real é a Onda 1.

| Onda | Objetivo | Escopo | Gate de saída | Esforço |
|---|---|---|---|---|
| **0 · Base existente** | Reconhecer e estabilizar o que já roda | CRM, diagnóstico público, geradores Claude, finance v2, tracking, Stripe (vitalícia). Numerar migrations, limpar dados | Schema sem drift; dados de leads/studies consistentes | Já feito, só auditar |
| **1 · MVP venture** | Provar a tese: visão única mais margem real | `ventures` + `studies.venture_id` + `tasks.venture_id` + `time_entries` (manual, horas/venture/semana) + custo de IA automático via `generation_metadata` + `media_spend` manual + cabeçalho de 4 números | Toda venture visível do lead à camada atual; margem real de 1 projeto fechando com horas mais IA | 2-3 semanas |
| **2 · Caixa e narrativa** | Conectar cobrança e timeline | Stripe (assinatura mais payment link, webhook idempotente, inflow em `transactions`); `venture_events` (timeline mais tempo-em-estágio); status report mensal por IA; estágio `onboarding` mais checklist | MRR atualiza sozinho do Stripe; velocity por estágio calculável; status report gerado num clique | 3-4 semanas |
| **3 · Carteira e dashboards** | Equity visível e 3 telas | Dashboard de equity (3 colunas, depois `cap_table_entries` se 2+ posições); 3 telas de BI; alertas via `notifications` (lead frio, parcela vencida, proposta parada, vesting); portal por venture (token mais NDA) | Portfólio marcado lado a lado com caixa; alertas disparando; cliente vê portal | 3-4 semanas |
| **4 · Inteligência** | Copiloto e previsão | Previsão de fechamento ponderada; copiloto operacional (tool-use sobre funções server-side); marcação de equity assistida | Copiloto responde margem/leads/tokens com número certo e link; previsão 90d publicada | 3-5 semanas |

Regra de avanço: cada onda só começa quando a anterior fecha o gate. Onda 2+ é guiada por dor concreta, não por completude de modelo.

---

## 9. Métricas e dashboards do studio

Três telas mais um cabeçalho. Nada de 40 widgets. Cada widget responde a uma decisão do dono, senão não entra.

**Cabeçalho (4 números que contam a história em uma linha):** Caixa do mês (realizado), MRR atual, Receita esperada do pipeline (90d), Valor do portfólio de equity (papel, separado do caixa).

**Tela 1 · Aquisição e funil.**

| Métrica | Por que importa | Fonte |
|---|---|---|
| CAC por canal | origens têm custo e qualidade diferentes | `leads` mais `media_spend` |
| Conversão por etapa | onde o pipeline vaza | `funnel_events`, `dashboardData.ts` |
| Tempo-em-estágio (velocity) | deal frio aparece cedo | `venture_events` |
| Leads quentes não tocados | ação imediata | `leads` mais score |
| Receita esperada 30/60/90d | previsão ponderada | `stageProbability` |

**Tela 2 · Financeiro do studio.** Regra: nunca misturar caixa realizado com valor de papel.

| Métrica | Definição | Fonte |
|---|---|---|
| Receita por fluxo | one-shot vs MRR vs equity, separados | `study_pricing.pricing_model` |
| MRR e churn | recorrência de manutenção | Stripe mais `ventures.mrr_brl` |
| Margem por projeto | receita menos (horas mais IA mais infra) | `transactions` mais `time_entries` mais `cost_entries` |
| Margem por camada | qual das 3 paga a conta | `study_pricing.archetype` |
| Custo de IA por projeto | token Anthropic por venture | `generation_metadata` para `cost_entries` |
| Fluxo de caixa 30/60/90 | já existe | `financeAnalytics.ts` |

Insight central: custo de IA é insumo de produção, entra na margem. É o que separa este ERP de um ERP de agência.

**Tela 3 · Portfólio e capacidade.**

| Métrica | Definição | Observação |
|---|---|---|
| Valor do portfólio | soma das posições a fair value | valor de papel, separado |
| Posições por venture | % do studio, base de custo, última marcação | cap table leve |
| TVPI / DPI direcional | papel vs caixa realizado da carteira | DPI só é real no exit |
| Concentração | 1 cliente = X% do MRR; 1 venture = Y% do valor | risco crítico de portfólio pequeno |
| Utilização do time | horas alocadas vs capacidade, por pessoa e venture | `time_entries` |
| Capacidade vs pipeline | alerta quando pipeline ponderado excede capacidade | gargalo do studio enxuto |

---

## 10. Riscos e anti-padrões

**O que NÃO construir (cortes deliberados):**
- Contabilidade fiscal completa, NF-e, plano de contas, balanço, escrituração. Terceirizar ao contador. O ERP mantém faturamento, fluxo de caixa e DRE gerencial.
- Estoque, MRP, WMS, folha de pagamento. Negócio é serviço, time pequeno. Folha cabe como linha em `transactions`.
- Multi-tenant real. RLS por papel basta. Só repensar se virar produto vendido a terceiros.
- BPM/workflow engine, low-code builder, motor de regras. Over-engineering para 1-5 usuários. Status enum mais funções server-side resolvem.
- Fund administration (Carta-like): vesting automatizado, waterfall, IRR. Cap table leve basta. IRR é métrica inflada; ficar com DPI/TVPI direcional.

**Armadilhas de processo:**
- Não reescrever o que já existe nem migrar de framework. O stack atual é o ativo.
- Não modelar equity como contabilidade pesada. Teste prático: se registrar uma posição ou remarcação leva mais que alguns minutos e alguns campos, o modelo está errado.
- Não construir o copiloto antes dos dados consolidados. Sequência: consolidar, limpar, copiloto.
- Não fazer 40 dashboards. Três telas mais cabeçalho.
- Não modelar `engagements`, `invoices`/`payments`/`subscriptions`, `proposals`/`contracts` e cap table de 3 tabelas no MVP. São Onda 2+ guiada por dor real. Modelar tudo isso de início é completude de modelo, não valor.

**LGPD e dados de clientes:** o diagnóstico coleta dados de leads; tornar efetivo o consentimento (base legal, finalidade, caminho de exclusão/exportação). Dados societários e financeiros de terceiros são sensíveis: RLS por papel mais cuidado especial nas telas de equity. Definir política do que pode ir no prompt da Anthropic (não enviar dados pessoais desnecessários). Ligar acesso a artefatos sensíveis a NDA quando aplicável (`nda_signatures` já existe).

**Dependência de fornecedor único de IA:** tudo depende da Anthropic hoje. O wrapper já abstrai o cliente, o que é bom. Não construir multi-provider agora (over-engineering), mas manter a chamada atrás da interface única para que trocar provedor seja config, não reescrita. A métrica de custo de IA por projeto é a defesa contra custo fora de controle: aparece na margem antes de virar prejuízo.

---

## 11. Build vs comprar

| Módulo / capacidade | Decisão | Razão |
|---|---|---|
| Venture core, CRM, pipeline, artefatos | **Build (estender)** | Já existe, é o diferencial |
| Financeiro: DRE/Forecast/caixa | **Build (estender)** | `finance.ts` pronto; lógica de 3 receitas é sob medida |
| Custo de IA por projeto | **Build nativo** | Insumo de produção, auto de `generation_metadata` |
| Margem por projeto (horas mais IA) | **Build** | Diferencial do studio |
| Timesheet (`time_entries`) | **Build leve** | Manual e simples; destrava margem real |
| Cap table / equity | **Build leve** | 3 colunas; Carta é overkill e caro |
| Cobrança recorrente mais payment links | **Buy (Stripe)** | Nunca reimplementar gateway |
| E-sign de contrato | **Buy (Clicksign/DocuSign)** | Commodity; guardar só `envelope_id` mais `signed_at` |
| NF-e / fiscal | **Buy/terceirizar (contador)** | ERP guarda faturamento e fluxo, não escrituração |
| Automação/orquestração | **Buy (n8n via webhook)** | Webhooks mais que orquestrador interno |
| E-mail transacional | **Buy (Resend, já existe)** | Não recodar |
| BI/dashboards | **Build** | `dashboardData.ts` já agrega |
| Auth/RBAC | **Build (existe)** | Supabase Auth mais profiles mais invites |
| Copiloto / geração / score | **Build nativo** | Insumo de produção, não plugin |

---

## 12. Próximos passos

**Esta semana:**
1. Criar a migration `db/0XX_ventures.sql`: tabela `ventures` (com `layer`, colunas de equity, `referred_by_venture_id`, estágio `onboarding`), mais `studies.venture_id` e `tasks.venture_id`. RLS no padrão `is_active_member()`, equity restrito a owner/admin.
2. Backfill: 1 venture por client existente, ligando studies por `venture_id`.
3. Subir a ficha da Venture em `app/(erp)/ventures/[id]`, reaproveitando os componentes de `studies`.

**Próximas 4 semanas (fechar Onda 1):**
4. `time_entries` mais tela de timesheet manual (horas/venture/semana). Esta é a peça cultural: simples ou ninguém preenche.
5. Job que lê `studies.generation_metadata` e popula `cost_entries` de IA por venture. Requisito, não opção.
6. `media_spend` (entrada manual mensal) e o cabeçalho de 4 números no topo do dashboard.
7. Validar o gate: fechar a margem real de um projeto (Sal Express) somando horas mais IA.

**Próximas 8 semanas (Onda 2):**
8. Integração Stripe: webhook idempotente em `app/api/webhooks/stripe/`, inflow em `transactions`, atualização de `ventures.mrr_brl`/`stripe_subscription_id`.
9. `venture_events` (timeline mais tempo-em-estágio) e estágio `onboarding` com checklist.
10. Status report mensal por IA (lê tarefas, marcos, transações), com proveniência e custo.

O fio condutor de todo o plano: construir o ERP é construir o melhor case comercial do PRECEPTOR!. Cada peça que entra precisa provar valor no mesmo movimento em que prova a tese do studio.

---

Arquivos de referência (verdade de base): `/Users/matheuscastro/Documents/claude projects/preceptor-studio/db/schema.sql`, `/db/finance_migration.sql`, `/db/finance_v2_installments.sql`, `/db/funnel_migration.sql`, `/db/security_v3_portal_rls.sql`, `/lib/finance.ts`, `/lib/financeAnalytics.ts`, `/lib/dashboardData.ts`, `/lib/leadScore.ts`, `/lib/leadEnrich.ts`, `/lib/gemini.ts`, `/lib/apiAuth.ts`, `/lib/metaCapi.ts`, `/db/README.md`.
