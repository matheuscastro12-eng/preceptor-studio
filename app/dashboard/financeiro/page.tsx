import { fetchCategories, fetchPricings, fetchSummary, fetchTransactions } from "@/lib/finance";
import { getFinanceAnalytics } from "@/lib/financeAnalytics";
import { fetchStudies } from "@/lib/dashboardData";
import { FinanceView } from "./FinanceView";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const [summary, transactions, pricings, categories, studies, analytics] = await Promise.all([
    fetchSummary(),
    fetchTransactions({ limit: 500 }),
    fetchPricings(),
    fetchCategories(),
    fetchStudies(),
    getFinanceAnalytics(),
  ]);
  const studyOptions = studies.map((s) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    status: s.status,
    client_id: s.client_id,
    client_name: s.client?.name || null,
  }));
  return (
    <FinanceView
      summary={summary}
      initialTransactions={transactions}
      initialPricings={pricings}
      categories={categories}
      studies={studyOptions}
      analytics={analytics}
    />
  );
}
