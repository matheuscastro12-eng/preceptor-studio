# Progresso: landing v2 da home

**Tarefa:** refazer do zero `app/(marketing)/page.tsx` com a copy v3, paleta do repo, animada e acessível.
**Restrições:** commit só local na `lp-v2-do-zero`; sem push, PR, merge, deploy; não mexer na segurança de `/api/leads`; sem travessão, sem "não é X, é Y", sem nomes de clientes, sem números antigos.
**Saídas:** `components/marketing/home/*`, `app/(marketing)/page.tsx`, `.eslintrc.json` + devDeps de lint.

## Estágios
- [x] Contexto lido (copy v3, tokens, form, API, referências)
- [x] Lint: repo não tinha ESLint; instalado eslint@8 + eslint-config-next@14.2.35, `.eslintrc.json` core-web-vitals. Baseline: 10 erros `react/no-unescaped-entities` em 3 arquivos fora do escopo (corrigidos por escape, render idêntico).
- [x] Plano (`plano.md`)
- [x] Implementação (worker)
- [x] Revisão (19/10, retomada): código contra plano e copy v3, varredura de texto, lint, tsc e build verdes. Correção: região `aria-live` do formulário não some mais com `display:none` quando vazia.
- [ ] Screenshots 1440/390 e reduced motion: com o Matheus (fora desta sessão)
- [x] Commit local na `lp-v2-do-zero` (sem push)

## Decisões
- Fontes do repo (Bricolage, Instrument Sans, JetBrains Mono) em vez de Fraunces/Hanken/Plex da nota de layout da copy: a tarefa pede a paleta e o design system do repo.
- Pendências inline da copy ficam fora da página (lista em `plano.md`).
- Sem framer-motion na home (peso de bundle); CSS + IntersectionObserver.
- Componentes antigos da home ficam no repo: outras páginas importam `components/marketing/*`.

## Falhas / atenção
- Outra sessão (`preceptor-studio-7c`) estava ativa no mesmo repo e escapou as aspas nos 3 arquivos antes de mim. Mensagem enviada para coordenar.

## Revisão de 19/10 (retomada)
- Lint: sem avisos. tsc: exit 0. Build: exit 0, `/` estático, 5.13 kB, First Load 101 kB.
- Texto: sem `—`, sem números antigos, sem "não é X, é Y". Todo texto visível bate com a copy v3, menos strings de interface e 2 mensagens de validação novas (Empresa, Segmento), que a copy não define.
- Worktree paralelo `preceptor-studio-lp-a` (branch `lp-v2-do-zero-a`, commit 2f25be8) tem outra implementação da mesma tarefa em `components/landing/*`. Não foi tocado. Uma das duas precisa ser descartada.
- Órfãos da home antiga, sem importador agora: `components/ui/digital-serenity-hero`, `ResultsSection`, `ProofSection`, `SegmentsSection`, `HowSection`, `AutomationSection`, `AutomationContactForm`. Ficaram no repo; remover em commit separado se esta versão for a escolhida.
- Para olhar nos screenshots: marca de caneta `nowrap` em 360 a 390; ao recarregar no meio da página, blocos já visíveis somem e voltam com fade.

## Incremento 2 (19/10/2026): home mais visual
Pedido do Matheus: trocar texto por visual onde der, copy v3 literal no texto que fica. Plano em `plano.md` (Incremento 2). Três workers em paralelo, cada um com seu CSS.
- [x] Problema: `ProblemaVisual.tsx`, painel ANTES/DEPOIS (SVG + HTML, loop 9 s, pausado até entrar).
- [x] Método: `Metodo.tsx` virou diagrama de 4 passos (nós, conector, faixa PILOTO sobre 2 a 4, desenho abstrato por passo). `MetodoProgress.tsx` removido; regras antigas do Método saíram do `home.css`.
- [x] Exemplos: cartão FINANCEIRO em largura total, 99 em `clamp(5rem, 12vw, 9rem)`, `ProvaGrade.tsx` (10×10, 99 células cheias no ritmo do CountUp). Contador com largura fixa de 2 dígitos para o "%" não pular.
- [x] Verticais: `MockLogistica.tsx` (romaneio preenche CT-e, Aprovar), `MockFinanceiro.tsx` (extrato concilia linha a linha, baixa proposta com prova), `MockClinica.tsx` (pergunta administrativa, rascunho aguardando aprovação, aprovado e enviado). Selo DEMONSTRAÇÃO em todos.
- [x] CSS novo: `visuais-problema-prova.css`, `visuais-metodo.css`, `visuais-mockups.css` (importados no `page.tsx`). Base de todo elemento novo = estado final; estados iniciais só sob `.js-ready [data-rv]:not(.is-in)` ou em keyframes.
- [x] Lint sem avisos, tsc exit 0, build exit 0: `/` estático, 4.87 kB, First Load 101 kB.
- [ ] Screenshots finais 1440/390 e reduced motion com o Matheus (workers tiraram prints de conferência em 360/1280/1440 no dev server da 3210: sem rolagem lateral, reduced motion mostra o estado final).

### Decisões e atenção
- Pedido falava em "3 passos"; a copy v3 tem 4. Ficaram os 4 (pergunta para o Matheus).
- Strings novas de interface, todas dentro de visuais `aria-hidden`: ANTES, DEPOIS, PILOTO, Aprovar, Aprovado, DEMONSTRAÇÃO e dados fictícios dos mockups (NF 4821, 12 vol., 380 kg, valores R$ fictícios, "Vocês atendem sábado?", "Sim, das 8h às 12h. Quer agendar um horário?", "Aguardando aprovação", "Aprovado pela recepção", "prova.pdf").
- Horário "8h às 12h" é fictício; trocar se puder ser lido como horário real de algum cliente.
- Mockups em 8/7 (1/1 abaixo de 480 px) para caber o extrato em 360 px.
- Desenho do passo 4: barra "depois" ficou só um pouco menor que a linha de base (120 de 148), para ler como comparação e não como resultado prometido.
- 100 spans da grade adicionam cerca de 3 KB de HTML.
