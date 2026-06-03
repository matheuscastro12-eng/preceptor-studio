import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/insights";

const SITE_URL = "https://preceptorstudio.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getAllPosts();

  const sectors: MetadataRoute.Sitemap = [
    "saude",
    "educacao",
    "juridico",
    "tech",
  ].map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const insightsRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/insights`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/insights/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/produtos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/diagnostico`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...sectors,
    ...insightsRoutes,
    {
      url: `${SITE_URL}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
