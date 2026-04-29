# Preceptor! Studio

Plataforma interna de geração de Estudos Estratégicos para a PRECEPTOR! Venture Studio.

A IA gera o estudo completo a partir de um questionário de 25-40 perguntas com lógica condicional por categoria (saúde, educação, jurídico, tech, outro).

---

## Como rodar localmente

### 1. Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (free tier)
- Chave de API da Anthropic (Claude)

### 2. Instalação

```bash
# Instale as dependências
npm install

# Copie o arquivo de variáveis de ambiente
cp .env.local.example .env.local
```

### 3. Configurar Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Vá em **SQL Editor** e cole o conteúdo de `db/schema.sql`. Execute.
3. Vá em **Project Settings → API** e copie:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configurar Anthropic

1. Pegue sua chave em [console.anthropic.com](https://console.anthropic.com)
2. Cole em `ANTHROPIC_API_KEY` no `.env.local`

### 5. Rodar

```bash
npm run dev
```

Acesse `http://localhost:3000`

---

## Estrutura do Projeto

```
preceptor-studio/
├── app/
│   ├── api/studies/
│   │   ├── generate/route.ts    # Endpoint que chama Claude
│   │   └── pdf/route.ts         # Endpoint que gera PDF
│   ├── dashboard/
│   │   ├── page.tsx             # Lista de estudos com filtros
│   │   ├── new/page.tsx         # Criar novo estudo
│   │   └── study/[id]/page.tsx  # Questionário + visualizador
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── Questionnaire.tsx        # Lógica do questionário condicional
│   └── StudyViewer.tsx          # Renderização e edição do estudo
├── lib/
│   ├── questions.ts             # Banco de perguntas (universal + categorias)
│   └── supabase.ts              # Cliente Supabase + tipos
├── prompts/
│   └── study.ts                 # Prompt mestre para a Claude
├── db/
│   └── schema.sql               # SQL para criar tabelas no Supabase
└── ...
```

---

## Como funciona

### Fluxo de criação de um estudo

1. **Sócio cria estudo:** preenche nome do cliente, título e categoria
2. **Questionário condicional:** ~14 perguntas universais + 6 perguntas específicas da categoria escolhida
3. **Geração com IA:** Claude Sonnet recebe o prompt mestre + respostas e gera o estudo em Markdown
4. **Edição opcional:** sócio pode editar manualmente o Markdown gerado
5. **Download PDF:** geração com Puppeteer usando layout Preceptor (capa + conteúdo formatado)

### Banco de perguntas

Em `lib/questions.ts`. Para adicionar/editar perguntas:
- **Universais:** afetam todas as categorias
- **Específicas:** afetam apenas a categoria correspondente

Cada pergunta tem `id`, `section`, `order`, `type`, `question`, `options` (se aplicável), e `required`.

### Prompt da IA

Em `prompts/study.ts`. Tem dois pedaços:
- **System prompt:** define o tom de voz, a estrutura obrigatória do documento e o contexto da categoria
- **User prompt:** monta as respostas do questionário em formato legível

---

## Próximos passos sugeridos

- [ ] Adicionar autenticação Supabase para login dos sócios
- [ ] Adicionar histórico de versões do estudo
- [ ] Permitir múltiplos estudos por cliente (relatórios comparativos)
- [ ] Templates de prompts adicionais (pitch deck, plano de negócios, etc)
- [ ] Métricas de uso (tempo médio, custo de tokens, etc)
- [ ] Deploy na Vercel quando estiver maduro

---

## Custo estimado

- **Supabase:** gratuito até 500 MB de banco
- **Claude Sonnet:** ~R$ 0,30 a R$ 0,60 por estudo (8k tokens output × $15/M tokens)
- **Vercel:** gratuito até 100 GB de bandwidth (depois)

Para 100 estudos/mês: ~R$ 30 a R$ 60 em IA. Tudo o resto roda no free tier.
