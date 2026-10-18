# 04 — QA plan (QA Engineer)

Audience: QA Engineer · Prereq: [00-overview.md](00-overview.md) §0, §5, §6, §8; other specs for the behaviour under test · Tasks: Q-1 … Q-5 in [STATUS.md](STATUS.md)

---

## 1. Scope

Verify, before anything reaches `master`, that:

1. **Contact** works end to end, degrades gracefully, resists spam, and is accessible.
2. **Blog** (index, post, RSS, sitemap, drafts/future rules) renders correctly in both grounds and on all target devices.
3. **CMS authoring** really lets the owner write → publish → edit → unpublish without hand-editing files.
4. **Nothing existing regressed** (home, experience, publications, projects, teaching, gallery, 404, theme toggle, mesh, assets).
5. **Security/privacy hygiene** of a public, static, token-in-`localStorage` setup.
6. Accessibility (WCAG 2.2 AA) and Lighthouse targets are met and not regressed.

Out of scope: the third-party services' own reliability; the CMS's internal UI quality beyond our workflows; load testing; login (G3 is roadmap only).

## 2. Files owned

```
tests/e2e/*.spec.ts           Playwright specs (blog, contact, nav, a11y, seo, regression, security)
tests/fixtures/**             generated-at-CI fixture posts, stub payloads
tests/scripts/scan-out.mjs    scans out/ and git for secrets/unsafe content
playwright.config.ts
lighthouserc.json
.github/workflows/qa.yml      PR checks only; never deploys
docs/qa/**                    baseline.md, test-log.md, bugs.md, report-YYYY-MM-DD.md, signoff.md
docs/qa-report.md             the running consolidated bug report (steps, expected, actual, owner); bugs.md may link to it
```

You do **not** edit application code, `package.json` (Frontend adds `@playwright/test`, `@axe-core/playwright` and the scripts `test:e2e`, `build:drafts` in F-1; Lighthouse CI runs through `pnpm dlx @lhci/cli`), content, or deploy config. File bugs; do not fix them.

## 3. Strategy

| Layer | Tool | What it covers | Where |
|---|---|---|---|
| Static/build checks | `pnpm lint`, `tsc --noEmit`, `pnpm build` ×N | contracts, validation failures, no-secrets | CI + local |
| Automated browser | Playwright (chromium, firefox, webkit) against the static `out/` | functional, SEO, security, a11y (axe), visual regression of non-animated pages | CI + local |
| Lighthouse | `@lhci/cli` against `out/` (mobile + desktop presets) | perf/a11y/SEO/best-practices budgets | CI + local |
| Manual | Real devices & screen readers; CMS flows; real provider email | what automation cannot judge | recorded in `docs/qa/test-log.md` |
| Post-deploy smoke | Owner + QA on production once | GitHub Pages content-types, real CMS, real email | after M-1 |

**Why several builds.** The visibility rules and failure modes can only be tested by building different content sets. `qa.yml` (and a local script) create *uncommitted* fixtures in `content/blog/` before building:

| Build | Content | Command | Expected |
|---|---|---|---|
| **B0 clean prod** | repo as-is (two sample drafts) | `pnpm build` | passes; `/blog/` shows empty state; no post pages in `out/` |
| **B1 prod + fixtures** | + `qa-published.md` (published, past date), `qa-future.md` (published, date +30d), `qa-draft.md` (`draft: true`) | `pnpm build` | passes; only `qa-published` is exposed in list/sitemap/RSS/`out/` |
| **B2 drafts** | repo as-is | `pnpm build:drafts` | passes; both sample posts present, with `DRAFT` marker |
| **B3 invalid (negative)** | + one file per violation: no summary / bad date / dup slug / `cover` without `coverAlt` / missing local image / bad tag | `pnpm build` ×each | each **fails**, message contains file name and field name |
| **B4 no contact config** | B0 with `NEXT_PUBLIC_CONTACT_*` unset | `pnpm build` | passes; `/contact/` shows provider-error state |

A local static server differs from GitHub Pages (content types for extensionless files, 404 handling, trailing-slash redirects). Treat server-dependent results (feed content type, 404 status, `/admin/` routing) as **provisional until the post-deploy smoke test (§10)**.

## 4. Environments and device/browser matrix

Automated (Playwright projects): Desktop Chrome, Desktop Firefox, Desktop Safari (WebKit), iPhone 13 (WebKit), Pixel 7 (Chromium), iPad (WebKit).

Manual (record the exact versions in `test-log.md`):

| Class | Required | Notes |
|---|---|---|
| Desktop browsers | Chrome, Safari, Firefox, Edge — latest stable | Safari: also check `backdrop-filter` nav and mask-feathered studio portrait unaffected |
| iOS | Safari on a real iPhone (latest iOS) | iOS form zoom on focus (16px rule), keyboard covering submit button, `type=email` keyboard |
| Android | Chrome on a real Android phone | autofill, long-press paste |
| Tablets | iPad Safari portrait + landscape | nav wrap at 768/1024 |
| Viewports | 320, 375, 414, 768, 1024, 1280, 1920 | plus 400% zoom at 1280 (≈320 CSS px) |
| Themes | Ink and Studio on **every** test | toggle mid-session as well as at load; reload keeps the choice |
| Preferences | `prefers-reduced-motion`, `prefers-color-scheme` (admin page), forced-colors (Windows high contrast) once | |
| Assistive tech | VoiceOver (macOS Safari + iOS), plus NVDA+Firefox or TalkBack once each | forms, nav, post headings |
| Network | Fast 4G throttle + offline for the contact form | |

If real devices aren't available to the QA agent, say so in `test-log.md` and ask the owner (open question QA-Q1) — don't silently substitute emulation.

## 5. Test cases

IDs are stable; automated cases are marked **[A]**, manual **[M]**, both **[A+M]**. "Both grounds" = ink and studio.

### 5.1 Blog index and posts (BLG)

| ID | Case | Expected |
|---|---|---|
| BLG-01 [A] | B0: open `/blog/` | Empty state per design; `data-testid=blog-empty`; no `post-list`; HTTP 200; page has one `h1` |
| BLG-02 [A] | B1: open `/blog/` | Exactly one post row (`qa-published`); newest-first order verified with 3 published posts in an extra fixture; year grouping correct across a year boundary |
| BLG-03 [A] | B1: `qa-draft` and `qa-future` | Absent from `/blog/`, `sitemap.xml`, `feed.xml`, and `out/blog/*` directory listing; direct URL → 404 page |
| BLG-04 [A] | B2: drafts build | Both sample posts listed with `post-draft-badge`; badge text not colour-only |
| BLG-05 [A] | Open a post | Title (`h1`), `<time datetime>`, reading time, tags, body render; `<title>` unique and matches template; canonical correct with trailing slash |
| BLG-06 [A+M] | Post with every element from `prose.md` (hello-world fixture) | Each element matches the design in both grounds; code highlight tokens ≥ 4.5:1; table scrolls inside its container |
| BLG-07 [A] | Edge fixture: long title, 100-char unbroken string, wide table, long code line, `<script>`/`onerror=` text in Markdown | No horizontal page scroll at 320px (`scrollWidth ≤ clientWidth`); script text appears as text; DOM contains no `<script>` from the body, no `on*` attributes, no `javascript:` URLs |
| BLG-08 [A] | Metadata | `meta description` = summary; OG `article:*` tags; JSON-LD parses and has `BlogPosting` with correct dates/headline; no cover ⇒ site default OG image |
| BLG-09 [A] | Unknown slug `/blog/nope/` | Site 404 page (status 404 on the real host; see §10) |
| BLG-10 [A] | First/last post navigation | Previous/next omitted correctly at ends |
| BLG-11 [A] | Date display | Same date string in SSR HTML and after hydration (no hydration warning in console); UTC rendering for a post dated `2026-11-01T23:30:00Z` shows 1 Nov regardless of the test machine's timezone (run once with `TZ=Pacific/Auckland`) |
| BLG-12 [A] | Cover image | Reserved aspect box (CLS ≈ 0), `alt` present, lazy-loading attributes present below the fold |
| BLG-13 [A] | Local images in body | `width`/`height` present; no broken image in a link crawl |
| BLG-14 [A] | Console | Zero errors/warnings on every blog URL in all 3 engines |
| BLG-15 [M] | Print preview of a post | Legible, no nav/mesh/grain (note as a non-blocking finding if not handled) |

### 5.2 RSS, sitemap, robots (SEO)

| ID | Case | Expected |
|---|---|---|
| SEO-01 [A] | `/blog/feed.xml` (B1) | Well-formed XML; validates as RSS 2.0; one item; absolute URLs with trailing slashes; RFC-822 dates; zero-post build yields valid empty channel |
| SEO-02 [A] | `<link rel="alternate" type="application/rss+xml">` on `/blog/` | Present and resolves 200 |
| SEO-03 [A] | `sitemap.xml` (B1) | Contains `/`, section pages, `/blog/`, `/contact/`, the published post; **not** `/admin/`, drafts, future posts, `/gallery/` unless in nav |
| SEO-04 [A] | `robots.txt` | `Disallow: /admin/`; sitemap URL absolute |
| SEO-05 [A] | `/admin/` | `meta robots noindex`; not linked from any page (crawl every internal link on every page) |
| SEO-06 [M] | Share preview of a post and of `/contact/` (LinkedIn Post Inspector / opengraph.xyz) after deploy | Title, description, image render |

### 5.3 Contact form (CON)

Automated tests intercept the provider endpoint with `page.route` (never hit the real provider in CI).

| ID | Case | Expected |
|---|---|---|
| CON-01 [A] | Load `/contact/` | `h1`, form, labelled fields, mailto fallback; no console errors; honeypot field exists, is not visible, not focusable by Tab, not in the a11y tree |
| CON-02 [A] | Submit empty | Error summary appears and receives focus; each invalid field has `aria-invalid="true"` and `aria-describedby`; summary links jump to fields; **no network request** made |
| CON-03 [A] | Invalid email forms (`a`, `a@b`, `a b@c.d`, 300-char) | Inline error with the designed copy; valid forms accepted (`a+tag@sub.example.co`) |
| CON-04 [A] | Message too short (9) / boundary 10 / boundary 5000 / 5001 | Reject / accept / accept / reject; counter appears > 80% |
| CON-05 [A] | Valid submit, provider stub returns success | Button shows `Sending…` and is disabled while pending; fields read-only; success block with focus on its heading; `role=status` announced once; typed text not echoed; request body has exactly the allowed keys and `botcheck` empty |
| CON-06 [A] | Double click Submit | Exactly one request |
| CON-07 [A] | Provider 429 / quota body | Rate-limited copy + mailto; values preserved |
| CON-08 [A] | Provider 400 validation / 500 / malformed JSON / network abort / 20-s hang (fake timers) | Correct state each time; values preserved; retry works; timeout at 15 s; "Still sending…" at 8 s |
| CON-09 [A] | Offline (Playwright `context.setOffline`) | Network-error state, no uncaught exception |
| CON-10 [A] | Honeypot filled via script | **No request** to the provider; designed spam behaviour shown |
| CON-11 [A] | Submit < 3000 ms after load (script-fast) | Treated as spam; a *human-fast* path (autofill, then submit at 3.1 s) succeeds. Record the false-positive risk in the report |
| CON-12 [A] | CR/LF and header-injection payloads in name/subject (`x\r\nBcc: a@b.c`) | Not sent to provider verbatim (adapter strips/rejects); no UI crash |
| CON-13 [A] | HTML/script payloads in all fields | Never rendered back as HTML anywhere; if echoed in any UI, it is escaped |
| CON-14 [A] | B4 (no config) | Provider-error state with mailto fallback; no blank screen; no thrown error at load |
| CON-15 [A] | "Send another" | Form resets, `elapsedMs` restarts, focus returns to first field |
| CON-16 [A+M] | Keyboard-only run through every state; focus order logical; no trap | Pass |
| CON-17 [M] | Screen reader (VO/NVDA): labels, required, errors announced, success announced once | Pass |
| CON-18 [M] | iOS Safari + Android Chrome: no zoom-on-focus, correct keyboards, autofill fills name/email, submit reachable above the keyboard | Pass |
| CON-19 [M] | JavaScript disabled | Designed fallback; mailto works |
| CON-20 [M] | **Live send (production, max 3 per run — uses free quota):** from the production site | Message arrives in the chosen inbox; name/email/subject/body correct; Reply-To lets the owner answer; arrives within 2 minutes; not in spam folder (Gmail and UCSD) |
| CON-21 [M] | Provider dashboard check | Submission logged; key restricted to the site domain if the free tier supports it; the vendor facts recorded in `docs/runbooks/contact-form.md` are still true |
| CON-22 [A] | Privacy copy | The consent line present and matches `docs/design/copy.md` |

### 5.4 CMS authoring (CMS) — mostly manual

Run first in **local mode / a throwaway fork** (Sveltia local workflow needs no auth and a Chromium browser), then once on production (§10).

| ID | Case | Expected |
|---|---|---|
| CMS-01 [M] | Open `/admin/` | Designed loading state; CMS loads; script integrity hash verifies (DevTools shows no SRI error) |
| CMS-02 [M] | Sign in with a fine-grained PAT scoped only to the repo (contents RW) | Success. With a PAT lacking contents write → clear failure on save, nothing committed |
| CMS-03 [M] | New post → fill all fields → Save with Draft ON | One commit to `master` titled per `commit_messages`; only `content/blog/<slug>.md` (+ images) changed; **site unchanged** |
| CMS-04 [M] | Toggle Draft OFF → Save | Deploy workflow green; post visible at `/blog/<slug>/` + list + feed + sitemap within ~3 min; time recorded |
| CMS-05 [M] | Edit title and body | URL (slug) unchanged; content updated; `updated` handled as designed |
| CMS-06 [M] | Upload an image (small, and a 3 MB one) | Stored under `public/images/blog/…`; path referenced correctly; large-image behaviour documented (warn/resize); image renders in post |
| CMS-07 [M] | Cover without alt | Build fails with message naming file and field; **previous site stays live**; fixing the field and saving recovers |
| CMS-08 [M] | Duplicate slug / empty summary / 91-char title / bad tag `Foo Bar` | Editor-level blocks where the widget can; otherwise a red build with a human-readable message (screenshot it for the runbook) |
| CMS-09 [M] | Schedule: `date` +1 day with Draft OFF | Not public now; visible after the next build following that time (and after the cron, if Q8) |
| CMS-10 [M] | Unpublish (Draft ON) | Gone from list, feed, sitemap after deploy. Record that it remains in git history (expected) |
| CMS-11 [M] | Delete post | File removed; URL 404 after deploy; leftover images noted |
| CMS-12 [M] | Markdown with raw HTML (`<script>`, `<iframe>`) saved from the editor | Rendered as text/ignored, never executed |
| CMS-13 [M] | Runbook dry run: a person who has not seen the system follows `docs/runbooks/editing-posts.md` verbatim | Completes the publish flow unaided; every deviation logged as a doc bug |
| CMS-14 [M] | Token expired/revoked mid-session | Clear error; no data loss in the editor; re-auth path in `token-rotation.md` works |

### 5.5 Navigation and layout (NAV)

| ID | Case | Expected |
|---|---|---|
| NAV-01 [A] | Nav items at 320/375/768/1024/1280 both grounds | Blog + Contact present; no overlap/clipping; wraps; theme toggle reachable |
| NAV-02 [A] | `aria-current="page"` | Correct on `/blog/`, `/blog/<slug>/` (Blog), `/contact/` |
| NAV-03 [A] | Footer link to `/contact/` and mailto both work | Pass |
| NAV-04 [A] | 404 page lists the new destinations | Pass |
| NAV-05 [A] | Skip link | Moves focus to `#main` on every new page |
| NAV-06 [A] | Theme toggle on new pages | Choice persists across navigation and reload; no flash of wrong ground on first paint (check `data-theme` before first paint) |
| NAV-07 [A] | Client-side navigation Home → Blog → Post → Contact → back | No full reload errors; scroll restoration sane; no hydration warnings |

### 5.6 Regression on existing pages (REG)

Capture the **baseline from current `origin/master`** in Q-1 (before any feature merges): screenshots, Lighthouse JSON, DOM text, `sitemap.xml`, `robots.txt`, link graph. Compare at the end.

| ID | Page | Checks |
|---|---|---|
| REG-01 | `/` | Hero shell session completes; portrait hover wave; theme toggle; mesh canvas draws & idles; no console errors. Animated regions are **masked** in screenshot diffs; behaviour is checked by script/manual |
| REG-02 | `/experience/`, `/publications/`, `/projects/`, `/teaching/` | Text content identical to baseline; screenshots within `maxDiffPixelRatio 0.002` at 375 & 1280, both grounds (nav region excluded or compared against the *expected* new nav) |
| REG-03 | `/gallery/` | Unchanged; still not in nav; still in sitemap only if it was before |
| REG-04 | 404 | Renders in layout; lists nav |
| REG-05 | Assets | `/cv.pdf` 200 and unchanged hash; `/media/*` 200; favicon/OG image 200; no new 404 in a crawl of every internal link & asset |
| REG-06 | Fonts, grain, studio portrait feathering | Unchanged (visual) |
| REG-07 | Build output | Page count = baseline + (`/blog/`, `/contact/`, posts); total `out/` size delta reported; no unexpected new JS chunks on old pages (compare First Load JS per route to baseline) |
| REG-08 | `sitemap.xml` / `robots.txt` | Only intended diffs |
| REG-09 | Old Jekyll URLs (`/publication/…`, `/Experiences/`, `/talks/`) | Still hit the 404 (known/accepted, `CHANGELOG` 1.0.1) — confirm unchanged |
| REG-10 | `_legacy-jekyll/_posts` removal | No file or build step references it; `pnpm lint`/`tsc` unaffected |

### 5.7 Security and privacy (SEC)

| ID | Case | Expected |
|---|---|---|
| SEC-01 [A] | `scan-out.mjs` on every build: grep `out/` for token shapes (`ghp_`, `github_pat_`, `secret_`, `sk_`, `-----BEGIN`), `.env` contents, `NOTION_TOKEN`, absolute local paths, `localhost` | None. Only the two documented `NEXT_PUBLIC_CONTACT_*` values appear |
| SEC-02 [A] | `git log -p --all` pattern scan (or `gitleaks` if available) on the integration branch diff vs `master` | No secrets |
| SEC-03 [A] | `pnpm audit --prod` | No high/critical; list moderate |
| SEC-04 [A] | `<script>` inventory across all pages (B1) | Only: Next chunks, the existing inline theme script, JSON-LD. **No third-party origins** on any page except `/admin/` |
| SEC-05 [A] | `/admin/` script | Pinned exact version, `integrity` + `crossorigin`; hash matches the file served; page has no inline event handlers |
| SEC-06 [A] | External links | `rel` contains `noopener` (Footer `noreferrer`; post body links `noopener noreferrer`) |
| SEC-07 [A] | Post body sanitisation | Covered in BLG-07; plus fuzz 20 hostile Markdown snippets (`[x](javascript:…)`, `![](x" onerror=…)`, `<img src=x onerror>`, reference-style link tricks, HTML entities, SVG data URLs) — none produces executable output |
| SEC-08 [M] | PAT handling | Token only in browser `localStorage` after sign-in; not present in any request to a non-GitHub host (DevTools Network); not in the repo; sign-out clears it |
| SEC-09 [M] | Headers | GitHub Pages cannot set CSP/X-Frame-Options; record observed headers. `/admin/` is therefore frameable — document as a known accepted risk |
| SEC-10 [M] | Contact abuse | 20 rapid submits from one browser: the provider/UI behaviour is graceful; note whether the free quota could be exhausted by a trivial script (it can, by design — record the observed rate-limit) |
| SEC-11 [M] | Privacy | Contact copy states what happens to the message; the provider's retention matches that copy; no analytics/trackers added; cookies set by the site: none |
| SEC-12 [M] | Image EXIF | Sample uploads carry no GPS data after the CMS flow (or runbook warns) |

### 5.8 Accessibility (A11Y) and performance (PERF)

| ID | Case | Target |
|---|---|---|
| A11Y-01 [A] | axe-core on `/blog/` (empty and populated), a post (ink & studio), `/contact/` (idle, error, success), `/admin/` loading | **0 critical/serious**; moderate triaged |
| A11Y-02 [A+M] | Contrast: every text/background and control-border pair on the new pages in both grounds | Text ≥ 4.5:1, large ≥ 3:1, control boundaries & focus ring ≥ 3:1 (`--line` as a sole input border is a defect; `--cr` text on `--surface` in studio fails at 4.16:1 — see `01` §3.1) |
| A11Y-03 [M] | Keyboard: tab order, visible focus on grain overlay, no traps, skip link, nav | Pass |
| A11Y-04 [M] | Screen reader pass on blog index, a post (heading navigation, code, table, image alt), contact, nav | Pass |
| A11Y-05 [M] | 200% text and 400% zoom; WCAG 1.4.12 text-spacing bookmarklet | No loss of content or function |
| A11Y-06 [M] | `prefers-reduced-motion: reduce` | No new motion; transitions effectively instant |
| A11Y-07 [M] | Windows forced-colors | Form fields and buttons still distinguishable |
| A11Y-08 [A] | Heading outline | One `h1`; no skipped levels on each page |
| PERF-01 [A] | Lighthouse mobile (default throttling) on `/blog/`, a post, `/contact/` | Performance ≥ **90**, Accessibility **100**, Best Practices ≥ **95**, SEO **100**; CLS ≤ 0.05; LCP ≤ 2.5 s; TBT ≤ 200 ms |
| PERF-02 [A] | Lighthouse desktop, same pages | Performance ≥ 95 |
| PERF-03 [A] | Existing pages: Lighthouse vs baseline (median of 3 runs) | No category drops by more than 3 points |
| PERF-04 [A] | First Load JS per route vs baseline | Within the budgets in `02` AC-19 |
| PERF-05 [A] | Post weight: no image > 500 KB in `public/images/blog/` (fixture check script) | Fails CI if exceeded |
| PERF-06 [M] | Real-device load on throttled 4G for a post with a cover image | Text visible quickly; no layout jump |

`lighthouserc.json` encodes the budgets as assertions (`error` for a11y/SEO/CLS, `warn` for performance because shared CI runners are noisy; the **release gate** uses a local median-of-3 run recorded in the report).

## 6. Process

1. **Q-1 (start of project):** build the harness (`playwright.config.ts`, `qa.yml`, fixture generator, scan script), record `docs/qa/baseline.md` from `origin/master`.
2. As feature PRs land on `integration/blog-contact`, run the relevant cases; log in `test-log.md` (case ID, build, browser/device, ground, result, evidence link).
3. Bugs go in `docs/qa/bugs.md`: `ID · severity · case ID · environment · steps · expected · actual · evidence · owner (F/I/D) · status`. Severities: **S1** data loss/security/site broken/blocks publishing; **S2** feature broken or a11y AA failure on a main path; **S3** cosmetic or edge; **S4** suggestion. Add a Request in `STATUS.md` for S1/S2.
4. Retest every fixed bug and rerun the regression set (REG-*) after the last merge.
5. **Entry criteria for Q-4/Q-5:** all F/I tasks `done`; `pnpm lint`, `tsc`, `build` green.

## 7. Exit criteria (sign-off, Q-5)

All must hold; the result is recorded in `docs/qa/signoff.md`, which the Tech Lead requires before M-1:

1. 100% of **[A]** cases pass in all three engines in CI.
2. All **[M]** cases executed at least once on the required matrix; no case skipped without a recorded reason and owner approval.
3. **Zero open S1 or S2** bugs; S3 either fixed or accepted by the owner in writing.
4. Lighthouse/axe targets in §5.8 met; no regression > 3 points anywhere.
5. SEC-* all pass; `scan-out` clean on the final build.
6. Regression REG-* clean vs baseline (intended diffs listed and approved).
7. The CMS write → publish → edit → unpublish → delete flow demonstrated in rehearsal (CMS-03…11) and the runbook dry run (CMS-13) completed.
8. A live contact message delivered in rehearsal using a throwaway/test configuration, or explicitly deferred to the post-deploy smoke with the owner's agreement.

## 8. CI workflow (`.github/workflows/qa.yml`)

- Triggers: `pull_request` to `integration/blog-contact` and `master`; `workflow_dispatch`. No `push` to `master` (deploy.yml owns that).
- Jobs: `static` (lint, tsc) → `build-matrix` (B0–B4) → `e2e` (Playwright, 3 engines, sharded if > 10 min) → `lighthouse` (`pnpm dlx @lhci/cli autorun` on B1) → upload `playwright-report`, `lhci` results, `out/` size summary as artifacts.
- Permissions `contents: read`. Uses **no repository secrets**; the provider is stubbed, the CMS is not exercised in CI.
- Fixture generation is a script in `tests/scripts/` (writes files only in the runner workspace).

## 9. Test data

- Fixtures generated at CI time (never committed to `content/blog/`): see §3.
- Sample payloads: normal, unicode/emoji, RTL text, 5000-char message, injection strings, very long unbroken string, empty-after-trim whitespace.
- Provider stub payloads for 200, 400, 429, 500, malformed, timeout.
- Dates: boundary tests around "now" (±1 minute), midnight UTC, year boundary.

## 10. Post-deploy smoke test (after M-1, with the owner)

Run within an hour of the merge; if anything in this list fails, the Tech Lead decides within the hour whether to `git revert`.

1. Pages deploy green; `/`, `/blog/`, `/contact/`, `/blog/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/admin/` all 200 with correct `Content-Type` (`application/rss+xml` or XML for the feed); unknown URL returns 404 with the site 404 page.
2. Owner signs in to `/admin/`, creates **`qa-smoke-delete-me`** as Draft → confirm unchanged site → Publish → confirm live (time it) → check feed/sitemap → Unpublish → confirm gone → delete the entry.
3. One real contact message from a phone on mobile data (CON-20).
4. Lighthouse on production for `/blog/`, `/contact/`.
5. Share-preview check (SEO-06). Search Console/robots sanity.
6. Record results in `docs/qa/report-<date>.md`; revoke the smoke-test PAT if a temporary one was used.

## 11. Acceptance criteria for the QA deliverables

1. `playwright.config.ts`, specs, fixture generator and `scan-out.mjs` exist; `pnpm test:e2e` runs locally against a fresh `pnpm build` with one command documented in `docs/qa/README` (a section of `baseline.md` is acceptable).
2. `qa.yml` runs on PRs, is green on a clean branch, and **fails** when a deliberate defect is introduced (demonstrate with one throwaway PR: e.g. remove an `aria-describedby`, or leave `--line` as the input border).
3. `docs/qa/baseline.md` contains the `origin/master` Lighthouse scores, First Load JS per route, `out/` size, sitemap and screenshots index, dated, with the commit SHA.
4. `test-log.md` has a result for every case ID in §5 (pass/fail/blocked/N-A with reason).
5. Every defect has an entry in `bugs.md` and, for S1/S2, a Request row in `STATUS.md`.
6. `signoff.md` states pass/fail against each exit criterion in §7, with evidence links, and is signed off by the QA agent; the Tech Lead's merge is blocked without it.
7. The post-deploy smoke test script (§10) is executed and its report filed.
8. Nothing outside the files in §2 was modified.

## 12. Open questions for the owner

| # | Question |
|---|---|
| QA-Q1 | Which real devices can you provide (iPhone model/iOS, Android model)? If none, emulation-only results are marked as such and a residual-risk note goes in the sign-off. |
| QA-Q2 | Who performs the runbook dry run (CMS-13)? It must be someone other than the author of the runbook; you or a friend. |
| QA-Q3 | May QA send up to 3 real messages through the production form (uses free quota, lands in your inbox)? |
| QA-Q4 | May the smoke test create and delete a public `qa-smoke-delete-me` post and commits on `master` (visible in git history permanently)? |
| QA-Q5 | Are Lighthouse "warn" thresholds acceptable in CI with the median-of-3 local run as the release gate, or do you want hard-fail performance gates despite runner noise? |
| QA-Q6 | Is Windows forced-colors / NVDA testing required, or is VoiceOver + one additional screen reader enough? |
