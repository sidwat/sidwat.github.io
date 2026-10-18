import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { nav, site } from "@/lib/site";

export const dynamic = "force-static";

// trailingSlash is on, so the canonical URL carries the slash. Listing the
// unslashed form would point search engines at a redirect.
function absolute(href: string): string {
  return new URL(href.endsWith("/") ? href : `${href}/`, site.url).toString();
}

/**
 * Nav-derived entries (so a page added to the site cannot be left out), then
 * one entry per visible post. `/admin/` is not in `nav` and never listed; the
 * `__no-posts` export placeholder is not a post, so getAllPosts never returns it.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = nav.map((item) => ({
    url: absolute(item.href),
    lastModified: new Date(),
    priority: item.href === "/" ? 1 : 0.8,
  }));

  const posts = (await getAllPosts()).map((post) => ({
    url: absolute(`/blog/${post.slug}`),
    lastModified: new Date(post.updated ?? post.date),
    priority: 0.7,
  }));

  return [...pages, ...posts];
}
