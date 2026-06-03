import type { Metadata } from "next";
import { SectorPage } from "@/components/marketing/SectorPage";

export const metadata: Metadata = {
  title: "Tech",
  description:
    "B2B SaaS, AI native ou plataforma de produto? Construímos com time-to-market real, retenção medida e arquitetura que escala.",
  alternates: { canonical: "/tech" },
  openGraph: {
    type: "website",
    url: "https://preceptorstudio.com/tech",
    title: "Tech · PRECEPTOR! Venture Studio",
    description:
      "B2B SaaS e AI native com retenção medida e arquitetura que escala. Diagnóstico técnico grátis.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function TechPage() {
  return (
    <SectorPage
      slug="tech"
      label="Tech"
      eyebrow="B2B SAAS · AI NATIVE · PRODUTO"
      headline={
        <>
          AI feature, AI native ou produto <span className="cyan">B2B real?</span>
        </>
      }
      lead="Tech parece o terreno mais fácil pra construir e é onde mais tese morre. A gente entra separando o que é feature sobre LLM de prateleira do que é produto AI native, e mede retenção desde o primeiro release."
      method="No vertical tech o estudo estratégico foca em três perguntas: o produto sobrevive se o LLM base ficar mais barato, o canal de distribuição é defensável e o time consegue manter a stack escolhida. A camada de execução entra com observabilidade no dia 1, testes de carga antes do primeiro release pago e documentação técnica que o time interno do cliente consegue tocar depois."
      painPoints={[
        {
          title: "AI feature vs AI native",
          body: "Produto descrito como AI native usa GPT como wrapper. Quando o modelo base fica mais barato e mais capaz, o moat desaparece. Diferenciação real exige dado proprietário, fine-tuning ou orquestração defensável.",
        },
        {
          title: "Time-to-market sem buffer",
          body: "Cronograma de 12 semanas com zero buffer pra auditoria, integração com SSO corporativo ou revisão de segurança. Quem vende B2B SaaS aprende caro que comprador enterprise exige SOC2, ISO ou equivalente.",
        },
        {
          title: "Retenção em B2B SaaS",
          body: "Métrica de sucesso focada em MRR e signup. Sem instrumentação real de feature usage, cohort retention e expansion revenue, o churn vira surpresa no terceiro trimestre.",
        },
      ]}
      cases={[
        {
          title: "Plataforma de análise de dados para B2B",
          summary: "Estudo estratégico + execução em sprints. Observabilidade nativa, instrumentação de retenção e SSO corporativo.",
          status: "Em produção · Q3 2026",
        },
        {
          title: "Orquestrador de agentes para operação interna",
          summary: "Camada 1 concluída. Produto em construção com foco em workflow auditável e custo unitário modelado.",
          status: "Em produção · Q3 2026",
        },
      ]}
    />
  );
}
