import Link from "next/link";
import { t, type Post } from "@/lib/blog";
import PostRow from "./PostRow";

/** Posts are already newest first, so years come out newest first too. */
function byYear(posts: Post[]): [string, Post[]][] {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const year = post.date.slice(0, 4); // ISO in UTC, matching the visible dates
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return [...groups];
}

/**
 * Populated index (docs/design/blog-index.md §2): one section per year, the
 * year label sticky in the left column from `md`, then the RSS row.
 */
export default function PostList({ posts }: { posts: Post[] }) {
  return (
    <>
      <ol data-testid="post-list" className="mt-12 border-t border-line">
        {byYear(posts).map(([year, rows]) => (
          <li key={year} className="grid md:grid-cols-[10rem_1fr] md:gap-8">
            <h2 className="eyebrow pt-8 md:sticky md:top-24 md:self-start">
              {t("blog.index.year", { year })}
            </h2>
            <ol>
              {rows.map((post) => (
                <PostRow key={post.slug} post={post} />
              ))}
            </ol>
          </li>
        ))}
      </ol>

      <div className="md:grid md:grid-cols-[10rem_1fr] md:gap-8">
        <div className="flex items-center justify-between gap-4 border-b border-line py-2 md:col-start-2">
          <p className="eyebrow">{t("blog.index.rss.label")}</p>
          {/* A plain anchor: the feed is a file, not a page to client-navigate to. */}
          <a href="/blog/feed.xml" className="text-link eyebrow">
            {t("blog.index.rss.link")}
          </a>
        </div>
      </div>
    </>
  );
}

/** Zero published posts (blog-index.md §5.1): a ruled row with nothing in it. */
export function EmptyState() {
  return (
    <div
      data-testid="blog-empty"
      className="mt-12 grid gap-2 border-y border-line py-8 md:grid-cols-[10rem_1fr] md:gap-8"
    >
      <p className="eyebrow md:pt-1.5">{t("blog.index.empty.label")}</p>
      <div>
        <p className="prose-body">{t("blog.index.empty.body")}</p>
        <Link href="/contact/" className="text-link mt-2">
          {t("blog.index.empty.cta")}
          <span aria-hidden="true" className="font-mono">
            {"\u00a0→"}
          </span>
        </Link>
      </div>
    </div>
  );
}
