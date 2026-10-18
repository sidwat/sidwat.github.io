// Generated 1:1 from docs/design/copy.md (all `blog.*` IDs). Do not edit by hand:
// change the copy deck, then regenerate. `{placeholders}` are filled with `t()`.
// `blog.post.figure.prefix` lives in CSS `content`; it is listed here for completeness only.

export const blogCopy = {
  "blog.meta.title": "Blog",
  "blog.meta.description": "Notes on compression, vision, and the occasional detour.",
  "blog.index.label": "Writing",
  "blog.index.title": "Blog",
  "blog.index.intro": "Notes on compression, vision, and the occasional detour.",
  "blog.index.year": "{year}",
  "blog.readingtime": "{n} min read",
  "blog.date.format": "2 Nov 2026",
  "blog.index.empty.label": "No entries",
  "blog.index.empty.body": "Nothing published yet. The first post is in progress.",
  "blog.index.empty.cta": "Write a message",
  "blog.index.rss.label": "Subscribe",
  "blog.index.rss.link": "RSS feed",
  "blog.draft.chip.draft": "Draft",
  "blog.draft.chip.scheduled": "Scheduled",
  "blog.draft.chip.both": "Draft · Scheduled",
  "blog.draft.banner.draft": "Draft — not published",
  "blog.draft.banner.scheduled": "Scheduled — not published until {date}",
  "blog.post.back": "Blog",
  "blog.post.updated": "Updated {date}",
  "blog.post.tags.label": "Tags",
  "blog.post.reply.label": "Reply",
  "blog.post.reply.body": "Found a mistake, or want to discuss this?",
  "blog.post.reply.cta": "Write a message",
  "blog.post.nav.aria": "More posts",
  "blog.post.nav.older": "Older",
  "blog.post.nav.newer": "Newer",
  "blog.post.anchor.label": "Link to section: {heading}",
  "blog.post.code.aria": "Code, {language}",
  "blog.post.code.aria.plain": "Code",
  "blog.post.table.aria": "Table",
  "blog.post.footnotes.heading": "Footnotes",
  "blog.post.footnote.backref": "Back to reference {n}",
  "blog.post.figure.prefix": "Fig. {n} —",
} as const;

export type BlogCopyId = keyof typeof blogCopy;

/** Look up a copy string and fill its `{placeholders}`. Unknown placeholders are left as is. */
export function t(id: BlogCopyId, vars: Record<string, string | number> = {}): string {
  return blogCopy[id].replace(/\{([a-z]+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}
