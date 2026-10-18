# Blog content

Every blog post is one Markdown file in this folder. The site reads them at build time (`lib/blog`), and the editor at `/admin/` writes them for you, so you should never need to edit these files by hand.

> **Drafts are public.** This repository is public. A post with `draft: true` is hidden from the *website*, but anyone can read it, and its full history, on GitHub. Never put anything here that must stay private: no unpublished results, no private images, no personal data. The editor strips location (EXIF/GPS) data from JPEG/PNG/HEIC photos on upload; strip it yourself from anything else (and from any file added outside the editor).

## Where things go

| What | Where | URL |
|---|---|---|
| A post | `content/blog/<slug>.md` | `/blog/<slug>/` |
| Its images | `public/images/blog/<slug>/<file>` | `/images/blog/<slug>/<file>` |

`<slug>` is the filename. It is lowercase-kebab-case (`a-z`, `0-9`, `-`), has no date in it, and **never changes once published**: renaming the file breaks every link to the post. You can retitle a post freely, because the title is not part of the URL.

## Front matter (schema, copied from `docs/00-overview.md` §5.1)

```yaml
---
title: "…"            # required, ≤ 90 chars
date: 2026-11-02T09:00:00Z   # required, ISO 8601 with timezone; posts dated in the future are hidden until the next build after that moment
updated: 2026-11-10T09:00:00Z   # optional
summary: "…"          # required, ≤ 200 chars; used for list excerpt, <meta description>, OG, RSS
tags: [video-coding, notes]     # optional; lowercase kebab-case
cover: /images/blog/<slug>/cover.jpg   # optional
coverAlt: "…"         # required iff cover is set
draft: true           # required; CMS default = true so a new post is never published by accident
---
Markdown body (CommonMark + GFM tables/task lists/footnotes). Raw HTML is NOT rendered.
```

Dates may be written quoted (`"2026-11-02T09:00:00Z"`) or unquoted. The two samples use one form each, so the loader is exercised on both.

## Rules the build enforces

The build **fails**, and the live site stays as it was, if any post has:

- a missing or invalid required field (`title`, `date`, `summary`, `draft`), or a title over 90 or a summary over 200 characters;
- a `date` or `updated` that cannot be parsed;
- a `cover` without `coverAlt`;
- a duplicate slug;
- a local image (`/images/blog/...`) that does not exist under `public/`.

If a change doesn't appear on the site, open the repository's **Actions** tab. A red run names the file and field to fix.

## When is a post visible?

A post is public only when `draft: false` **and** its `date` is not in the future at build time. Future-dated posts appear at the next build after their date. There is no scheduled rebuild (decision Q8), so that means the next time anything is published.

Local and QA builds can show drafts and future posts with `BLOG_INCLUDE_DRAFTS=1` (`pnpm build:drafts`). The production deploy never sets it.

## Writing tips

- Body text is Markdown: headings from `##` down (the title is the page's only `#`), lists, links, code fences with a language (```` ```python ````), tables, footnotes (`[^1]`), images (`![alt text](/images/blog/<slug>/file.png)`).
- **Raw HTML is not rendered.** `<script>`, `<iframe>`, `<img onerror=…>` and the like are removed or shown as text. This is deliberate: it protects the editor's sign-in token, which lives in your browser on this site.
- Images: keep them ≤ 200 KB and ≤ 1600 px wide. The site serves them as they are, without resizing. The editor converts uploaded photos to WebP at most 1600 px for you; animated GIFs are uploaded unchanged. Always write alt text.
- Tags: lowercase-kebab-case, for example `video-coding`, not `Video Coding`.

## The two sample posts

`hello-world.md` (every Markdown feature the design covers) and `edge-cases.md` (layout and safety stress test) are **fixtures** for development and QA. Both are `draft: true`, so they never appear on the live site. You may delete them, together with `public/images/blog/hello-world/`, once your first real post is published. Tell the QA/Frontend owners first if their tests still use them.
