import { CountUp } from "./CountUp";
import { Marca } from "./Marca";
import { ProvaGrade } from "./ProvaGrade";

export function Exemplos() {
  return (
    <section id="exemplos" className="lp2-section lp2-navy lp2-exemplos" data-rv="bg">
      <div className="lp2-container">
        <header className="lp2-head" data-rv>
          <p className="lp2-rotulo">
            EXEMPLOS · CASOS ANÔNIMOS DE LOGÍSTICA E FINANCEIRO · NÚMEROS ARREDONDADOS
          </p>
          <h2 className="lp2-h2">
            Exemplos do que a gente <Marca>já construiu</Marca>.
          </h2>
          <p className="lp2-lead">
            Os números abaixo vêm de casos de logística e de financeiro. Na sua operação, a meta é
            combinada no diagnóstico e medida no piloto.
          </p>
        </header>

        <ul className="lp2-casos">
          <li className="lp2-caso lp2-prova" data-rv style={{ "--rv-d": "0ms" } as React.CSSProperties}>
            <p className="lp2-rotulo lp2-caso__frente">FINANCEIRO</p>
            <p className="lp2-caso__destaque lp2-caso__destaque--num lp2-prova__num">
              <span className="lp2-prova__pre">Cerca de </span>
              <CountUp to={99} />
              <span className="lp2-prova__pct">%</span>
            </p>
            <ProvaGrade />
            <p className="lp2-caso__texto">dos recebimentos conciliados no período medido.</p>
            <p className="lp2-caso__nota">
              Um cliente de logística. O agente cruza extrato e títulos, e o financeiro confirma as
              baixas.
            </p>
          </li>

          {/* PENDENTE copy v3 (pendência 12): cartão LOGÍSTICA · SIMULAÇÃO
              "Cerca de 13%" de custo de tabela a menos nas rotas, em simulação sobre
              dias reais. Fica fora até o Matheus confirmar o número e o rótulo. */}

          <li className="lp2-caso" data-rv style={{ "--rv-d": "120ms" } as React.CSSProperties}>
            <p className="lp2-rotulo lp2-caso__frente">LOGÍSTICA</p>
            <p className="lp2-caso__destaque">Aprovação humana em cada emissão.</p>
            <p className="lp2-caso__texto">
              Agente de CT-e que prepara o documento e espera o ok da equipe.
            </p>
            <p className="lp2-caso__nota">Um cliente de logística. A equipe só confere e aprova.</p>
          </li>

          <li className="lp2-caso" data-rv style={{ "--rv-d": "240ms" } as React.CSSProperties}>
            <p className="lp2-rotulo lp2-caso__frente">
              CLÍNICAS · EXEMPLO DE PRODUTO, SEM CASO MEDIDO
            </p>
            <p className="lp2-caso__destaque">Agente no WhatsApp oficial da recepção.</p>
            <p className="lp2-caso__texto">
              Responde dúvidas administrativas e organiza as conversas por assunto. A recepção aprova
              as respostas.
            </p>
            <p className="lp2-caso__nota">O agente fica longe de orientação de saúde.</p>
          </li>
        </ul>

        <p className="lp2-rotulo lp2-exemplos__rodape" data-rv>
          CASOS ANÔNIMOS · NÚMEROS ARREDONDADOS · CLÍNICAS SEM CASO MEDIDO
        </p>
      </div>
    </section>
  );
}
