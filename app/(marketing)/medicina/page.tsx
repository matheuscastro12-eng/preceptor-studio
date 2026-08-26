import type { Metadata } from "next";
import { SegmentLanding, type SegmentContent } from "@/components/marketing/SegmentLanding";

export const metadata: Metadata = {
  title: "Medicina",
  description:
    "Automação com Inteligência Artificial para operações de medicina: agendamento, confirmação, conferência de guias de convênio e apoio a laudos.",
  alternates: { canonical: "/medicina" },
};

const CONTENT: SegmentContent = {
  eyebrow: "Medicina",
  title: ["Agenda cheia, recepção tranquila,", "glosa em queda"],
  lead: "Agendamento, guia de convênio, cadastro, laudo: a rotina da clínica é feita de regra e repetição. A automação tira isso das costas da equipe e devolve atenção ao paciente.",
  pains: [
    {
      title: "A agenda com furo",
      body: "Paciente que não confirma, horário que fica vazio e a recepção ligando um a um pra tentar preencher.",
    },
    {
      title: "A guia glosada",
      body: "Código errado, anexo faltando, prazo vencido: a glosa aparece semanas depois e o faturamento refaz tudo.",
    },
    {
      title: "O cadastro redigitado",
      body: "O mesmo paciente preenchendo os mesmos dados em papel, sistema e convênio, com a recepção no meio.",
    },
    {
      title: "O laudo na fila",
      body: "O atendimento acaba e o laudo espera digitação. O médico leva trabalho pra casa ou o prazo estoura.",
    },
  ],
  automations: [
    {
      title: "Confirmação e triagem de agenda",
      body: "Confirmação automática, lista de espera acionada no furo e triagem antes da consulta.",
    },
    {
      title: "Conferência de guias antes do envio",
      body: "Código, prazo e anexo conferidos pela regra de cada convênio antes de a guia sair.",
    },
    {
      title: "Cadastro único do paciente",
      body: "O dado nasce uma vez e alimenta sistema, convênio e prontuário, sem redigitação.",
    },
    {
      title: "Apoio a laudos",
      body: "O registro do atendimento vira minuta de laudo no padrão da clínica, pronta pra revisão do médico.",
    },
  ],
  results: [
    { v: "Menos glosa", l: "guia conferida antes do envio, retrabalho de faturamento em queda." },
    { v: "Menos furo", l: "confirmação automática e lista de espera preenchendo a agenda." },
    { v: "Mais paciente", l: "recepção e equipe com tempo pra quem está na frente da mesa." },
  ],
  ctaLine:
    "Conta pra gente como a rotina da clínica roda hoje. A gente mostra onde a automação se paga primeiro.",
};

export default function MedicinaPage() {
  return <SegmentLanding content={CONTENT} />;
}
