import type { MetadataRoute } from "next";
import { nav, site } from "@/lib/site";

export const dynamic = "force-static";

/** Derived from `nav`, so a page added to the site cannot be left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  return nav.map((item) => ({
    // trailingSlash is on, so the canonical URL carries the slash. Listing the
    // unslashed form would point search engines at a redirect.
    url: new URL(item.href.endsWith("/") ? item.href : `${item.href}/`, site.url)
      .toString(),
    lastModified: new Date(),
    priority: item.href === "/" ? 1 : 0.8,
  }));
}
