// Reads content/blog/*.md at build time. Only lib/blog/** may use `fs` (02 §5.5).

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { localImagePath, readingMinutes, renderMarkdown, type RenderContext } from "./render";
import { BlogContentError, SLUG_PATTERN, validateFrontMatter } from "./validate";

export type Post = {
  slug: string; // URL segment, from filename
  title: string;
  date: string; // ISO 8601
  updated?: string; // ISO 8601
  summary: string;
  tags: string[];
  cover?: { src: string; alt: string };
  draft: boolean;
  readingMinutes: number; // computed at build
  html: string; // rendered body (trusted, build-time)
};

const CONTENT_DIR = "content/blog";
const IGNORED = new Set(["readme.md"]);

/** Fails loudly on `---js` / `---coffee` front matter, which gray-matter would eval. */
function assertYamlFrontMatter(file: string, source: string) {
  const first = source.replace(/^﻿/, "").split(/\r?\n/, 1)[0];
  if (first.trim() !== "---") {
    throw new BlogContentError(
      `${file}: must start with a front-matter block: a line containing only --- (YAML), the fields, then ---`,
    );
  }
}

async function loadOne(root: string, name: string, warn: (m: string) => void): Promise<Post> {
  const file = `${CONTENT_DIR}/${name}`;
  const slug = name.slice(0, -".md".length);
  const source = readFileSync(path.join(root, CONTENT_DIR, name), "utf8");
  assertYamlFrontMatter(file, source);

  let parsed: matter.GrayMatterFile<string>;
  try {
    // Passing options disables gray-matter's shared cache (it would hand back mutated objects).
    parsed = matter(source, { language: "yaml" });
  } catch (err) {
    const reason = (err as Error).message.split("\n")[0];
    throw new BlogContentError(`${file}: the front matter is not valid YAML (${reason})`);
  }

  const fm = validateFrontMatter(file, parsed.data);
  const publicDir = path.join(root, "public");
  const ctx: RenderContext = { file, publicDir, errors: [], warn };

  if (fm.cover && fm.cover.startsWith("/")) {
    const abs = localImagePath(publicDir, fm.cover);
    if (!abs || !existsSync(abs) || !statSync(abs).isFile()) {
      ctx.errors.push(`${file}: "cover" ${fm.cover} does not exist (expected public${fm.cover})`);
    }
  }

  const html = await renderMarkdown(parsed.content, ctx);
  if (ctx.errors.length) throw new BlogContentError(ctx.errors.join("\n"));

  return {
    slug,
    title: fm.title,
    date: fm.date,
    ...(fm.updated ? { updated: fm.updated } : {}),
    summary: fm.summary,
    tags: fm.tags,
    ...(fm.cover && fm.coverAlt ? { cover: { src: fm.cover, alt: fm.coverAlt } } : {}),
    draft: fm.draft,
    readingMinutes: readingMinutes(parsed.content),
    html,
  };
}

/**
 * Every post in content/blog, validated and rendered, newest first (ties by slug).
 * Drafts and future posts are included; visibility is applied by the caller.
 * Throws one BlogContentError listing every problem in every file.
 */
export async function loadAllPosts(root = process.cwd()): Promise<Post[]> {
  const dir = path.join(root, CONTENT_DIR);
  if (!existsSync(dir)) return [];

  const names = readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && !d.name.startsWith(".") && !IGNORED.has(d.name.toLowerCase()))
    .map((d) => d.name)
    .sort();

  const errors: string[] = [];
  const warn = (m: string) => console.warn(`[blog] ${m}`);
  const seen = new Map<string, string>();
  const toLoad: string[] = [];

  for (const name of names) {
    const file = `${CONTENT_DIR}/${name}`;
    if (!name.endsWith(".md")) {
      if (/\.(md|markdown|mdx)$/i.test(name)) {
        errors.push(`${file}: posts must use the lowercase .md extension`);
      }
      continue; // other files (images by mistake, editor backups) are not posts
    }
    const slug = name.slice(0, -3);
    if (!SLUG_PATTERN.test(slug)) {
      errors.push(
        `${file}: the filename is the URL, so it must be lowercase-kebab-case (a-z, 0-9, -), e.g. my-first-post.md`,
      );
      continue;
    }
    const key = slug.toLowerCase();
    if (seen.has(key)) {
      errors.push(`${file}: duplicate slug "${slug}" (also ${seen.get(key)})`);
      continue;
    }
    seen.set(key, file);
    toLoad.push(name);
  }

  const results = await Promise.allSettled(toLoad.map((name) => loadOne(root, name, warn)));
  const posts: Post[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") posts.push(r.value);
    else errors.push(r.reason instanceof Error ? r.reason.message : String(r.reason));
  }

  if (errors.length) {
    throw new BlogContentError(
      `Blog content has ${errors.length === 1 ? "a problem" : `${errors.length} problems`}; fix and publish again:\n` +
        errors.map((e) => `  - ${e.replace(/\n/g, "\n  - ")}`).join("\n"),
    );
  }

  return posts.sort((a, b) =>
    a.date === b.date ? a.slug.localeCompare(b.slug) : a.date < b.date ? 1 : -1,
  );
}
