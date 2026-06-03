import { fetchStudies } from "@/lib/dashboardData";
import { StudiesView } from "./StudiesView";

export const dynamic = "force-dynamic";

export default async function EstudosPage() {
  const studies = await fetchStudies();
  // Map to plain rows for the client component.
  const rows = studies.map((s) => {
    const rec = s.scores?.internal?.recommendation;
    const recommendation =
      rec === "entrar"
        ? ("ENTRAR" as const)
        : rec === "nao_entrar"
          ? ("NAO_ENTRAR" as const)
          : rec === "observar"
            ? ("OBSERVAR" as const)
            : null;
    return {
      id: s.id,
      title: s.title,
      client: s.client?.name || "Sem cliente",
      category: s.category as string,
      status: s.status as string,
      created_at: s.created_at,
      overall: s.scores?.client_facing?.overall ?? null,
      recommendation,
    };
  });
  return <StudiesView rows={rows} />;
}
