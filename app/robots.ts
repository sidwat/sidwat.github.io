import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    // /admin/ is the CMS sign-in shell: nothing there for search engines.
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/"] },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
