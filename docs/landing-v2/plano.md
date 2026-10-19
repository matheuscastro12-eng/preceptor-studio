# Landing v2 da home: plano

Branch `lp-v2-do-zero`. Fonte única de texto: `/workspace/marketing/copy-site/copy-site-v3.md` (hero opção 1).

## 0. Direção
1. **Propósito:** levar o dono de uma operação com regra (logística, financeiro, clínica) a pedir o diagnóstico de 30 min.
2. **Público:** dono ou gestor, no celular vindo de anúncio ou no desktop. Precisa ver primeiro a cena (documento chega, conferência pronta, equipe aprova) e para quem é.
3. **Tom:** editorial, calmo, concreto. Muito branco, tipografia grande, linhas finas, rótulos mono.
4. **Detalhe memorável:** a "marca de caneta": uma faixa teal que se desenha atrás de uma expressão por seção, e no hero o carimbo de aprovação que fecha a cena animada.
5. **Restrições:** Next 14 app router, tokens do repo (sem cor nova), Bricolage Grotesque + Instrument Sans (layout) + JetBrains Mono (token `--font-mono`), sem CDN, sem framer-motion na home, só transform/opacity, `prefers-reduced-motion`, contraste AA.

## Tokens (CSS vars, todos do repo)
```css
.lp2 {
  --navy: #00033D; --navy-deep: #010226;
  --teal: #3BCACE; --teal-soft: #9FE7E9; --teal-ink: #12888E; --teal-tint: #EAF9FA;
  --ink: #16203C; --ink-soft: #4C5670; --ink-mute: #8A93A8;
  --line: #E4E7F0; --bg: #FFFFFF; --bg-soft: #F4F6FA;
  --ease-out: cubic-bezier(0.2, 0.7, 0.2, 1); --dur-fast: 160ms; --dur-base: 320ms; --dur-slow: 700ms;
  --r-sm: 6px; --r-md: 8px; --r-xl: 12px;
}
```
Contraste medido: ink 16.1, ink-soft 7.3 (6.8 no bg-soft), navy 19.4 no branco; teal 9.7 e ink-mute 6.3 no navy.
**Proibido como texto pequeno no claro:** teal (2.0), teal-ink (4.25), ink-mute (3.1). Teal no claro só como decoração.

## Seções (ordem) e padrões
| # | Seção | id | Fundo | Padrão |
|---|---|---|---|---|
| 0 | Nav | | branco | logo, 4 âncoras, CTA em texto sublinhado; some ao rolar para baixo, volta ao subir |
| 1 | Hero | `topo` | branco + grão | grade 7/5; h1 em 3 linhas (uma por frase) entrando em sequência; cena animada à direita; 3 frentes em faixa mono abaixo, mesmo peso |
| 2 | Problema | `problema` | branco | título grande; texto em coluna estreita; 3 dores como lista numerada com fios, sem ícone |
| 3 | Método | `metodo` | bg-soft | título fixo à esquerda (desktop), 4 passos à direita com linha que se preenche com o scroll |
| 4 | Serviços | `servicos` | branco | índice editorial: cabeçalho mono do grupo à esquerda, itens à direita |
| 5 | Exemplos | `exemplos` | navy + grão | faixa que "abre" (scale 0.96 → 1) ao entrar; 3 cartões com fio fino; 99% conta de 0 a 99 |
| 6 | Verticais | `para-quem` | branco | 3 cartões iguais; advocacia como faixa só de texto |
| 7 | Piloto | `piloto` | bg-soft | régua de 3 marcos semana a semana; listas; CTA do meio |
| 8 | FAQ | `faq` | branco | `<details>` nativo, ícone gira, resposta entra com fade |
| 9 | Contato | `contato` | navy + grão | título + texto à esquerda, formulário em cartão branco à direita |
| 10 | Rodapé | | branco | frase-assinatura grande, texto, links |

## Animações
- **Reveal:** `[data-rv]` + um único IntersectionObserver; opacity 0→1, translateY 24px→0, 700ms, stagger por `--rv-d`.
- **Hero h1:** cada frase sobe de dentro de uma máscara (translateY 105%→0), 80/220/360ms.
- **Cena do hero (CSS keyframes, loop 9s):** documento entra, 3 linhas de conferência ganham ✓ uma a uma, carimbo "Aprovado" aparece, documento sai. Sem dado legível (barras abstratas). `aria-hidden`.
- **Marca de caneta:** `.lp2-marca::before` scaleX 0→1 (origin left), 900ms, quando a seção entra.
- **Método:** linha vertical scaleY = progresso do scroll (rAF); passo ativo ganha opacidade 1.
- **Exemplos:** fundo navy scale 0.96→1; count-up 0→99 em 1.2s (SSR já renderiza 99).
- **Microinterações:** sublinhado do CTA (scaleX), seta do CTA (translateX 4px), cartão de vertical sobe 4px, foco visível teal 2px em tudo.
- **Reduced motion:** um bloco que zera animação/transição; cena do hero mostra o estado final parado; count-up não roda.

## Estados (formulário)
| Estado | O que mostra |
|---|---|
| Loading | botão "Enviando..." desabilitado, layout estável |
| Erro de campo | mensagem da copy sob o campo, `aria-invalid`, foco no primeiro inválido |
| Erro de envio | "Não conseguimos enviar agora. Tente de novo em alguns minutos ou fale com a gente pelo WhatsApp." com link |
| Sucesso | "Recebido. A gente vai falar com você..." em região viva, depois redireciona para `/obrigado/automacao` (Pixel) |
| Empty / Partial / Permission | não se aplica: página pública estática, sem dados carregados |

## Pendências da copy: regra aplicada
Marcador `[A CONFIRMAR]` ou `[PLACEHOLDER]` inline = fora da página, em comentário no código.
- Fora: voz do cliente; cartão "Cerca de 13%"; FAQ "Quanto custa?"; parágrafo "Depois do piloto"; FAQ "Como ficam os meus dados?"; link "Ver como funciona no financeiro"; prazo "em até 1 dia útil".
- "[canal do titular]" vira link para `/privacidade#lgpd`.
- Foto do hero (a produzir) trocada pela cena animada; OG image fica a refazer.
- Dentro, mas com risco listado: advocacia (só texto), "Rotas e ocorrências" (pendência 15).

## Referências abertas (researcher, 19/10/2026)
- Método: "Step Path" de https://www.scrolltide.co (linha se desenha com o scroll, passo sobe com fade quando ela chega).
- Exemplos: número animado ("Revolut Number of Transactions", https://60fps.design); "Hover List" do scrolltide (lista com fios no lugar de grade de cartões).
- Nav: https://www.navbar.gallery tipo estático/sticky sem dropdown; https://minimal.gallery usa links de texto, sem pílula.
- Rodapé: https://www.footer.design tags "Typographic", "Minimal".
- Microinterações: fade com leve subida ("Wabi Fade Reveal"), destaque de borda por pseudo-elemento com opacity (60fps.design).
- Não abriram: land-book.com (403); cta.gallery só lista nomes. Medidas de grid não vieram (WebFetch lê texto, não imagem).
