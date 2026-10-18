# QA report: blog + contact (running bug log)

Owner: QA Engineer. One entry per defect, newest last, stable IDs. Severity: **S1** data loss/security/site broken/blocks publishing; **S2** feature broken or WCAG AA failure on a main path; **S3** cosmetic/edge; **S4** suggestion. Every S1/S2 also has a Request row in [`STATUS.md`](STATUS.md). Plan: [`04-qa-plan.md`](04-qa-plan.md). Baseline: [`qa/baseline.md`](qa/baseline.md). Case log: [`qa/test-log.md`](qa/test-log.md).

## Summary: 2026-10-17 (Q-1: harness + baseline)

| | |
|---|---|
| Commits tested | Baseline **`eab9889`** (`origin/master`, the live site's source). Harness run against **`42ddff7`** (`integration/blog-contact` = `feat/qa` base, which has F-1 and F-5 but not yet F-2/F-3/F-4/I-2) |
| Builds run | Baseline `pnpm build`. Integration: B0, B1, B1X, B2 and B4 built and pass. All six B3 cases are **pending**: no route reads `lib/blog` until F-2, so invalid content cannot fail the build yet. `scan-out` found 0 issues on every export and on the git diff |
| Automated results | B0, all six Playwright projects (chromium, firefox, webkit, iPhone 13, Pixel 7 and iPad, all emulated): **402 passed, 0 failed, 420 skipped/fixme**. The passes include 3 cases per project that are expected to fail and track BUG-003. B1, B1X, B2 and B4 on chromium and webkit: 134 passed, 0 failed, 140 skipped each. Skips are cases whose page does not exist yet (F-2, F-3, F-4, I-2) or that belong to another build |
| Manual results | None run. Every [M] case is `blocked: needs owner/device` (see test-log) |
| Server-dependent results | 404 status, feed content type and trailing-slash redirects come from `tests/scripts/serve-out.mjs` and are **provisional** until the post-deploy smoke test (04 §10) |
| Defects | 5 open: S2 ×4 (BUG-001…004, all **pre-existing on `origin/master`**), S4 ×1 (BUG-005) |
| Sign-off vs 04 §7 | **Not met; sign-off not started** (Q-1 only). §7.1 [A] cases: most are pending the feature tasks. §7.2 [M]: none run. §7.3: 4 open S2. §7.4: the baseline already misses the a11y targets on existing pages. §7.5: SEC-03 fails (BUG-004). §7.6: baseline captured, comparison pending. §7.7 and §7.8: not started |

---

### BUG-001 · S2 · A11Y-02 / A11Y-01 · existing pages (publications, home)
- Environment: `origin/master` eab9889 and integration 42ddff7 (build B0). Chromium, Firefox and emulated Pixel 7, both grounds for `/publications/`. Lighthouse 12.6.1 mobile and desktop.
- Steps: 1. Build and serve `out/`. 2. Open `/publications/` and run axe (`tests/e2e/a11y.spec.ts`) or Lighthouse. 3. Open `/` with motion allowed (no `prefers-reduced-motion`) and inspect the portrait caption.
- Expected: Body text has a contrast ratio of at least 4.5:1 (WCAG 1.4.3 AA).
- Actual: `/publications/` citation lines (`app/publications/page.tsx:39`, `text-muted/80`, 12px mono) are **3.43:1** (#606578 on #08090e) in ink and also fail in studio. The home figcaption hint " · hover to wave" / " · tap to wave" (`components/Hero.tsx:307`, `text-muted/60`, 11px) is **2.4:1** (#4a4e5e on #08090e). Lighthouse a11y: `/` 92 and `/publications/` 91 on mobile; `/publications/` 96 on desktop. (evidence: docs/qa/baseline.md §1; axe output from `A11Y-01 existing /publications/` and from `/` on pixel-7)
- Owner: Frontend (both files are frozen, so the Tech Lead must approve the change; the Designer picks the token, e.g. full `--muted`)
- Status: open (tracked in the axe allow-list in `a11y.spec.ts`; remove the entry when retesting)

### BUG-002 · S2 · A11Y-01 / NAV-01 · nav
- Environment: `origin/master` eab9889 and integration 42ddff7 (B0). Emulated Pixel 7, iPhone 13 and iPad, and Lighthouse mobile, on every page and both grounds.
- Steps: 1. Serve `out/`. 2. Open any page at a phone viewport. 3. Run axe with WCAG 2.2 AA tags, or Lighthouse mobile.
- Expected: Each nav link has a target of at least 24×24 CSS px, or enough spacing (WCAG 2.5.8 Target Size (Minimum), AA).
- Actual: The nav links (`.eyebrow`, e.g. Experience and Teaching) have a safe clickable diameter of **20.4px** where they wrap at narrow widths. axe reports `target-size` as serious, and Lighthouse fails `target-size` on every page on mobile. (evidence: docs/qa/baseline.md §1; axe on the pixel-7 project)
- Owner: Frontend (F-4 rebuilds the nav to the Designer's 28px/44px-coarse hit heights in `docs/design/contact.md` §8, which should fix it)
- Status: open. The allow-list tolerates it **only while the old nav is built**: once the F-4 nav (with its Contact link) lands, any target-size violation fails CI.

### BUG-003 · S2 · REG-01 / NAV-06 · home, theme
- Environment: `origin/master` eab9889 and integration 42ddff7 (B0). Chromium and Firefox desktop (also seen on all six Playwright projects), `prefers-reduced-motion: reduce`, studio ground.
- Steps: 1. Turn on "reduce motion" in the OS, or emulate it. 2. Open `/` and click the ground toggle (`#E9D5A3`) to switch to studio. 3. Reload `/`.
- Expected: The page reloads in studio with no console errors, as it does without reduced motion and as other pages do.
- Actual: Two uncaught `Minified React error #418` (hydration mismatch, `args[]=HTML`). React then re-renders the root on the client, and `<html data-theme="studio">` is dropped, so the page shows **ink** even though `localStorage.theme === "studio"`. Going on to `/teaching/` shows studio again. Without reduced motion there is no error and the ground persists. Likely cause, not confirmed: `Hero.tsx` renders `{!reduceMotion && <span>…wave</span>}` in the figcaption, and `useReducedMotion()` differs between the server render and the client's first render. (evidence: docs/qa/evidence/BUG-003-probe.txt; `regression.spec.ts` "BUG-003 reduced motion …" and "REG / … (reduce motion)" are marked expected-fail)
- Owner: Frontend (`components/Hero.tsx` is frozen, so this needs Tech Lead approval)
- Status: open

### BUG-004 · S2 · SEC-03 · dependencies
- Environment: `pnpm audit --prod` on `origin/master` eab9889 (9 advisories) and on integration 42ddff7 (10 advisories), 2026-10-17.
- Steps: 1. `pnpm install --frozen-lockfile`. 2. `pnpm audit --prod --audit-level high`.
- Expected: No high or critical advisories (SEC-03; exit criterion §7.5).
- Actual: **1 critical, 3 high**. `next@16.3.3` has the critical [GHSA-vcvr-r3jv-pc5j](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j) (RCE in `next/og` ImageResponse) and the high [GHSA-cjq9-62q9-8jv4](https://github.com/advisories/GHSA-cjq9-62q9-8jv4) (SSRF in image optimisation); both are fixed in ≥ 16.3.8. Two more highs come through `next`: `sharp` [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w) (fixed in ≥ 0.35.5) and `source-map-js` [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) (fixed in ≥ 1.2.2). There are also 5 moderate (4 `next`, plus `sprintf-js` through `gray-matter`, which is new on the integration branch) and 1 low. **Exposure is low**: the site is a static export with no Next server at runtime and does not use `next/og` (`opengraph-image.png` is a static file), so these are build-time and dev-server risks. The SEC-03 gate still fails. (evidence: `pnpm audit --prod` output; `qa.yml` job `audit`)
- Owner: Frontend (single owner of `package.json`; bump `next` and `eslint-config-next` to ≥ 16.3.8, which the F-1 pre-approved list may need a Request for)
- Status: open (the `audit` job in `qa.yml` reports red without blocking the other jobs)

### BUG-005 · S4 · REG-07 / PERF-04 · build tooling, spec
- Environment: `next build` 16.3.3 (Turbopack), baseline and integration.
- Steps: 1. `pnpm build`. 2. Look for the "First Load JS" column.
- Expected: 02 AC-19 says "Report numbers from the build output in the PR".
- Actual: Next 16 prints only the route list and no sizes, so AC-19 cannot be met as written. QA measures with `node tests/scripts/route-js.mjs out` (unique `<script src>` chunks per exported page, raw and gzip), and the baseline uses the same method.
- Owner: Tech Lead (amend 02 AC-19 to point at `route-js.mjs`); Frontend (use it in the F-2/F-3 PRs)
- Status: open
