/*
 * Mockup da recepção (CSS puro, loop de 10s): janela de conversa genérica, sem
 * marca de aplicativo. O paciente pergunta algo administrativo, o agente
 * digita, o rascunho fica "Aguardando aprovação", a recepção aprova e a
 * mensagem sai com os vistos. Nada clínico, sem nome e sem telefone.
 */
export function MockClinica() {
  return (
    <div className="lp2-mock lp2-mock--cli" aria-hidden="true">
      <div className="lp2-mock__barra">
        <span className="lp2-mock__nome">
          <span className="lp2-mock-cli__avatar" />
          Paciente
        </span>
        <span className="lp2-mock__selo">Demonstração</span>
      </div>
      <div className="lp2-mock__palco">
        <div className="lp2-mock-cli">
          <p className="lp2-mock-cli__msg lp2-mock-cli__msg--in">Vocês atendem sábado?</p>
          <div className="lp2-mock-cli__resposta">
            <div className="lp2-mock-cli__msg lp2-mock-cli__msg--out">
              <span className="lp2-mock-cli__digitando">
                <span />
                <span />
                <span />
              </span>
              <span className="lp2-mock-cli__texto">
                Sim, das 8h às 12h. Quer agendar um horário?
                <span className="lp2-mock-cli__vistos">✓✓</span>
              </span>
            </div>
            <span className="lp2-mock-cli__etiqueta">
              <span className="lp2-mock-cli__estado lp2-mock-cli__estado--pendente">
                Aguardando aprovação
              </span>
              <span className="lp2-mock-cli__estado lp2-mock-cli__estado--ok">
                Aprovado pela recepção
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
