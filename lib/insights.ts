import { promises as fs } from "fs";
import path from "path";

export interface InsightPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  body: string;
  readingTime: number;
}

const INSIGHTS_DIR = path.join(process.cwd(), "content", "insights");

interface Frontmatter {
  title: string;
  description: string;
  date: string;
  category: string;
}

function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Invalid frontmatter: missing --- delimiters");
  }
  const yaml = match[1];
  const body = match[2];

  const data: Record<string, string> = {};
  for (const line of yaml.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;
    const key = trimmed.slice(0, colonIndex).trim();
    let value = trimmed.slice(colonIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  const required: Array<keyof Frontmatter> = [
    "title",
    "description",
    "date",
    "category",
  ];
  for (const key of required) {
    if (!data[key]) {
      throw new Error(`Missing frontmatter field: ${key}`);
    }
  }

  return {
    data: {
      title: data.title,
      description: data.description,
      date: data.date,
      category: data.category,
    },
    body,
  };
}

function computeReadingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export async function getAllPosts(): Promise<InsightPost[]> {
  const entries = await fs.readdir(INSIGHTS_DIR);
  const files = entries.filter((f) => f.endsWith(".md"));

  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = await fs.readFile(path.join(INSIGHTS_DIR, file), "utf8");
      const { data, body } = parseFrontmatter(raw);
      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        category: data.category,
        body,
        readingTime: computeReadingTime(body),
      } satisfies InsightPost;
    })
  );

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

export async function getPostBySlug(slug: string): Promise<InsightPost | null> {
  const all = await getAllPosts();
  return all.find((p) => p.slug === slug) ?? null;
}

export function formatPostDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}
