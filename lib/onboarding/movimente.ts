import type { Onboarding } from "./model";

// Segue o documento "O que pedir à Movimente" e o slide 14 do deck de onboarding.
// Mudar perguntas: suba `versao`, para o navegador descartar rascunhos antigos.

const SIM_NAO_NAOSEI = ["Sim", "Não", "Não sei"];

export const MOVIMENTE: Onboarding = {
  slug: "movimente",
  versao: 1,
  cliente: "Movimente",
  titulo: "O que precisamos da Movimente",
  introducao:
    "Este é o Momento 0 do Cockpit de relacionamento. As respostas destravam cada fase: com a Fase 1 preenchida, já começamos a integração com o Brudam e o e-mail. Não precisa responder tudo de uma vez: o rascunho fica salvo neste navegador, e cada envio fica registrado separado. Cada pessoa pode responder só a parte dela.",
  avisoCredenciais:
    "Não coloque senhas, tokens ou chaves neste formulário. Quando o usuário do Brudam estiver criado, avise por aqui e combine com o Matheus o envio da senha por um canal seguro.",
  responsavel: { nome: "Matheus Castro", empresa: "PRECEPTOR!", email: "matheus@ospreceptores.com" },
  secoes: [
    {
      id: "fase1",
      fase: "Fase 1",
      titulo: "Conexão com o Brudam e o e-mail",
      destrava: "Integração com o TMS e com as caixas de e-mail do time",
      descricao: "É o que precisamos primeiro. Com estes itens, cada NF com ocorrência passa a aparecer num card.",
      campos: [
        {
          tipo: "escolha", id: "brudam_usuario", rotulo: "O usuário de integração da API do Brudam já foi criado?",
          ajuda: "É criado na tela 669 do Brudam, com permissão de ler e lançar ocorrências. Se puderem, chamem o usuário de COCKPIT: ele aparece como autor dos lançamentos.",
          opcoes: ["Sim, já foi criado", "Ainda não", "Não sabemos como criar"],
        },
        { tipo: "texto", id: "brudam_login", rotulo: "Nome do usuário criado (sem a senha)", placeholder: "Ex.: COCKPIT" },
        { tipo: "escolha", id: "brudam_homologacao", rotulo: "Existe ambiente de homologação do Brudam para testes?", opcoes: SIM_NAO_NAOSEI },
        {
          tipo: "escolha", id: "brudam_webhook", rotulo: "A conta de vocês no Brudam envia ocorrências por webhook?",
          ajuda: "Se não souberem, podemos perguntar direto ao suporte da Brudam.", opcoes: SIM_NAO_NAOSEI,
        },
        { tipo: "texto", id: "brudam_contato", rotulo: "Quem administra o Brudam na Movimente?", placeholder: "Nome, cargo, e-mail ou WhatsApp" },
        {
          tipo: "escolha", id: "email_provedor", rotulo: "Qual e-mail o time de relacionamento usa?",
          ajuda: "Muda o trabalho da integração: o Cockpit lê e responde pela caixa de cada operador.",
          opcoes: ["Google Workspace (Gmail)", "Microsoft 365 (Outlook)"], outro: true,
        },
        { tipo: "texto", id: "email_dominio", rotulo: "Domínio do e-mail da empresa", placeholder: "Ex.: grupomovimente.com.br" },
        { tipo: "texto", id: "ti_contato", rotulo: "Contato de TI para o app de e-mail e o DNS", placeholder: "Nome, e-mail e telefone" },
        {
          tipo: "tabela", id: "codigos_ocorrencia", rotulo: "Códigos de ocorrência do Brudam",
          ajuda: "Todos os códigos que vocês usam. Marque quais o time de relacionamento trata: o Cockpit só cria card para esses. Se preferir, envie a planilha exportada do Brudam.",
          aceitaPlanilha: true, linhasIniciais: 3,
          colunas: [
            { id: "codigo", rotulo: "Código", placeholder: "Ex.: 21" },
            { id: "descricao", rotulo: "Descrição", placeholder: "Ex.: Reentrega solicitada" },
            { id: "tipo", rotulo: "Tipo", opcoes: ["Entrega", "Reentrega", "Devolução", "Avaria", "Extravio", "Recusa", "Agendamento", "Informativo", "Outro"] },
            { id: "finaliza", rotulo: "Finaliza a entrega?", opcoes: ["Sim", "Não"] },
            { id: "relacionamento", rotulo: "É do relacionamento?", opcoes: ["Sim", "Não"] },
          ],
        },
        {
          tipo: "tabela", id: "carteira", rotulo: "Carteira de clientes",
          ajuda: "Uma linha por CNPJ pagador. O operador responsável decide quem recebe o card. Para muitos clientes, envie a planilha.",
          aceitaPlanilha: true, linhasIniciais: 3,
          colunas: [
            { id: "cnpj", rotulo: "CNPJ pagador", placeholder: "Só números" },
            { id: "razao", rotulo: "Razão social" },
            { id: "segmento", rotulo: "Segmento", opcoes: ["Farma", "Cosméticos", "Alimentos", "Hospitalar", "Autopeças", "Atacado", "Indústria", "Outro"] },
            { id: "operador", rotulo: "Operador responsável", placeholder: "Nome ou e-mail" },
          ],
        },
      ],
    },
    {
      id: "fase2",
      fase: "Fase 2",
      titulo: "O aprendizado em sombra",
      destrava: "Os agentes aprendendo com casos reais da Movimente",
      descricao: "Os agentes propõem e o operador decide. Para as propostas saírem no jeito da Movimente, precisamos ver como o time trabalha hoje.",
      campos: [
        {
          tipo: "arquivos", id: "exemplos", rotulo: "Exemplos reais de e-mails e conversas",
          ajuda: "De 20 a 30 casos típicos: rastreamento, reentrega, avaria, extravio, devolução, cobrança. Vale exportar o e-mail (.eml ou .msg), PDF ou print. Pode anonimizar dados de terceiros.",
          aceita: ["eml", "msg", "pdf", "png", "jpg", "jpeg", "txt", "docx", "zip"], maxArquivos: 40,
        },
        { tipo: "longo", id: "modelo_reentrega", rotulo: "Mensagem que vocês mandam numa reentrega", placeholder: "Cole o texto que o time usa hoje" },
        { tipo: "longo", id: "modelo_devolucao", rotulo: "Mensagem de devolução" },
        { tipo: "longo", id: "modelo_avaria", rotulo: "Mensagem de avaria" },
        { tipo: "longo", id: "modelo_extravio", rotulo: "Mensagem de extravio" },
        { tipo: "longo", id: "modelo_cobranca", rotulo: "Cobrança ao cliente que não responde" },
        { tipo: "longo", id: "assinatura", rotulo: "Assinatura padrão do e-mail", placeholder: "Nome · Relacionamento · Movimente · telefone" },
        {
          tipo: "longo", id: "regras_prazos", rotulo: "Regras e prazos que o time segue",
          ajuda: "Em quantos dias uma NF parada vira extravio? Qual o prazo de reentrega? Quando se devolve a carga? Quando se cobra o cliente que não responde? Escreva como explicaria para alguém novo no time.",
        },
      ],
    },
    {
      id: "fase3",
      fase: "Fase 3",
      titulo: "Operação completa",
      destrava: "Todos os operadores, WhatsApp e a visão do gestor",
      campos: [
        {
          tipo: "tabela", id: "operadores", rotulo: "Operadores do relacionamento",
          ajuda: "Marque como gestor quem vê tudo e aprova regras. Os demais veem só a própria carteira.",
          linhasIniciais: 3,
          colunas: [
            { id: "nome", rotulo: "Nome" },
            { id: "email", rotulo: "E-mail" },
            { id: "cargo", rotulo: "Cargo" },
            { id: "papel", rotulo: "Papel", opcoes: ["Operador", "Gestor"] },
            { id: "whatsapp", rotulo: "WhatsApp", placeholder: "DDD + número" },
          ],
        },
        {
          tipo: "tabela", id: "contatos", rotulo: "Contatos de cada cliente",
          ajuda: "Quem responde sobre entregas em cada cliente, e quem recebe cobrança. Para muitos contatos, envie a planilha.",
          aceitaPlanilha: true, linhasIniciais: 2,
          colunas: [
            { id: "cnpj", rotulo: "CNPJ do cliente" },
            { id: "nome", rotulo: "Nome do contato" },
            { id: "email", rotulo: "E-mail" },
            { id: "whatsapp", rotulo: "WhatsApp" },
            { id: "cobranca", rotulo: "Recebe cobrança?", opcoes: ["Sim", "Não"] },
          ],
        },
        {
          tipo: "tabela", id: "regras_especiais", rotulo: "Clientes com regra especial",
          ajuda: "Prazo diferente, autorização permanente de devolução, carga que precisa ser segregada, portal próprio do cliente.",
          linhasIniciais: 1,
          colunas: [
            { id: "cnpj", rotulo: "CNPJ" },
            { id: "cliente", rotulo: "Cliente" },
            { id: "regra", rotulo: "Regra" },
          ],
        },
        {
          tipo: "tabela", id: "unidades", rotulo: "Unidades",
          ajuda: "Como cada unidade aparece no Brudam.",
          linhasIniciais: 2,
          colunas: [
            { id: "sigla", rotulo: "Sigla no Brudam" },
            { id: "cidade", rotulo: "Cidade / UF" },
          ],
        },
        {
          tipo: "escolha", id: "whatsapp_numero", rotulo: "Como vai ser o WhatsApp do Cockpit?",
          ajuda: "O Cockpit envia mensagens pelo WhatsApp. A sessão fica presa ao chip que escanear o QR code.",
          opcoes: ["Um número único do setor", "Um chip por operador", "Ainda não decidimos"],
        },
        { tipo: "texto", id: "whatsapp_responsavel", rotulo: "Quem vai escanear o QR code?", placeholder: "Nome e contato" },
        {
          tipo: "escolha", id: "subdominios", rotulo: "Podemos usar os endereços cockpit.<domínio> e evidencia.<domínio>?",
          ajuda: "O primeiro é a tela dos operadores. O segundo é o link da foto de entrega que vai para o cliente.",
          opcoes: ["Sim", "Preferimos outros nomes", "Precisamos ver com a TI"], outro: true,
        },
      ],
    },
    {
      id: "geral",
      fase: "Tudo",
      titulo: "Decisões e conformidade",
      destrava: "Quem decide, o tamanho da operação e a base legal",
      campos: [
        { tipo: "texto", id: "dono_projeto", rotulo: "Dono do projeto na Movimente", ajuda: "Quem decide e valida pela Movimente.", placeholder: "Nome, cargo e contato" },
        { tipo: "texto", id: "email_alertas", rotulo: "E-mail do gestor que recebe os alertas do sistema" },
        { tipo: "texto", id: "volume_nfs", rotulo: "Quantas NFs a Movimente entrega por mês?", placeholder: "Número aproximado" },
        { tipo: "texto", id: "volume_ocorrencias", rotulo: "Quantas NFs com ocorrência passam pelo relacionamento por dia?", placeholder: "Número aproximado" },
        { tipo: "texto", id: "volume_mensagens", rotulo: "Quantos e-mails e mensagens de clientes o time recebe por dia?", placeholder: "Número aproximado" },
        { tipo: "texto", id: "tempo_resposta", rotulo: "Quanto tempo, em média, um cliente espera a primeira resposta hoje?", placeholder: "Ex.: 2 horas" },
        {
          tipo: "escolha", id: "sombra", rotulo: "Concordam em começar com 30 dias de sombra, em que nenhuma ação sai sem aprovação de um operador?",
          opcoes: ["Sim", "Queremos conversar sobre isso"],
        },
        {
          tipo: "escolha", id: "email_remetente", rotulo: "Em nome de quem o Cockpit deve responder o cliente?",
          ajuda: "Nossa recomendação é pela caixa do operador, porque o cliente já responde para a pessoa.",
          opcoes: ["Pela caixa do operador que aprovou", "Por uma caixa única do setor"],
        },
        {
          tipo: "escolha", id: "lgpd", rotulo: "Qual a base legal para tratarmos os dados dos contatos de clientes?",
          opcoes: ["Execução de contrato", "Legítimo interesse", "Precisamos ver com o jurídico"], outro: true,
        },
        { tipo: "arquivos", id: "marca", rotulo: "Logo da Movimente", ajuda: "SVG ou PNG com fundo transparente, se tiverem.", aceita: ["svg", "png", "jpg", "jpeg", "pdf"], maxArquivos: 4 },
        { tipo: "texto", id: "cor_marca", rotulo: "Cor principal da marca", placeholder: "Ex.: #0A3D91" },
        { tipo: "longo", id: "observacoes", rotulo: "Algo mais que devemos saber?" },
      ],
    },
  ],
};
