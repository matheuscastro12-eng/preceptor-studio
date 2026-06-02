import type { Metadata } from "next";
import { SectorPage } from "@/components/marketing/SectorPage";

export const metadata: Metadata = {
  title: "Educação",
  description:
    "Edtech, regtech educacional ou plataforma de ensino? Construímos com aderência real, custo de conteúdo modelado e certificação válida.",
  alternates: { canonical: "/educacao" },
  openGraph: {
    type: "website",
    url: "https://preceptor-studio.vercel.app/educacao",
    title: "Educação · PRECEPTOR! Venture Studio",
    description:
      "Edtech B2B com aderência real e certificação válida. Diagnóstico técnico grátis.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function EducacaoPage() {
  return (
    <SectorPage
      slug="educacao"
      label="Educação"
      eyebrow="EDTECH · LMS · CERTIFICAÇÃO"
      headline={
        <>
          Edtech, regtech ou plataforma de <span className="cyan">ensino?</span>
        </>
      }
      lead="Educação B2B trava no mesmo lugar de sempre: aderência baixa pós-onboarding, custo de conteúdo subestimado e certificação que não vale nada na prática. A gente entra com diagnóstico técnico e plano comercial calibrado pro ciclo real de compra."
      method="Em edtech o estudo estratégico foca no comprador certo: RH corporativo, instituição de ensino ou consumidor final pedem produtos completamente diferentes. A camada de execução prioriza retenção mensurável (aderência de 30, 60 e 90 dias) e integração com LMS legado do cliente. Conteúdo entra como custo modelado, não como detalhe operacional."
      painPoints={[
        {
          title: "Aderência baixa pós-onboarding",
          body: "Produto entrega 80% de signup e 12% de uso recorrente em 60 dias. Sem engagement loop estruturado e sem mecânica de cohort, o churn vira certeza estatística antes do segundo ciclo de renovação.",
        },
        {
          title: "Custo de conteúdo subestimado",
          body: "Plano financeiro trata produção de conteúdo como custo fixo pequeno. Na operação real, conteúdo é a maior linha do CAC e demora 18 meses pra calibrar.",
        },
        {
          title: "Certificação válida na ponta",
          body: "Plataforma promete certificado, mas o mercado comprador (RH corporativo, conselho profissional) exige selo MEC, ANBIMA ou equivalente. Sem isso, o ticket cai pela metade.",
        },
      ]}
      cases={[
        {
          title: "Plataforma de microcredenciais para indústria",
          summary: "Estudo estratégico + execução em sprints. Cohort tracking nativo e integração com LMS corporativo via SCORM.",
          status: "Em produção · Q3 2026",
        },
        {
          title: "Edtech B2B de compliance regulatório",
          summary: "Camada 1 concluída. Produto em construção com foco em renovação anual obrigatória e relatório auditável.",
          status: "Em produção · Q3 2026",
        },
      ]}
    />
  );
}
