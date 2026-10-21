# Auditoria da LP v2: identidade, taste-skill e referência Xenora

Auditoria de 21/10/2026 da landing (`/`, `/transporte`, `/agro`, `/medicina`) contra a design-taste-frontend
e a referência visual Xenora. Junta três coisas que estavam fora do repo:

1. a parte da LP de `validacao-identidade.md` (base-de-design, proposta v2);
2. o que este PR (#3, `feat/lp-v2-design-taste`) aplicou;
3. a análise da Xenora e o gap da LP contra ela (`xenora-analise.md`, `gap-lp-vs-xenora.md`).

A imagem da Xenora é de terceiros e **não está no repo**. Ela fica em
`/workspace/scratch/base-de-design-proposta/referencias-visuais/xenora-lp.jpg`, só para consulta.

O CRM (C1 a C17, P5, P13, P22 a P25) é outro repo e fica fora deste documento.

## 1. Placar

Medido com `inspect.mjs` da taste-skill (1440, 768 e 390 px), em build local com variáveis falsas.

| Página | Auditoria (`eea9729`) | Antes da Xenora (`1dfdc66`) | Depois da Xenora (este PR) |
|---|---|---|---|
| Home | 15 FAIL, 10 WARN | 6 FAIL, 5 WARN | **1 FAIL, 5 WARN** |
| Transporte | 12 FAIL, 8 WARN | 2 FAIL, 3 WARN | 1 FAIL, 3 WARN |
| Agro | 11 FAIL, 7 WARN | 2 FAIL, 3 WARN | 1 FAIL, 3 WARN |
| Medicina | 12 FAIL, 7 WARN | 2 FAIL, 3 WARN | 1 FAIL, 3 WARN |
| `lint.mjs` nos arquivos da home | | 4 FAIL, 1 WARN | 0 FAIL, 0 WARN |
| `lint.mjs` em `app/(marketing)` + `components/marketing` (inclui CSS antigo que a home não importa mais) | 423 FAIL, 35 WARN | | 350 FAIL, 33 WARN |

**O FAIL que sobra é o banner de cookies.** O `covered-text` aponta "Uma pessoa aprova" e "O que o agente faz no dia a
dia" cobertos: conferido com `elementFromPoint`, quem cobre é o link "Ler a política de privacidade" do banner
(`ConsentManager.tsx`), que é fixo no rodapé da tela. É uma sobreposição de consentimento (LGPD) e fica.

**Os WARN que sobram, com a defesa:**
- `outlined-box`: é a borda do mesmo banner de cookies.
- `no-footage`: não há vídeo próprio nem clipe honesto da operação; a foto do hero também está pendente (§3).
- `off-centre` (75 / 111 px a 1440): a esquerda é a margem do container (a captura conta a barra de rolagem); a
  direita é o fim dos textos em bandeira. Todo bloco começa e termina no mesmo `.mb-wrap`.
- `ragged-edges`: os cards de setor, a galeria e o bento têm texto dentro de cards, cada um com o seu recuo.
- `card-rows` a 390: no celular os 4 cards de setor e os 3 do bento empilham. Cada card tem conteúdo próprio
  (fluxo de UI), sem ícone.

## 2. O que este PR aplicou

### 2.1 Propostas da validação de identidade (§4)

| ID | Proposta | Situação | Commit |
|---|---|---|---|
| P1 | H1 em até 2 linhas | aplicada: "Agentes de IA que sua equipe aprova", 2 linhas a 1440, 768 e 390 | `246db16` |
| P2 | Sem eyebrow | aplicada | `246db16` |
| P3 | Fontes sem CDN | aplicada: woff2 em `public/fonts`, banner em Geist | `d788ab1` |
| P4 | Anonimizar telas de demonstração | **não necessário: os dados de demonstração já são fictícios** | |
| P6 | Sem gradiente | aplicada | `7abe99b` |
| P7 | Sem sombra em repouso | aplicada | `7abe99b` |
| P8 | Sem mono, rótulo em frase normal | aplicada | `ee02d24` |
| P9 | Sem 01/02/03 | aplicada | `ee02d24` |
| P10 | "Por que" sem cartão com ícone | aplicada | `ee02d24` |
| P11 | Sem ícone no título, sem loop, sem mola | aplicada | `246db16`, `eb08285` |
| P12 | Corpo na tinta cheia | aplicada | `1aff7a3` |
| P15 | Segmentos com as regras da home | aplicada | `e9226a7`, `1dfdc66` |
| P16 | 5 tamanhos | aplicada: 14 / 18 / 24 / 48 / 80 px | `1aff7a3` |
| P17 | Nav opaca, sem blur | aplicada | `eb08285` |
| P18 | CTA de 1 a 3 palavras | aplicada: "Agendar diagnóstico" | `ee3b0f3` |
| P19 | Ponto teal nos títulos | aplicada: título numa cor; o "!" teal fica no logo | `eb08285` |
| P20 | Margens iguais | aplicada, e agora com um container só (§2.2) | `eb08285`, `69c185b`, este passo |
| P21 | Fontes mortas | aplicada | `d788ab1` |

### 2.2 Referência Xenora (este passo)

| Item do gap | O que foi feito | Arquivos |
|---|---|---|
| Produto como herói | A tela do hero deixa de ser o JPG da torre e vira HTML com `data-ui`: o fluxo **NF-e recebida → Agente lê e confere → Equipe aprova → CT-e emitido**, com o painel lateral "Aguardando você". Dados fictícios, marcados "Demonstração · dados fictícios". A tela sobe do campo navy e atravessa o corte para o branco | `HeroProduto.tsx`, `xenora.css` |
| A coisa viva | O "Aprovar" do painel funciona: aprova o exemplo, o nó da pessoa vira "Aprovado por Carla às 08:14" e o último vira "CT-e 000.184 emitido". "Corrigir" explica o que acontece. Sem script, a tela aparece parada no estado "aguardando" | `HeroProduto.tsx` |
| H1 | À esquerda, 2 linhas, branco, 80 px, entrelinha 0,98, -0.045em | `MbHome.tsx`, `xenora.css` |
| Linha de apoio | Curta, 2 frases: "O agente faz a parte repetitiva. Uma pessoa da sua equipe decide." | `MbHome.tsx` |
| Ação | Um CTA sólido ("Agendar diagnóstico") com a microcópia dos 30 minutos ao lado. Sai o "Como funciona →" vazado | `MbHome.tsx` |
| Fundo do hero | Navy chapado de borda a borda no lugar da foto (pendente, §3). Saem o P! em contorno do hero e o da caixa de contato | `MbHome.tsx`, `mobbin.css` |
| Cards por setor | As abas viram 4 cards visíveis (transportadoras, clínicas, agro, financeiro) em `#F4F5F7`, larguras 1,7 : 1 e 1 : 1,7, sem borda nem sombra. Cada um tem um fluxo de UI (`data-ui`) com 3 nós: o passo anterior, o passo em foco (teal, ou vermelho `#E11D48` quando diverge) e a pessoa que decide. O fluxo é cortado pela borda do card. Título e texto à esquerda, com link para a página do setor | `Setores.tsx`, `xenora.css` |
| H2 à esquerda, texto à direita | Em setores ("Um agente para cada setor") e em "Começar é simples como 1, 2, 3", com o pé do texto alinhado à última linha do título. No FAQ, título e texto à esquerda e perguntas à direita (antes: título centralizado e lista de 760 px no meio) | `MbHome.tsx`, `xenora.css` |
| Respiro | Seções a `clamp(104px, 12vw, 176px)` (antes 120 px); 72 px do cabeçalho aos cards | `mobbin.css` |
| Container | Um par de margens: 1280 px úteis com 32 px de cada lado (20 px no celular), na página inteira, rodapé e segmentos incluídos (antes 1120 + 24) | `mobbin.css` |
| Menos decoração | Saem os ícones redondos do bento, a pílula do "antes" no bento, o leque do FAQ, as abas com ícone e os fios do rodapé e do aviso do formulário. A bolinha da trilha troca a sombra interna por borda | `MbHome.tsx`, `mobbin.css`, `home.css` |
| Títulos em 2 linhas | Contato: "Onde a sua equipe perde o dia?" (antes 3 linhas). Setores: "Um agente para cada setor" (antes 3 linhas a 390) | `MbHome.tsx` |

Componentes que saíram por não terem mais uso: `Segmentos.tsx` (abas) e `MarcaFundo.tsx` (P! em contorno).

### 2.3 Decisões em aberto do gap (escolhidas pela taste-skill)

| Decisão | Escolha | Por quê |
|---|---|---|
| CTA navy ou teal | **Teal** (`#3BCACE`, texto navy) | A taste manda o acento na ação ("The accent appears on the action", l. 439-440). O campo do hero é navy enquanto a foto não chega, e um CTA navy sumiria nele. Se a foto entrar com céu claro atrás do botão e o teal perder contraste, trocar para navy chapado (está pronto em `.mb-pilula--navy`). Dentro da UI, o botão "Aprovar" é navy, como controle do produto |
| Container 1120 + 24 ou 1280 + 32 | **1280 + 32** | "One grid, one pair of tight margins (16–32px)" e "large things run to the edges" (l. 431-432): a tela do produto e os cards ganham a largura da referência com uma margem só |
| Abas ou cards | **Cards visíveis** | "Write the full content" e "no rows of identical cards" (l. 216-219, 393): os 4 setores ficam à vista, em larguras diferentes, cada um com o seu fluxo. A "coisa viva" (l. 187-192) passa a ser o "Aprovar" do hero, que usa o conteúdo real do produto e funciona no celular |

## 3. Pendências

- **Foto do hero pendente.** Não há foto própria de céu sobre a operação em `public/` nem em `/workspace/marketing`
  (as quatro de `identidade-v3/marca/fotos/` são interiores escuros, sem céu nem arquitetura, e com origem não
  registrada). O lugar está pronto: `.mb-hx__foto` (`data-foto="pendente"`) em `MbHome.tsx`. Especificação:
  `public/fotos/hero-ceu.jpg`, pelo menos 2880 × 1800, céu na metade de cima com área calma à esquerda para o H1,
  assunto do mundo do cliente (galpão, pátio, silo, doca), sem placa, logo, rosto ou nome legível; recorte em
  retrato para o celular. Caminhos: acervo aberto com crédito (`assets.mjs`), foto própria, ou imagem gerada com o
  gasto aprovado. Quando entrar, medir o contraste do H1 e do CTA com o `inspect.mjs`.
- **Dados fictícios do hero e dos cards** (para troca antes do lançamento, se quiser): NF-e 4.512, pedido 2231,
  14 paletes, 12.400 kg, R$ 1.840,00, CT-e 000.184, "Distribuidora Exemplo", "Atacado Modelo", Carla, Júlia,
  Rafael, Marta, embarque 0412, "frete 6% acima", "38 lançamentos / 36 casados".
- **L26:** travessões e verde fora da marca dentro de `compras.jpg` e `clima.jpg`. Sem proposta desde a saída da P4.
- **Textos novos para revisar:** linha de apoio do hero, "Um agente para cada setor" e o texto ao lado, os textos dos
  4 cards, "Um diagnóstico de 30 minutos e um piloto de 2 a 4 semanas, medido no fim contra a linha de base", o texto
  do FAQ e "Onde a sua equipe perde o dia?".
- **CSS antigo:** `sobrio.css`, `tech.css`, `visuais-*.css` e componentes antigos da home não são mais importados
  pela landing, mas continuam no repo e somam a maior parte dos 350 FAIL do lint de pasta.

## 4. Validação da identidade: a parte da LP

Fonte: `validacao-identidade.md` da base-de-design (auditoria de 21/10/2026, commit `eea9729`). Linhas `mb:` são
de `components/marketing/home/mobbin.css` e `home:` de `components/marketing/home/home.css` naquele commit.

### 4.1 Como foi medido
Cópia do commit `eea9729` com `npm ci`, `next build` e `next start` com `.env.local` falso; `inspect.mjs` em 1440,
768 e 390 nas quatro rotas; `lint.mjs` em `app/(marketing)` e `components/marketing`. Node 20 com
`--experimental-websocket`, Chrome 155. O banner de cookies aparece em todas as capturas.

### 4.2 Decisões do Matheus (21/10/2026)
- **D1. LP e CRM mantêm identidades separadas.** A LP v2 (navy, teal, Geist, logo PNG) vale para marketing e
  páginas; o CRM v3 vale para o app. Nenhum puxa paleta, fonte ou logo do outro. Por isso a **P14** (unificar a marca)
  saiu da lista.
- **D2. P4 não é necessária.** Os dados das telas de demonstração da LP já são fictícios e as telas estão marcadas
  "Demonstração". A regra de anonimato continua: dado de demonstração é fictício, nunca tirado de cliente.

### 4.3 O que já passava
- Botão real na primeira tela, em pílula (redondo, decidido uma vez).
- Um H1 em tamanho de display, Geist 600, tracking -0.045em, `text-wrap: balance`.
- Geist Sans e Geist Mono self-host pelo pacote `geist`.
- Um fundo, uma tinta, um acento: branco, `#0B0D1F`, teal `#3BCACE`; teal sobre navy 9,74:1; navy fora da família violeta.
- 7 imagens na home (telas de demonstração).
- Motion com curva expo, `prefers-reduced-motion` respeitado, sem preloader nem sequestro de rolagem.
- Foco visível (teal 2 px, offset 3); erro `#E11D48` a 4,7:1.
- Sem frase pronta no lint.

### 4.4 O que falhava (L1 a L26) e onde está hoje
| # | Regra | O que o código fazia | Hoje |
|---|---|---|---|
| L1 | Título em até 2 linhas | H1 de 3 frases, 3 a 5 linhas | resolvido (P1); todos os títulos da home em 2 linhas |
| L2 | Sem eyebrow | pílula teal acima do H1 | resolvido (P2) |
| L3 | Sem mono fora de código | Geist Mono em selos e rótulos | resolvido (P8) |
| L4 | Sem rótulo em caixa alta espaçada | 10 rótulos | resolvido (P8) |
| L5 | Sem 01/02/03 | passos numerados | resolvido (P9) |
| L6 | Sem gradiente | 6 preenchimentos, 8 textos | resolvido (P6) |
| L7 | Sem sombra em repouso | tela do hero, celular, cenas | resolvido (P7); sombra só dentro de `data-ui` e no banner |
| L8 | Sem fio fino | barra da janela, aviso do formulário, rodapé | resolvido neste passo |
| L9 | Sem fileira de cards com ícone | "Por que" com ícone | resolvido (P10); bento e setores sem ícone |
| L10 | Sem emoji | "✓" na cena | resolvido |
| L11 | Nada abaixo de 13 px | selo 9 px, mono 11 px | resolvido (P8, P16) |
| L12 | Nada sobre um título | títulos cobertos | é o banner de cookies (conferido) |
| L13 | 2 famílias, sem CDN | Google Fonts, banner em Instrument Sans | resolvido (P3) |
| L14 | Corpo na tinta cheia | `#5B6072` | resolvido (P12) |
| L15 | Contraste 4,5:1 | rótulos a 4,3:1 e 3,22:1 | resolvido (P12) |
| L16 | Até 5 tamanhos | 17 tamanhos | resolvido (P16) |
| L17 | Margens iguais | 147 / 205 px; seção com 988 px vazios | resolvido (P20, container único) |
| L18 | Sem glass | nav com blur | resolvido (P17) |
| L19 | Sem overshoot | mola `(0.34,1.56,0.64,1)` | resolvido (P11) |
| L20 | Loop para fora da tela | ícones do H1, P! flutuando, cenas | resolvido (P11); P! saiu neste passo |
| L21 | Sem ícone em quadrado colorido | ícones do H1 | resolvido (P11) |
| L22 | Título numa cor | ponto final teal | resolvido (P19) |
| L23 | Botão em 1 a 3 palavras | "Quero meu diagnóstico de 30 min" | resolvido (P18) |
| L24 | Segmentos: o que é e com imagem | corpo 14,5 px, 0 imagens | resolvido (P15) |
| L25 | Anonimato | placas, cidades e nomes nas telas | resolvido por decisão (D2): dados fictícios e marcados |
| L26 | Sem travessão | travessões em `compras.jpg` e `clima.jpg` | pendente, sem proposta |

### 4.5 Propostas da LP
P4 e P14 não estão na lista acima por decisão (§4.2). Os outros IDs mantêm o número:

| ID | Antes | Depois proposto | Situação |
|---|---|---|---|
| P1 | H1 de 11 palavras, 3 a 5 linhas | título em 2 linhas com as palavras do código | aplicada |
| P2 | pílula "Agentes de IA para operações" | removida | aplicada |
| P3 | `@import` do Google Fonts | sem `@import`; banner em Geist | aplicada |
| P4 | refazer as telas de demonstração | **não necessário: os dados de demonstração já são fictícios** | não necessário |
| P6 | gradientes | campos chapados | aplicada |
| P7 | sombras em repouso | sem sombra, degrau de tom | aplicada |
| P8 | Geist Mono em caixa alta | Geist Sans em frase normal; `data-ui` no cromo | aplicada |
| P9 | `01/02/03` | `<ol>` sem número decorativo | aplicada |
| P10 | 3 cartões com ícone | lista em tipo grande | aplicada |
| P11 | ícones no H1, loops, mola | título sem ícone, assinatura que roda uma vez, `--ease-out` | aplicada |
| P12 | corpo `#5B6072` | corpo em `--mb-tinta` | aplicada |
| P15 | segmentos com corpo 14,5 px e 0 imagens | regras da home | aplicada |
| P16 | 17 tamanhos | 5 passos | aplicada |
| P17 | nav navy a .92 com blur | navy opaco | aplicada |
| P18 | CTA de 6 palavras | "Agendar diagnóstico" | aplicada |
| P19 | ponto teal em todo título | decidir | aplicada: título numa cor |
| P20 | margens 147 / 205 | um par de margens | aplicada |
| P21 | Caveat carregada sem uso | remover | aplicada |

## 5. Referência Xenora: análise (resumo de `xenora-analise.md`)

Referência indicada pelo Matheus em 21/10/2026 como primária para páginas da PRECEPTOR!: uma LP de automação
("Xenora") em desktop, provavelmente conceito ou template (o próprio texto cita outro nome). Serve como composição,
não como prova de conversão. **Da Xenora vem estrutura, ritmo e o jeito de mostrar o produto; nada de marca, texto,
imagem, ícone ou número.** A LP mantém navy `#00033D`, teal `#3BCACE`, tinta `#0B0D1F`, branco, Geist, pílula e logo PNG.

**Medidas aproximadas (1440 px):** hero com foto de borda a borda de cerca de 1030 px; H1 de 2 linhas a cerca de
66 px, entrelinha 0,88, tracking -0.04em, branco; linha de apoio de 20 px; CTA escuro de cerca de 204 × 50 px;
janela do produto de 1376 px começando a cerca de 485 px do topo e ocupando uns 45% da primeira tela; cerca de 165 px
do hero à seção seguinte; H2 de 48 px à esquerda com texto de 20 px à direita; cards de setor em larguras 1 : 1,7 com
fragmento de UI no lugar de ícone. Escala de cerca de 66 / 48 / 22 / 20 / 15 / 12 px; cor fora da UI só em branco,
preto e cinza.

**O que pegar:** o produto é o herói (um fluxo de verdade, com estado e um painel aberto); foto real de borda a borda
com a UI sobreposta; H1 grande à esquerda em 2 linhas com uma ação; CTA chapado; muito respiro; H2 à esquerda e texto
à direita; cards por setor com fragmento de UI; larguras diferentes; monocromático com acento na UI; nav quieta.

**O que não copiar:** nome, logo, textos, a foto do céu com templo, avatar, ícones, arquivos, o "+18%" e o
"124 leads" sem fonte, selos de Gmail e Notion, e as cores da UI deles (laranja, vermelho, lilás).

**Onde a Xenora bate de frente com a taste, e a resolução usada:**

| Na Xenora | Regra da taste | Na LP |
|---|---|---|
| Nav, CTA e tag em mono | sem mono fora de código | Geist em tudo fora da UI |
| Links da nav em caixa alta | sem caixa alta pequena | frase normal |
| Chip "USE CASES" acima do H2 | sem eyebrow | sai; o título diz a coisa |
| Tag ligada ao CTA por fios | sem pílula ao lado do título, sem fio | sai; a tela começa logo abaixo da ação |
| CTA preto de canto reto | botão chato, reto ou redondo | pílula (identidade), teal (§2.3) |
| Fios e grade de pontos | sem fio fino (UI com `data-ui` fica de fora) | fios só dentro de `data-ui`; cards por degrau de tom |
| Sombra leve | sem sombra em repouso | sem sombra fora da UI |
| Card com ícones em círculo | sem card com ícone | todo card com fragmento de UI |
| Texto em cinza médio | corpo na tinta cheia | `--mb-tinta` |
| Duas margens (30 e 97 px) | um par de margens | 1280 + 32 em tudo |
| Branco sobre céu claro | contraste AA | céu denso ou véu neutro quando a foto entrar |
| Céu com templo, genérico | ideia do assunto | céu sobre a operação (foto pendente) |
| Nav com 2 botões | logo, 3 a 5 links, uma ação | 3 links e "Falar com a gente" |
| Nav transparente | sem glass | navy opaco (P17) |
| Número de vitrine | sem dado inventado | só o 99% com fonte; o resto é exemplo marcado |
| Texto centralizado nos cards | à esquerda por padrão | à esquerda |
| Muitos acentos na UI | um acento | teal para ok e foco, `#E11D48` para divergência, cinzas |

## 6. Gap: a LP contra a Xenora (resumo de `gap-lp-vs-xenora.md`, com o estado depois deste PR)

| Item | Xenora | LP na auditoria | Depois deste PR |
|---|---|---|---|
| Fundo do hero | foto real de borda a borda | navy com degradê, brilho radial e P! em contorno | navy chapado de borda a borda; **foto pendente** |
| H1 | 2 linhas, à esquerda, branco | 3 a 5 linhas, centralizado, com ícones | 2 linhas, à esquerda, branco |
| Eyebrow | nenhum | pílula teal | nenhum |
| Linha de apoio | 2 linhas, 20 px, à esquerda | 17 px, branco a .74, centralizada | 2 frases, 18 px, branco cheio, à esquerda |
| Ação | um botão chapado | dois botões e microcópia de 13 px | um botão e microcópia de 14 px ao lado |
| Produto como herói | UI real com fluxo e painel | JPG da torre, com sombra e inclinação | fluxo em HTML `data-ui` com painel e "Aprovar" funcionando |
| Nav | transparente, mono, 2 botões | navy .92 com blur | navy opaco, Geist, uma ação |
| Chip de seção | chip mono | rótulos mono e caixa alta | nenhum |
| H2 à esquerda, texto à direita | sim | só em Segmentos, com degradê | em setores e "Como funciona"; FAQ em duas colunas |
| Cards por setor | larguras 1 : 1,7 com fragmento de UI | abas com ícone e painel ardósia | 4 cards, larguras 1,7 : 1 e 1 : 1,7, fluxo de UI terminando numa pessoa |
| Ícones | quase nenhum | quadrados com ícone em vários blocos | nenhum fora da UI |
| Cor | branco, preto, cinza; acento na UI | navy, ardósia, degradês, amarelo | branco, tinta, cinzas; navy no hero, ardósia nos motivos e no bento, teal no acento |
| Sombras | leves (não copiar) | grandes em repouso | nenhuma fora da UI |
| Respiro | cerca de 165 px | 120 px | 104 a 176 px |
| Margens | 30 e 97 px | 1120 + 24, rodapé com outro container | 1280 + 32 em tudo |
| Prova | número sem fonte | 99% com barra em degradê | 99% com fonte, barra chapada |
| Imagens reais | 1 foto + UI | 0 fotos, 5 JPGs de tela | 0 fotos (pendente), 4 JPGs de tela + 1 tela HTML no hero + 4 fluxos nos cards |
| Celular | não mostra | H1 em 5 linhas, hero alto | H1 em 2 linhas, CTA de 48 px, fluxo em coluna sem os detalhes, painel abaixo |

## 7. Arquivos de apoio (fora do repo)

- Capturas depois deste passo: `/workspace/scratch/base-de-design-proposta/shots/lp-xenora-depois-{1440,768,390}.png`
  (página inteira, banner de cookies recusado).
- Capturas da auditoria e dos passos anteriores: `shots/lp-antes-*.png` e `shots/lp-depois-*.png`.
- Relatórios do inspector: `.taste-skill/xenora-antes/` e `.taste-skill/xenora-depois/` na worktree (ignorados pelo git).
