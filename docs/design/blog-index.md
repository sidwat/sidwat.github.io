# Blog index — `/blog/`

Task D-1 · Spec: [01-design-spec.md](../01-design-spec.md) §4.1 · Tokens and contrast: [tokens.md](tokens.md) · Strings: [copy.md](copy.md) (IDs `blog.index.*`, `blog.draft.*`)

Post titles, summaries and dates in the wireframes are placeholders, not copy (see [copy.md](copy.md), "Coverage check"). Both grounds (ink and studio) use identical layout; only token values change. Where a state's appearance depends on the ground, the "Ground notes" column says so. Wireframes below are ASCII; the real type and colour are in the hi-fi pages ([post-ink.html](assets/post-ink.html), [post-studio.html](assets/post-studio.html)) which also contain the nav and footer in context.

---

## 1. Decisions

| Id | Question | Recommendation | Why |
|---|---|---|---|
| **D-Q2** | `Blog` or `Blogs`? | **`Blog`** for the nav label, the page title (`<h1>`), the `<title>` and the back link. Header eyebrow stays `Writing`. | One blog is a *Blog*, not several. The URL is `/blog/`, the owner's brief says "Blog", and the other nav labels name a section (`Teaching`, `Experience`, `Contact`), not a count. It is also four characters shorter in a nav that is out of room. Cost: change one string in `lib/site.ts` and anything QA wrote against `Blogs`. |
| **D-Q3** | Tags/filters in v1? | **Pure chronological list.** Tags are shown as plain text on index rows and posts, not links. | One author, a handful of posts. A filter UI for fewer than ~15 posts is chrome. Plain-text tags also keep them out of the 44px target obligation. Re-evaluate at ~20 posts or when two tags each have 5+ posts. |
| **D-Q4** | Cover image on index? | **Text-only index.** Cover appears on the post page only. | Keeps rows scannable and identical whether or not a post has a cover; no layout shift or image budget on the list; matches the Teaching list. |

## 2. Anatomy

Page frame is unchanged: `mx-auto max-w-5xl px-6 pb-24 pt-20`.

```
PageHeader (unchanged component)
  label  "Writing"            .eyebrow
  title  "Blog"               .display, clamp(2.25rem,6vw,4rem)
  intro  "Notes on compression, vision, and the occasional detour."   .prose-body, max-w-xl
  ──────────────────────────  border-b border-line pb-10

List  (mt-12, border-t border-line)
  one section per calendar year, newest year first
    year label  <h2 class="eyebrow">  (left column at md+, sticky; row header below md)
    <ol> of rows, newest first
      row  (lives in the 1fr column; the year label owns the 10rem column)
           border-b border-line, py-8, position: relative
        date line   <time datetime> eyebrow    "2 Nov 2026"
        title       <h3><a> text-[1.375rem] leading-snug, hover text-cb
        summary     .prose-body, max-w-2xl, plain text, line-clamp 3 (<md) / 2 (md+)
        meta line   eyebrow: "6 min read · video-coding · notes"
End-of-list row (only when >= 1 post)   "Subscribe" … "RSS feed"
```

Grid: each year section is `grid md:grid-cols-[10rem_1fr] md:gap-8`. The year `<h2>` is in column 1 (`md:sticky md:top-24 md:self-start`), the `<ol>` of rows is in column 2. Below `md` the grid is one column and the year label sits above its rows with `pt-8`.

## 3. Row behaviour

- **Whole row is one link target.** The title anchor carries `after:absolute after:inset-0` (stretched pseudo-element); the row is `relative`. The summary and meta are plain text. No links inside the summary.
- **Hover:** title colour `--luma` → `--cb` (5.38 / 5.60 on ground). No other change.
- **Focus:** `:focus-visible` on the anchor draws the global 2px `--cb` ring, but on the **row**, not the title: `a:focus-visible { outline: none }` and `a:focus-visible::after { outline: 2px solid var(--cb); outline-offset: -2px }` (the pseudo covers the row; inset offset keeps it inside the hairlines). Without this, the ring would wrap only the title and the large hit area would look unfocused.
- **Hit area:** the full row (≥ 4.5rem tall) satisfies 44×44 at every width.
- **Summary clamp:** CSS `line-clamp` (3 lines below `md`, 2 from `md`). It ends at a line end with an ellipsis; never a fixed height, so 1.4.12 text-spacing overrides and 400% zoom cannot clip text. Authoring rule (CMS hint `cms.summary.hint`): the first ~100 characters must stand alone, because on a 320px screen only ~3 lines of ~33 characters are shown.
- **Dates:** `<time datetime="2026-11-02T09:00:00Z">2 Nov 2026</time>`, UTC, `Intl.DateTimeFormat("en-GB", {timeZone:"UTC", day:"numeric", month:"short", year:"numeric"})`. (`en-GB` renders September as "Sept"; accept that.)
- **Reading time:** `6 min read`, plain text, never `<time>`.
- **Tags:** plain mono text separated by ` · ` (separator `aria-hidden`). Screen readers hear "6 min read, video-coding, notes".

## 4. Wireframes

### 4.1 Populated, three posts across two years — 1280 (frame 1024)

```
┌ nav ─────────────────────────────────────────────────────────────────────┐
│ Sidhartha Watsa   EXPERIENCE PUBLICATIONS PROJECTS TEACHING BLOG CONTACT   ◐ #E9D5A3 │
└──────────────────────────────────────────────────────────────────────────┘

   WRITING
   Blog                                              .display
   Notes on compression, vision, and the occasional detour.
   ───────────────────────────────────────────────────────────────────────
   
   ───────────────────────────────────────────────────────────────────────
   2026         2 NOV 2026
   (sticky)     Why a loop filter needs fewer bits than you think          <- 1.375rem, hover cb
                A short walk through where in-loop filtering spends its
                budget, and what a learned filter changes about that.      <- 2 lines, clamp
                6 MIN READ · VIDEO-CODING · NOTES
                ───────────────────────────────────────────────────────────
                14 OCT 2026
                Notes from a week of teaching entropy coding
                ...
                4 MIN READ · TEACHING
                ───────────────────────────────────────────────────────────
   2025         30 DEC 2025
   (sticky)     Year-end: what I would build next
                ...
                3 MIN READ
                ───────────────────────────────────────────────────────────
                SUBSCRIBE                                  RSS FEED
                ───────────────────────────────────────────────────────────
   footer
```

### 4.2 Populated — 768 portrait (md grid, header static)

```
   WRITING
   Blog
   Notes on compression, vision, and the occasional detour.
   ─────────────────────────────────────────────────────────
   2026        2 NOV 2026                  <- right column is 528px
   (sticky)    Why a loop filter needs fewer bits than you think
               A short walk through where in-loop filtering spends its
               budget, and what a learned filter changes about that.
               6 MIN READ · VIDEO-CODING · NOTES
               ───────────────────────────────────────────────
```

### 4.3 Populated — 375 / 320 (one column)

```
   WRITING
   Blog
   Notes on compression,
   vision, and the occasional
   detour.
   ───────────────────────────────
   
   ───────────────────────────────
   2026                          <- h2 eyebrow, pt-8
   
   2 NOV 2026
   Why a loop filter needs
   fewer bits than you think
   A short walk through where
   in-loop filtering spends
   its budget, and what a …      <- clamp 3
   6 MIN READ · VIDEO-CODING
   · NOTES                       <- meta wraps, never truncates
   ───────────────────────────────
```

### 4.4 1920

Frame stays `max-w-5xl` and centred; mesh and grain fill the viewport. Nothing scales up. This is deliberate: the measure of the list never exceeds ~62rem.

## 5. States

| State | Design | Ground notes |
|---|---|---|
| **Populated, 1 post** | One year section: year label (left, sticky within its section) and one row, then the end-of-list row. The sticky label is bounded by its section, so nothing floats alone; with one row the label and row top-align. No "only one post" apology copy. | none |
| **Populated, 30+ posts** | No pagination in v1. Scanning is carried by: the year label staying in view while scrolling a year (`md+`), a ~9rem row rhythm (title dominates; summary is muted), and hairline rows. Each row is about 10 to 12rem tall, so 30 rows is about six screens. **Threshold to revisit:** more than 50 posts, or more than 20 in one year, add in-year anchors or a year jump list. Do not add them now. | none |
| **Empty** (0 published; the state on day one) | See 5.1 | none |
| **Loading** | **Not applicable.** `/blog/` is pre-rendered; client navigation from another page is instant. **No skeleton is designed.** | n/a |
| **Error** | **Not applicable at runtime**: bad content fails the build, not the visitor. Unknown slug (`/blog/nope/`) → existing `app/not-found.tsx` ("No such page … may have moved when the site was rebuilt, or never existed at all"). **Confirmed: it reads correctly for a missing or unpublished post** and its link list contains `Blog` (renamed) and `Contact` (new) automatically. I recommend **not** adding a "← All posts" link: one click from the list already there, and it keeps `not-found.tsx` unchanged (no Request raised). | none |
| **Draft preview** (`BLOG_INCLUDE_DRAFTS=1` only; never in production) | See 5.2 | marker is `--cr`: 6.77 ink / 4.67 studio on ground, plus words |
| **Scheduled preview** (same build flag; `draft:false` but date in the future) | See 5.2 | as above |

### 5.1 Empty state

Replaces "Coming soon." It reuses the ruled-row idiom so it reads as a list with nothing in it, not as an error.

```
   WRITING
   Blog
   Notes on compression, vision, and the occasional detour.
   ───────────────────────────────────────────────────────────────────────

   ───────────────────────────────────────────────────────────────────────  border-t
   NO ENTRIES      Nothing published yet. The first post is in progress.     <- .prose-body
   (eyebrow,       Write a message →                                         <- text link (tokens §4.8)
    10rem col)
   ───────────────────────────────────────────────────────────────────────  border-b
```

- `data-testid="blog-empty"` on the row. No RSS row (a feed with zero items is valid but there is nothing to subscribe to).
- Below `md` the `NO ENTRIES` eyebrow sits above the sentence.
- Nav item `Blog` is kept (Q9 default). Sitemap still includes `/blog/`.

### 5.2 Draft and scheduled markers

```
   [!] DRAFT · 2 NOV 2026                      <- eyebrow, "!" glyph box + word, in --cr
   Why a loop filter needs fewer bits than you think
   ...

   [!] SCHEDULED · 14 DEC 2026                 <- draft:false, date in the future
   [!] DRAFT · SCHEDULED · 14 DEC 2026         <- both
```

Rule: the marker is text plus a glyph, never colour alone. It sits on the page ground (not in a `--surface` box), because studio `--cr` on `--surface` is 4.16:1. `data-testid="post-draft-badge"` on the marker. `aria`: the visible text is the accessible text.

### 5.3 End-of-list row

```
   SUBSCRIBE                                         RSS FEED
```
`.eyebrow` on the left; right is a text link `RSS feed` to `/blog/feed.xml` (underlined, `--luma`). Row is `flex justify-between border-b border-line py-5`. Hit area 44px. Hidden when empty.

## 6. Contrast used by this page

All pairs are from [tokens.md](tokens.md) §2.

| Element | Pair | Ink | Studio |
|---|---|---|---|
| Row title | `--luma` / `--ink` | 16.56 | 12.56 |
| Row title hover | `--cb` / `--ink` | 5.38 | 5.60 |
| Summary, date, meta, year label, `NO ENTRIES` | `--muted` / `--ink` | 4.81 | 5.37 |
| Draft marker, glyph | `--cr` / `--ink` | 6.77 | 4.67 |
| Focus ring | `--cb` / `--ink` | 5.38 | 5.60 |
| Row hairlines | `--line` / `--ink` | 1.25 | 1.60 (decoration, exempt) |

## 7. Responsive

| Width | Layout |
|---|---|
| 320 | One column. Year label above rows. Summary clamp 3. Title ~15 characters per line at 1.375rem: long titles wrap to 3 to 4 lines, use `overflow-wrap: anywhere`. Meta wraps. |
| 375 portrait | As 320. |
| 375 landscape (667 wide) | Still one column (below `md`). Header is static (see [contact.md](contact.md) §8), so no sticky bar eats the 375px of height. |
| 768 portrait | `md` grid (160px label column + 32px gap + 528px). Header static, two rows. |
| 768 landscape (1024 wide) | As 1024. |
| 1024, 1280 | Grid; right column up to 784px; summary capped at `max-w-2xl`. Header single-row and sticky from `lg`. |
| 1920 | As 1280 (frame centred). |

Text must reflow at 400% zoom (a 1280 window at 400% is a 320px layout; nothing has a fixed height or width). No horizontal page scroll at any width.

## 8. Accessibility

1. Heading order: `h1` Blog → `h2` year → `h3` row title. No skips. Empty state has no extra heading.
2. The `<ol>` hierarchy gives screen readers "list, N items" per year.
3. Link name = title (visible text); the stretched pseudo adds no text. Date and meta are outside the link text but inside the row, so a screen reader reads title then summary then meta in DOM order. DOM order: date, title, summary, meta (matches visual).
4. `time` elements carry `datetime`.
5. Focus ring on the row (see §3). Hover has no information that focus lacks.
6. Draft marker is words plus glyph.
7. Nothing animates. Hover colour change is a 150ms transition, neutralised by reduced motion.

## 9. Implementation notes for Frontend

Components assumed (all new, in `components/blog/`; Server Components):

| Component | Reuses unchanged | Notes |
|---|---|---|
| `PostList` | `PageHeader` (page-level, unchanged) | outer `<ol data-testid="post-list">` of year `<li>`, each containing the year `<h2>` and a nested `<ol>` of rows. `post-row` selectors still count rows. Adjust QA if it assumes a flat `<ol>`; it does not matter for `getAllByTestId("post-row")` |
| `PostRow` | tokens/`.eyebrow`/`.prose-body` | stretched-link pattern + row focus ring in §3 |
| `PostMeta` | `.eyebrow` | `{date, updated?, readingMinutes, tags}` → text line. Used by index and post |
| `DraftBadge` | `.eyebrow`, `--cr` | `kind: "draft" | "scheduled" | "both"`; rendered only when the loader says the post is not publicly visible |
| `EmptyState` (inline in `app/blog/page.tsx` is fine) | | `data-testid="blog-empty"` |
| `app/not-found.tsx` | **unchanged** | no Request raised |
| `Nav.tsx`, `Footer.tsx` | changed per [contact.md](contact.md) §8 and §9 | |

Strings: every visible string in this file has an ID in [copy.md](copy.md); code must import them, not inline literals.
