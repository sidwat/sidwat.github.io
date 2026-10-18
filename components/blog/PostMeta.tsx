import { Fragment, type ReactNode } from "react";
import { formatPostDate, t, type Post } from "@/lib/blog";

/** Decorative separator; screen readers hear the items as a list of phrases. */
export function Sep() {
  return <span aria-hidden="true"> · </span>;
}

function join(parts: ReactNode[]) {
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <Sep />}
      {part}
    </Fragment>
  ));
}

/** `<time>` for a post date, rendered in UTC per copy ID `blog.date.format`. */
export function PostDate({ iso, testId }: { iso: string; testId?: string }) {
  return (
    <time dateTime={iso} data-testid={testId}>
      {formatPostDate(iso)}
    </time>
  );
}

/**
 * Metadata line. `row` (index): "6 min read · video-coding · notes".
 * `post` (post header): "2 Nov 2026 · Updated 10 Nov 2026 · 6 min read",
 * first date in `--luma`, the rest `--muted`.
 */
export default function PostMeta({
  post,
  variant,
}: {
  post: Pick<Post, "date" | "updated" | "readingMinutes" | "tags">;
  variant: "row" | "post";
}) {
  const reading = t("blog.readingtime", { n: post.readingMinutes });

  if (variant === "row") {
    return <p className="eyebrow mt-3">{join([reading, ...post.tags])}</p>;
  }

  const parts: ReactNode[] = [
    <span key="date" className="text-luma">
      <PostDate iso={post.date} testId="post-date" />
    </span>,
  ];
  if (post.updated) {
    const [before, after] = t("blog.post.updated").split("{date}");
    parts.push(
      <span key="updated">
        {before}
        <PostDate iso={post.updated} />
        {after}
      </span>,
    );
  }
  parts.push(<span key="reading">{reading}</span>);

  return <p className="eyebrow mt-2 leading-relaxed">{join(parts)}</p>;
}
