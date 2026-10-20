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
- Pedido falava em "3 passos"; a copy v3 tem 4. Ficaram os 4 (pergunta para o Matheus). **Resolvido no Incremento 3: 3 passos, decisão do Matheus.**
- Strings novas de interface, todas dentro de visuais `aria-hidden`: ANTES, DEPOIS, PILOTO, Aprovar, Aprovado, DEMONSTRAÇÃO e dados fictícios dos mockups (NF 4821, 12 vol., 380 kg, valores R$ fictícios, "Vocês atendem sábado?", "Sim, das 8h às 12h. Quer agendar um horário?", "Aguardando aprovação", "Aprovado pela recepção", "prova.pdf").
- Horário "8h às 12h" é fictício; trocar se puder ser lido como horário real de algum cliente.
- Mockups em 8/7 (1/1 abaixo de 480 px) para caber o extrato em 360 px.
- Desenho do passo 4: barra "depois" ficou só um pouco menor que a linha de base (120 de 148), para ler como comparação e não como resultado prometido.
- 100 spans da grade adicionam cerca de 3 KB de HTML.

## Incremento 3 (19/10/2026): corte de texto
Pedido do Matheus: home com 5 a 6 seções e menos de ~600 palavras visíveis, mantendo todos os visuais novos. Só cortar e condensar a v3. Copy final em `/workspace/marketing/copy-site/copy-site-v4-enxuta.md`, com a contagem por seção.
- [x] Hero: sem o rótulo de topo, subtítulo de 1 frase e microcopy curta. Os 3 mockups saíram de Verticais e viraram cartões no hero, com os rótulos de frente da v3, `data-rv` nos `<li>` (sem isso o loop não toca) e os links de logística e clínicas. A HeroScene ficou.
- [x] Problema: antes/depois + 3 linhas (título da dor + cena da v3), `.lp2-dores--linhas` com 3 colunas em 1024.
- [x] Método: 3 passos (Diagnóstico, IA aplicada, Medição), uma linha cada. `FigRedesenho` e o CSS dele saíram; grade com 3 colunas e faixa PILOTO sobre os passos 2 e 3. "Piloto de 2 a 4 semanas" fica no `quando` do passo 2 porque a faixa é `aria-hidden`.
- [x] Prova: um cartão (99% + grade + uma linha), com as ressalvas da v3.
- [x] FAQ: 3 perguntas (Serve?, Trocar sistema?, E se a IA errar?).
- [x] Formulário: nome, e-mail, WhatsApp, segmento, consentimento LGPD (texto da v3) e aviso de dados de saúde. Saíram Empresa, "O que mais toma tempo hoje?" e a microcopy abaixo do botão. Mesmo endpoint; `/api/leads` intocado.
- [x] Removidos `Servicos.tsx`, `Verticais.tsx` e `Piloto.tsx`, mais o CSS sem uso (`.lp2-frentes`, `.lp2-indice*`, `.lp2-advocacia`, `.lp2-regua*`, `.lp2-piloto*`, `.lp2-lista`, `.lp2-exemplos__rodape`, `.lp2-footer__texto`, `.lp2-form__micro`). `.lp2-vertical*` e `.lp2-verticais__*` ficam porque os cartões do hero usam.
- [x] Nav: Como funciona · Exemplo · FAQ. Rodapé sem o parágrafo de integração.
- [x] Contagem na 3210 (curl, sem script/style/tags, tokens com letra ou número): 1781 → **558** no total e 1671 → **450** só no texto de leitura (sem `aria-hidden`/`hidden`).
- [x] Varredura: sem travessão e sem números antigos. O único "não é" é a pergunta do FAQ da v3 ("não é de logística nem de clínica"), sem contraste.
- [x] Lint sem avisos, tsc exit 0. Build não rodado (dev server da 3210 usa `.next`).
- [ ] Screenshots 1440/390 com o Matheus. Olhar o comprimento do hero no celular: texto, HeroScene e 3 mockups antes do Problema.

### Atenção
- CRM: leads da home chegam com `company` nulo e `mensagem`/`notes` vazios (Empresa e processo saíram). `category` segue preenchido pelo Segmento, então `computeScoreFields` e o resumo continuam recebendo o setor.
- Duas sessões (09 e 8c) rodaram este corte em paralelo no mesmo working tree. Combinaram por mensagem: a 09 parou e a 8c fez o commit. Hero, CtaLink, Problema e o bloco Problema do `home.css` são da 09; o resto é da 8c.

## Incremento 4 (19/10/2026): redesenho "Agente em destaque"
Pedido do Matheus: o visual anterior não agradou. Direção Linear + Attio, com toques de n8n e Sierra. Plano em `plano.md` (Incremento 4). Texto da v4 enxuta, só cortado.
- [x] Hero: título da v4 em 3 linhas, uma linha de apoio (subtítulo da v4 cortado em "parte repetitiva"), botão primário navy (retângulo, sem pílula) + "Ver como funciona" (fantasma, leva a `#metodo`), microcopy da v4.
- [x] Palco do agente (`HeroPalco.tsx`, `visuais-hero.css`): uma janela grande em perspectiva leve (desktop), base sumindo no fundo; abas Logística / Financeiro / Clínicas (tablist com setas, Home/End). Em cada aba: entrada chega, o agente preenche os campos, conferência ganha os vistos, "Aguardando a equipe" e o selo teal "Aprovado pela equipe". Auto-play pela barra de progresso da aba (9 s), só com o palco na tela e sem o mouse em cima; o primeiro clique ou tecla desliga. Reduced motion: sem barra, sem troca, estado final. Painéis inativos com `hidden`. Selo DEMONSTRAÇÃO e dados fictícios dos mockups antigos.
- [x] Faixa de prova (`FaixaProva.tsx`): frentes (rótulos do Segmento + financeiro) e caso anônimo com link para `#exemplos`. Sem números e sem logos.
- [x] Método como fluxo de nós (`Metodo.tsx`, `visuais-metodo.css` reescrito): 3 nós com portas, arestas tracejadas que se desenham na entrada e pacote teal andando em loop de 6 s; dentro do passo 2, mini fluxo "Agente prepara → Equipe aprova" com o nó humano em teal (o único) e anel que pulsa quando o pacote chega. Faixa PILOTO sobre 2 e 3. Texto dos passos igual à v4.
- [x] Prova, FAQ e formulário iguais. `/api/leads` e o payload do formulário intocados.
- [x] Saíram: Problema (`Problema.tsx`, `ProblemaVisual.tsx`), `HeroScene.tsx`, os 3 mockups e `visuais-mockups.css`, `visuais-problema-prova.css` (a parte da prova virou `visuais-prova.css`), o componente `CtaLink` (o arquivo guarda só as constantes), o grão do fundo e o CSS de cena/verticais/dores/CTA de texto.
- [x] Contagem (curl na home, sem script/style/tags, tokens com letra ou número; inclui o `<title>`): **602** no HTML todo, **421** só texto de leitura (sem `aria-hidden` e `hidden`).
- [x] Varredura: sem travessão, sem 1.400/38%/7 de cada 10. "não é" só na pergunta do FAQ.
- [x] Lint sem avisos, tsc exit 0, build exit 0 (`/` estático, 6.26 kB, First Load 102 kB).
- [x] Screenshots (Playwright, `next start`/`next dev` na 3311): 1440 e 390, com e sem reduced motion. Sem rolagem lateral em 390. Auto-play troca de aba em ~9 s, clique para a troca, setas mudam a aba e o foco; com reduced motion fica na 1ª aba com o selo visível.

### Decisões e atenção
- Problema saiu: não estava na lista de seções do pedido, e o palco já mostra o trabalho manual sendo feito.
- "Da marca só o logo P!": ficou o `logo-horizontal.png` (P! + PRECEPTOR!); saíram o grão e a cena abstrata. A marca de caneta ficou no título do hero, do Método e do formulário.
- Strings novas, todas `aria-hidden` dentro dos visuais: etapas do agente (Entrada, Preenchimento, Conferência, Aprovação), títulos das colunas, rótulos de campo, os 3 vistos de conferência por frente, "CT-e pronto", "Baixa proposta", "Resposta enviada", "Aguardando a equipe", "Aprovado pela equipe", "Agente prepara", "Equipe aprova", "Passo humano".
- Strings novas de leitura: "Ver como funciona", "Frentes", "Caso anônimo", "Conciliação de recebimentos em um cliente de logística.", "Ver o caso". Nenhuma promessa nova.
- Pausa do auto-play só com mouse (`pointerType`): no toque não há "leave", e a troca pararia de vez. Sombra da janela com folga dentro da máscara (sem corte reto no desktop).
- Não testado: Safari/iOS real (máscara e `perspective`), leitor de tela real.
