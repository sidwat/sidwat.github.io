// Public API of the blog (contract: docs/00-overview.md §4.2). Pages and components
// import only from "@/lib/blog", never `fs` or content paths. Swapping the source
// (e.g. Notion, DEVELOPMENT.md Phase 3) means changing load.ts, not the pages.

import { loadAllPosts, type Post } from "./load";

export type { Post } from "./load";
export { blogCopy, t, type BlogCopyId } from "./copy";

/** Fixed once per build process, so every page of one build agrees on "now". */
const BUILD_TIME = Date.now();

/**
 * Drafts and future-dated posts are included when `BLOG_INCLUDE_DRAFTS=1`
 * (QA builds, `pnpm build:drafts`) and by default in `next dev`
 * (opt out there with `BLOG_INCLUDE_DRAFTS=0`). Production never sets it.
 */
export function includesDrafts(): boolean {
  const flag = process.env.BLOG_INCLUDE_DRAFTS;
  if (flag === "1") return true;
  if (flag === "0") return false;
  return process.env.NODE_ENV === "development";
}

/** True when the post's date is after this build's start (shown only in drafts builds). */
export function isScheduled(post: Pick<Post, "date">): boolean {
  return Date.parse(post.date) > BUILD_TIME;
}

/** Public iff `draft === false && date <= build time` (00 §5.1). */
export function isPublished(post: Pick<Post, "draft" | "date">): boolean {
  return !post.draft && !isScheduled(post);
}

let all: Promise<Post[]> | undefined;

function loadMemo(): Promise<Post[]> {
  // `next dev` keeps one process alive across edits, so a process-level cache
  // would serve stale posts until a restart. Re-read on every request there.
  if (process.env.NODE_ENV === "development") return loadAllPosts();
  if (!all) {
    all = loadAllPosts();
    // Do not cache a failure in `next dev`: the next request should retry after a fix.
    all.catch(() => {
      all = undefined;
    });
  }
  return all;
}

/** Visible posts, newest first (ties by slug). Throws if any post file is invalid. */
export async function getAllPosts(): Promise<Post[]> {
  const posts = await loadMemo();
  return includesDrafts() ? posts : posts.filter(isPublished);
}

/** A visible post by slug, or undefined (unknown, draft or future in a production build). */
export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getAllPosts()).find((p) => p.slug === slug);
}

/**
 * `output: "export"` rejects a dynamic route whose `generateStaticParams`
 * returns nothing, so with zero visible posts `/blog/[slug]` is given this one
 * placeholder param instead. It renders the 404 page, and the build script
 * (`lib/blog/prune-export.mjs`) deletes `out/blog/<it>/` afterwards so no post
 * directory exists. Underscores keep it outside the slug pattern, so it can
 * never collide with a real post.
 */
export const EMPTY_SLUG_PARAM = "__no-posts";

/** Older (next in the newest-first list) and newer neighbours of a visible post. */
export async function getAdjacentPosts(
  slug: string,
): Promise<{ older?: Post; newer?: Post }> {
  const posts = await getAllPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { older: posts[i + 1], newer: i > 0 ? posts[i - 1] : undefined };
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Visible date per copy ID `blog.date.format`, e.g. "2 Nov 2026" (UTC, so no hydration mismatch). */
export function formatPostDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}
