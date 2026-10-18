# Prose — post-body typography

Task D-4 · Spec: [01-design-spec.md](../01-design-spec.md) §4.2 "Prose spec" · Tokens and contrast: [tokens.md](tokens.md) · Context: [blog-post.md](blog-post.md)

Scope: everything inside `.post-body` (the rendered Markdown). Sizes are rem; px appears only for hairlines. Colours are tokens; **every rule below is identical in both grounds** because it is token-driven. The few places where a ground changes the *result* are listed in §6.

Hi-fi proof (a screen of body text with a code block, a table, a footnote, a figure and a task list): [assets/post-ink.html](assets/post-ink.html) / [assets/post-studio.html](assets/post-studio.html), exported to `assets/post-*-1280.png` and `assets/post-*-375.png`.

---

## 1. Principles

1. **Body text is `--luma`, not `--muted`.** The rest of the site uses muted body copy for short blurbs; a 1,500-word article in muted type is tiring (4.81:1 on ink, and 4.38:1 under a lit mesh strand). Luma gives 16.56 / 12.56. Muted is reserved for secondary text (lede, captions, footnotes, quotes).
2. **One column, 36rem, left-aligned.** Wide things (code, tables, figures) break out rightwards to the frame edge; nothing is centred.
3. **The site's idioms carry over:** hairline rules (`--line`) between sections, the hyphen-rule bullet, mono eyebrows for metadata, `Fig. N —` captions.
4. **Nothing in the body may widen the page.** Long tokens break (`overflow-wrap: anywhere`); code and tables scroll in their own focusable region.
5. **No raw HTML is rendered** (decision log, 2026-10-17), so every element here is produced by Markdown. Nothing needs `kbd`, `details` or `iframe` styles.

## 2. Elements

Base: `.post-body { font-size: 1.0625rem; line-height: 1.7 }` below `sm`, `1.125rem / 1.75` from `sm` (640px). Colour `--luma`. Font Archivo (variable). Column `max-width: 36rem`; breakouts (`pre`, `.table-wrap`, `figure`) have `max-width: none` (frame width). `.post-body > *:first-child { margin-top: 0 }`, `> *:last-child { margin-bottom: 0 }`.

### 2.1 Paragraph
`margin: 0 0 1.25rem`. `overflow-wrap: anywhere` (a 100-character unbroken string must not widen the page). No justification, no hyphenation (`hyphens: manual`).

### 2.2 Headings (no `h1` in the body)

| | Size ≥ sm / < sm | Weight / width | Line-height | Tracking | Colour | Space above / below | Extras |
|---|---|---|---|---|---|---|---|
| `h2` | 1.75rem / 1.5rem | 700, `font-variation-settings: "wdth" 112` | 1.2 | −0.02em | `--luma` | 3.5rem / 1rem | `border-top: 1px solid var(--line)`, `padding-top: 1.5rem` (the ruled-list idiom as a section divider). Omitted when it is the first child. |
| `h3` | 1.3125rem / 1.1875rem | 600, wdth 105 | 1.3 | −0.01em | `--luma` | 2.5rem / 0.75rem | |
| `h4` | 0.8125rem | Plex Mono 500, uppercase | 1.4 | 0.12em | `--luma` | 2rem / 0.5rem | Reads like a label, not a sentence; use for "Note", "Result". Not for deep outlines |

`scroll-margin-top: 6rem` on all (clears the sticky bar at `lg+`; the bar is static below). `overflow-wrap: anywhere`. Inline code inside a heading: `font-size: 0.9em`.

**Heading anchor** (`rehype-autolink-headings`, behaviour `append`): an `<a class="anchor" href="#id">#</a>` after the heading text. Plex Mono, `--muted`, `margin-left: 0.5rem`, `min-width: 2rem; min-height: 2rem; display: inline-flex; justify-content: center` (hit area ≥ 24px, WCAG 2.5.8; 32px used). Visible only on `heading:hover`, `.anchor:hover` and `.anchor:focus-visible` (`opacity: 0` otherwise, **not** `display:none`, so it stays in the tab order and appears on focus). On focus the global 2px `--cb` ring applies and the glyph turns `--cb` (5.38/5.60). Accessible name: `aria-label="Link to section: <heading text>"` (copy ID `blog.post.anchor.label`; use the plugin's `properties` function form). Touch devices do not show it: acceptable, it is a convenience.

### 2.3 Links
`--luma` text, `text-decoration: underline`, `text-decoration-color: var(--cb)` **at 100%** (not the site's 60% mix, which is 2.60 / 2.55:1; see tokens §7 R-1), `text-decoration-thickness: 1px`, `text-underline-offset: 3px`. Hover: thickness 2px, text `--cb`. Focus: global ring. External links (`rel="noopener noreferrer"`) get no icon. Link text must make sense out of context (author discipline: "the 2024 survey", never "here").

### 2.4 Lists
- **Unordered:** no marker. `li { position: relative; padding-left: 1.25rem; margin-top: 0.5rem }` with `li::before { content: ""; position: absolute; left: 0; top: 0.85em; width: 0.75rem; height: 1px; background: var(--muted) }`. This is the Teaching list's hyphen rule with one change: the rule is `--muted`, not `--line` (`--line` is 1.25:1 on ink, 1.60 on studio: the marker would vanish at reading size). Nested lists: `margin-top: 0.5rem`, same bullet.
- **Ordered:** `list-style: decimal; padding-left: 1.75rem`; `li::marker { font-family: Plex Mono; font-size: 0.8125em; color: var(--muted) }`; nested ordered lists use `lower-alpha`.
- **Task lists** (GFM `- [ ]` / `- [x]`, rendered `ul.contains-task-list` with `input[type=checkbox][disabled]`): no hyphen bullet; `li { padding-left: 1.75rem }`; checkbox restyled with `appearance: none; position: absolute; left: 0; top: 0.4em; width: 1rem; height: 1rem; border: 1px solid var(--muted); border-radius: 2px; background: transparent; opacity: 1`. Checked: `background: var(--cb)` and a `✓` pseudo-element in `--ink` (5.38/5.60). State is conveyed by the check mark, not colour alone. The `disabled` attribute stays (semantics); the author's text is the label.
- Tight lists: `li > p { margin: 0 }`. Loose lists: `li > p { margin-bottom: 0.75rem }`.
- List block margin: `0 0 1.25rem`.

### 2.5 Blockquote
`margin: 1.75rem 0; padding-left: 1.25rem; border-left: 2px solid var(--cb)`; text `--muted` (quotes are secondary voice), same size as body, no italic; inner paragraphs `margin-bottom: 0.75rem`; last child `margin-bottom: 0`. Attribution written as a final paragraph starting with an em dash is styled as plain text (no special markup in CommonMark).

### 2.6 Code

**Inline code:** Plex Mono 400, `0.875em`, `--luma` on `--surface`, `border: 1px solid var(--line)`, `border-radius: 2px`, `padding: 0.1em 0.35em`, `overflow-wrap: anywhere`, `box-decoration-break: clone`. 15.56 / 11.18:1.

**Fenced code** (`rehype-pretty-code`, no client JS):

| Property | Value |
|---|---|
| Block | `pre` with `max-width: none` (breaks out to frame width); `margin: 1.75rem 0`; `background: var(--surface)`; `border: 1px solid var(--line)`; `border-radius: 2px`; `padding: 1rem 1.25rem` (0.875rem 1rem below `sm`) |
| Text | Plex Mono 400, `0.875rem / 1.65` (0.8125rem below `sm`), `tab-size: 2`, `white-space: pre`, `overflow-wrap: normal` (**never wraps**) |
| Scroll | `overflow-x: auto`, `tabindex="0"`, `scrollbar-width: thin; scrollbar-color: var(--muted) transparent` (thumb 4.52 to 4.81:1 vs ground, ≥3:1 non-text), global focus ring |
| Name | Accessible name from the language: `role="region" aria-label="Code, <lang>"` (or `Code` when unknown) so the scroll region has a name |
| Language label | `pre[data-language]::before { content: attr(data-language); display: block; margin-bottom: 0.75rem; font: 500 0.6875rem Plex Mono; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted) }` (4.52 / 4.79 on `--surface`) |
| Line numbers, line highlighting, copy button | **Not in v1** |

**Syntax palette: three classes, no new colours.** Drive `rehype-pretty-code` with Shiki's `css-variables` theme and set its variables inside `.post-body`:

| Class | Shiki variable | Token | Ink on `--surface` | Studio on `--surface` |
|---|---|---|---|---|
| Plain, identifiers, functions, parameters | `--shiki-foreground`, `--shiki-token-function`, `--shiki-token-parameter` | `--luma` | 15.56 | 11.18 |
| Keywords, constants and numbers, strings | `--shiki-token-keyword`, `--shiki-token-constant`, `--shiki-token-string`, `--shiki-token-string-expression`, `--shiki-token-link` | `--cb` | 5.06 | 4.99 |
| Comments, punctuation | `--shiki-token-comment`, `--shiki-token-punctuation` | `--muted` | 4.52 | 4.79 |
| Block background | `--shiki-background` | `transparent` (the `pre` carries `--surface`) | | |

Justification (a Request is **not** needed, because no token is added): `--cr` is the natural fourth colour, but studio `--cr` on `--surface` is 4.16:1, so it cannot colour code text on a `--surface` block. Plex Mono is loaded only in weights 400 and 500 and has no italic, and the `css-variables` theme cannot set weights, so the palette is colour-only. Three tonal classes (text, accent, recede) is a deliberate fit with the monochrome identity. Every highlighted colour is ≥4.5:1 on both grounds. If the owner later wants a richer palette, the route is a new `--code-*` token pair tuned for `--surface` on both grounds, which needs a Tech Lead decision.

### 2.7 Tables
GFM tables are wrapped by a rehype step in `<div class="table-wrap" tabindex="0" role="region" aria-label="Table">` (Frontend; the wrapper is the scroll container and takes the focus ring).

| Part | Spec |
|---|---|
| Wrapper | `max-width: none; overflow-x: auto; margin: 1.75rem 0; scrollbar` as code |
| Table | `border-collapse: collapse; width: max-content; min-width: 100%` (columns never crush; the wrapper scrolls instead) |
| `th` | Plex Mono 500 `0.6875rem`, uppercase, 0.18em, `--muted` (4.81 / 5.37), `text-align: left` (or GFM alignment), `padding: 0.75rem 1rem`, `border-bottom: 1px solid var(--muted)` |
| `td` | Archivo `0.9375rem / 1.5`, `--luma`, `padding: 0.75rem 1rem`, `border-bottom: 1px solid var(--line)`, `vertical-align: top` |
| First column | Not sticky (keeps the scroll model trivial) |
| Numeric columns | Use GFM `---:` right-alignment; add `font-variant-numeric: tabular-nums` to `td` |
| Row striping / hover | None |
| Caption | None. A table is introduced by the sentence before it; no `<caption>` styling in v1 |
| Mobile | Scrolls inside the wrapper at any width below its natural width. 320px: shows about two columns; the cut-off third column is the scroll cue |

### 2.8 Footnotes
`remark-gfm` footnotes render `<section data-footnotes class="footnotes"><h2 class="sr-only">Footnotes</h2><ol>…`.
- Section: `margin-top: 3.5rem; border-top: 1px solid var(--line); padding-top: 1.5rem`; `font-size: 0.9375rem; line-height: 1.6; color: var(--muted)`.
- `ol` decimal with mono muted markers (as 2.4).
- Reference `sup a[data-footnote-ref]`: `font-size: 0.75em; display: inline-block; min-width: 1.5rem; text-align: center` (24px minimum hit area), underlined like a link, `--luma`.
- Back-reference `↩` (`a[data-footnote-backref]`): `--luma`, `display: inline-block; min-width: 1.5rem; text-align: center`; its `aria-label` is the plugin default ("Back to reference N").
- Targeted footnote (`li:target`): `outline: 2px solid var(--cb); outline-offset: 4px` (a non-colour-only cue).

### 2.9 Emphasis and other inline
`strong`: weight 600, `--luma`. `em`: italic (synthesised; Archivo italic is not loaded; tokens §7 R-3). `del`: `--muted` with `line-through`. No `mark`, no `kbd` (raw HTML is not rendered).

### 2.10 Images and captions
Block images (a paragraph containing only an image) are emitted as `<figure>`; the Markdown title becomes `<figcaption>`. Inline images remain bare `<img>` in the paragraph (no border).
- `figure`: `max-width: none; margin: 2rem 0`.
- `img`: `display: block; max-width: 100%; height: auto` (width/height attributes from the loader reserve the box, no layout shift), `border: 1px solid var(--line)`, `background: var(--surface)`, `border-radius: 0`. **No** `.portrait-frame`, no mask, no feathering in studio.
- `figcaption`: Plex Mono, `0.75rem / 1.5`, `--muted`, `margin-top: 0.75rem`, `max-width: 36rem`. Convention from the hero: the caption starts `Fig. N —` generated in CSS: `.post-body { counter-reset: fig } figcaption { counter-increment: fig } figcaption::before { content: "Fig. " counter(fig) " — "; text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.6875rem }`. Figures without a caption are not numbered.
- Cover image: see [blog-post.md](blog-post.md) §4.

### 2.11 Horizontal rule
`hr { margin: 3rem 0; border: 0; border-top: 1px solid var(--line); max-width: 36rem }`. Decorative; it is also announced as a thematic break.

### 2.12 Math
Not in v1 (Q7 default: no). If it is enabled later it needs its own design pass; the minimum rule is that `.katex-display` scrolls horizontally in its own `tabindex="0"` region and inherits `--luma`.

## 3. Image alt text: what the editor should write

CMS hint strings are in [copy.md](copy.md) (`cms.cover_alt.hint`, `cms.body.hint`). The rules:

1. Say what the image shows that the surrounding text does not, in under ~125 characters. No "image of" or "picture of".
2. For a chart, state the takeaway ("Bitrate falls 18% at equal PSNR with the learned filter") and put the numbers in the text or a table.
3. The caption (Markdown title) adds context and is *not* a substitute for alt; alt must stand alone.
4. Purely decorative images get empty alt (`![](…)`). The cover image cannot be decorative: its alt is required by the CMS.
5. Do not put text in images without repeating it in the post. Do not use screenshots of code or tables; paste them as code or Markdown.
6. Strip location metadata before upload; keep images ≤200 KB and ≤1600px wide (03 §4.2).

## 4. Contrast table

Every text/background pair in the post body. Normative; sources in [tokens.md](tokens.md) §2.

| Element | Pair | Ink | Studio | Need | Result |
|---|---|---|---|---|---|
| Paragraph, list, heading, strong, link text | `--luma` / `--ink` | 16.56 | 12.56 | 4.5 | pass |
| Lede, blockquote, footnotes, captions, `th`, list markers | `--muted` / `--ink` | 4.81 | 5.37 | 4.5 | pass |
| Link hover, anchor on focus, checkbox fill | `--cb` / `--ink` | 5.38 | 5.60 | 4.5 | pass |
| Link underline (non-text) | `--cb` / `--ink` | 5.38 | 5.60 | 3 | pass |
| Inline code, code text, plain tokens | `--luma` / `--surface` | 15.56 | 11.18 | 4.5 | pass |
| Keyword/literal/string tokens | `--cb` / `--surface` | 5.06 | 4.99 | 4.5 | pass |
| Comment/punctuation tokens, language label | `--muted` / `--surface` | 4.52 | 4.79 | 4.5 | pass |
| Checkbox check mark | `--ink` / `--cb` | 5.38 | 5.60 | 4.5 | pass |
| Checkbox border, blockquote rule, scrollbar thumb | `--muted` or `--cb` / `--ink` | 4.81 / 5.38 | 5.37 / 5.60 | 3 | pass |
| Hairlines (`--line`: h2 rule, td border, hr, code border) | decoration | 1.25 | 1.60 | n/a | exempt: no information depends on them |

Under a lit mesh strand (desktop pointer only) the veil keeps luma ≥ 15.1 / 10.9 and muted ≥ 4.38 / 4.65 (tokens §3).

## 5. Markup contract Frontend must produce

| Need | How |
|---|---|
| Block images as figures with captions from the title | small remark/rehype step: paragraph containing only an `img` → `figure` (+ `figcaption` from `title`) |
| Table scroll wrapper | rehype step wrapping `table` in `div.table-wrap[tabindex=0][role=region][aria-label=Table]` |
| Code region name | `rehype-pretty-code` output plus `role="region"` and `aria-label` on `pre` (a transformer) |
| Heading anchors | `rehype-slug` + `rehype-autolink-headings` (`behavior: "append"`, function-form `properties` with `aria-label`) |
| Local images | `loading="lazy" decoding="async"`, intrinsic `width`/`height` (02 §F-1) |
| Syntax theme | Shiki `css-variables` theme; the variable mapping in §2.6 lives in the `blog prose` CSS block |

## 6. Where the ground changes the result

| Element | Ink | Studio |
|---|---|---|
| Accent (link underline, quote rule, keywords, checked box) | blue `--cb` | brown `--cb` (never blue) |
| `th`, captions, quotes | muted blue-grey | muted brown |
| Code block fill vs page | `--surface` is a slight lift (1.06:1) | `--surface` is a slight darkening (1.12:1); the 1px `--line` border carries the edge |
| Selection | `--cb` background, `--ink` text | same tokens |
| `--cr` | not used in prose | not used in prose |

## 7. Edge cases the QA fixtures should hit

100-character unbroken string in a paragraph, in a heading, in a list item and in inline code; a 12-column table; a 300-character code line; an image without a title; nested lists three deep; a task list with long labels; a footnote referenced twice; a heading containing inline code; a blockquote containing a list; `<script>alert(1)</script>` as text (must render as literal text).
