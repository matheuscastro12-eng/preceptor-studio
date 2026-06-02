import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { getAllPosts, formatPostDate } from "@/lib/insights";

const SITE_URL = "https://preceptor-studio.vercel.app";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Como o PRECEPTOR! Studio pensa método, diagnóstico e análise de teses. Conteúdo técnico de venture studio, sem clichê de startup.",
  alternates: { canonical: "/insights" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/insights`,
    title: "Insights · PRECEPTOR! Venture Studio",
    description:
      "Como o PRECEPTOR! Studio pensa método, diagnóstico e análise de teses.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default async function InsightsIndexPage() {
  const posts = await getAllPosts();

  return (
    <div className="site">
      <Nav />
      <section className="section" style={{ paddingTop: 72 }}>
        <div className="container">
          <div style={{ maxWidth: 760 }}>
            <span className="eyebrow">Insights</span>
            <h1 className="mkt-display" style={{ marginTop: 18, fontSize: "clamp(2.4rem, 4.8vw, 4.4rem)" }}>
              Como pensamos o <span className="cyan">estúdio.</span>
            </h1>
            <p className="mkt-lead" style={{ marginTop: 22 }}>
              Notas técnicas sobre método, diagnóstico e análise de tese.
              Escrito pelo time do PRECEPTOR! Studio com base no que a gente vê
              construindo produto B2B no Brasil.
            </p>
          </div>

          <div className="mkt-insights-grid" style={{ marginTop: 56 }}>
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/insights/${post.slug}`}
                className="mkt-post-card"
                aria-label={`Ler: ${post.title}`}
              >
                <span className="mkt-chip">{post.category}</span>
                <h2 className="mkt-post-card__title">{post.title}</h2>
                <p className="mkt-post-card__desc">{post.description}</p>
                <div className="mkt-post-meta">
                  <span>{formatPostDate(post.date)}</span>
                  <span className="mkt-post-meta__dot" aria-hidden="true">
                    •
                  </span>
                  <span>{post.readingTime} min de leitura</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
