import { getAllPosts, t } from "@/lib/blog";
import { site } from "@/lib/site";

// Prerendered to out/blog/feed.xml by `next build` (static export: GET only,
// no request reading).
export const dynamic = "force-static";

/** Escape the five XML special characters; used on every interpolated value. */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 date, as RSS 2.0 requires ("Sat, 17 Oct 2026 00:00:00 GMT"). */
function rfc822(iso: string | number): string {
  return new Date(iso).toUTCString();
}

/**
 * RSS 2.0, summaries only (F-Q4 default). Items are the visible posts, newest
 * first; with no published posts this is a valid channel with no items.
 */
export async function GET(): Promise<Response> {
  const posts = await getAllPosts();
  const blogUrl = new URL("/blog/", site.url).toString();
  const feedUrl = new URL("/blog/feed.xml", site.url).toString();
  const newest = posts[0];
  const lastBuild = newest ? rfc822(newest.updated ?? newest.date) : rfc822(Date.now());

  const items = posts
    .map((post) => {
      const link = new URL(`/blog/${post.slug}/`, site.url).toString();
      const categories = post.tags
        .map((tag) => `      <category>${xml(tag)}</category>`)
        .join("\n");
      return [
        "    <item>",
        `      <title>${xml(post.title)}</title>`,
        `      <link>${xml(link)}</link>`,
        `      <guid isPermaLink="true">${xml(link)}</guid>`,
        `      <pubDate>${rfc822(post.date)}</pubDate>`,
        `      <description>${xml(post.summary)}</description>`,
        ...(categories ? [categories] : []),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${xml(`${t("blog.meta.title")} — ${site.name}`)}</title>`,
    `    <link>${xml(blogUrl)}</link>`,
    `    <description>${xml(t("blog.meta.description"))}</description>`,
    "    <language>en</language>",
    `    <lastBuildDate>${lastBuild}</lastBuildDate>`,
    `    <atom:link href="${xml(feedUrl)}" rel="self" type="application/rss+xml"/>`,
    ...(items ? [items] : []),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
