# Tokens, contrast and component recipes

Owner: Designer · Tasks D-1…D-4 · Spec: [01-design-spec.md](../01-design-spec.md) §3, §9, §10.3

Nothing here is new. Every colour is a token that already exists in `app/globals.css`, every font is already loaded. The only thing this file adds is **how the tokens combine** and the contrast of every combination the new surfaces use. Raw hex appears only in §1, to document a token's value.

**No new tokens, fonts or accents are requested.** (Two *changes to existing frozen rules* are requested, see §7.)

---

## 1. Token values (documentation only)

| Token | Tailwind | Ink (default) | Studio (`[data-theme="studio"]`) | Role |
|---|---|---|---|---|
| `--ink` | `bg-ink` | `#08090e` | `#e9d5a3` | page ground |
| `--surface` | `bg-surface` | `#10121a` | `#dfc994` | inset fill (code, inputs) |
| `--line` | `border-line` | `#1e2130` | `#c4a76b` | hairlines **between** rows only |
| `--luma` | `text-luma` | `#e8eaf2` | `#1a1509` | primary text |
| `--muted` | `text-muted` | `#767c93` | `#5f512c` | secondary text, **control borders** |
| `--cb` | `text-cb` | `#4c7dff` | `#6f4718` | accent, focus, primary action |
| `--cr` | `text-cr` | `#ff5c8a` | `#a62c53` | error, draft |

Fonts: Archivo (`font-sans`, variable `wdth`; `.display` rides `wdth 118`) and IBM Plex Mono (`font-mono`, weights 400 and 500 only, **no italic file**). Archivo is also loaded without an italic file, so `em` is a synthesised slant (see [prose.md](prose.md) §2.9).

## 2. Contrast of every pair the new surfaces use

Computed with the WCAG 2.x relative-luminance formula from the values in §1. "Need" is 4.5 for text and 3 for non-text (WCAG 1.4.11). **Ground** = `--ink` unless stated.

| Use | Pair | Ink | Studio | Need | Result |
|---|---|---|---|---|---|
| Body text, post prose | `--luma` on `--ink` | 16.56 | 12.56 | 4.5 | pass |
| Secondary text: lede, captions, eyebrows, consent line, counters | `--muted` on `--ink` | 4.81 | 5.37 | 4.5 | pass |
| Text typed into inputs, code text | `--luma` on `--surface` | 15.56 | 11.18 | 4.5 | pass |
| Code comments and punctuation, footnote text on code-like fills | `--muted` on `--surface` | 4.52 | 4.79 | 4.5 | pass (tight on ink: never smaller or lighter) |
| Accent text, hover titles, code keywords and literals | `--cb` on `--ink` | 5.38 | 5.60 | 4.5 | pass |
| Code keywords and literals | `--cb` on `--surface` | 5.06 | 4.99 | 4.5 | pass |
| Error message, DRAFT marker, error glyph | `--cr` on `--ink` | 6.77 | 4.67 | 4.5 | pass (**ground only**) |
| Error message placed on a `--surface` fill | `--cr` on `--surface` | 6.36 | **4.16** | 4.5 | **FAIL on studio: never do this** |
| Primary button label | `--ink` on `--cb` | 5.38 | 5.60 | 4.5 | pass |
| Primary button boundary | `--cb` fill vs `--ink` ground | 5.38 | 5.60 | 3 | pass |
| Primary button hover label | `--ink` on `--luma` | 16.56 | 12.56 | 4.5 | pass |
| Control border at rest | `--muted` vs `--ink` ground | 4.81 | 5.37 | 3 | pass |
| Control border at rest (inner edge against fill) | `--muted` vs `--surface` | 4.52 | 4.79 | 3 | pass |
| Error border | `--cr` vs `--ink` ground | 6.77 | 4.67 | 3 | pass |
| Error border (inner edge against fill) | `--cr` vs `--surface` | 6.36 | 4.16 | 3 | pass |
| Focus ring | `--cb` vs `--ink` | 5.38 | 5.60 | 3 | pass |
| Focus ring | `--cb` vs `--surface` | 5.06 | 4.99 | 3 | pass |
| Link underline, `.prose-body a` as shipped (`--cb` at 60%) | mix vs `--ink` | **2.60** | **2.55** | 3 | **FAIL** (see §7 R-1) |
| Link underline, proposed for posts (`--cb` at 100%) | `--cb` vs `--ink` | 5.38 | 5.60 | 3 | pass |
| Active nav link vs inactive (`--luma` vs `--muted`) | | 3.45 | **2.34** | 3 | colour alone fails on studio: add a non-colour cue (§4.12) |
| `--line` as an input border | `--line` vs `--ink` | **1.25** | **1.60** | 3 | **FAIL: forbidden** |
| `--luma` text on a `--cb` fill | | **3.08** | **2.24** | 4.5 | **FAIL: forbidden** |

### 2.1 Rules that fall out of the table

1. Control borders: `--muted`, 1px at rest. Never `--line`.
2. Error text, DRAFT text and the error glyph sit on the **page ground** (`--ink`), never inside a `--surface` box. Error borders may wrap a `--surface` input (border contrast passes, text is outside).
3. Text on a `--cb` fill is `--ink`, never `--luma`.
4. Errors and draft markers are never colour alone: a glyph or the words "Error"/"DRAFT" always travel with the colour.
5. Studio-ground accents are brown, not blue (`--cb` resolves to `#6f4718`); nothing in these designs hard-codes blue.

## 3. The mesh problem and the "reading veil"

The mesh canvas (`MeshField`) sits behind everything. At rest it is a faint `--line` triangulation. When a fine pointer is within 240px, edges light in `--cb` at up to 90% alpha, 1 to 1.75px wide. For short labels that is atmosphere; for a 600px column of body text, or a form where the owner is reading an error, it is a moving background image under the text.

Measured on a lit 1px strand at 90% alpha (the worst case, desktop pointer only):

| Veil over the ground | Ink: luma / muted / cr | Studio: luma / muted / cr |
|---|---|---|
| none | 3.67 / **1.06** / **1.50** | **2.74** / **1.17** / **1.02** |
| ink at 88% | 15.09 / 4.38 / 6.17 | 10.86 / 4.65 / 4.04 |
| ink at 90% | 15.37 / 4.46 / 6.29 | 11.09 / 4.75 / 4.12 |

**Decision:** the post body column, the post header block and the contact form block (including its error and success panels) get a **reading veil**: `background: color-mix(in srgb, var(--ink) 90%, transparent)`, no blur, no border. At `md:` and up the veil extends 2rem beyond the text on each side and its left and right edges feather to transparent (`linear-gradient(to right, transparent, veil 2rem, veil calc(100% - 2rem), transparent)`) so there is no visible rectangle. Below `md` it is full-bleed and flat. At rest the mesh is nearly invisible anyway, so little identity is lost; the lit strands still show in the gutters and margins.

What the numbers mean: **static ratios in §2 are normative** (they are what a checker measures, with the veil composite equal to `--ink` to within rounding). The table above is the residual worst case: a single 1 to 1.75px strand under the pointer, which cannot be eliminated without hiding the mesh. Muted text on a lit strand dips to ≈4.4 on ink (marginal, transient, desktop pointer only); luma text never drops below 10.8. This residual is accepted and recorded here.

The veil is a rule inside Frontend's two delimited CSS blocks (`/* ---- blog prose ---- */`, `/* ---- contact form ---- */`). It adds no token. Name: `.reading-veil`.

## 4. Component recipes

Sizes in rem; px only for hairlines. Tailwind equivalents are indicative.

### 4.1 Field label
Plex Mono, 0.75rem, `letter-spacing: 0.12em`, uppercase, `--luma`. (Same family as `.eyebrow` but brighter and a point larger because a label must be read, not just seen.) Optional fields append ` (optional)` in `--muted`. Required fields carry no asterisk.

### 4.2 Text input / textarea
Height 3rem (48px) so the target is ≥44px; padding 0.75rem 0.875rem; font Archivo **1rem (16px, prevents iOS zoom)**, `--luma`; fill `--surface`; border 1px `--muted`; radius 2px; no placeholder (labels are always visible). Textarea: min-height 9rem (≥6 rows), `resize: vertical`, `field-sizing: content` where supported.
- Hover: border `--luma`.
- Focus (`:focus-visible`, and for text inputs every focus): `outline: 2px solid var(--cb); outline-offset: 0` which reads as a 2px `--cb` border; the 1px `--muted` border sits under it. (Contrast 5.06/4.99 on `--surface`.)
- Read-only (submitting): same appearance, no hover change, `cursor: progress`. Never `disabled` (stays readable and copyable).
- Autofill: `input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px var(--surface) inset; -webkit-text-fill-color: var(--luma); caret-color: var(--luma) }` so a browser's yellow or blue autofill fill cannot break the contrast pairs above.

### 4.3 Field error (inline)
Sits **below** the control, on the page ground. `0.9375rem` Archivo, `--cr`. Structure: a mono `!` glyph in a 1.25rem square outlined 1px `--cr` (aria-hidden), then a visually hidden `Error:` prefix, then the message. Control gets `aria-invalid="true"`, `aria-describedby` → message id, and border **2px `--cr`** (implemented as `border-color: var(--cr)` plus `box-shadow: inset 0 0 0 1px var(--cr)` so the box does not shift).

### 4.4 Error summary / error panel
A block on the page ground (not a filled box): 2px `--cr` left rule, 1rem left padding, heading in Archivo 600 `--luma` (the heading is **luma**, not cr, so the only cr text is the glyph and per-item messages which sit on `--ink`), list of in-page links in `--luma` underlined `--cb`. `tabindex="-1"`, receives focus. No `role="alert"` (focus does the announcing; see [contact.md](contact.md) §6).

### 4.5 Primary button
Height 3rem, padding 0 1.5rem, Archivo 500 1rem, `--ink` on `--cb`, radius 2px, no border. Hover: fill `--luma`, label `--ink`. Busy: same fill, label `Sending…`, `aria-disabled="true"`, `cursor: progress`, no opacity change (disabled-looking buttons would drop the label below 4.5:1). Full width below `sm`, content width from `sm` up.

### 4.6 Secondary button
As 4.5 but transparent fill, 1px `--muted` border (4.81/5.37 vs ground), label `--luma`. Hover: border `--luma`. Used for `Send another`, `Back to home`.

### 4.7 Inline link in prose
`--luma` text, 1px **solid `--cb`** underline (not the 60% mix), `text-underline-offset: 3px`; hover: underline 2px and text `--cb`. Visited: unchanged. See §7 R-1.

### 4.8 Text link with arrow ("Write a message →")
`--luma`, underline as 4.7, trailing ` →` in mono (aria-hidden). Min height 2.75rem hit area via `padding-block`.

### 4.9 Tags
Plain text, not chips: Plex Mono 0.6875rem uppercase `.eyebrow` register, lowercase kept (`video-coding`), `--muted`. Not interactive in v1 (D-Q3), so no target-size obligation. If tag pages arrive later they become 44px chips with a 1px `--muted` border.

### 4.10 Draft marker
Words `DRAFT` (and `SCHEDULED` when `draft:false` but the date is in the future) in `.eyebrow` mono, `--cr`, preceded by the `!` glyph box; on the page ground only. In the index it replaces nothing; it prefixes the date line.

### 4.11 Code surface
`--surface` fill, 1px `--line` border (decoration, not a required boundary), radius 2px, text `--luma`. Syntax palette is **only** `--luma`, `--muted`, `--cb`, differentiated by weight (400/500 are the only mono weights loaded). `--cr` is excluded because studio `--cr` on `--surface` is 4.16:1. Details in [prose.md](prose.md) §2.6.

### 4.12 Nav link
Existing: `.eyebrow` (`--muted`), hover `--luma`, active `--luma`. **Added:** active also gets a 1px `--cb` underline with `text-underline-offset: 6px` (non-colour cue; the colour change alone is 2.34:1 on studio). Hit height: 1.75rem (28px) for fine pointers, 2.75rem (44px) under `(pointer: coarse)`. See [contact.md](contact.md) §8.

### 4.13 Focus
Unchanged global rule: 2px `--cb`, offset 3px (5.38/5.60 on ink, 5.06/4.99 on surface). It is drawn outside the element so it is visible over the grain overlay (the overlay is `pointer-events: none` at 5.5–8.5% opacity and does not hide a 2px ring). Exceptions: text inputs use offset 0 (§4.2); stretched row links draw the ring on the row (see [blog-index.md](blog-index.md) §3).

## 5. Type and spacing used by the new surfaces

| Role | Spec |
|---|---|
| Page frame | `mx-auto max-w-5xl px-6 pb-24 pt-20` (unchanged) |
| Index title / date column | `grid md:grid-cols-[10rem_1fr] md:gap-8`, row `py-8` (as Teaching) |
| Row title | `text-[1.375rem] leading-snug` (as Teaching) |
| Post title | `.display`, `clamp(1.875rem, 5vw, 3rem)` (index/contact keep PageHeader's `clamp(2.25rem,6vw,4rem)`) |
| Lede | Archivo 1.25rem / 1.55, `--muted`, `max-width: 36rem` |
| Post body | Archivo 1.0625rem/1.7 below `sm`, 1.125rem/1.75 from `sm`; column `max-width: 36rem` |
| Form width | `max-width: 36rem` |
| Vertical rhythm unit | 0.25rem; section gaps 3rem; field gap 1.5rem |

## 6. Motion

Nothing new animates. Transitions reuse the existing 150ms/450ms colour transitions and are neutralised by the global `prefers-reduced-motion` rule. No spinners, no skeletons, no autoplay.

## 7. Requests raised from this file

| Id | To | Request |
|---|---|---|
| R-1 | Tech Lead (owns frozen `app/globals.css`) | `.prose-body a` underline is `--cb` at 60% = 2.60/2.55:1, below the 3:1 non-text line, and on studio the link text (`--luma`) vs surrounding `--muted` text is only 2.34:1, so the underline is the only cue. Recommend `text-decoration-color: var(--cb)` (100%) in `.prose-body a`. Affects the whole site, so it is a Tech Lead call. The post-body rules in this spec already use 100% and need nothing. Logged in `STATUS.md` |
| R-2 | Frontend | Implement the recipes above inside the two delimited CSS blocks; no raw hex |
| R-3 | Tech Lead (optional, low priority) | Archivo and Plex Mono have no italic file. If the owner writes `*emphasis*` often, add `style: ["normal","italic"]` to Archivo in `app/layout.tsx` (frozen); otherwise the browser's synthetic slant is used |
