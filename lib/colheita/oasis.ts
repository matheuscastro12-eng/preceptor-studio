// Colheita de corpus da venture OASIS CT-e (metodo OPERA).
// Fonte: oasis-cte/corpus/colheita-oasis.md, versao de 09/09/2026. Os codigos entre
// colchetes daquele arquivo viram `origem`, so para rastreio interno.
//
// Tipos de pergunta:
//   simnao   -> Sim / Nao / Nao sei, com um campo opcional de detalhe
//   escolha  -> lista fechada (uma ou varias), com "outro" livre
//   texto    -> resposta livre

export type TipoDePergunta = "simnao" | "escolha" | "texto";

export interface Pergunta {
  id: string;
  grupo: GrupoId;
  texto: string;
  tipo: TipoDePergunta;
  /** rotulo do campo de detalhe (simnao) ou placeholder (texto) */
  detalhe?: string;
  opcoes?: string[];
  multipla?: boolean;
  origem: string;
}

export type GrupoId = "operacao" | "gestao" | "contador" | "gerenciadora" | "ti";

export const GRUPOS: { id: GrupoId; nome: string; quem: string }[] = [
  { id: "operacao", nome: "Operação", quem: "quem aperta os botões no TRAFLOG hoje" },
  { id: "gestao", nome: "Gestão", quem: "Marcus Vinicius e a direção" },
  { id: "contador", nome: "Contador", quem: "quem responde pela parte fiscal" },
  { id: "gerenciadora", nome: "Gerenciadora de risco", quem: "quem cuida da SM" },
  { id: "ti", nome: "TI ou TRAFLOG", quem: "TI da OASIS ou o fornecedor do sistema" },
];

export const VENTURE = { slug: "oasis-cte", nome: "OASIS", processo: "emissão de CT-e, CIOT, MDF-e e SM" };

export const PERGUNTAS: Pergunta[] = [
  // 1.1 Operacao
  { id: "q1", grupo: "operacao", tipo: "texto", origem: "C1, L23", texto: "Quem é, com nome e função, a pessoa que decide parar uma emissão quando algo dá errado? E quem cobre essa função fora do horário comercial e no fim de semana?" },
  { id: "q2", grupo: "operacao", tipo: "texto", origem: "C2, L23", texto: "Quando o fluxo para, quem é avisado, por qual canal (telefone, WhatsApp, e-mail, sistema), e como alguém sabe que essa pessoa leu o aviso?" },
  { id: "q3", grupo: "operacao", tipo: "texto", origem: "C5, L25", texto: "Quando o fluxo para no meio, o que vocês fazem hoje, na prática? Queremos a lista completa das saídas possíveis, com as palavras de vocês, e não menos que duas.", detalhe: "Por exemplo: cancela o que já foi emitido, corrige e segue, segura o carregamento, chama o cliente, faz outra coisa." },
  { id: "q4", grupo: "operacao", tipo: "escolha", multipla: true, origem: "C18, L24", texto: "Como vocês sabem que o caminhão saiu?", opcoes: ["Pela ocorrência de início de viagem no TRAFLOG", "A portaria avisa", "Ligação ou mensagem para o motorista", "Rastreador", "Não se sabe"] },
  { id: "q5", grupo: "operacao", tipo: "texto", origem: "C22", texto: "Quando alguém pergunta se o veículo ainda está no pátio, quais são as respostas possíveis, nas palavras de vocês? Hoje trabalhamos com três (confirmado no pátio, já saiu, não se sabe). Serve? Falta alguma, do tipo \"saiu e voltou\", \"ainda está carregando\", \"está na fila da balança\"?" },
  { id: "q6", grupo: "operacao", tipo: "texto", origem: "C23", texto: "Quem responde essa pergunta hoje, com nome e função?" },
  { id: "q7", grupo: "operacao", tipo: "texto", origem: "L31", texto: "Quem lança a ocorrência de início de viagem no TRAFLOG, e quanto tempo em média se passa entre o caminhão sair de verdade e alguém lançar isso no sistema?" },
  { id: "q8", grupo: "operacao", tipo: "simnao", origem: "C19, P", texto: "Quem entrega o DACTE e o manifesto ao motorista responde alguma coisa depois, tipo avisar que saiu?", detalhe: "Quem entrega, por onde, e o que o motorista responde" },
  { id: "q9", grupo: "operacao", tipo: "escolha", multipla: true, origem: "C14, L13, L14, L15", texto: "Em que formato a nota fiscal chega hoje?", opcoes: ["XML", "PDF", "Anexa no e-mail", "Por link", "O TRAFLOG busca sozinho na SEFAZ"], detalhe: "Qual caixa de e-mail ou pasta, quem controla essa caixa, e se a ordem de carregamento chega pelo mesmo caminho ou já é feita direto no TRAFLOG antes da nota" },
  { id: "q10", grupo: "operacao", tipo: "simnao", origem: "L16", texto: "Uma ordem de carregamento pode ter várias notas?", detalhe: "E uma mesma nota pode aparecer em mais de uma ordem de carregamento?" },
  { id: "q11", grupo: "operacao", tipo: "escolha", multipla: true, origem: "C11, L17", texto: "Quando o cliente reenvia a mesma nota, o que costuma ter mudado?", opcoes: ["Nada, é a mesma nota", "Uma correção", "Uma ordem de carregamento nova", "Nunca aconteceu"] },
  { id: "q12", grupo: "operacao", tipo: "texto", origem: "L20, L27", texto: "Quantas notas vocês recebem por dia, e no pico por hora? Quantas viagens por dia, e quantos CT-e por viagem?" },
  { id: "q13", grupo: "operacao", tipo: "simnao", origem: "C7", texto: "O TRAFLOG guarda o histórico das emissões com o retorno de cada uma?", detalhe: "De quantos meses para trás" },
  { id: "q14", grupo: "operacao", tipo: "simnao", origem: "C8, L5", texto: "Dá para tirar esse histórico em arquivo (Excel, CSV, PDF, qualquer coisa)?", detalhe: "Existe algum relatório ou exportação que vocês já tiram hoje" },
  { id: "q15", grupo: "operacao", tipo: "simnao", origem: "C9", texto: "Dá para separar no histórico os carregamentos que não chegaram até o fim, com um dos quatro documentos faltando?", detalhe: "Como vocês fariam essa separação" },
  { id: "q16", grupo: "operacao", tipo: "simnao", origem: "L29", texto: "Conseguem mandar um print do filtro da coluna Status aberto, nas três listagens: CT-e, Manifestos e CIOT?", detalhe: "Se puder, cole aqui os valores que aparecem no filtro" },
  { id: "q17", grupo: "operacao", tipo: "texto", origem: "L32, L33", texto: "Onde fica o botão que transmite o CT-e para a SEFAZ? E onde fica a ação de encerrar o MDF-e? Nos prints do manual público não achamos nenhum dos dois." },
  { id: "q18", grupo: "operacao", tipo: "texto", origem: "Pt5, Pt10", texto: "Quem confere hoje se o veículo tem MDF-e pendente de encerramento antes de abrir uma viagem nova? E de onde sai, na prática, a data de início previsto da viagem?" },
  { id: "q19", grupo: "operacao", tipo: "simnao", origem: "Pt5, Pt7", texto: "A mesma pessoa que lê a tela do TRAFLOG já transmite o CT-e, sem ninguém conferir antes?", detalhe: "Quem lê a tela hoje, e quem confere antes de transmitir, se alguém confere" },
  { id: "q20", grupo: "operacao", tipo: "simnao", origem: "F", texto: "Em dia de SEFAZ fora do ar, vocês emitem o CT-e mesmo sem conseguir consultar a situação da nota?", detalhe: "Quem assume essa decisão" },
  { id: "q21", grupo: "operacao", tipo: "escolha", origem: "C15, L8", texto: "O CIOT é gerado onde?", opcoes: ["Dentro do TRAFLOG", "No portal da instituição de pagamento", "Nos dois lugares", "Não sei"], detalhe: "Qual é a instituição de pagamento de frete que vocês usam" },
  { id: "q22", grupo: "operacao", tipo: "escolha", origem: "C15, L9, F4", texto: "Contradição que precisamos resolver: foi dito que a SM sai pelo TRAFLOG, mas no material público do sistema não existe tela de SM. Na prática de hoje, quem pede a SM faz isso por onde?", opcoes: ["Dentro do TRAFLOG", "No portal da gerenciadora", "Por e-mail", "Por telefone ou mensagem", "Não sei"], detalhe: "Um print do menu Transporte aberto já resolve" },
  { id: "q23", grupo: "operacao", tipo: "simnao", origem: "L28", texto: "O campo \"Nº averbação\" da grade de documentos do manifesto tem alguma relação com a SM da gerenciadora?", detalhe: "Quem preenche esse campo hoje" },
  { id: "q24", grupo: "operacao", tipo: "texto", origem: "Pt19", texto: "Depois de a SEFAZ recusar uma emissão, quem autoriza tentar de novo, e com base em quê?" },
  // 1.2 Gestao
  { id: "q25", grupo: "gestao", tipo: "simnao", origem: "L4, L pedido 10", texto: "Vocês autorizam, por escrito, um usuário somente leitura no TRAFLOG de produção e o uso do histórico de carregamentos como material de trabalho?", detalhe: "Quem assina essa autorização" },
  { id: "q26", grupo: "gestao", tipo: "texto", origem: "C15, L10, F4", texto: "Qual é a gerenciadora de risco da OASIS, e quem é o contato de vocês lá dentro?" },
  { id: "q27", grupo: "gestao", tipo: "simnao", origem: "L18, F3", texto: "A OASIS tem certificado digital e-CNPJ A1?", detalhe: "Está em uso por qual sistema hoje, e dá para emitir um certificado separado só para a integração" },
  { id: "q28", grupo: "gestao", tipo: "simnao", origem: "L3", texto: "A OASIS pode nos apresentar ao contato técnico do fornecedor do TRAFLOG?", detalhe: "Nome e contato, se tiver" },
  { id: "q29", grupo: "gestao", tipo: "texto", origem: "L pedido 9", texto: "CNPJ, inscrição estadual, RNTRC e a UF em que a OASIS emite." },
  // 1.3 Contador
  { id: "q30", grupo: "contador", tipo: "simnao", origem: "L34", texto: "Um CT-e que já foi vinculado a um MDF-e autorizado ainda pode ser cancelado dentro das 168 horas?", detalhe: "Isso decide a ordem em que se desfaz uma cadeia que quebrou" },
  { id: "q31", grupo: "contador", tipo: "texto", origem: "L35", texto: "Qual é o prazo do procedimento de anulação de valores da cláusula 17 do Ajuste SINIEF 09/2007? Encontramos duas respostas diferentes na mesma fonte." },
  { id: "q32", grupo: "contador", tipo: "simnao", origem: "L35", texto: "A UF em que a OASIS emite pratica prazo de cancelamento de CT-e menor que as 168 horas?", detalhe: "Qual é o prazo" },
  { id: "q33", grupo: "contador", tipo: "simnao", origem: "C20, P", texto: "Já houve, na OASIS, CT-e de anulação seguido de CT-e substituto?", detalhe: "Quem faz esse procedimento, e os dados da última ocorrência" },
  // 1.4 Gerenciadora
  { id: "q34", grupo: "gerenciadora", tipo: "texto", origem: "C24", texto: "Quais são as situações que uma SM pode ter, do pedido até a liberação, na lista de vocês? Precisamos dos nomes exatos que vocês usam." },
  { id: "q35", grupo: "gerenciadora", tipo: "simnao", origem: "C21, P", texto: "Uma liberação de SM tem prazo de validade?", detalhe: "Qual, e o que acontece quando vence" },
  { id: "q36", grupo: "gerenciadora", tipo: "simnao", origem: "L12", texto: "Uma SM pode ser cancelada ou alterada depois de enviada?", detalhe: "Em que prazo" },
  { id: "q37", grupo: "gerenciadora", tipo: "escolha", origem: "L11", texto: "A SM precisa estar aprovada antes de o veículo sair, ou basta estar solicitada?", opcoes: ["Precisa estar aprovada", "Basta estar solicitada", "Depende do cliente ou da carga"], detalhe: "Quem aprova do lado de vocês, e quanto tempo demora na prática" },
  { id: "q38", grupo: "gerenciadora", tipo: "escolha", multipla: true, origem: "C25, Pt16", texto: "Por onde o retorno chega à OASIS?", opcoes: ["Portal", "E-mail", "Telefone", "Mensagem (WhatsApp ou similar)"], detalhe: "Quem acompanha esse retorno do lado da OASIS, com nome" },
  { id: "q39", grupo: "gerenciadora", tipo: "simnao", origem: "C26", texto: "Já aconteceu de uma liberação ser dada e depois revogada, ou de sair liberada com restrição?", detalhe: "Com que frequência, e o que a operação fez em cada caso" },
  // 1.5 TI / TRAFLOG
  { id: "q40", grupo: "ti", tipo: "simnao", origem: "L1", texto: "O TRAFLOG tem integração para outro sistema conversar com ele (API ou web service)?", detalhe: "Existe documentação, e quem no fornecedor confirma isso" },
  { id: "q41", grupo: "ti", tipo: "simnao", origem: "L2", texto: "Existe um ambiente de teste do TRAFLOG, separado do de produção, onde dê para emitir sem gerar documento fiscal de verdade?" },
  { id: "q42", grupo: "ti", tipo: "simnao", origem: "L4", texto: "Dá para criar um usuário só de leitura, sem permissão de emitir, cancelar ou encerrar nada, e com registro de auditoria do que ele olhou?" },
  { id: "q43", grupo: "ti", tipo: "texto", origem: "L30", texto: "Na aba Ocorrências existem duas colunas de hora, \"Data\" e \"Data adição\". Qual delas é a hora em que o fato aconteceu, e em que fuso cada uma é gravada? Num dos prints elas estão exatamente 3 horas afastadas." },
  { id: "q44", grupo: "ti", tipo: "escolha", origem: "L21, F1, C14", texto: "Quando o TRAFLOG busca a nota na SEFAZ, ele mostra a situação atual dela (válida ou cancelada) ou só importa os dados?", opcoes: ["Mostra a situação atual", "Só importa os dados", "Não sei"], detalhe: "Com qual certificado ele faz essa busca" },
  { id: "q45", grupo: "ti", tipo: "escolha", origem: "Pt9, Pt14", texto: "O que a tela do TRAFLOG mostra quando a SEFAZ recusa uma emissão?", opcoes: ["O código e o motivo da recusa", "Só um aviso genérico", "Não sei"] },
  { id: "q46", grupo: "ti", tipo: "simnao", origem: "P", texto: "Existe uma consulta de situação dentro do detalhe do MDF-e?" },
  { id: "q47", grupo: "ti", tipo: "simnao", origem: "L19, P", texto: "A OASIS aparece dentro do XML da nota fiscal dos clientes como transportadora (grupo do transportador) ou como autorizada a consultar (autXML)?", detalhe: "Dá para conferir abrindo qualquer XML recebido" },
];

/** As ocorrencias pedidas pelo nome (secao 2 do instrumento). Cada uma: ja aconteceu? */
export const OCORRENCIAS_PEDIDAS: { id: string; texto: string; ficha: "A" | "B" | "C"; origem: string }[] = [
  { id: "o1", ficha: "C", origem: "C12a", texto: "CT-e emitido e o CIOT não saiu" },
  { id: "o2", ficha: "C", origem: "C12b", texto: "CT-e e CIOT emitidos e o MDF-e não saiu" },
  { id: "o3", ficha: "C", origem: "C12c", texto: "CT-e, CIOT e MDF-e emitidos e a SM não saiu ou não teve aceite" },
  { id: "o4", ficha: "C", origem: "C10", texto: "Nota que chegou já cancelada, sem o cliente avisar" },
  { id: "o5", ficha: "C", origem: "C11", texto: "A mesma nota chegando duas vezes" },
  { id: "o6", ficha: "C", origem: "C16", texto: "Nota cancelada depois de o CT-e já estar emitido" },
  { id: "o7", ficha: "C", origem: "C17", texto: "Emissão sem resposta: a tela travou, a sessão caiu ou apareceu um erro genérico, e ninguém sabia se o documento tinha sido emitido" },
  { id: "o8", ficha: "A", origem: "C28", texto: "Veículo que saiu com a cadeia incompleta, com algum dos quatro documentos faltando" },
  { id: "o9", ficha: "B", origem: "C26, C27", texto: "SM liberada e depois revogada, ou liberada com restrição, ou carregamento que saiu com a SM apenas solicitada" },
];

export interface CampoDeFicha { id: string; rotulo: string; ajuda?: string; longo?: boolean; obrigatorio?: boolean }

export const FICHAS: Record<"A" | "B" | "C", { nome: string; quando: string; campos: CampoDeFicha[] }> = {
  A: {
    nome: "Ficha A. O veículo ainda está no pátio?",
    quando: "Uma para cada vez que alguém precisou responder essa pergunta antes de emitir alguma coisa ou de dizer que o carregamento estava pronto.",
    campos: [
      { id: "quando", rotulo: "Data e hora", ajuda: "quando a pergunta precisou ser respondida", obrigatorio: true },
      { id: "carregamento", rotulo: "Carregamento", ajuda: "número do carregamento, do CT-e ou do manifesto", obrigatorio: true },
      { id: "para_que", rotulo: "Para que se perguntou", ajuda: "ia emitir o quê, ou ia declarar o carregamento pronto" },
      { id: "documentos", rotulo: "Documentos que já existiam", ajuda: "para cada um (CT-e, CIOT, MDF-e, SM): o valor da coluna Status e o valor da coluna Status viagem, os dois", longo: true },
      { id: "chave_protocolo", rotulo: "Chave e protocolo", ajuda: "de cada documento já autorizado; se estiver autorizado e sem protocolo, escreva assim mesmo", longo: true },
      { id: "ocorrencia_inicio", rotulo: "Havia ocorrência de início de viagem?", ajuda: "se sim, copie a linha inteira, com as duas colunas de hora e o que estava em Observações", longo: true },
      { id: "outros_sinais", rotulo: "Outros sinais", ajuda: "portaria, ligação ao motorista, mensagem, rastreador, nada" },
      { id: "resposta", rotulo: "Resposta dada", ajuda: "o veículo estava confirmado no pátio, já tinha saído, ou não se sabia? Use a palavra de vocês", obrigatorio: true },
      { id: "como_soube", rotulo: "Como se soube", ajuda: "o que sustentou essa resposta" },
      { id: "quem", rotulo: "Quem respondeu", ajuda: "nome da pessoa", obrigatorio: true },
    ],
  },
  B: {
    nome: "Ficha B. O retorno da gerenciadora sobre a SM",
    quando: "Uma para cada retorno de SM que valha registrar, especialmente os que não foram liberados de primeira.",
    campos: [
      { id: "quando_pedido", rotulo: "Data e hora do pedido", obrigatorio: true },
      { id: "quando_retorno", rotulo: "Data e hora do retorno" },
      { id: "carregamento", rotulo: "Carregamento", ajuda: "número do MDF-e e do CT-e", obrigatorio: true },
      { id: "documentos", rotulo: "Documentos que já existiam", ajuda: "para cada um (CT-e, CIOT, MDF-e): Status e Status viagem, os dois", longo: true },
      { id: "chave_protocolo", rotulo: "Chave e protocolo", ajuda: "de cada documento já autorizado", longo: true },
      { id: "canal", rotulo: "Por onde chegou o retorno", ajuda: "portal, e-mail, telefone, mensagem" },
      { id: "retorno_bruto", rotulo: "O retorno como chegou", ajuda: "copie o texto exatamente como veio, sem resumir e sem corrigir", longo: true, obrigatorio: true },
      { id: "situacao", rotulo: "Situação concluída", ajuda: "em que situação a SM ficou, na palavra de vocês", obrigatorio: true },
      { id: "prazo", rotulo: "Prazo", ajuda: "a liberação tinha validade? Venceu?" },
      { id: "veiculo", rotulo: "Onde estava o veículo", ajuda: "confirmado no pátio, já tinha saído, ou não se sabia, e como se soube" },
      { id: "quem", rotulo: "Quem leu e concluiu", ajuda: "nome da pessoa", obrigatorio: true },
    ],
  },
  C: {
    nome: "Ficha C. O fluxo parou no meio",
    quando: "A mais importante das três. Uma para cada vez que um carregamento travou.",
    campos: [
      { id: "quando", rotulo: "Data e hora", ajuda: "quando o fluxo parou", obrigatorio: true },
      { id: "carregamento", rotulo: "Carregamento", ajuda: "número do carregamento, do CT-e, do manifesto", obrigatorio: true },
      { id: "documentos", rotulo: "Documentos que já existiam", ajuda: "para cada um (CT-e, CIOT, MDF-e, SM): Status e Status viagem, os dois", longo: true },
      { id: "emitidos", rotulo: "O que já tinha sido emitido", ajuda: "com chave e protocolo de cada um", longo: true },
      { id: "falhou", rotulo: "O que falhou", ajuda: "qual documento não saiu", obrigatorio: true },
      { id: "como_falhou", rotulo: "Como falhou", ajuda: "veio um código e uma mensagem da SEFAZ ou da registradora (copie os dois), ou não veio resposta nenhuma?", longo: true, obrigatorio: true },
      { id: "veiculo", rotulo: "Onde estava o veículo", ajuda: "confirmado no pátio, já tinha saído, ou não se sabia" },
      { id: "como_soube", rotulo: "Como se soube disso", ajuda: "ocorrência no sistema, portaria, ligação, nada" },
      { id: "decisao", rotulo: "O que foi decidido", ajuda: "o que a pessoa fez em seguida, com as palavras dela", longo: true, obrigatorio: true },
      { id: "quem", rotulo: "Quem decidiu", ajuda: "nome da pessoa", obrigatorio: true },
      { id: "depois", rotulo: "O que aconteceu depois", ajuda: "funcionou, deu outro problema, teve custo" },
    ],
  },
};

export const LISTAS_DE_RESPOSTAS: { id: string; titulo: string; ajuda: string; origem: string }[] = [
  { id: "l1", origem: "C22", titulo: "Momento 1. O veículo ainda está no pátio", ajuda: "Quais respostas alguém pode dar? Trabalhamos com três (confirmado no pátio, já saiu, não se sabe), mas essa lista é nossa e pode estar errada ou incompleta. Uma opção por linha." },
  { id: "l2", origem: "C24", titulo: "Momento 2. O retorno da gerenciadora", ajuda: "Quais situações a SM pode ter? Precisamos dos nomes que a gerenciadora usa e dos nomes que vocês usam, se forem diferentes. Uma opção por linha." },
  { id: "l3", origem: "C5", titulo: "Momento 3. O fluxo parou no meio", ajuda: "O que a pessoa pode decidir fazer? Precisa cobrir pelo menos: cancelar dentro do prazo, anulação de valores mais CT-e substituto, seguir mesmo assim registrando o que se aceita, retomar depois de corrigir. Se fazem outras coisas, entram na lista. Uma opção por linha." },
];
