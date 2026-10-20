import { LeadForm } from "./LeadForm";
import { Marca } from "./Marca";
import { Icone3D } from "./Icone3D";

export function Contato() {
  return (
    <section id="contato" className="lp2-section lp2-navy lp2-grain lp2-contato">
      <div className="lp2-container lp2-contato__grid">
        <header className="lp2-contato__head" data-rv>
          <figure className="lp4-foto lp4-foto--contato" aria-hidden="true" style={{ "--tom": "#FFF4D6", "--r": "-5deg" } as React.CSSProperties}>
            <Icone3D nome="tachinha" tamanho={34} className="lp4-foto__pino" />
            <div className="lp4-foto__img">
              <Icone3D nome="ampulheta" tamanho={128} />
            </div>
            <figcaption>só 30 min</figcaption>
          </figure>
          <h2 className="lp2-h2">
            Qual processo <Marca>come o dia</Marca> da sua equipe?
          </h2>
          <p className="lp2-lead">
            Em 30 minutos de conversa, você sai sabendo se dá para automatizar e por onde começar.
          </p>
        </header>
        <div className="lp2-contato__card" data-rv style={{ "--rv-d": "120ms" } as React.CSSProperties}>
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
