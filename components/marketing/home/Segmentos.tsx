"use client";

import { useState } from "react";
import { Glifo } from "./Glifo";

/*
 * "Feito para a sua operação": abas por segmento, como numa reunião de
 * vendas. Cada aba diz para quem é, em que sistemas o agente trabalha e
 * compara a mesma tarefa hoje e com o agente.
 */
type Seg = {
  id: string;
  aba: string;
  icone: string;
  titulo: string;
  texto: string;
  sistemas: string[];
  tarefa: string;
  hoje: string[];
  agente: string[];
};

const SEGMENTOS: Seg[] = [
  {
    id: "transporte",
    aba: "Transportadoras",
    icone: "caminhao",
    titulo: "Feito para transportadoras.",
    texto: "SSW, Brudam ou o TMS que vocês usam: o agente trabalha dentro dele, do jeito que a sua equipe já trabalha.",
    sistemas: ["SSW", "Brudam", "TMS próprio", "CT-e e MDF-e", "WhatsApp", "Planilhas"],
    tarefa: "Emissão de CT-e",
    hoje: ["A nota chega por e-mail", "Alguém digita os dados no TMS", "Confere peso, volume e frete na mão", "Emite e manda o PDF"],
    agente: ["O agente lê a nota assim que chega", "Preenche o CT-e no TMS", "Confere com o romaneio e marca o que diverge", "Sua equipe só aprova"],
  },
  {
    id: "clinicas",
    aba: "Clínicas",
    icone: "mensagem",
    titulo: "Feito para clínicas.",
    texto: "A recepção para de responder a mesma pergunta o dia todo. O agente fala com o paciente e a equipe cuida de quem está na clínica.",
    sistemas: ["WhatsApp", "Sistema de agenda", "Prontuário", "Planilhas", "E-mail"],
    tarefa: "Agendamento pelo WhatsApp",
    hoje: ["O WhatsApp lota antes das nove", "A recepção abre a agenda para cada pergunta", "Confirmações feitas uma a uma", "Mensagem sem resposta vira paciente perdido"],
    agente: ["O agente responde na hora", "Consulta a agenda e oferece horários", "Confirma e lembra o paciente", "O que foge da regra vai para a recepção"],
  },
  {
    id: "agro",
    aba: "Agro e grãos",
    icone: "pacote",
    titulo: "Feito para o agro.",
    texto: "Do ERP do campo à planilha do comercial: o agente junta os dados do embarque e entrega o resultado pronto para conferir.",
    sistemas: ["Enoki / Safra Cloud", "ERP", "Planilhas", "E-mail"],
    tarefa: "Resultado por embarque",
    hoje: ["Dados espalhados em ERP e planilhas", "Alguém junta tudo no fim do mês", "O resultado chega tarde", "Erro de cópia só aparece depois"],
    agente: ["O agente coleta direto do ERP", "Cruza embarque, custo e preço", "Aponta o que não fecha", "O gestor decide com o número do dia"],
  },
  {
    id: "financeiro",
    aba: "Financeiro",
    icone: "dinheiro",
    titulo: "Feito para o financeiro.",
    texto: "Extrato, títulos e ERP conversando sem ninguém copiar linha por linha.",
    sistemas: ["ERP", "Extrato bancário", "Boletos e PIX", "Planilhas"],
    tarefa: "Conciliação",
    hoje: ["Extrato baixado todo dia", "Conferência linha por linha", "Baixa manual no ERP", "Divergência descoberta no fechamento"],
    agente: ["O agente lê o extrato", "Casa cada recebimento com o título", "Separa só o que diverge", "O financeiro confirma as baixas"],
  },
];

export function Segmentos() {
  const [ativo, setAtivo] = useState(0);
  const s = SEGMENTOS[ativo];
  return (
    <div className="mb-seg">
      <div className="mb-seg__abas" role="tablist" aria-label="Segmentos">
        {SEGMENTOS.map((g, i) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            id={`seg-aba-${g.id}`}
            aria-selected={i === ativo}
            aria-controls="seg-painel"
            className={`mb-seg__aba${i === ativo ? " is-on" : ""}`}
            onClick={() => setAtivo(i)}
          >
            <Glifo nome={g.icone} />
            {g.aba}
          </button>
        ))}
      </div>

      <div key={s.id} id="seg-painel" role="tabpanel" aria-labelledby={`seg-aba-${s.id}`} className="mb-seg__painel">
        <div className="mb-seg__topo">
          <div>
            <h3 className="mb-seg__titulo">
              {s.titulo.replace(/\.$/, "")}
              <span className="mb-ponto">.</span>
            </h3>
            <p className="mb-seg__texto">{s.texto}</p>
          </div>
          <ul className="mb-seg__sistemas" aria-label="Sistemas">
            {s.sistemas.map((n, i) => (
              <li key={n} style={{ animationDelay: `${i * 60}ms` }}>{n}</li>
            ))}
          </ul>
        </div>

        <div className="mb-seg__compara">
          <div className="mb-seg__col mb-seg__col--hoje">
            <p className="mb-seg__rot">Hoje · {s.tarefa}</p>
            <ol>
              {s.hoje.map((t, i) => (
                <li key={t} style={{ animationDelay: `${120 + i * 90}ms` }}>{t}</li>
              ))}
            </ol>
          </div>
          <div className="mb-seg__seta" aria-hidden="true">→</div>
          <div className="mb-seg__col mb-seg__col--agente">
            <p className="mb-seg__rot">Com o agente</p>
            <ol>
              {s.agente.map((t, i) => (
                <li key={t} style={{ animationDelay: `${420 + i * 90}ms` }}>{t}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
