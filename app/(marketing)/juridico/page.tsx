import type { Metadata } from "next";
import { SectorPage } from "@/components/marketing/SectorPage";

export const metadata: Metadata = {
  title: "Jurídico",
  description:
    "Legaltech, automação de contrato ou compliance multi-jurisdição? Construímos com modelo SaaS real, não billable hours disfarçado.",
  alternates: { canonical: "/juridico" },
  openGraph: {
    type: "website",
    url: "https://preceptorstudio.com/juridico",
    title: "Jurídico · PRECEPTOR! Venture Studio",
    description:
      "Legaltech com modelo SaaS real e compliance multi-jurisdição. Diagnóstico técnico grátis.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function JuridicoPage() {
  return (
    <SectorPage
      slug="juridico"
      label="Jurídico"
      eyebrow="LEGALTECH · CONTRATO · COMPLIANCE"
      headline={
        <>
          Legaltech, automação de cláusula ou <span className="cyan">compliance?</span>
        </>
      }
      lead="Jurídico no Brasil tem comprador exigente e ciclo de venda longo. A gente entra na sua tese mapeando o que automação resolve, o que revisão humana ainda precisa fechar e como o modelo de receita escapa do hábito de billable hour."
      method="No setor jurídico o estudo estratégico começa pela leitura do comprador: escritório boutique, departamento jurídico interno, fintech ou contraparte regulatória pedem produtos diferentes. A camada de execução desenha workflow auditável desde o dia 1 (versionamento, rastro de revisão, exportação assinada) porque jurídico não aceita caixa preta."
      painPoints={[
        {
          title: "Automação de cláusula vs revisão humana",
          body: "Produto promete redigir contrato com IA, mas o comprador exige revisão jurídica antes de assinar. Quem não modela esse loop perde o cliente na segunda semana de uso real.",
        },
        {
          title: "Compliance multi-jurisdição",
          body: "Plataforma desenhada pra direito brasileiro entra em conflito quando o cliente é multinacional ou opera em mais de uma jurisdição. Sem camada de parametrização regulatória, o produto para de servir.",
        },
        {
          title: "Billable hour vs assinatura SaaS",
          body: "Mercado paga por hora há décadas. Quem entra com SaaS puro e ticket fixo encontra resistência cultural e churn alto. Modelo híbrido (assinatura + créditos por uso) costuma converter mais.",
        },
      ]}
      cases={[
        {
          title: "Plataforma de revisão contratual para escritório boutique",
          summary: "Estudo estratégico + execução. Workflow auditável, integração com DocuSign e exportação assinada.",
          status: "Em produção · Q3 2026",
        },
        {
          title: "Compliance LGPD para fintech early stage",
          summary: "Camada 1 concluída. Produto em construção com foco em mapeamento de processamento e DPIA automatizada.",
          status: "Em produção · Q3 2026",
        },
      ]}
    />
  );
}
