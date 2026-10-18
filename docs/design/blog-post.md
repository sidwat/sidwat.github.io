# Blog post — `/blog/<slug>/`

Task D-1 (structure and states) · D-4 (body typography: [prose.md](prose.md)) · Spec: [01-design-spec.md](../01-design-spec.md) §4.2 · Tokens: [tokens.md](tokens.md) · Strings: [copy.md](copy.md) (`blog.post.*`, `blog.draft.*`)

Hi-fi, both grounds, with a screen of body text containing a code block and a table: [assets/post-ink.html](assets/post-ink.html), [assets/post-studio.html](assets/post-studio.html), exported as `assets/post-ink-1280.png`, `assets/post-studio-1280.png`, `assets/post-ink-375.png`, `assets/post-studio-375.png`. The HTML is responsive (open it at any width).

---

## 1. Decisions

| Id | Decision | Why |
|---|---|---|
| **D-Q5** | **Left-aligned inside the frame**, body column `max-width: 36rem`, not centred. | Every other page is left-aligned and ruled; the title, back link and hairlines all start at the frame's left edge, so a centred column would leave three competing left edges. 36rem at 18px Archivo is about 64 characters per line (running English averages about 0.5em per character), inside the 60 to 72 target. Verify in QA with the real font: 45 to 75 is the acceptable window. Wide content (code, tables, figures) extends rightwards to the frame edge. |
| Title size | `.display` at `clamp(1.875rem, 5vw, 3rem)` (30px to 48px), against PageHeader's `clamp(2.25rem, 6vw, 4rem)`. | Post titles are sentences, not one-word section names. At 4rem a 90-character title is 8 to 9 lines on a laptop. At 30px on a 320px screen a 96-character title is about 7 lines (≈15 characters per line at wdth 118) and fits without overflow. The `.display` class (wdth 118, weight 700, −0.03em, leading 0.94) is unchanged. |
| Header | A new `PostHeader`, **not** `PageHeader`. | PageHeader fixes its clamp and its intro is `.prose-body`; the post needs a different clamp, a meta row instead of a label, and a larger lede. It keeps the same skeleton (eyebrow, display h1, muted lede, `border-b border-line pb-10`), so the two read as siblings. |
| Reading veil | Header and body sit on the `.reading-veil` ([tokens.md](tokens.md) §3). | Body text on a lit mesh drops to 1.1:1 for muted text under a lit strand; the veil makes the worst case ≥4.4:1. |
| Copy button on code | **Omitted in v1.** | It would be the only client component on the post page (02 §F-2 says post pages are Server Components), needs a polite "Copied" status and an accessible name, and the horizontal-scroll code block is already selectable. Revisit if the owner posts long code. |

## 2. Anatomy

```
← Blog                                                (back link, eyebrow register, 44px hit area)
[draft banner]                                        (dev/QA builds only)
2 NOV 2026 · UPDATED 10 NOV 2026 · 6 MIN READ         (eyebrow row; first date --luma, rest --muted)
Title as .display h1                                  (clamp(1.875rem, 5vw, 3rem))
Lede = summary                                        (Archivo 1.125rem <sm / 1.25rem sm+, --muted, max 36rem)
──────────────────────────────────────────────        (border-b border-line pb-10)

[cover]                                               (optional, frame width, aspect 1200 / 630, max-height 26rem)

Body (the Prose component, column 36rem)             -> prose.md

──────────────────────────────────────────────        (border-t border-line, mt-16 pt-6)
TAGS     video-coding · notes                         (omitted entirely when no tags)
──────────────────────────────────────────────
REPLY    Found a mistake, or want to discuss this?    Write a message →
──────────────────────────────────────────────
OLDER                              NEWER
Title of the older post            Title of the newer post
```

## 3. Wireframes

### 3.1 Normal — 1280 (frame 1024, content 976)

```
   ← BLOG
   2 NOV 2026 · UPDATED 10 NOV 2026 · 6 MIN READ
   Why a loop filter needs fewer bits
   than you think                                           <- .display ~48px
   A short walk through where in-loop filtering spends
   its budget, and what a learned filter changes.           <- lede, 36rem
   ─────────────────────────────────────────────────────────────────────────
   ┌─────────────────────────────────────────────────────────────────────┐
   │                    cover 976 x 416 (object-fit: cover)               │
   └─────────────────────────────────────────────────────────────────────┘
   Body paragraph, 576px column, 18px/1.75 ...
   ...
   ## Section heading (h2, hairline above)
   ┌ pre ──────────────────────────────────────────────────────────────────┐
   │ code block, breaks out to 976px, scrolls horizontally                  │
   └───────────────────────────────────────────────────────────────────────┘
   ┌ table-wrap (tabindex=0) ──────────────────────────────────────────────┐
   │ Name   Bits   PSNR   ...                                               │
   └───────────────────────────────────────────────────────────────────────┘
   ─────────────────────────────────────────────────────────────────────────
   TAGS     video-coding · notes
   ─────────────────────────────────────────────────────────────────────────
   REPLY    Found a mistake, or want to discuss this?      Write a message →
   ─────────────────────────────────────────────────────────────────────────
   OLDER                                                      NEWER
   Notes from a week of teaching entropy coding               Year-end: what I would build next
```

### 3.2 Normal — 375

```
   ← BLOG
   2 NOV 2026 ·
   UPDATED 10 NOV 2026 ·
   6 MIN READ
   Why a loop filter
   needs fewer bits
   than you think                  <- 30px, 5vw floor
   A short walk through where
   in-loop filtering spends its
   budget …                        <- lede 18px
   ─────────────────────────────
   [cover 327 x 172]
   Body at 17px/1.7, column = 327px (about 38 characters)
   ┌ pre ───────────────────────┐
   │ scrolls inside, focus ring  │   <- never widens the page
   └─────────────────────────────┘
   ─────────────────────────────
   TAGS  video-coding · notes
   REPLY Found a mistake, or want to discuss this?
         Write a message →
   OLDER
   Notes from a week of …
   NEWER
   Year-end: what I …
```

## 4. States

| State | Design |
|---|---|
| **Normal** | §2 and §3. |
| **Long title (≥ 80 chars)** | Title wraps; `overflow-wrap: anywhere` so one unbroken token cannot overflow. At 320px: ≈15 characters per line, 7 lines for 96 characters. Back link and meta stay above. No truncation, no `text-overflow`. |
| **No cover** | Header rule is followed directly by the body (`mt-10`). Nothing reserves cover space. |
| **With cover** | Frame width, `aspect-ratio: 1200 / 630` (the Open Graph ratio, so one file serves both), `max-height: 26rem; object-fit: cover`, intrinsic `width`/`height` from the loader so no layout shift, `fetchpriority="high"` (it is the LCP). 1px `--line` border, `--surface` placeholder fill. **Studio:** a plain `<img>`; do **not** use `.portrait-frame` (that class feathers edges in studio, which would eat the picture). Alt text is mandatory (CMS-enforced); no caption slot (use a figure in the body if a caption is needed). At 320 the cover is 272×143. Authoring hint: keep the subject in the centre 60%, because wide screens crop top and bottom. |
| **No tags** | Tag row is removed with its hairline; the reply block's top hairline becomes the first rule. |
| **No summary edge cases** | Summary is required (CMS and build enforce ≤200). Worst case 200 characters at 320px is about 7 lines of lede (≈220px) plus a 7-line title (≈200px): the header can run to ~600px, longer than a 568px screen. Accepted, but the CMS hint `cms.summary.hint` tells the author to aim for ≤140. |
| **First / last post** | Prev/next are two grid cells, Older left, Newer right. A missing one is omitted (not a disabled link, not an empty box). If only Newer exists it stays in the right cell, text right-aligned at `md+`, so direction is still spatial. Below `md` the cells stack and the missing one is simply absent. |
| **`updated` present** | Second date in the eyebrow row, prefixed `Updated`, in `--muted` while the original date is `--luma`. This is the "quieter" treatment without lowering contrast. `<time datetime>` for both. It never replaces the original date. |
| **Draft preview** (`BLOG_INCLUDE_DRAFTS=1` only) | Banner above the back link: `[!] DRAFT — NOT PUBLISHED` (mono eyebrow, `--cr`, 2px `--cr` left rule, on the ground, never on `--surface`). Scheduled variant: `[!] SCHEDULED — NOT PUBLISHED UNTIL 14 DEC 2026`. `data-testid="post-draft-badge"`. |
| **Unknown slug** | Existing 404 (`dynamicParams = false`). Confirmed adequate; see [blog-index.md](blog-index.md) §5. |
| **Loading / error** | Not applicable (pre-rendered; build-time validation). No skeleton. |

### 4.1 Long title at 320

```
   ← BLOG
   2 NOV 2026 · 6 MIN READ
   A very long post title that
   goes on for nearly a hundred
   characters so that it has to
   wrap onto many lines at the
   narrowest supported width,
   without overflowing
   Lede (muted) …
   ─────────────────────────────
```

## 5. End of post

- **Tags:** `<ul aria-label="Tags">`, plain text items (not links in v1, D-Q3). Items are mono `--muted`, separated by `·`. Left label `TAGS` is an `.eyebrow`, in a 10rem column at `md+` (same grid as the index) and above the list below `md`.
- **Reply:** one sentence in `.prose-body` and the link `Write a message →` → `/contact/`. (The spec suggests "Reply by email"; the destination is the contact form, so the label says message. Same link text as the footer and the empty state: identical destination, identical name.)
- **Previous/next:** labels `Older`, `Newer` (not Previous/Next, which are ambiguous in a newest-first list). Each cell is one link containing the eyebrow label and the post title, accessible name `Older: <title>`. Cell: `border-t border-line`, `py-6`, hover title `--cb`, stretched hit area (≥ 4.5rem tall), row-style focus ring.

## 6. Contrast

From [tokens.md](tokens.md) §2.

| Element | Pair | Ink | Studio |
|---|---|---|---|
| Title, first date, body | `--luma` / `--ink` | 16.56 | 12.56 |
| Updated date, lede, tags, labels | `--muted` / `--ink` | 4.81 | 5.37 |
| Back link hover, post-nav hover | `--cb` / `--ink` | 5.38 | 5.60 |
| Draft banner text and glyph | `--cr` / `--ink` | 6.77 | 4.67 |
| Underline of the reply link | `--cb` / `--ink` | 5.38 | 5.60 |
| Veil worst case on a lit strand (luma / muted) | | 15.37 / 4.46 | 11.09 / 4.75 |

## 7. Responsive

| Width | Notes |
|---|---|
| 320 | Gutter 24px (16px minimum respected). Body 17px, ≈33 characters per line: short but unavoidable under the 24px gutter. Code/table scroll inside their own container. Eyebrow row wraps to 2 or 3 lines. |
| 375 portrait / landscape | Portrait as 320. Landscape (667 wide): single column; cover capped at 26rem tall; header static. |
| 768 | Body column 576px, left-aligned; breakouts to 720px. Prev/next two columns. |
| 1024, 1280 | Column 576px, breakouts to 976px. |
| 1920 | As 1280, frame centred. |

Satisfies: no horizontal page scroll (code, table, figures and long tokens are contained); 400% zoom (becomes the 320 layout); 1.4.12 text spacing (no fixed heights or widths on text boxes).

## 8. Accessibility

1. One `h1` (the title). Body headings start at `h2`. Footnote section heading is visually hidden `h2`.
2. The page wrapper in `app/layout.tsx` is `<div id="main">`, **not a `<main>` element**, so there is no `main` landmark site-wide today. Request R-4 to the Tech Lead (frozen file): make it `<main id="main">`. This design does not depend on it, but the spec's "keep `main` semantics" cannot be met until it exists.
3. `<article>` wraps header + body; `<time datetime>` for dates.
4. Back link, tag list, reply and post-nav are in DOM order of the visual layout.
5. Link text is meaningful out of context: `Older: <title>`, `Write a message`, `← Blog` (arrow aria-hidden).
6. Scrollable regions (`pre`, table wrappers) have `tabindex="0"`, an accessible name, and a visible focus ring.
7. Images: alt rules in [prose.md](prose.md) §3.

## 9. Implementation notes for Frontend

| Component | Reuses unchanged | New / notes |
|---|---|---|
| `PostHeader` | `.display`, `.eyebrow`, `.prose-body` classes | **New.** Not `PageHeader`; props `{post}`; renders back link, `DraftBadge` banner, `PostMeta`, `h1`, lede |
| `PostMeta` | `.eyebrow` | shared with the index; first date `--luma`, rest `--muted` here |
| `Cover` (inline in the page is fine) | | `<img>` with width/height, `fetchpriority="high"` |
| `Prose` | | wrapper `.post-body.reading-veil`; styles in the `blog prose` block; see [prose.md](prose.md) |
| `TagList` | | plain list, no links |
| `PostNav` | | Older/Newer cells |
| `DraftBadge` | | variants `chip` (index) and `banner` (post) |
| `Nav.tsx`, `Footer.tsx` | | changed, see [contact.md](contact.md) §8 and §9. Active state: `pathname.startsWith("/blog")` keeps `Blog` active on `/blog/<slug>/`; the added underline cue works on it |
| `app/not-found.tsx` | **unchanged** | |

`generateMetadata` and JSON-LD are Frontend's (02 §F-2); the design adds no requirements there.
