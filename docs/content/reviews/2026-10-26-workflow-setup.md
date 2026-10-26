# Content workflow setup — QA handoff

Decision: **PASS WITH NOTES for workflow setup**, independently reviewed by the `content_release_qa` agent. This is not editorial approval of current website copy. No site content or visual preset was changed, and nothing was deployed.

## Delivered

- `website-content-review`: professor/recruiter perspectives, claim/evidence discipline, narrative/media improvements, and READY / REVISE / NEEDS FACTS reports.
- `website-release-qa`: independent defect reporting, exact-candidate checks, visual review and release handoff.
- Both skills validated and registered locally, with canonical version-controlled instructions in `.agents/skills/`.
- `pnpm qa:release`: lint, TypeScript, fresh production export, six basic browser checks, source/artifact digests and Markdown/JSON reports.
- PR smoke workflow and pre-upload Pages gate; reports retained by Actions even when QA fails.

## Independent findings and resolution

The reviewer initially found that same-origin submissions could bypass the provider stub, published posts were missing from the media/link crawl, and base `.env` was absent from build-input hashing. All were corrected and independently rechecked. Browser requests are intercepted at context scope, service workers are blocked, sitemap pages participate in the crawl, images are decoded, HTML fragments are checked, and base `.env` is hashed without exposing values.

The content skill was forward-tested on a deliberately exaggerated sample draft. It returned NEEDS FACTS, rejected unsupported ownership/adoption claims, and distinguished complexity percentages from speedup. This sample was not published or substituted for the owner's draft.

## Final evidence

The final fresh `pnpm qa:release` passed lint, types, production build and all six Chromium checks, with zero failed/skipped/flaky. The report identifies the base SHA plus dirty checkout and exact input/export digests. Automatic reports are under `node_modules/.cache/release-qa/`; the independent source review was returned separately by the QA agent. Generated light/dark screenshots were checked for the unchanged layout.

A deliberate change to `out/` made `pnpm qa:smoke` return BLOCKED with a nonzero exit before browser checks. The probe was removed and the full gate rerun successfully. No real email was sent: contact failure and success were simulated.

## Limits and next handoff

GitHub Actions execution and production deployment have not run for this branch; their ordering/configuration was inspected. This gate does not certify inbox delivery, external sites, real devices, media quality, or the truth of future content. Those are explicit review items, not implied passes.

Next: the owner supplies drafts/notes and useful media; run editorial review, implement the supported improvements, delegate independent QA, fix findings and rerun the final basic gate before an authorized release.
