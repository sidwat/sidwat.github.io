import Link from "next/link";
import clsx from "clsx";
import { t, type Post } from "@/lib/blog";

function Cell({ post, dir }: { post: Post; dir: "older" | "newer" }) {
  return (
    <Link
      href={`/blog/${post.slug}/`}
      className={clsx(
        "post-nav-link group block border-b border-line py-6",
        dir === "newer" && "md:col-start-2 md:text-right",
      )}
    >
      <span className="eyebrow block">{t(`blog.post.nav.${dir}`)}</span>
      {/* Accessible name "Older: <title>"; the colon is not shown. */}
      <span className="sr-only">: </span>
      <span className="mt-2 block text-lg leading-snug transition-colors [overflow-wrap:anywhere] group-hover:text-cb">
        {post.title}
      </span>
    </Link>
  );
}

/** Older / Newer (blog-post.md §5). A missing side is omitted, not disabled. */
export default function PostNav({ older, newer }: { older?: Post; newer?: Post }) {
  if (!older && !newer) return null;
  return (
    <nav aria-label={t("blog.post.nav.aria")} className="grid md:grid-cols-2 md:gap-x-8">
      {older && <Cell post={older} dir="older" />}
      {newer && <Cell post={newer} dir="newer" />}
    </nav>
  );
}
