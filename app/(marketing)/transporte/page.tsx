import type { Metadata } from "next";
import { SegmentLanding, type SegmentContent } from "@/components/marketing/SegmentLanding";

export const metadata: Metadata = {
  title: "Logística e Transportes",
  description:
    "Automação com Inteligência Artificial para transportadoras e operações logísticas: conferência de documentação, torre de controle, faturamento e atendimento a motorista.",
  alternates: { canonical: "/transporte" },
};

const CONTENT: SegmentContent = {
  eyebrow: "Logística e Transportes",
  title: ["Menos papel, menos telefone,", "menos madrugada no faturamento"],
  lead: "Canhoto, CT-e, ocorrência, motorista no WhatsApp: a sua operação roda em cima de regra e volume. É exatamente onde a automação devolve mais horas por mês.",
  pains: [
    {
      title: "O comprovante que some",
      body: "Canhoto e documentação de carga passam por três mãos antes de virar faturamento. Quando falta um, alguém caça o papel por dias.",
    },
    {
      title: "A ocorrência que o cliente avisa primeiro",
      body: "O atraso e a avaria chegam pelo telefone do cliente, não pelo seu painel. A torre de controle vive apagando incêndio.",
    },
    {
      title: "O faturamento que atravessa a noite",
      body: "Fechamento com gente conferindo pedido contra canhoto na planilha, um a um, contra o relógio.",
    },
    {
      title: "O motorista esperando resposta",
      body: "Adiantamento, comprovante, próxima carga: o motorista pergunta no WhatsApp e alguém do time para o que está fazendo pra responder.",
    },
  ],
  automations: [
    {
      title: "Conferência de documentação",
      body: "Canhoto, CT-e e pedido conferidos automaticamente antes do faturamento. O time só vê as exceções.",
    },
    {
      title: "Torre de controle com alerta",
      body: "Ocorrência detectada e avisada antes de o cliente ligar, com o próximo passo sugerido.",
    },
    {
      title: "Faturamento conferido no prazo",
      body: "Fechamento que roda no horário, com pendência apontada por sistema, não por madrugada de gente.",
    },
    {
      title: "Atendimento ao motorista",
      body: "Resposta imediata para as perguntas com regra: comprovante, agenda de carga, adiantamento. O que exige critério vai pra uma pessoa.",
    },
  ],
  results: [
    { v: "60h por mês", l: "devolvidas ao time só na conferência de documentação." },
    { v: "No prazo", l: "faturamento fechando no horário, sem mutirão de fim de mês." },
    { v: "Antes do cliente", l: "ocorrência avisada pelo seu painel, não pelo telefone dele." },
  ],
  ctaLine:
    "Conta pra gente como a sua operação roda hoje. A gente mostra onde a automação se paga primeiro.",
};

export default function TransportePage() {
  return <SegmentLanding content={CONTENT} />;
}
