# Checks: landing v2 da home

Revisão de 19/10/2026 (sessão de retomada). Screenshots ficam com o Matheus.

| # | Requisito | Status | Evidência |
|---|---|---|---|
| 1 | Layout e componentes novos (não patch) | ok | `components/marketing/home/*` (18 arquivos + `home.css` escopado em `.lp2`); `page.tsx` só monta as seções |
| 2 | Paleta exata do repo, sem cor nova | ok | 13 hex em `home.css`, todos presentes em `design-tokens.css`, `marketing.css` ou `tailwind.config.ts` (`#E11D48` = `--danger-rose`); rgba só de navy e branco |
| 3 | Logos de `public/brand` | ok | `/brand/logo-horizontal.png` na nav e no rodapé; `p-mark-teal.png` no JSON-LD |
| 4 | Texto literal da copy v3, hero opção 1 | ok, com desvios listados | script compara todo texto JSX e string com a copy: só sobram strings de interface (skip link, aria-label, "Menu/Fechar", "Enviando...", "Aprovado") e 2 mensagens de validação novas ("Escreva o nome da empresa.", "Selecione o segmento.") |
| 5 | Pendências fora ou marcadas | ok | comentários `PENDENTE copy v3` em Problema, Exemplos, Verticais, Piloto, Faq, LeadForm |
| 6 | Sem travessão, sem "não é X, é Y", sem clientes, sem números antigos | ok | grep de `—`/`–`, `1.400`, `38%`, `7 de cada 10`: vazio. Único "não é" é a pergunta literal do FAQ, sem contraste. Casos anônimos como na copy |
| 7 | Animações: reveal, hero, microinterações, transição entre seções | código ok; visual pendente | ver progress.md; screenshots com o Matheus |
| 8 | `prefers-reduced-motion` | código ok; visual pendente | bloco final de `home.css` zera animação e transição, cena do hero parada no estado final, count-up não roda |
| 9 | Contraste 4.5:1, alt, foco de teclado | ok no código | tabela de contraste no plano; `:focus-visible` teal 2px; skip link; cena `aria-hidden`; região viva do form sempre na árvore (corrigido nesta revisão) |
| 10 | Mobile first, sem overflow horizontal em 390 | pendente: screenshot | atenção: marca de caneta é `nowrap`; "uma tela para outra" e "Um processo por vez" ficam perto da largura em 360 a 390 |
| 11 | Form: mesmo backend e campos, Segmento da copy, LGPD | ok | `POST /api/public/automation-lead`, mesmo payload `{contact, mensagem, category, consent, attribution}`; Segmento com as 3 opções da copy (valores aceitos pela API); checkbox LGPD obrigatório |
| 12 | Nota de pendência `/api/leads` e banner de cookies | ok | `LeadForm.tsx` linha 1 |
| 13 | `/api/leads` intacto | ok | `git diff --stat -- app/api` vazio |
| 14 | `npm run lint` | ok | "No ESLint warnings or errors" |
| 15 | `npx tsc --noEmit` | ok | exit 0, sem saída |
| 16 | `npm run build` | ok | exit 0; `/` estático, 5.13 kB, First Load JS 101 kB |
| 17 | Commit local na `lp-v2-do-zero`, sem push, master intacta | ok | um commit com `page.tsx`, `components/marketing/home/`, `docs/landing-v2/` |
