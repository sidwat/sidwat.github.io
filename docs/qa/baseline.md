# QA baseline: `origin/master` (Q-1)

Captured **2026-10-17** by the QA agent, before any feature branch merged into `master`.

| | |
|---|---|
| Commit | **`eab9889e995f337022634ab0ab2c62a8f8ea9c06`** (`origin/master`, "Merge remote-tracking branch 'origin/master' into HEAD", committed 2026-09-30). This is the source of the live site |
| How | `git worktree add --detach <tmp outside the repo> origin/master` → `pnpm install --frozen-lockfile` → `pnpm build` → served `out/` with `tests/scripts/serve-out.mjs`. The temporary worktree was removed afterwards |
| Toolchain | Next.js 16.3.3 (Turbopack), pnpm 11.25.0, Node 26.5.0 locally (CI and deploy use Node 22: sizes and scores may differ slightly) |
| Lighthouse | 12.6.1 through `@lhci/cli` 0.15.1, HeadlessChrome 155, `staticDistDir` server, 3 runs per URL, **median run** reported. Mobile = Lighthouse default (simulated Moto G Power, slow 4G); desktop = `preset: desktop` |
| Machine-readable copies | `tests/fixtures/baseline/` (`pages.json`, `assets.json`, `sitemap.txt`, `robots.txt`, `route-js.json`), used by `tests/e2e/regression.spec.ts` and `seo.spec.ts` |

Local results are on a developer laptop, not CI hardware. The release gate (PERF-03) compares a local median-of-3 run on the same machine against these numbers.

## 1. Lighthouse scores

### Mobile (median of 3)

| URL | Perf | A11y | Best pr. | SEO | LCP ms | CLS | TBT ms | Non-performance audits below 1 |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `/` | 92 | 92 | 100 | 100 | 3384 | 0 | 4 | color-contrast, target-size |
| `/experience/` | 98 | 96 | 100 | 100 | 2464 | 0 | 4 | target-size |
| `/publications/` | 98 | 91 | 100 | 100 | 2461 | 0 | 3 | color-contrast, target-size |
| `/projects/` | 98 | 96 | 100 | 100 | 2460 | 0 | 3 | target-size |
| `/teaching/` | 98 | 96 | 100 | 100 | 2462 | 0 | 4 | target-size |
| `/gallery/` | 98 | 96 | 100 | 100 | 2458 | 0 | 3 | target-size |
| `/blog/` (placeholder "Coming soon.") | 98 | 96 | 100 | 100 | 2461 | 0 | 4 | target-size |

### Desktop (median of 3)

| URL | Perf | A11y | Best pr. | SEO | LCP ms | CLS | TBT ms | Non-performance audits below 1 |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `/` | 100 | 100 | 100 | 100 | 711 | 0 | 0 | none |
| `/experience/` | 100 | 100 | 100 | 100 | 523 | 0 | 0 | none |
| `/publications/` | 100 | 96 | 100 | 100 | 522 | 0 | 0 | color-contrast |
| `/projects/` | 100 | 100 | 100 | 100 | 525 | 0 | 0 | none |
| `/teaching/` | 100 | 100 | 100 | 100 | 524 | 0 | 0 | none |
| `/gallery/` | 100 | 100 | 100 | 100 | 524 | 0 | 0 | none |
| `/blog/` | 100 | 100 | 100 | 100 | 522 | 0 | 0 | none |

The baseline already misses the 04 §5.8 targets on existing pages: mobile accessibility is 91–96, not 100, and mobile LCP on `/` is 3.4 s, over 2.5 s. These are pre-existing, not regressions. The accessibility misses are filed as BUG-001 (contrast) and BUG-002 (target size) in [`../qa-report.md`](../qa-report.md). PERF-03 judges existing pages against this table: no category may drop by more than 3 points.

## 2. First Load JS per route

Next 16 (Turbopack) no longer prints a "First Load JS" column in `next build`. These numbers come from `node tests/scripts/route-js.mjs out`: it adds up the unique same-origin `<script src>` chunks each exported HTML page loads. Raw bytes, and gzip -9 as an approximation of transfer size.

| Route | Chunks | First Load JS raw KB | gzip KB | Inline scripts | HTML KB |
|---|---:|---:|---:|---:|---:|
| `/` | 9 | 707.8 | 221.3 | 10 | 26.9 |
| `/experience/` | 8 | 567.7 | 175.2 | 14 | 31.8 |
| `/publications/` | 8 | 567.7 | 175.2 | 12 | 29.6 |
| `/projects/` | 8 | 567.7 | 175.2 | 17 | 37.5 |
| `/teaching/` | 8 | 567.7 | 175.2 | 10 | 23.9 |
| `/gallery/` | 8 | 567.7 | 175.2 | 8 | 19.3 |
| `/blog/` | 8 | 567.7 | 175.2 | 8 | 19.3 |
| `/404.html`, `/404/`, `/_not-found/` | 8 | 567.7 | 175.2 | 10 | 22.9 |

Budget reference (02 AC-19): `/blog/` and `/blog/<slug>/` may add **≤ 2 KB** over the smallest content page (`/teaching/`: 567.7 KB raw / 175.2 KB gzip); `/contact/` may add **≤ 15 KB**. The "inline scripts" column counts the RSC payload pushes (`self.__next_f`) plus the theme script.

## 3. `out/` size

| Metric | Value |
|---|---|
| Files | 78 |
| Total | 2,715.7 KB (3.1 MB on disk) |
| HTML pages | 10 (7 routes + 3 not-found variants) |
| JS chunks | 12 files, 708.2 KB |
| Largest assets | `media/hero-wave.mp4` 433 KB, `cv.pdf` 193 KB, `media/portrait.jpg` 45 KB |

## 4. Sitemap and robots

`/sitemap.xml` has 6 URLs, all with a trailing slash. `<lastmod>` is the build time, so it differs on every build and is ignored in comparisons:

```
https://sidwat.github.io/
https://sidwat.github.io/experience/
https://sidwat.github.io/publications/
https://sidwat.github.io/projects/
https://sidwat.github.io/teaching/
https://sidwat.github.io/blog/
```

`/gallery/` is **not** in the sitemap, and not in the nav (REG-03).

`/robots.txt`:

```
User-Agent: *
Allow: /

Sitemap: https://sidwat.github.io/sitemap.xml
```

## 5. Pages, nav and assets

| Page | Status | `<title>` | h1 count |
|---|---:|---|---:|
| `/` | 200 | Sidhartha Watsa — Research Engineer | 1 |
| `/experience/` | 200 | Experience — Sidhartha Watsa | 1 |
| `/publications/` | 200 | Publications — Sidhartha Watsa | 1 |
| `/projects/` | 200 | Projects — Sidhartha Watsa | 1 |
| `/teaching/` | 200 | Teaching — Sidhartha Watsa | 1 |
| `/gallery/` | 200 | Gallery — Sidhartha Watsa | 1 |
| `/blog/` | 200 | Blogs — Sidhartha Watsa | 1 |
| `/404.html` | 200 (file) / 404 for unknown URLs | Not found — Sidhartha Watsa | 1 |

- Nav labels (`nav[aria-label="Sections"]`): Experience, Publications, Projects, Teaching, **Blogs**. The Tech Lead has ruled that F-4 renames this to `Blog` and adds `Contact`; both are intended diffs.
- No page has `<link rel="canonical">`. That is accepted for existing pages; BLG-05 requires one on posts.
- No third-party scripts on any page. Every `<script src>` is same-origin `/_next/static/`.
- The layout wraps pages in `<div id="main">`, not `<main>` (Designer R-4; the Tech Lead has approved changing it).
- Asset hashes, used by REG-05:

| Asset | Bytes | sha256 (first 16) |
|---|---:|---|
| `/cv.pdf` | 197,176 | `8b0506ee2a085f7f` |
| `/media/portrait.jpg` | 46,249 | `edd4ebf7d0e70976` |
| `/media/hero-wave.mp4` | 443,224 | `5005cf658a0ef45e` |
| `/media/hero-wave.webm`, `/icon.png`, `/opengraph-image.png` | see `tests/fixtures/baseline/assets.json` | |

## 6. Screenshots index

Chromium with `prefers-reduced-motion: reduce` (animated text in its final state), full page, JPEG, device scale 1. Files are in [`baseline/`](baseline/).

| File | Page | Width | Ground | KB |
|---|---|---:|---|---:|
| [home-1280-ink.jpg](baseline/home-1280-ink.jpg) | `/` | 1280 | ink | 77 |
| [home-1280-studio.jpg](baseline/home-1280-studio.jpg) | `/` | 1280 | studio | 77 |
| [home-375-ink.jpg](baseline/home-375-ink.jpg) | `/` | 375 | ink | 49 |
| [experience-1280-ink.jpg](baseline/experience-1280-ink.jpg) | `/experience/` | 1280 | ink | 112 |
| [publications-1280-ink.jpg](baseline/publications-1280-ink.jpg) | `/publications/` | 1280 | ink | 154 |
| [publications-1280-studio.jpg](baseline/publications-1280-studio.jpg) | `/publications/` | 1280 | studio | 160 |
| [projects-1280-ink.jpg](baseline/projects-1280-ink.jpg) | `/projects/` | 1280 | ink | 161 |
| [projects-375-studio.jpg](baseline/projects-375-studio.jpg) | `/projects/` | 375 | studio | 142 |
| [teaching-1280-ink.jpg](baseline/teaching-1280-ink.jpg) | `/teaching/` | 1280 | ink | 57 |
| [teaching-375-ink.jpg](baseline/teaching-375-ink.jpg) | `/teaching/` | 375 | ink | 43 |
| [blog-1280-ink.jpg](baseline/blog-1280-ink.jpg) | `/blog/` (placeholder) | 1280 | ink | 26 |
| [404-1280-ink.jpg](baseline/404-1280-ink.jpg) | `/404.html` | 1280 | ink | 42 |

These are for people to compare by eye. Automated pixel diffs (REG-02, `maxDiffPixelRatio 0.002`) need PNG snapshots rendered on the CI image; they are generated in Q-4 once the new nav is final.

## 7. Other baseline facts

- **SEC-01** `scan-out.mjs` on the baseline `out/`: 0 findings.
- **SEC-03** `pnpm audit --prod` on the baseline: 9 advisories (1 critical, 3 high, 4 moderate, 1 low), all in `next@16.3.3` and its dependencies `sharp` and `source-map-js`. The integration branch adds 1 moderate (`sprintf-js` through `gray-matter`). Filed as BUG-004.
- **Hydration**: with `prefers-reduced-motion: reduce`, `/` throws React error #418 twice, and a stored studio ground is lost on reload (Chromium and Firefox, baseline and integration alike). Filed as BUG-003.

---

## Running the harness (docs/qa README)

Run everything from the repo root. Nothing below writes tracked files: fixtures are created and deleted by the scripts, and artifacts go to `node_modules/.cache/qa/` (git-ignored) unless `QA_ARTIFACTS` is set.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium firefox webkit     # once

# One command: plain production build, then all six browser projects. A plain build has
# no contact config, so it is a B4 build as far as the contact cases are concerned.
pnpm build && QA_BUILD=B4 pnpm test:e2e                  # serves ./out on :4173

# The full build matrix (B0 B1 B1X B2 B3 B4): keeps each export, runs scan-out on each,
# checks that every B3 invalid fixture fails the build with file + field in the message
node tests/scripts/build-matrix.mjs                      # or a subset: ... B1 B4
QA_BUILD=B1 QA_OUT_DIR=node_modules/.cache/qa/out-B1 pnpm test:e2e

# Individual tools
node tests/scripts/fixtures.mjs list | b1 | b1x | b3 <case> | clean
node tests/scripts/scan-out.mjs out                      # SEC-01
node tests/scripts/scan-out.mjs --git origin/master      # SEC-02
node tests/scripts/route-js.mjs out                      # REG-07 / PERF-04 table
node tests/scripts/serve-out.mjs out 4173                # Pages-like static server
node tests/scripts/capture-baseline.mjs <out-dir>        # re-capture this baseline (rarely)

# Lighthouse (from a scratch directory, so .lighthouseci/ lands outside the repo)
cd "$(mktemp -d)" && pnpm dlx @lhci/cli@0.15.1 autorun \
  --config=<repo>/lighthouserc.json --collect.staticDistDir=<repo>/out
node <repo>/tests/scripts/lhci-summary.mjs .lighthouseci  # median table
```

Specs check the export they are served. A case whose page is not built yet (blog F-2, contact F-3, nav/feed F-4, admin I-2) marks itself **fixme** and starts running once the page exists. Build-specific cases skip on other builds (`QA_BUILD`). Pre-existing defects are tracked in the specs so CI stays green while they are open. `knownBug(...)` marks a case `test.fail`, so it turns red as "expected to fail" once the fix lands. The axe allow-list in `a11y.spec.ts` only records matches as annotations, so remove its entry when retesting a fix.
