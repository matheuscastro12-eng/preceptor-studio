import type { Metadata } from "next";
import { SegmentLanding, type SegmentContent } from "@/components/marketing/SegmentLanding";

export const metadata: Metadata = {
  title: "Agro",
  description:
    "Automação com Inteligência Artificial para o agronegócio: laudos e relatórios de campo, controle de insumos e integração entre fazenda, escritório e cooperativa.",
  alternates: { canonical: "/agro" },
};

const CONTENT: SegmentContent = {
  eyebrow: "Agro",
  title: ["Da fazenda ao escritório", "sem redigitar nada"],
  lead: "Laudo, romaneio, controle de insumo, relatório de cooperativa: o campo produz dado o dia inteiro. A automação faz esse dado chegar no padrão certo, na hora certa.",
  pains: [
    {
      title: "O laudo que leva dias",
      body: "A informação sai do campo no papel ou na foto do WhatsApp e leva dias até virar laudo no formato que a cooperativa ou o cliente exige.",
    },
    {
      title: "O insumo controlado de cabeça",
      body: "Estoque de defensivo e fertilizante anotado em caderno ou planilha solta. A surpresa aparece na hora da aplicação.",
    },
    {
      title: "Cada cooperativa, um formato",
      body: "O mesmo dado redigitado em relatório diferente pra cada cooperativa, banco ou certificadora.",
    },
    {
      title: "A safra decidida no feeling",
      body: "Custo por talhão e produtividade fechados meses depois da colheita, quando a decisão já passou.",
    },
  ],
  automations: [
    {
      title: "Laudos e relatórios no padrão",
      body: "O registro do campo vira laudo e relatório no formato exigido, em minutos, sem redigitação.",
    },
    {
      title: "Controle de insumos",
      body: "Entrada, saída e aplicação registradas num fluxo único, com alerta antes de faltar.",
    },
    {
      title: "Integração fazenda, escritório e cooperativa",
      body: "O dado nasce uma vez e chega em todo lugar que precisa, no formato de cada um.",
    },
    {
      title: "Painel de safra",
      body: "Custo por talhão e produtividade atualizados durante a safra, enquanto a decisão ainda vale.",
    },
  ],
  results: [
    { v: "De dias pra minutos", l: "no ciclo entre o registro no campo e o laudo entregue." },
    { v: "Zero redigitação", l: "o mesmo dado deixa de ser digitado três vezes em três lugares." },
    { v: "Número na mão", l: "decisão de safra com custo e produtividade em tempo real." },
  ],
  ctaLine:
    "Conta pra gente como o dado sai do campo hoje. A gente mostra onde a automação se paga primeiro.",
};

export default function AgroPage() {
  return <SegmentLanding content={CONTENT} />;
}
