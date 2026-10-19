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
