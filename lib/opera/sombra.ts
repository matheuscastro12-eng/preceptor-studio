// A sombra do OPERA: o par cego entre a decisão de uma pessoa e a do agente.
//
// A pessoa decide ANTES do agente, e sem ver a resposta dele. Nada nesta
// camada mostra, devolve ou aceita decisão de agente: a tela e a rota daqui
// só conhecem a metade humana do par.
//
// Os dezessete tipos de ação abaixo são cópia fiel das chaves de
// `opera/politica.ts` da venture (OASIS CT-e), com o nome legível vindo de
// `construcao/08-sombra.json`. Se a política mudar lá, esta lista precisa ser
// regerada: a rota recusa qualquer tipo que não esteja aqui.

export interface TipoDeAcao {
  /** A chave exata de POLITICA em opera/politica.ts. */
  id: string;
  /** O degrau da cadeia, só para agrupar a lista na tela. */
  degrau: string;
  /** Nome curto, para quem está no meio do trabalho. */
  curto: string;
  risco: "leitura" | "reversivel" | "externa" | "irreversivel";
  nuncaGradua: boolean;
  /** O nome inteiro, como a partitura aprovada o escreve. */
  nome: string;
}

export const TIPOS_OASIS_CTE: TipoDeAcao[] = [
  { id: "receber_a_nf_e_em_xml_e_a_ordem_de_carregamento_sem_os_dois_nada_comeca", degrau: "Entrada", curto: "Receber a NF-e e a ordem de carregamento", risco: "leitura", nuncaGradua: false, nome: "receber a NF-e em XML e a ordem de carregamento; sem os dois, nada começa" },
  { id: "validar_a_nf_e_no_proprio_xml_chave_de_44_digitos_com_digito_verificador_protnfe_com_cstat_100_cnpj_e_numero_batendo_com_a_chave_contingencia_tratada_como_congelamento_e_nao_como_recusa", degrau: "Entrada", curto: "Validar a NF-e no próprio XML", risco: "leitura", nuncaGradua: false, nome: "validar a NF-e no próprio XML: chave de 44 dígitos com dígito verificador, protNFe com cStat 100, CNPJ e número batendo com a chave, contingência tratada como congelamento e não como recusa" },
  { id: "conferir_se_a_nota_ja_foi_processada_pela_chave_de_acesso_e_se_a_ordem_de_carregamento_ja_tem_carregamento_aberto_nota_substituta_reservar_a_nota_antes_de_abrir_a_cadeia_duplicata_para_e_avisa", degrau: "Entrada", curto: "Conferir se a nota já foi processada", risco: "reversivel", nuncaGradua: false, nome: "conferir se a nota já foi processada, pela chave de acesso, e se a ordem de carregamento já tem carregamento aberto (nota substituta); reservar a nota antes de abrir a cadeia; duplicata para e avisa" },
  { id: "consultar_a_situacao_da_nf_e_na_sefaz_cstat_do_envelope_e_eventos_110111_registrar_hora_protocolo_e_prazo_de_validade_da_leitura_qualquer_coisa_que_nao_seja_viva_congela_a_cadeia_inclusive_depois_do_ct_e_emitido", degrau: "Entrada", curto: "Consultar a situação da NF-e na SEFAZ", risco: "leitura", nuncaGradua: false, nome: "consultar a situação da NF-e na SEFAZ (cStat do envelope E eventos 110111), registrar hora, protocolo e prazo de validade da leitura; qualquer coisa que não seja VIVA congela a cadeia, inclusive depois do CT-e emitido" },
  { id: "confirmar_que_o_veiculo_ainda_esta_no_patio_antes_de_cada_emissao_irreversivel_e_antes_de_declarar_a_cadeia_completa_tres_estados_confirmado_no_patio_saiu_desconhecido_e_ausencia_da_ocorrencia_nao_prova_permanencia", degrau: "Entrada", curto: "Confirmar que o veículo está no pátio", risco: "leitura", nuncaGradua: false, nome: "confirmar que o veículo ainda está no pátio, antes de cada emissão irreversível e antes de declarar a cadeia completa; três estados (confirmado no pátio, saiu, desconhecido), e ausência da ocorrência não prova permanência" },
  { id: "emitir_o_ct_e_no_traflog_com_chave_de_idempotencia_so_com_veiculo_confirmado_no_patio_leitura_da_sefaz_vigente_e_viva_e_liberacao_vigente", degrau: "CT-e", curto: "Emitir o CT-e no TRAFLOG", risco: "irreversivel", nuncaGradua: true, nome: "emitir o CT-e no TRAFLOG, com chave de idempotência, só com veículo confirmado no pátio, leitura da SEFAZ vigente E viva, e liberação vigente" },
  { id: "ler_o_desfecho_da_emissao_do_ct_e_em_tres_saidas_autorizado_cstat_100_protocolo_e_hora_da_autorizacao_recusado_cstat_e_xmotivo_sem_resposta_congela_e_obriga_consulta_de_existencia_antes_de_qualquer_reemissao", degrau: "CT-e", curto: "Ler o desfecho da emissão do CT-e", risco: "leitura", nuncaGradua: false, nome: "ler o desfecho da emissão do CT-e em três saídas: autorizado (cStat 100, protocolo e hora da autorização), recusado (cStat e xMotivo), SEM RESPOSTA (congela e obriga consulta de existência antes de qualquer reemissão)" },
  { id: "gerar_o_ciot_para_todo_carregamento_frota_propria_e_agregado_na_tela_novo_ciot_com_cod_ext_como_chave_de_idempotencia_ponto_de_nao_retorno_no_botao_inserir_e_enviar_janela_de_cancelamento_ate_24_horas_antes_do_inicio_previsto_da_operacao", degrau: "CIOT", curto: "Gerar o CIOT", risco: "irreversivel", nuncaGradua: true, nome: "gerar o CIOT para todo carregamento (frota própria e agregado), na tela Novo CIOT com Cod. ext. como chave de idempotência, ponto de não retorno no botão Inserir e enviar; janela de cancelamento até 24 horas ANTES do início previsto da operação" },
  { id: "ler_o_desfecho_do_ciot_nos_logs_da_registradora_coluna_de_sucesso_estruturada_tratando_a_espera_da_ipef_como_estado_proprio_com_prazo_nomeado_mesmas_tres_saidas", degrau: "CIOT", curto: "Ler o desfecho do CIOT", risco: "leitura", nuncaGradua: false, nome: "ler o desfecho do CIOT nos logs da registradora (coluna de sucesso estruturada), tratando a espera da IPEF como estado próprio com prazo nomeado; mesmas três saídas" },
  { id: "conferir_o_campo_n_ciot_do_manifesto_imediatamente_antes_de_autorizar_o_agente_nunca_digita_esse_campo_o_traflog_preenche_ao_lancar_o_ct_e_vazio_ou_diferente_congela_antes_de_transmitir_e_a_conferencia_vence", degrau: "CIOT", curto: "Conferir o Nº CIOT do manifesto", risco: "leitura", nuncaGradua: false, nome: "conferir o campo Nº CIOT do manifesto imediatamente antes de Autorizar: o agente nunca digita esse campo, o TRAFLOG preenche ao lançar o CT-e; vazio ou diferente congela antes de transmitir, e a conferência vence" },
  { id: "emitir_o_mdf_e_botao_autorizar_com_ct_e_e_ciot_vinculados_janela_de_cancelamento_de_ate_24_horas_da_autorizacao_so_antes_de_iniciar_o_transporte", degrau: "MDF-e", curto: "Emitir o MDF-e", risco: "irreversivel", nuncaGradua: true, nome: "emitir o MDF-e (botão Autorizar) com CT-e e CIOT vinculados; janela de cancelamento de até 24 horas da autorização, só antes de iniciar o transporte" },
  { id: "ler_o_desfecho_do_mdf_e_nas_tres_saidas_a_recusa_por_manifesto_pendente_de_encerramento_na_retransmissao_e_evidencia_nao_prova_de_que_o_anterior_existe", degrau: "MDF-e", curto: "Ler o desfecho do MDF-e", risco: "leitura", nuncaGradua: false, nome: "ler o desfecho do MDF-e nas três saídas; a recusa por manifesto pendente de encerramento na retransmissão é evidência (não prova) de que o anterior existe" },
  { id: "solicitar_a_sm_solicitacao_de_monitoramento_a_gerenciadora_de_risco_com_o_numero_do_mdf_e_como_idempotencia_solicitada_nao_e_aprovada", degrau: "SM", curto: "Solicitar a SM à gerenciadora", risco: "externa", nuncaGradua: false, nome: "solicitar a SM (Solicitação de Monitoramento) à gerenciadora de risco, com o número do MDF-e como idempotência; solicitada não é aprovada" },
  { id: "acompanhar_o_retorno_da_gerenciadora_ate_aceite_vigente_solicitada_em_analise_pendente_com_causa_e_dono_da_acao_liberada_liberada_com_restricao_recusada_revogada_cancelada_sem_aceite_vigente_o_carregamento_nao_e_regular", degrau: "SM", curto: "Acompanhar o retorno da gerenciadora", risco: "leitura", nuncaGradua: false, nome: "acompanhar o retorno da gerenciadora até aceite vigente: solicitada, em análise, pendente com causa e dono da ação, liberada, liberada com restrição, recusada, revogada, cancelada; sem aceite vigente o carregamento não é regular" },
  { id: "declarar_o_carregamento_completo_e_regular_quatro_degraus_emitidos_nenhum_depois_da_saida_do_veiculo_sm_com_aceite_vigente_veiculo_checado_uma_ultima_vez_tudo_registrado_em_diario_append_only_com_hash_encadeado_e_ator_nominal", degrau: "Fecho", curto: "Declarar o carregamento completo e regular", risco: "reversivel", nuncaGradua: false, nome: "declarar o carregamento completo e regular: quatro degraus emitidos, nenhum depois da saída do veículo, SM com aceite vigente, veículo checado uma última vez; tudo registrado em diário append-only com hash encadeado e ator nominal" },
  { id: "excecao_congelar_a_cadeia_perguntar_se_o_veiculo_saiu_listar_o_que_ja_existe_chave_e_protocolo_e_o_que_ainda_cabe_desfazer_em_cada_janela_avisar_a_pessoa_nomeada_da_oasis_com_confirmacao_de_leitura_propor_o_menu_sem_resposta_consult_7a4c3b8", degrau: "Exceção", curto: "Congelar a cadeia e propor o menu", risco: "reversivel", nuncaGradua: false, nome: "exceção: congelar a cadeia, perguntar se o veículo saiu, listar o que já existe (chave e protocolo) e o que ainda cabe desfazer em cada janela, avisar a pessoa nomeada da OASIS com confirmação de leitura, propor o menu; SEM RESPOSTA consulta existência antes de qualquer proposta; nota cancelada depois do CT-e é caso próprio" },
  { id: "decidir_o_reparo_com_nome_e_motivo_cancelar_dentro_da_janela_ct_e_ate_168_horas_como_teto_mdf_e_24_horas_ciot_24_horas_antes_do_inicio_anulacao_de_valores_mais_ct_e_substituto_depois_da_janela_seguir_com_nota_nao_viva_escrevendo_o_q_b712679", degrau: "Exceção", curto: "Decidir o reparo, com nome e motivo", risco: "irreversivel", nuncaGradua: true, nome: "decidir o reparo com nome e motivo: cancelar dentro da janela (CT-e até 168 horas como teto, MDF-e 24 horas, CIOT 24 horas antes do início), anulação de valores mais CT-e substituto depois da janela, seguir com nota não viva escrevendo o que se aceita, ou retomar após reparo; o que já saiu nunca é reemitido" },
];

/** Só ventures com sombra ligada têm porta. A venture sem lista aqui dá 404. */
export const TIPOS_DA_SOMBRA: Record<string, TipoDeAcao[]> = {
  "oasis-cte": TIPOS_OASIS_CTE,
};

export interface DecisaoPossivel { id: string; rotulo: string; ajuda: string }

/**
 * As decisões possíveis, no espaço fechado que a partitura aprovada usa.
 *
 * São PROVISÓRIAS, pelo mesmo motivo dos rótulos de
 * `corpus/rotulos-provisorios.json`: saíram do texto da partitura, não da boca
 * de quem opera. A colheita pede as palavras da OASIS, e quando elas voltarem
 * esta lista é substituída. Enquanto isso, "outra" existe justamente para que
 * ninguém precise torcer o que fez para caber numa palavra minha.
 */
export const DECISOES: DecisaoPossivel[] = [
  { id: "segui", rotulo: "Segui", ajuda: "fiz o passo, e a cadeia continua" },
  { id: "congelei", rotulo: "Congelei", ajuda: "parei a cadeia e avisei alguém" },
  { id: "recusei", rotulo: "Recusei", ajuda: "não fiz o passo, e não vai ser feito assim" },
  { id: "reparei", rotulo: "Reparei", ajuda: "desfiz ou corrigi o que já tinha sido feito" },
  { id: "outra", rotulo: "Outra", ajuda: "escreva com as suas palavras" },
];

export const DECISOES_VALIDAS = new Set(DECISOES.map((d) => d.id));

/** A chave da NF-e como o carregamento a identifica: 44 dígitos, sem enfeite. */
export function chaveNfeNormalizada(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const digitos = v.replace(/\D/g, "");
  return /^[0-9]{44}$/.test(digitos) ? digitos : null;
}

/** O caso, na língua da operação: uma ordem de carregamento mais uma nota. */
export function casoId(ordem: string, chave: string): string {
  return ordem.trim().toUpperCase() + "|" + chave;
}
