import { t } from "@/lib/blog";

/** End-of-post tags: plain text, not links in v1 (D-Q3). Omitted when empty. */
export default function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="grid gap-2 border-b border-line py-6 md:grid-cols-[10rem_1fr] md:gap-8">
      <p className="eyebrow">{t("blog.post.tags.label")}</p>
      <ul
        aria-label={t("blog.post.tags.label")}
        data-testid="post-tags"
        className="post-tags flex flex-wrap gap-x-3 font-mono text-[0.6875rem] tracking-[0.18em] text-muted"
      >
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </div>
  );
}
