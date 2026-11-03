---
name: website-release-qa
description: Independently check the sidwat.github.io website's content release immediately before shipping, using basic functional tests and a concise evidence-based report; use after content/media edits and before deployment.
---

# Website release QA reviewer

Resolve repository paths from the sidwat.github.io project root, not from this skill folder.

Be an independent QA agent for the release candidate, not the author of its content. Inspect and report first; let the primary agent implement fixes. This is a basic release gate, not a claim of exhaustive security, accessibility, device, or editorial validation.

## Candidate and execution

Read `AGENTS.md`, `docs/content/WORKFLOW.md`, the content-review report when available, and the actual diff. Record the commit and whether the checkout is dirty; a Git SHA alone does not describe uncommitted edits. Confirm the active visual preset. If a release artifact already exists, verify its provenance rather than silently testing an unrelated old `out/` directory.

Run `pnpm qa:release` to lint, type-check, build a fresh static export and test it. Reports live in `node_modules/.cache/release-qa/`. For an artifact built in this same run, `pnpm qa:smoke` tests it without rebuilding. CI uses the full command before uploading the same `out/` to Pages. Do not substitute a development server for release checks. A passing report is stale after a source/content/media change; rebuild and rerun for the final candidate.

The browser gate checks public routes, internal links/assets, readable headings, mobile overflow, appearance/navigation, key accessibility issues, CV and contact behavior. Contact submissions must be intercepted; do not send real email. Simulated acceptance does not establish inbox delivery. A missing-config email fallback is distinct from a successful provider test. External links, real mobile devices, media quality, captions and factual correctness may need manual review; record what was actually checked.

## Visual and content pass

Inspect the changed pages at desktop and phone widths in light and dark appearance. Check title wrapping, clipping, links, caption/alt accuracy, loaded images, video posters/controls, and consistency with the approved draft. For meaningful visual changes, save screenshots and inspect them. Check Reduced Motion if animation/media changed. Use additional existing tests only where the change warrants them.

When delegated as the QA agent, return a report containing:

- Candidate SHA/dirty state, theme, command, environment and report paths.
- PASS/FAIL/SKIPPED/NOT CHECKED per area; never treat a skipped check as a pass.
- Each defect: severity, route, reproduction, expected versus actual behavior, and evidence.
- **PASS**, **PASS WITH NOTES**, or **BLOCKED**, plus a short correction list.

BLOCKED means a required check failed or a material functional defect remains. PASS WITH NOTES is for explicitly nonblocking limits, not a way to waive broken navigation, lost content, failed forms, missing assets, or unusable layout. If a tool/browser cannot run, state the limitation; do not fabricate a pass. The primary agent fixes defects and reruns affected checks, then the full basic gate for the final artifact. Do not deploy or message anyone solely because this skill was invoked; follow the user's existing release authorization.
