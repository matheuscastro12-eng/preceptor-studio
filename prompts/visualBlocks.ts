export const VISUAL_BLOCK_RULES = `
BLOCOS VISUAIS OBRIGATORIOS PARA HIERARQUIA:

Use estes blocos para separar decisao, evidencia, risco e acao. Eles serao renderizados como componentes visuais na plataforma e no PDF.

Sintaxes aceitas:

:::summary
- 3 a 5 bullets curtos com a leitura em 30 segundos.
- Cada bullet deve ter dado, decisao ou alerta concreto.
:::

:::decision
Titulo curto da decisao
Explique a decisao em 2 a 4 frases. Use numeros e trade-offs.
:::

:::evidence
Titulo curto da evidencia
- Evidencia 1 com numero.
- Evidencia 2 com fonte da resposta.
- Evidencia 3 com implicacao pratica.
:::

:::metric
Label | Valor | Nota curta
Label | Valor | Nota curta
Label | Valor | Nota curta
:::

:::risk
Titulo curto do risco
Explique o risco, sinal de alerta e mitigacao concreta.
:::

:::next-actions
- Acao concreta, responsavel, metrica e prazo.
- Acao concreta, responsavel, metrica e prazo.
- Acao concreta, responsavel, metrica e prazo.
:::

Regras:
- Logo depois do H1, inclua um bloco :::summary.
- Em secoes decisivas, use :::decision antes da explicacao longa.
- Em secoes com numeros, use :::metric com 3 a 5 metricas.
- Use :::evidence para separar dados das interpretacoes.
- Use :::risk apenas quando houver risco real.
- Use :::next-actions no fechamento do documento ou de uma secao operacional.
- Nao coloque blocos dentro de tabelas.
- Nao use mais de 2 blocos visuais seguidos sem texto entre eles.
`;
