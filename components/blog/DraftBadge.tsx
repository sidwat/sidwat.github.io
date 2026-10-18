import { formatPostDate, isScheduled, t, type Post } from "@/lib/blog";

type Kind = "draft" | "scheduled" | "both";

/** Which marker a post needs, or undefined when it is publicly visible. */
export function draftKind(post: Pick<Post, "draft" | "date">): Kind | undefined {
  const scheduled = isScheduled(post);
  if (post.draft && scheduled) return "both";
  if (post.draft) return "draft";
  if (scheduled) return "scheduled";
  return undefined;
}

/** The `!` box that travels with every draft marker (never colour alone). */
function Glyph() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-5 flex-none items-center justify-center border border-current font-mono text-xs leading-none tracking-normal"
    >
      !
    </span>
  );
}

/**
 * Draft / scheduled marker (docs/design/blog-index.md §5.2, blog-post.md §4).
 * Only ever rendered for posts that are not public, which only exist in
 * drafts builds. Sits on the page ground: studio `--cr` on `--surface` fails.
 */
export default function DraftBadge({
  post,
  variant,
}: {
  post: Pick<Post, "draft" | "date">;
  variant: "chip" | "banner";
}) {
  const kind = draftKind(post);
  if (!kind) return null;

  if (variant === "chip") {
    const label = {
      draft: t("blog.draft.chip.draft"),
      scheduled: t("blog.draft.chip.scheduled"),
      both: t("blog.draft.chip.both"),
    }[kind];
    return (
      <span data-testid="post-draft-badge" className="inline-flex items-center gap-2 text-cr">
        <Glyph />
        {label}
      </span>
    );
  }

  const label =
    kind === "scheduled"
      ? t("blog.draft.banner.scheduled", { date: formatPostDate(post.date) })
      : t("blog.draft.banner.draft");
  return (
    <p
      data-testid="post-draft-badge"
      className="eyebrow mb-4 flex items-center gap-2 border-l-2 border-cr py-1 pl-3 text-cr"
    >
      <Glyph />
      {label}
    </p>
  );
}
