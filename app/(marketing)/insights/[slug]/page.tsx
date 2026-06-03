import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { getAllPosts, getPostBySlug, formatPostDate } from "@/lib/insights";
import {
  renderRichMarkdown,
  extractMarkdownHeadings,
} from "@/lib/markdownExtensions";

const SITE_URL = "https://preceptorstudio.com";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Post não encontrado" };

  const url = `${SITE_URL}/insights/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      title: `${post.title} · PRECEPTOR!`,
      description: post.description,
      publishedTime: post.date,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function InsightPostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const html = renderRichMarkdown(post.body);
  const headings = extractMarkdownHeadings(post.body, 2);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "PRECEPTOR! Venture Studio",
    },
    publisher: {
      "@type": "Organization",
      name: "PRECEPTOR! Venture Studio",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon` },
    },
    mainEntityOfPage: `${SITE_URL}/insights/${post.slug}`,
    articleSection: post.category,
  };

  return (
    <div className="site">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Nav />
      <article className="section" style={{ paddingTop: 56 }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <Link
            href="/insights"
            className="mkt-post-back"
            aria-label="Voltar para Insights"
          >
            <span aria-hidden="true">←</span> Voltar para Insights
          </Link>

          <div style={{ marginTop: 28 }}>
            <span className="mkt-chip">{post.category}</span>
          </div>
          <h1
            className="mkt-display"
            style={{ marginTop: 18, fontSize: "clamp(2.2rem, 4.4vw, 3.8rem)" }}
          >
            {post.title}
          </h1>
          <div className="mkt-post-meta" style={{ marginTop: 20 }}>
            <span>{formatPostDate(post.date)}</span>
            <span className="mkt-post-meta__dot" aria-hidden="true">
              •
            </span>
            <span>{post.readingTime} min de leitura</span>
          </div>

          {headings.length > 0 && (
            <nav
              className="mkt-post-toc"
              aria-label="Sumário"
              style={{ marginTop: 32 }}
            >
              <span className="mkt-post-toc__label">Neste artigo</span>
              <ul>
                {headings.map((h) => (
                  <li key={h.id} style={{ paddingLeft: (h.depth - 2) * 14 }}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div
            className="mkt-post-prose"
            style={{ marginTop: 40 }}
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="mkt-post-cta">
            <div>
              <span className="eyebrow">Próximo passo</span>
              <h3 className="mkt-h2" style={{ fontSize: "clamp(1.4rem, 2.4vw, 2rem)", marginTop: 10 }}>
                Quer rodar o diagnóstico na sua tese?
              </h3>
            </div>
            <Link
              href="/diagnostico?start=1"
              className="mkt-btn mkt-btn--primary mkt-btn--lg"
            >
              Fazer diagnóstico grátis
              <span className="mkt-btn__icon" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
}
