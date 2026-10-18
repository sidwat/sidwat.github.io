# Test log

Every case ID from [04 §5](../04-qa-plan.md#5-test-cases), with its latest result. Builds as in 04 §3. "Emulated" means a Playwright device profile; that is **not** a real-device result.

## Runs

| Date | Commit | Build(s) | Browsers / devices | Scope | Result |
|---|---|---|---|---|---|
| 2026-10-17 | eab9889 (`origin/master`) | baseline `pnpm build` | Chromium (Lighthouse 12.6.1 mobile + desktop, ×3; screenshots), Chromium + Firefox (BUG-003 probe) | Q-1 baseline | recorded in [baseline.md](baseline.md) |
| 2026-10-17 | 42ddff7 (`integration/blog-contact`) | B0, B1, B1X, B2, B4 built; B3 ×6 pending F-2 | — | `build-matrix.mjs` + `scan-out` | 5 builds pass, scan 0 findings, B3 pending |
| 2026-10-17 | 42ddff7 | B0 | chromium, firefox, webkit, iphone-13, pixel-7, ipad (emulated) | full suite | 402 passed (incl. 18 expected-fail BUG-003), 0 failed, 420 skipped/fixme |
| 2026-10-17 | 42ddff7 | B1, B1X, B2, B4 | chromium, webkit | full suite | 134 passed, 0 failed, 140 skipped each |

## Real devices and assistive technology

None available to the QA agent (QA-Q1 is unanswered). All [M] cases are **blocked: needs owner/device**: iPhone (Safari, latest iOS), Android (Chrome), iPad, Windows (Edge, forced colours, NVDA), VoiceOver on macOS and iOS. Live contact send (CON-20) also needs QA-Q3 approval, and CMS cases need I-2 plus a PAT and a throwaway fork. Nothing below is marked pass on emulation alone.

## Cases

| ID | Type | Case | Result (Q-1) |
|---|---|---|---|
| BLG-01 | A | B0: open `/blog/` | pending F-2: spec written, self-activates (fixme) when the page exists |
| BLG-02 | A | B1: open `/blog/` | pending F-2: spec written, self-activates (fixme) when the page exists |
| BLG-03 | A | B1: `qa-draft` and `qa-future` | pending F-2: spec written, self-activates (fixme) when the page exists |
| BLG-04 | A | B2: drafts build | pending F-2: spec written, self-activates (fixme) when the page exists |
| BLG-05 | A | Open a post | pending F-2: spec written, self-activates (fixme) when the page exists |
| BLG-06 | A+M | Post with every element from `prose.md` (hello-world fixture) | pending F-2: spec written, self-activates (fixme) when the page exists; manual half blocked: needs owner/device |
| BLG-07 | A | Edge fixture: long title, 100-char unbroken string, wide table, long code line, `<script>` | pending F-2: spec written, self-activates (fixme) when the page exists |
| BLG-08 | A | Metadata | pending F-2: spec written, self-activates (fixme) when the page exists |
| BLG-09 | A | Unknown slug `/blog/nope/` | pass (provisional, local server) |
| BLG-10 | A | First/last post navigation | pending F-2: spec written, self-activates (fixme) when the page exists |
| BLG-11 | A | Date display | pending F-2: spec written, self-activates (fixme) when the page exists |
| BLG-12 | A | Cover image | pending F-2: spec written, self-activates (fixme) when the page exists |
| BLG-13 | A | Local images in body | pending F-2: spec written, self-activates (fixme) when the page exists |
| BLG-14 | A | Console | pending F-2: spec written, self-activates (fixme) when the page exists |
| BLG-15 | M | Print preview of a post | blocked: needs owner/device |
| SEO-01 | A | `/blog/feed.xml` (B1) | pending F-4: spec written, self-activates (fixme) when the page exists |
| SEO-02 | A | `<link rel="alternate" type="application/rss+xml">` on `/blog/` | pending F-4: spec written, self-activates (fixme) when the page exists |
| SEO-03 | A | `sitemap.xml` (B1) | pending F-4: spec written, self-activates (fixme) when the page exists |
| SEO-04 | A | `robots.txt` | pending F-4/I-2: spec written, self-activates (fixme) when the page exists |
| SEO-05 | A | `/admin/` | pending I-2: spec written, self-activates (fixme) when the page exists |
| SEO-06 | M | Share preview of a post and of `/contact/` (LinkedIn Post Inspector / opengraph.xyz) after | blocked: needs owner/device |
| CON-01 | A | Load `/contact/` | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-02 | A | Submit empty | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-03 | A | Invalid email forms (`a`, `a@b`, `a b@c.d`, 300-char) | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-04 | A | Message too short (9) / boundary 10 / boundary 5000 / 5001 | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-05 | A | Valid submit, provider stub returns success | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-06 | A | Double click Submit | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-07 | A | Provider 429 / quota body | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-08 | A | Provider 400 validation / 500 / malformed JSON / network abort / 20-s hang (fake timers) | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-09 | A | Offline (Playwright `context.setOffline`) | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-10 | A | Honeypot filled via script | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-11 | A | Submit < 3000 ms after load (script-fast) | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-12 | A | CR/LF and header-injection payloads in name/subject (`x\r\nBcc: a@b.c`) | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-13 | A | HTML/script payloads in all fields | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-14 | A | B4 (no config) | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-15 | A | "Send another" | pending F-3: spec written, self-activates (fixme) when the page exists |
| CON-16 | A+M | Keyboard-only run through every state; focus order logical; no trap | pending F-3: spec written, self-activates (fixme) when the page exists; manual half blocked: needs owner/device |
| CON-17 | M | Screen reader (VO/NVDA): labels, required, errors announced, success announced once | blocked: needs owner/device |
| CON-18 | M | iOS Safari + Android Chrome: no zoom-on-focus, correct keyboards, autofill fills name/emai | blocked: needs owner/device |
| CON-19 | M | JavaScript disabled | blocked: needs owner/device |
| CON-20 | M | **Live send (production, max 3 per run — uses free quota):** from the production site | blocked: needs owner/device |
| CON-21 | M | Provider dashboard check | blocked: needs owner/device |
| CON-22 | A | Privacy copy | pending F-3: spec written, self-activates (fixme) when the page exists |
| CMS-01 | M | Open `/admin/` | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| CMS-02 | M | Sign in with a fine-grained PAT scoped only to the repo (contents RW) | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| CMS-03 | M | New post → fill all fields → Save with Draft ON | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| CMS-04 | M | Toggle Draft OFF → Save | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| CMS-05 | M | Edit title and body | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| CMS-06 | M | Upload an image (small, and a 3 MB one) | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| CMS-07 | M | Cover without alt | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| CMS-08 | M | Duplicate slug / empty summary / 91-char title / bad tag `Foo Bar` | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| CMS-09 | M | Schedule: `date` +1 day with Draft OFF | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| CMS-10 | M | Unpublish (Draft ON) | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| CMS-11 | M | Delete post | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| CMS-12 | M | Markdown with raw HTML (`<script>`, `<iframe>`) saved from the editor | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| CMS-13 | M | Runbook dry run: a person who has not seen the system follows `docs/runbooks/editing-posts | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| CMS-14 | M | Token expired/revoked mid-session | blocked: needs I-2 (CMS) and owner (PAT, fork); not run |
| NAV-01 | A | Nav items at 320/375/768/1024/1280 both grounds | pending F-4: spec written, self-activates (fixme) when the page exists |
| NAV-02 | A | `aria-current="page"` | pending F-4: spec written, self-activates (fixme) when the page exists |
| NAV-03 | A | Footer link to `/contact/` and mailto both work | pending F-4: spec written, self-activates (fixme) when the page exists |
| NAV-04 | A | 404 page lists the new destinations | pending F-4: spec written, self-activates (fixme) when the page exists |
| NAV-05 | A | Skip link | pass on / and /blog/ (chromium, firefox, emulated devices; webkit desktop skipped: macOS Tab setting) |
| NAV-06 | A | Theme toggle on new pages | pass (no-preference motion); fail under reduced motion on / → BUG-003 |
| NAV-07 | A | Client-side navigation Home → Blog → Post → Contact → back | pending F-4: spec written, self-activates (fixme) when the page exists |
| REG-01 | A | `/` | pass without reduced motion; **fail** under reduced motion → BUG-003 |
| REG-02 | A | `/experience/`, `/publications/`, `/projects/`, `/teaching/` | pass (text/title/description vs baseline; visual diff pending Q-4) |
| REG-03 | A | `/gallery/` | pass |
| REG-04 | A | 404 | pass (404 status provisional, 04 §10) |
| REG-05 | A | Assets | pass (hashes + link/asset crawl) |
| REG-06 | A | Fonts, grain, studio portrait feathering | pending Q-4: spec written, self-activates (fixme) when the page exists |
| REG-07 | A | Build output | baseline recorded (docs/qa/baseline.md §2–3); comparison pending F-4 |
| REG-08 | A | `sitemap.xml` / `robots.txt` | pass (sitemap baseline URLs present; robots diff pending F-4) |
| REG-09 | A | Old Jekyll URLs (`/publication/…`, `/Experiences/`, `/talks/`) | pass (provisional, local server) |
| REG-10 | A | `_legacy-jekyll/_posts` removal | pending Q-4: spec written, self-activates (fixme) when the page exists |
| SEC-01 | A | `scan-out.mjs` on every build: grep `out/` for token shapes (`ghp_`, `github_pat_`, `secre | pass (0 findings on baseline, B0, B1, B1X, B2, B4) |
| SEC-02 | A | `git log -p --all` pattern scan (or `gitleaks` if available) on the integration branch dif | pass (0 findings, origin/master..42ddff7) |
| SEC-03 | A | `pnpm audit --prod` | **fail** → BUG-004 |
| SEC-04 | A | `<script>` inventory across all pages (B1) | pass (existing pages + placeholder /blog/) |
| SEC-05 | A | `/admin/` script | pending I-2: spec written, self-activates (fixme) when the page exists |
| SEC-06 | A | External links | pass (existing pages) |
| SEC-07 | A | Post body sanitisation | pending F-2: spec written, self-activates (fixme) when the page exists |
| SEC-08 | M | PAT handling | blocked: needs owner/device |
| SEC-09 | M | Headers | blocked: needs owner/device |
| SEC-10 | M | Contact abuse | blocked: needs owner/device |
| SEC-11 | M | Privacy | blocked: needs owner/device |
| SEC-12 | M | Image EXIF | blocked: needs owner/device |
| A11Y-01 | A | axe-core on `/blog/` (empty and populated), a post (ink & studio), `/contact/` (idle, erro | existing pages: **fail** (pre-existing) → BUG-001, BUG-002; new pages pending F-2/F-3/I-2 |
| A11Y-02 | A+M | Contrast: every text/background and control-border pair on the new pages in both grounds | existing pages: **fail** → BUG-001; new pages pending |
| A11Y-03 | M | Keyboard: tab order, visible focus on grain overlay, no traps, skip link, nav | blocked: needs owner/device |
| A11Y-04 | M | Screen reader pass on blog index, a post (heading navigation, code, table, image alt), con | blocked: needs owner/device |
| A11Y-05 | M | 200% text and 400% zoom; WCAG 1.4.12 text-spacing bookmarklet | blocked: needs owner/device |
| A11Y-06 | M | `prefers-reduced-motion: reduce` | blocked: needs owner/device |
| A11Y-07 | M | Windows forced-colors | blocked: needs owner/device |
| A11Y-08 | A | Heading outline | pass on existing pages |
| PERF-01 | A | Lighthouse mobile (default throttling) on `/blog/`, a post, `/contact/` | pending F-2/F-3: spec written, self-activates (fixme) when the page exists |
| PERF-02 | A | Lighthouse desktop, same pages | pending F-2/F-3: spec written, self-activates (fixme) when the page exists |
| PERF-03 | A | Existing pages: Lighthouse vs baseline (median of 3 runs) | baseline recorded (docs/qa/baseline.md §1); comparison pending F-4 |
| PERF-04 | A | First Load JS per route vs baseline | baseline recorded; comparison pending F-2/F-3 |
| PERF-05 | A | Post weight: no image > 500 KB in `public/images/blog/` (fixture check script) | pending F-2: spec written, self-activates (fixme) when the page exists |
| PERF-06 | M | Real-device load on throttled 4G for a post with a cover image | blocked: needs owner/device |
