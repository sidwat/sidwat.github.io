# 01 — Design spec (UI/UX Designer)

Audience: UI/UX Designer · Prereq: read [00-overview.md](00-overview.md) §0, §5, §8 · Status of tasks: [STATUS.md](STATUS.md)

---

## 1. Scope

Design — not code — for four surfaces, in both grounds (ink and studio), at every breakpoint:

1. **Blog index** `/blog/`
2. **Blog post** `/blog/<slug>/`
3. **Contact** `/contact/`
4. **Admin entry** `/admin/` (the thin static page that boots the third-party CMS)

Plus: the post-body typography ("prose"), the contact microcopy deck, and the nav/footer changes needed to reach these pages.

**Out of scope:** the visual identity itself (palette, type, mesh field, hero, grain — fixed, see `DEVELOPMENT.md` "Design system"); the CMS editor UI (third party, cannot be restyled); tag pages; comments; login screens (G3 is roadmap only).

## 2. Files owned

Designer owns **only** `docs/design/**` (Markdown, SVG, PNG; no source code). Deliverables:

```
docs/design/blog-index.md        wireframes + annotated states, ink and studio
docs/design/blog-post.md         wireframes + prose spec
docs/design/contact.md           wireframes + states
docs/design/admin-entry.md       wireframes + states
docs/design/copy.md              every user-visible string (single source for Frontend)
docs/design/prose.md             post-body typography tokens/sizes/spacing
docs/design/assets/**            exported images/SVG referenced by the above
```

Wireframes may be Markdown/ASCII, self-contained HTML (inline CSS using the site's token values, no external scripts), SVG, or exported PNG. Token usage and contrast tables go in `docs/design/tokens.md`. Hi-fi is only required for the two details called out in §6. A clickable prototype is not required.

## 3. The system you are fitting into

Do not introduce new tokens, fonts or accents. Everything below already exists in `app/globals.css` / `components/*`:

| Thing | Fact |
|---|---|
| Tokens | `--ink` (page), `--surface`, `--line`, `--luma` (text), `--muted`, `--cb` (accent), `--cr` (second accent); Studio redefines all via `[data-theme="studio"]` |
| Type | Archivo (one superfamily, `wdth` axis; `.display` rides wdth 118) + IBM Plex Mono for labels (`.eyebrow`: 11px, 0.18em tracking, uppercase) |
| Page frame | `mx-auto max-w-5xl px-6 pb-24 pt-20`, then `PageHeader` = eyebrow label + `.display` title (`clamp(2.25rem,6vw,4rem)`) + intro in `.prose-body` (1.0625rem / 1.7, `--muted`) |
| Lists | Hairline-ruled rows (`border-t` + per-row `border-b border-line`), a mono `.eyebrow` date column + title column at `md:` (see Teaching, 404) |
| Nav | Sticky, wraps, 6 items + theme toggle; active item gets `text-luma` and `aria-current` |
| Focus | Global `:focus-visible` = 2px `--cb` outline, 3px offset |
| Atmosphere | Mesh canvas behind the page; film grain overlay (`z-50`, pointer-events none); 450ms colour transitions; `prefers-reduced-motion` already neutralises transitions globally |

**Voice:** terse, technical, first person where a person speaks. No exclamation marks, no emoji. Labels are lowercase-in-mono where they read like commands, UPPERCASE `.eyebrow` where they read like metadata.

### 3.1 Contrast facts you must design around (computed from the real tokens)

| Pair | Ink | Studio | Consequence |
|---|---|---|---|
| `--luma` on `--ink` | 16.6 | 12.6 | Primary text OK |
| `--muted` on `--ink` | 4.81 | 5.37 | Body copy OK (AA) |
| `--muted` on `--surface` | 4.52 | 4.79 | Marginal on ink: do not shrink or lighten text placed on `--surface` |
| `--cb` on `--ink` / `--surface` | 5.38 / 5.06 | 5.60 / 4.99 | Accent text/links OK |
| `--cr` on `--ink` | 6.77 | 4.67 | OK |
| `--cr` on `--surface` | 6.36 | **4.16** | **Fails AA for text on Studio.** Error text must sit on `--ink`, never on a `--surface` fill |
| `--line` on `--ink` | **1.25** | **1.60** | **Fails the 3:1 non-text rule (WCAG 1.4.11).** `--line` is fine for hairlines between rows, but must NOT be the only boundary of an input, checkbox or button |

Therefore: **form control borders use `--muted`** (≥4.5:1 on both grounds), 1px at rest, 2px `--cb` on focus. Error state is never colour alone: add an icon/glyph (`!`/`×` in mono) and the word "Error" or the message text.

## 4. Pages and states

### 4.1 Blog index — `/blog/`

Header: eyebrow `Writing`, title `Blogs`, intro (existing: "Notes on compression, vision, and the occasional detour."). Body is a ruled list grouped by year (year as a mono `.eyebrow` sticky-feeling label in the left column at `md:`, like Teaching's period column).

Each row: date (`2 Nov 2026`, mono eyebrow), title (`text-[1.375rem]`, link, hover → `--cb`), summary (`.prose-body`, max ~2 lines desktop, 3 mobile; clamp, not truncate mid-word), meta line (`6 min read · video-coding · notes` as eyebrow). The whole row is one link target (title anchor with a stretched pseudo-element) — but links *inside* the summary are not allowed (summary is plain text).

| State | Required design |
|---|---|
| **Populated** | As above. 1 post must not look broken (no orphaned year label problem); 30+ posts must still be scannable (no pagination in v1; confirm the year grouping carries it) |
| **Empty** (0 published posts — this is the state on day one) | Replaces today's "Coming soon." One line in `.prose-body` + one secondary action. Suggested: "Nothing published yet. The first post is in progress." and a link "Write to me" → `/contact/`. Must feel intentional, not like a broken list. Sitemap and nav still include the page |
| Loading | Not applicable (pre-rendered). Client-side nav from another page is instant. **Do not design a skeleton.** State this explicitly in the deliverable |
| Error | Not applicable at runtime (bad content fails the build, not the visitor). Unknown slug → existing 404 (`app/not-found.tsx`); confirm it reads right for a missing post, and offer "← All posts" if you want it (needs Frontend; raise as a Request) |
| Draft preview (dev/QA builds only, `BLOG_INCLUDE_DRAFTS=1`) | A `DRAFT` marker on the row in `--cr` + text (not colour only). Never visible in production |

### 4.2 Blog post — `/blog/<slug>/`

Structure top to bottom: `← Blogs` back link · eyebrow (date, `updated <date>` if present, reading time) · title as `.display` at a **smaller clamp than PageHeader** (long titles; propose and justify a value) · summary as the lede · optional cover · body · tag list · end-of-post block ("Reply by email" → `/contact/`, and previous/next post links when they exist).

Reading measure: **60–72 characters** (about `max-w-[65ch]` / 40rem) for body inside the 5xl frame; code blocks, tables and images may break out wider up to the frame width. Decide left-aligned within the frame vs. centred and say why; the rest of the site is left-aligned and ruled.

| State | Required design |
|---|---|
| **Normal** | As above |
| Long title (≥ 80 chars), no cover, no tags, no summary-length edge cases | Each must lay out without overflow at 320px |
| With / without cover | Cover has fixed aspect ratio to avoid layout shift; alt text required (CMS enforces); on Studio the image must not pick up the portrait feathering |
| First / last post | Previous or next link omitted gracefully |
| `updated` present | Shown as a second, quieter date; never replaces the original |
| Draft preview (dev only) | `DRAFT — not published` banner above the title |
| Unknown slug | Existing 404 |

**Prose spec (`docs/design/prose.md`)** must cover, with sizes/colours/spacing in tokens and rem, for **both** grounds: paragraphs, `h2`–`h4` (no `h1` in body), links (follow `.prose-body a`: `--luma` text, `--cb` underline), lists (reuse the Teaching hyphen-rule bullet), blockquote, inline code, fenced code (note `--global-code-background-color`-style tokens do not exist in this system — define the code surface from `--surface`/`--line`/`--luma`; horizontal scroll, never wrap; must hold ≥4.5:1 for every highlighted token colour on both grounds), tables (horizontal scroll container on mobile), footnotes, images and captions (`Fig. N —` convention from the hero), horizontal rule, task lists, and — if Q7 confirms math — KaTeX display/inline. Heading anchors: a visible-on-focus `#` link.

### 4.3 Contact — `/contact/`

Header: eyebrow `Contact`, title `Get in touch`, intro one sentence that says *about anything* (the owner's words: "contact me about anything").

Form (single column, max ~36rem, left-aligned under the header):

| Field | Spec |
|---|---|
| Name | required, text, `autocomplete="name"` |
| Email | required, `type=email`, `autocomplete="email"`, `inputmode="email"` |
| Subject | optional, text, `autocomplete="off"` |
| Message | required, textarea ≥ 6 rows, grows; live character count only when > 80% of 5000; min 10 |
| Honeypot | **not designed visually** — a hidden field named `botcheck`; mention in the spec so no one "fixes" it |
| Consent line | Small `.prose-body`: what happens to the message (sent by a form service to the owner's inbox; not stored on the site; not used for marketing). Wording in `copy.md` |
| Submit | Primary button `Send message`. Use the site's existing button treatment if one exists, else define one from tokens (it must pass 3:1 for its boundary and 4.5:1 for its label on both grounds) |
| Alternatives | Below the form: the mailto address as a plain link ("or email swatsa@ucsd.edu") — also the failure fallback |

Labels are always visible above fields (never placeholder-only). Placeholders, if any, are examples and ≥4.5:1 or omitted.

| State | Required design |
|---|---|
| **Idle** | As above, no errors shown |
| **Field validation error** (on blur *after* first touch, and on submit) | Inline message under the field, field border 2px `--cr`, glyph + text; summary at top (`role=alert`) listing the problems with in-page links on submit. Error copy says how to fix it, not what was wrong ("Enter an email like name@example.com") |
| **Submitting / loading** | Button label `Sending…`, button disabled, `aria-busy` on the form, fields read-only (not disabled, so they stay readable/copyable). No spinner required; if you add one it respects reduced-motion. Must prevent double submit. If the response takes > 8s show "Still sending…" |
| **Success** | Form is replaced by a confirmation in the same block: heading "Message sent", one sentence ("Thanks — I read everything and reply from <address>."), actions: `Send another` and `Back to home`. Focus moves to the heading; announced politely. The user's text is *not* echoed back |
| **Server/provider error** | Preserve everything typed. Message + retry button + the mailto fallback with the message pre-filled in the `mailto:` body. Distinguish "couldn't reach the service" (network) from "service rejected it" (provider) only if the copy genuinely differs |
| **Rate-limited / quota exhausted** | Distinct copy: "Too many messages right now. Try again later or email me directly." Always shows mailto |
| **Spam rejected** | Looks like success to a bot only if that is safe; for a human who tripped the time-trap show the generic error with retry. Spec which of the two you recommend and why |
| **No JavaScript** | `<noscript>`: the form is replaced by the mailto link and a sentence explaining why. (Progressive enhancement via a native form POST is possible with the provider but was judged not worth the redirect/landing-page design cost; challenge this if you disagree — it is D-Q1) |
| **Not configured** (build without the endpoint key; should never ship) | Same as provider error. Never a blank page |

### 4.4 Admin entry — `/admin/`

This URL serves a static HTML file that loads the third-party CMS, which then takes over the whole viewport. The CMS UI cannot be restyled. What *is* designable:

| State | Required design |
|---|---|
| **Loading** (script downloading, ~1–2s) | A centred, minimal, token-coloured message in Plex Mono: `loading editor…`. No mesh/grain/nav (the page is not part of the site shell, and must not load site JS) |
| **No JavaScript** | `<noscript>`: "The editor needs JavaScript." |
| **Script failed to load** (CDN blocked/offline) | After a timeout, replace the loading text with a message and a retry link. Include "check your connection or content blocker" |
| **Signed out / signed in / failure** | Owned by the CMS — out of scope; but list the 3 things the owner will see (token prompt, editor, "save failed") in `admin-entry.md` so the runbook (Integrations) can screenshot them |
| Discoverability | `/admin/` is **never linked** from the site, not in nav, not in the sitemap, `noindex`, disallowed in `robots.txt`. State that this is deliberate (it is obscurity for tidiness, not security; the real control is the GitHub token) |
| Theme | The static page follows `prefers-color-scheme` (ink for dark, studio for light) since it cannot run the theme script safely. Say so |

## 5. Navigation and footer

- **Nav:** "Blogs" already exists. Decide the label (`Blog` vs `Blogs`) — D-Q2; the owner's brief says "Blog". Add `Contact` (Q10). With 7 items plus the theme toggle the bar will wrap earlier: show how it looks at 320, 375, 768, 1024 and 1280 on both grounds. If the wrap is ugly, propose an alternative (e.g. Contact pinned right of the toggle as a quiet button) and justify it.
- **Active state:** `/blog/<slug>/` must light up "Blogs" (current logic is `pathname.startsWith`; confirm it matches your design).
- **Footer:** the "Get in touch" column currently shows only the mailto. Keep the mailto, add a `Write a message →` link to `/contact/`. Show the result.
- **404:** lists `nav` automatically, so `Contact` will appear there. Confirm.

## 6. Hi-fi details required (everything else may stay wireframe)

1. **The post page, ink and studio**, above the fold and a screen of body text with a code block and a table. This is where the existing identity is most at risk (long text on a mesh+grain ground).
2. **The contact form with one field in error and the success state**, ink and studio.

## 7. Responsive requirements

Breakpoints to deliver: **320, 375, 768, 1024, 1280, 1920 px**; portrait and landscape at 375/768. Rules:

- No horizontal page scroll at any width (code/tables scroll in their own container with a visible focus ring and `tabindex=0`).
- 16px minimum side gutter (existing `px-6` = 24px; keep it).
- Touch targets **≥ 44×44 CSS px** for buttons, nav links and the tag chips; ≥ 24px with spacing is the hard WCAG 2.2 floor (2.5.8) — design to 44.
- Form fields ≥ 16px font-size (prevents iOS zoom on focus).
- Text must reflow at 400% zoom (1.4.10) and survive user text-spacing overrides (1.4.12).
- Nav wraps rather than overflowing (existing behaviour; do not introduce a hamburger without a reason).

## 8. Accessibility requirements

Target: **WCAG 2.2 AA**, both grounds. Specifically design for:

1. Contrast per §3.1; no information by colour alone.
2. One `h1` per page; heading order never skips; post-body headings start at `h2`.
3. Visible focus on every interactive element (existing global outline; confirm it is visible *on* the grain overlay and on `--surface`).
4. Skip link exists (`#main`); don't break it. The post page must keep `main` landmark semantics via the existing wrapper.
5. Form: every control has a visible `<label>`; errors programmatically associated (`aria-describedby`, `aria-invalid`); error summary receives focus on failed submit; success heading receives focus; status messages use `role=status` / `role=alert` appropriately (not both).
6. Images: informative images need alt (CMS makes alt mandatory for the cover; inline image alt is an author discipline — say what the editor should write); decorative → empty alt.
7. Links are distinguishable without colour (underline, as `.prose-body a` already does). Link text is meaningful out of context ("Read: <title>", not "read more").
8. Motion: nothing new animates except transitions already covered by the global reduced-motion rule. No autoplay.
9. Dates use `<time datetime>`; reading time is plain text.
10. Language: `lang="en"` inherited. Code blocks are not announced as prose noise: provide a way (e.g. `aria-label`) if you add a "copy" button — a copy button is optional; if included it needs an accessible name and a polite "Copied" status.

## 9. Fit with the existing theme (checklist the Designer signs off)

- [ ] Only existing tokens/fonts used; any proposed new token is justified in writing and sent to the Tech Lead as a Request
- [ ] Page frame, `PageHeader`, ruled-list pattern reused rather than reinvented
- [ ] Both grounds designed (not "invert it later"); Studio uses `--cb: #6f4718` accent, not blue
- [ ] Nothing depends on the portrait/hero
- [ ] Looks right over the mesh field and grain (annotate any surface that needs `bg-surface` to be legible)

## 10. Acceptance criteria

1. `docs/design/` contains all files listed in §2, each page showing **every state in §4** in both grounds (ASCII acceptable except the two hi-fi items in §6).
2. `copy.md` contains every string a visitor can see on `/blog/`, `/blog/<slug>/`, `/contact/` (including every error, status and aria-live message) and `/admin/`, each with an ID (e.g. `contact.error.email.invalid`) that Frontend uses as the code reference. No string appears in a wireframe that is missing from `copy.md`.
3. Every colour in the deliverables is a token name from §3; every text/background pair used is listed with its contrast ratio, and none is below 4.5:1 (text) or 3:1 (non-text).
4. The nav layout is shown at 320, 375, 768, 1024 and 1280 px with 7 items.
5. `prose.md` specifies all elements listed in §4.2, both grounds, in rem/tokens (no px except hairlines).
6. The decisions D-Q1 (no-JS strategy), D-Q2 (`Blog` vs `Blogs`) and the spam-rejection behaviour are each answered with a recommendation and reasoning.
7. A one-page "implementation notes for Frontend" section at the end of each page file lists component boundaries you assume (e.g. `PostList`, `PostMeta`, `Prose`, `ContactForm`, `FieldError`), and states which existing components are reused unchanged.
8. Nothing outside `docs/design/` was modified.

## 11. Open questions for the owner

| # | Question |
|---|---|
| D-Q1 | Is a form without JavaScript worth a full-page-redirect design, or is `mailto:` fallback enough? (Default: mailto fallback.) |
| D-Q2 | `Blog` or `Blogs` as the nav label and page title? (Currently `Blogs`.) |
| D-Q3 | Should the blog index show tags/filters in v1, or stay a pure chronological list? (Default: list only; tags shown on posts but not clickable.) |
| D-Q4 | Is a cover image expected on most posts (affects the index design: thumbnails or text-only)? (Default: text-only index; cover only on the post page.) |
| D-Q5 | Reading width/alignment: keep the site's left-aligned frame, or centre long-form text? (Designer recommends; owner vetoes.) |
| D-Q6 | Copy tone for the consent line: is "not stored on the site" accurate for the chosen provider (it stores 30 days of history)? Confirm with Integrations before publishing the wording. |
