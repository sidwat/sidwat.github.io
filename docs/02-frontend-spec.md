# 02 — Frontend spec (Frontend Engineer)

Audience: Frontend Engineer · Prereq: [00-overview.md](00-overview.md) §0, §5, §6, §8; designer output in `docs/design/` · Tasks: F-1 … F-5 in [STATUS.md](STATUS.md)

---

## 1. Scope

Implement, in the existing Next.js 16 static-export app:

1. The blog **reading side**: content loader, `/blog/`, `/blog/<slug>/`, RSS, sitemap/robots integration.
2. The **contact page UI** and form behaviour (validation, states, accessibility), calling the provider adapter Integrations supplies.
3. Navigation/footer changes to reach both.
4. Removal of the legacy placeholder posts.

**Not in scope:** the CMS (`public/admin/`, `config.yml`), the form provider adapter, CI/deploy changes, test code (Integrations/QA own those). Do not add Server Actions, API routes, or anything the static export rejects.

> **Before writing any code:** `AGENTS.md` says this Next.js version has breaking changes. Read the relevant guides under `node_modules/next/dist/docs/` (`static-exports`, dynamic routes + `generateStaticParams`, metadata, route handlers). Specifically verify: the type of `params` in the `[slug]` page (a Promise in recent majors), `dynamicParams = false`, and that a `force-static` GET route at `feed.xml` emits `out/blog/feed.xml` with the right content type.

## 2. Files owned

Only you may edit these (everything else: raise a Request in STATUS.md).

```
app/blog/page.tsx                    (replace the "Coming soon" placeholder)
app/blog/[slug]/page.tsx
app/blog/feed.xml/route.ts
app/contact/page.tsx
app/sitemap.ts
app/robots.ts
app/not-found.tsx                    (only if the Designer asks for a "← All posts" link)
app/globals.css                      (only inside two new delimited blocks: `/* ---- blog prose ---- */` and `/* ---- contact form ---- */`; do not touch existing rules)
components/blog/**                   PostList, PostRow, PostMeta, TagList, PostNav, Prose, DraftBadge
components/contact/**                ContactForm, FieldError, copy.ts   (provider.ts is NOT yours)
components/Nav.tsx
components/Footer.tsx
lib/site.ts
lib/blog/**                          index.ts (public API), load.ts, validate.ts, render.ts, copy.ts
package.json, pnpm-lock.yaml         (sole owner — see §4 F-1)
CHANGELOG.md, DEVELOPMENT.md, README.md   (docs for the shipped feature; version bump to 1.1.0)
_legacy-jekyll/_posts/**             (delete)
_legacy-jekyll/_drafts/**            (delete)
```

You **consume but do not edit:** `content/blog/**` and `public/images/blog/**` (Integrations), `lib/contact/provider.ts` (Integrations), `docs/design/**` (Designer), `.github/workflows/**` (Integrations/QA), `tests/**` (QA).

## 3. Contracts you implement (copied from `00`; `00` wins on conflict)

- **Post front matter and visibility rules:** `00` §5.1.
- **Public API of `lib/blog`:** `00` §4.2 (`Post`, `getAllPosts()`, `getPost(slug)`). Pages import **only** `@/lib/blog`, never `fs` or content paths.
- **Contact adapter:** `00` §5.2 — import `submitContact` and its types from `@/lib/contact/provider`. Until I-3 lands, develop against a local stub **that you do not commit** (or ask Integrations to land the interface-only file first: task I-3 step 1 exists for that).
- **Routes:** `00` §5.3.

### Test hooks (QA relies on these — do not rename)

| `data-testid` | Element |
|---|---|
| `post-list` | `<ol>` of rows on `/blog/` |
| `post-row` | each row |
| `blog-empty` | empty state on `/blog/` |
| `post-title` / `post-body` / `post-date` / `post-tags` | on `/blog/<slug>/` |
| `post-draft-badge` | only when `BLOG_INCLUDE_DRAFTS=1` |
| `contact-form` | the `<form>` |
| `contact-error-summary` | top-of-form error summary |
| `contact-submit` | the submit button |
| `contact-success` | success heading container |
| `contact-fallback` | the mailto fallback link block |

## 4. Tasks

### F-1 — Dependencies and loader (`lib/blog`)

Add dependencies (exact versions, latest stable at the time; run `pnpm install`, commit the lockfile). Only these, unless a Request is approved:

| Package | Why | Runs where |
|---|---|---|
| `gray-matter` | front matter | build only |
| `unified`, `remark-parse`, `remark-gfm`, `remark-rehype`, `rehype-stringify` | Markdown → HTML | build only |
| `rehype-slug`, `rehype-autolink-headings` | heading anchors | build only |
| `rehype-pretty-code` + `shiki` (or `@shikijs/rehype`) | code highlighting, **no client JS**; emit CSS-variable themes so ink/studio both work | build only |
| `zod` | front-matter validation with readable errors | build only |
| `remark-math`, `rehype-katex` | **only if Q7 confirms math**; KaTeX CSS then loads on post pages only | build only |
| devDeps for QA: `@playwright/test`, `@axe-core/playwright` | consumed by QA (T Q-1). Lighthouse CI runs via `pnpm dlx @lhci/cli`, **not** added as a dependency | dev only |
| `package.json` scripts | add `"test:e2e": "playwright test"` and `"build:drafts": "BLOG_INCLUDE_DRAFTS=1 next build"` (QA uses the latter) | — |

Check `pnpm-workspace.yaml` `allowBuilds`: do not weaken it; if a new package needs a build script, list it in a Request to the Tech Lead instead of enabling it.

Implement `lib/blog/*`:

- Read `content/blog/*.md` with `fs` (build time only), parse, validate with zod, render. Memoise per build process.
- Rendering config: raw HTML **not** allowed (do not enable `allowDangerousHtml`); GFM on; links starting with `http` get `rel="noopener noreferrer"` (+ `target` not set); external images allowed but warn at build; local images must exist under `public/` (else fail the build); add `loading="lazy" decoding="async"` and intrinsic `width`/`height` to local images (probe the file) to prevent layout shift.
- Computed: `readingMinutes` = `max(1, ceil(words / 200))` from the Markdown source with code fences excluded.
- Visibility: exactly the rule in `00` §5.1 (`draft`, future `date`, `BLOG_INCLUDE_DRAFTS`).
- Failure mode: any violation throws with a message naming the **file and field** (e.g. `content/blog/foo.md: "summary" is required`). This message is what the owner sees in a failed Action, so write it for a human.
- YAML timestamps: an unquoted ISO date in front matter is parsed by `gray-matter` into a JS `Date`, a quoted one stays a string. Accept both for `date`/`updated`, normalise to an ISO string, and reject anything unparseable (this is how the CMS will write them).
- Order: `date` descending; ties by slug.
- Dates are rendered in **UTC** with `Intl.DateTimeFormat("en-GB", { timeZone: "UTC", … })` (server-rendered, so no hydration mismatch).

### F-2 — Blog index and post pages

- `/blog/`: keep `PageHeader` (label/title/intro per Designer and `copy.md`). Populated = ruled list grouped by year; empty = the designed empty state. Test hooks per §3.
- `/blog/<slug>/`: `generateStaticParams` from `getAllPosts()`, `export const dynamicParams = false`. Unknown slug → existing 404. Post page structure per `docs/design/blog-post.md`.
- Metadata per post via `generateMetadata`: `title` (template already appends the site name), `description` = summary, `alternates.canonical` (`/blog/<slug>/`), `openGraph` (`type: "article"`, `publishedTime`, `modifiedTime`, `tags`; images only if `cover` set — otherwise inherit the site's static `opengraph-image.png`), `twitter` card. `/blog/` metadata adds `alternates.types` for the RSS feed.
- JSON-LD `BlogPosting` in a `<script type="application/ld+json">`; serialise with `JSON.stringify(...).replace(/</g, "\\u003c")`.
- `Prose`: styles only inside the `/* ---- blog prose ---- */` block, scoped under a `.post-body` class, implementing `docs/design/prose.md` for **both** grounds. Code blocks scroll horizontally, never wrap; tables scroll inside a container with `tabindex="0"`.
- No client components on these pages except what already exists in the layout (Nav, ThemeToggle, MeshField). Post pages are Server Components.

### F-3 — Contact page and form

- `app/contact/page.tsx`: Server Component, `metadata = { title: "Contact" }`, `PageHeader` per `copy.md`, renders `<ContactForm />`, plus the always-visible mailto fallback.
- `ContactForm` (client): fields and constraints exactly per `00` §5.2 and `docs/design/contact.md`. Behaviour:
  - Native `required`/`type=email`/`maxLength` attributes **and** `noValidate` with your own messages (so the Designer's copy and error summary are used).
  - Validate on submit; after a field has been touched, revalidate on blur/change.
  - On failed submit: focus the error summary (`tabIndex={-1}`), which lists links to each invalid field.
  - On submit: set busy, make fields `readOnly`, ignore further submits, call `submitContact({... , honeypot, elapsedMs})`, never `await` without a `try/catch` (the adapter should not throw, but a thrown error must still land in the provider-error state).
  - `elapsedMs`: `performance.now()` minus the mount time stored in a ref.
  - Honeypot: an `<input name="botcheck" tabIndex={-1} autoComplete="off">` inside a visually-hidden wrapper with `aria-hidden="true"`; **not** `display:none`.
  - Success: swap the form for the success block; move focus to its heading. Error results map from `ContactResult.code` to the copy IDs the Designer defined. Preserve typed values on every error. "Send another" resets the component (and `elapsedMs`).
  - `mailto:` fallback built with `encodeURIComponent` of the current message body when available.
  - No third-party client libraries (no react-hook-form). The client bundle for this route should stay small.
  - Never `console.log` user input.
- Styles only inside `/* ---- contact form ---- */`. Control borders use `--muted` (not `--line`; see Designer §3.1). Min touch target 44px; inputs ≥ 16px font.
- Strings come only from `components/contact/copy.ts`, generated 1:1 from `docs/design/copy.md` IDs. No inline user-facing literals in JSX.
- `<noscript>`: per Designer decision (default: mailto fallback paragraph).

### F-4 — Navigation, footer, sitemap, robots, RSS

- `lib/site.ts`: add `{ href: "/contact", label: "Contact" }` to `nav` (Q10) and apply the label decision (D-Q2). Remember `nav` also drives the sitemap and the 404 link list, so those pick up Contact automatically.
- `components/Nav.tsx`: layout changes only as the Designer specified for 7 items. Keep `aria-current` semantics. `/blog/<slug>/` must show "Blogs" active (it will under `startsWith`; verify at 320px).
- `components/Footer.tsx`: keep the mailto; add the `/contact/` link per Designer.
- `app/sitemap.ts`: keep the nav-derived entries; append one entry per published post (`/blog/<slug>/`, `lastModified` = `updated ?? date`, `priority` 0.7). Preserve the trailing slash behaviour. **Must not** list `/admin/`.
- `app/robots.ts`: add `disallow: ["/admin/"]`; keep the sitemap line.
- `app/blog/feed.xml/route.ts`: RSS 2.0, `export const dynamic = "force-static"`, `Content-Type: application/rss+xml; charset=utf-8`; items = published posts; each has `title`, `link` (absolute, trailing slash), `guid` (permalink), `pubDate` (RFC 822), `description` = summary; XML-escape everything. Zero posts → valid empty channel, not an error.

### F-5 — Remove legacy placeholder posts

`git rm -r _legacy-jekyll/_posts _legacy-jekyll/_drafts`. Verify with `git grep -n "_posts\|_drafts"` that nothing outside `_legacy-jekyll/` references them. **Do not** delete the rest of `_legacy-jekyll/` unless the owner answers Q6 with "all". Mention it in `CHANGELOG.md`.

## 5. Constraints and non-negotiables

1. `next build` must succeed with **zero** published posts, with one, and with `BLOG_INCLUDE_DRAFTS=1` (QA builds all three).
2. No runtime data fetching on the client for blog content.
3. No new global CSS outside the two delimited blocks; no raw hex; use tokens (`text-luma`, `border-line`, `bg-surface`, `text-muted`, `text-cb`, `text-cr`).
4. No `dangerouslySetInnerHTML` except (a) the rendered post body from `lib/blog`, (b) the JSON-LD script, (c) the existing theme script in the layout.
5. Don't import anything from `content/` or use `fs` outside `lib/blog/**`.
6. Respect `prefers-reduced-motion` (nothing new should animate).
7. Version `1.1.0` in `package.json` and `CHANGELOG.md` (new section: contact page, blog, RSS; "known" items: drafts are public in the repo; CMS requires a GitHub token).
8. Update the `DEVELOPMENT.md` Roadmap: Phase 4 "blog" becomes done *with the Git-based approach*; keep the Notion Phase 3 text for the other sections and note the seam in `lib/blog`.

## 6. Acceptance criteria

**Build & hygiene**
1. `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` pass on the branch with the two fixtures in `content/blog/` (both `draft: true`) — and with `BLOG_INCLUDE_DRAFTS=1` pnpm build:drafts.
2. With zero published posts the production build emits `out/blog/index.html` containing the empty state and **no** `out/blog/<slug>/` directories.
3. A post with a missing `summary` (or any rule in `00` §5.1) fails the build with a message naming file and field.
4. `out/` contains no string from `NEXT_PUBLIC_*` other than the two documented contact variables, and no GitHub token, `.env` content or CMS config.

**Blog**
5. `/blog/` lists published posts newest-first, grouped by year, with date, title, summary, reading time, tags; the empty state matches `docs/design/blog-index.md`.
6. `/blog/<slug>/` renders every element in `docs/design/prose.md` in both grounds; no horizontal page scroll at 320px with a 100-character unbroken string, a wide table and a long code line in the post.
7. A draft post, and a post dated in the future, are absent from `/blog/`, the sitemap, the RSS feed and `out/` in a production build; present in a drafts build, with a visible `DRAFT` marker.
8. Each post page has: unique `<title>`, `meta description` = summary, canonical, Open Graph article tags, valid JSON-LD (passes a JSON parse and the schema validator), one `h1`, `<time datetime>`.
9. `/blog/feed.xml` is valid RSS 2.0 (W3C feed validator or equivalent), served with an XML content type from GitHub Pages, and discoverable via `<link rel="alternate">` on `/blog/`.
10. `sitemap.xml` includes `/contact/`, `/blog/`, and every published post with trailing slashes; excludes `/admin/`. `robots.txt` disallows `/admin/`.
11. Post body HTML contains no `<script>`, `on*=` attribute, or `javascript:` URL even if the Markdown source contains them (add this as a fixture check).

**Contact**
12. Every state in `docs/design/contact.md` is reachable and matches (idle, field error, summary, submitting, success, provider error, network error, rate-limited, spam, no-JS, not-configured).
13. Keyboard-only: complete and submit the form; failed submit moves focus to the summary; success moves focus to the heading; no focus trap; visible focus everywhere.
14. Screen-reader labels/descriptions: each control has a programmatic label; invalid controls have `aria-invalid="true"` and `aria-describedby` to their message; success/failed messages are announced once.
15. Double-click on Submit sends exactly one request. Typed values survive every error state.
16. The honeypot is invisible and unfocusable to humans, absent from the accessibility tree, and a filled honeypot or `elapsedMs < 3000` results in a `spam` result (adapter-level; verify UI behaviour).
17. Building with `NEXT_PUBLIC_CONTACT_*` unset still succeeds; `/contact/` then shows the provider-error state with the mailto fallback.

**Navigation, performance, regression**
18. Nav shows Blog and Contact as specified, wraps without overlap at 320/375/768/1024/1280, `aria-current="page"` correct on `/blog/`, `/blog/<slug>/`, `/contact/`; footer link works; 404 lists the new items.
19. First-load JS: `/blog/` and `/blog/<slug>/` add **≤ 2 KB** over the existing smallest content page (e.g. `/teaching/`); `/contact/` adds **≤ 15 KB**. Measure with `node tests/scripts/route-js.mjs out` (Next 16 no longer prints First Load JS in the build output; BUG-005).
20. Existing pages (`/`, `/experience/`, `/publications/`, `/projects/`, `/teaching/`, `/gallery/`, 404) render identically — visual diff clean at 375 and 1280 on both grounds (QA verifies).
21. `legacy` placeholders removed (F-5); `git grep -n "Blog Post number\|Future Blog Post"` returns nothing outside history.

## 7. Open questions for the owner

| # | Question |
|---|---|
| F-Q1 | Math (KaTeX) and syntax highlighting in v1? (Q7 — default highlighting yes, math no.) Adding KaTeX later is small but changes the CSS budget. |
| F-Q2 | Should the blog link remain in the nav while there are zero posts (Q9)? If hidden when empty, `nav` must be filtered by `getAllPosts().length`, and `/blog/` must stay reachable by URL. |
| F-Q3 | Do you want inline images in posts commonly (affects the width/height probing work and the 500 KB image-size gate QA will enforce)? |
| F-Q4 | RSS: summary only (default) or full content in `content:encoded`? |
| F-Q5 | Is `Contact` in the top nav acceptable given the nav already wraps on narrow screens (Q10)? |
