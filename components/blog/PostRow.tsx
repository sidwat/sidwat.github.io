import Link from "next/link";
import type { Post } from "@/lib/blog";
import DraftBadge, { draftKind } from "./DraftBadge";
import PostMeta, { PostDate, Sep } from "./PostMeta";

/**
 * One index row (docs/design/blog-index.md §3). The title link is stretched
 * over the whole row (`.post-row-link::after`), and the focus ring is drawn on
 * that pseudo-element so the large hit area is what looks focused.
 */
export default function PostRow({ post }: { post: Post }) {
  const marked = draftKind(post) !== undefined;
  return (
    <li data-testid="post-row" className="relative border-b border-line py-8">
      <p className="eyebrow flex flex-wrap items-center whitespace-pre">
        {marked && (
          <>
            <DraftBadge post={post} variant="chip" />
            <Sep />
          </>
        )}
        <PostDate iso={post.date} />
      </p>
      <h3 className="mt-2 text-[1.375rem] leading-snug [overflow-wrap:anywhere]">
        <Link href={`/blog/${post.slug}/`} className="post-row-link">
          {post.title}
        </Link>
      </h3>
      <p className="prose-body mt-3 line-clamp-3 max-w-2xl md:line-clamp-2">{post.summary}</p>
      <PostMeta post={post} variant="row" />
    </li>
  );
}
