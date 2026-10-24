# Clarity — version 1

Implemented October 24, 2026 on `codex/apple-design-review`, following approval of A and the requested light/dark appearances.

## Review

- Live local preview: http://127.0.0.1:4190/
- Interactive animation choices: http://127.0.0.1:4190/motion-studies/
- Header appearance button switches light/dark; initial appearance follows the system unless a saved choice exists. Former ink/studio preferences migrate.
- The existing name, biography, research text, page titles/intros, dates, roles, paper/patent descriptions, project bullets, teaching descriptions, CV and blog content remain intact. Existing content exports supply the newly visible interests, biography, education and honors sections. No mockup slogan or invented achievement was added.
- Project cards contain credited illustrative images of image detail/compression, explicitly labeled as illustrations rather than project outputs. Actual project figures can replace these later. Campus photographs link to the institutions already specified in the content data. Credits are at `/image-credits/`.
- Three motion options are available: pointer web, soft spotlight, and rotating particles gathering into SW. The hero has a quiet initials study confined to the margins; the earlier mesh remains faint and pointer-responsive. The homepage background can be paused, and the preference persists. Reduced Motion freezes decorative movement. Particle rendering sleeps offscreen, in a hidden document, and for the hidden mobile hero.
- The contact provider, Markdown pipeline, draft filtering, static export, CMS authentication and deployment permissions are preserved. Only the editor's loading/failure-shell colors/type were adapted; the vendor-owned editor was not replaced.

## Verification

- Lint, TypeScript and whitespace checks pass.
- Production export succeeds with `pnpm run build:webpack`, including the zero-post placeholder pruning step. The default Turbopack build is still available as `pnpm build`; this execution environment prevented its worker from binding a local port, so a supported Webpack fallback script was added without changing the default CI build.
- Public production export: 95 Chromium checks passed; 15 fixture/visual-baseline cases skipped as specified by the existing test suite.
- Configured contact build: 21 Chromium checks passed; one unconfigured-only case skipped. Every provider request was intercepted by a local test stub; no messages were delivered.
- WebKit: six focused tests passed, covering both themes across all reviewed routes at 320/768/1440px, system/manual preference and legacy migration, compact navigation, images/anchors, and paused/reduced-motion demos.
- 36 full-page implementation screenshots were exported at 1440px and 390px in both appearances, plus three motion-study stills. `render-checks.json` verifies one H1, no broken images and no horizontal document overflow for these captures.
- The current public export includes no published posts, since the source's two existing posts remain drafts. The article renderer was preserved; the prior design review contains its template mockup.
- Existing test-harness issues were corrected: the generic cross-origin guard now allows the specific stub route to handle stub traffic; the hidden honeypot is checked for viewport/AT exclusion rather than CSS visibility; the Message textbox is distinguished from the failure group's label; and offline tests explicitly abort the stub. No form behavior was altered to satisfy these tests.

These checks are not a claim of exhaustive accessibility certification or a live deployment. The source content files are unchanged. The branch has not been merged into `master`.

## Reproduce

From the repository root:

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm run build:webpack
node tests/scripts/serve-out.mjs out 4190
# In another terminal:
node docs/apple-design-review/scripts/capture-implementation.mjs
```

For normal builds outside this local restriction, `pnpm build` remains the documented default. Existing Playwright configuration uses `QA_PORT`, `QA_OUT_DIR` and `QA_ARTIFACTS` to isolate test exports. Configured contact tests require the stub endpoint from `tests/e2e/helpers.ts`, never a real provider.
