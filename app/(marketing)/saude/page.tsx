import type { Metadata } from "next";
import { SectorPage } from "@/components/marketing/SectorPage";

export const metadata: Metadata = {
  title: "Saúde",
  description:
    "Healthtech, telemedicina ou plataforma para operadora? Construímos com LGPD e CFM 2.314/22 lidos antes do código rodar.",
  alternates: { canonical: "/saude" },
  openGraph: {
    type: "website",
    url: "https://preceptor-studio.vercel.app/saude",
    title: "Saúde · PRECEPTOR! Venture Studio",
    description:
      "Healthtech com LGPD e CFM lidos antes do código rodar. Diagnóstico técnico grátis.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function SaudePage() {
  return (
    <SectorPage
      slug="saude"
      label="Saúde"
      eyebrow="HEALTHTECH · TELEMEDICINA · OPERADORA"
      headline={
        <>
          Healthtech, telemedicina ou plataforma de <span className="cyan">operadora?</span>
        </>
      }
      lead="Saúde no Brasil é mercado regulado por padrão. A gente entra na sua tese com LGPD, CFM 2.314/22 e integração com legacy de operadora já mapeados. Diagnóstico técnico grátis em 8 minutos."
      method="O estudo estratégico em saúde olha três camadas que ninguém olha cedo: regime regulatório aplicável, plano de integração com sistemas legados (TISS, prontuário, billing) e modelo de receita compatível com o ciclo de pagamento de operadora ou prestador. A camada de execução entra com time sênior que já entregou produto em healthtech, não com freelancer aprendendo enquanto cobra."
      painPoints={[
        {
          title: "LGPD e CFM 2.314/22 sem clareza",
          body: "Time monta produto sem parecer jurídico assinado sobre dado sensível de saúde e telemedicina. Na auditoria da operadora ou na fiscalização do CFM, vira retrabalho de 6 meses.",
        },
        {
          title: "Integração com legacy de operadora",
          body: "Plataforma desenhada como SaaS limpo, mas o comprador real é operadora que roda mainframe e exige integração TISS. Quem não modela isso no dia 1 entrega produto que não vende.",
        },
        {
          title: "Billing por uso vs ticket fixo",
          body: "Receita modelada como assinatura, mas operadora paga por procedimento. Quando o contrato real chega, gross margin desaba porque o custo de servir foi calibrado pro modelo errado.",
        },
      ]}
      cases={[
        {
          title: "Plataforma de triagem com IA para operadora regional",
          summary: "Estudo estratégico + execução em curso. Triagem assistida por modelo proprietário com integração TISS nativa.",
          status: "Em produção · Q3 2026",
        },
        {
          title: "Prontuário leve para clínica de atenção primária",
          summary: "Camada 1 concluída. Produto em desenvolvimento com foco em LGPD, exportação CFM e billing por consulta.",
          status: "Em produção · Q3 2026",
        },
      ]}
    />
  );
}
