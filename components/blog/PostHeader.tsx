import Link from "next/link";
import { t, type Post } from "@/lib/blog";
import DraftBadge from "./DraftBadge";
import PostMeta from "./PostMeta";

/**
 * Post header (docs/design/blog-post.md §2): a sibling of PageHeader with a
 * smaller display clamp, a meta row instead of a label, and a larger lede.
 */
export default function PostHeader({ post }: { post: Post }) {
  return (
    <header className="reading-veil border-b border-line pb-10">
      <DraftBadge post={post} variant="banner" />
      <Link href="/blog/" className="back-link eyebrow">
        <span aria-hidden="true">{"← "}</span>
        {t("blog.post.back")}
      </Link>
      <PostMeta post={post} variant="post" />
      <h1
        data-testid="post-title"
        className="display mt-4 text-[clamp(1.875rem,5vw,3rem)] [overflow-wrap:anywhere]"
      >
        {post.title}
      </h1>
      <p className="mt-5 max-w-[36rem] text-lg leading-[1.55] text-muted sm:text-xl">
        {post.summary}
      </p>
    </header>
  );
}
