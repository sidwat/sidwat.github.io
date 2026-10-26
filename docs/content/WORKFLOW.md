# Content review and release workflow

This process is for new content the owner supplies. It does not rewrite the current website in advance or change its active theme. The aim is to make a strong, credible portfolio for professors and technical recruiters, then check the resulting site before shipping.

## 1. Prepare the material

Use [the intake template](intake-template.md) if convenient; ordinary notes or a draft are also fine. Include the intended audience, personal contribution, evidence for important claims, and images/videos you want used. If material is incomplete, the reviewer should improve the supported parts and identify only the missing facts that matter.

## 2. Editorial review

Invoke `$website-content-review` (canonical file: `.agents/skills/website-content-review/SKILL.md`). It is available through this repository's skills and registered in the local Codex skills directory. The skill simulates professor and recruiter perspectives; it does not claim to represent a real institution or employer.

It checks technical depth, attribution, interpretable impact, evidence, reading order and the value of proposed media. Its report goes in `docs/content/reviews/<date>-<scope>.md`, with **READY**, **REVISE**, or **NEEDS FACTS**. It must distinguish measured results from estimates and reject unsupported hype. READY means the content is ready for QA, not that it has been deployed.

## 3. Apply the content and media

After the owner requests implementation, update the typed content and affected page layouts together. Use a summary for the homepage and deeper project narratives on individual pages. Prefer explanatory figures/demos over decorative stock images. Include source/attribution, captions, alt text, a poster and controls for useful video, and transcripts/captions where audio carries information. Keep factual uncertainty visible in the working report instead of inventing filler.

Preserve Web/Galactic presets, contact behavior, navigation, existing URLs and public metadata unless the change explicitly calls for adjusting them. Record changed pages/media in the handoff. Update old text-based tests to match the approved new content rather than silently disabling coverage.

## 4. Independent basic QA

When the candidate is about to ship, delegate a separate QA reviewer using `$website-release-qa` (`.agents/skills/website-release-qa/SKILL.md`). The reviewer checks the actual diff and editorial report, runs the basic gate, visually inspects changed pages, and returns a defect report. The primary agent fixes findings. If delegation is unavailable, disclose that the review was not independent.

Run:

```sh
pnpm qa:release
```

This runs lint, TypeScript, a fresh production static export and the Chromium release-smoke suite. It owns its test server on port 4193 by default (`QA_PORT` can override it), never reuses an unrelated preview, and does not send real form submissions. Reports, logs and browser artifacts are in:

```text
node_modules/.cache/release-qa/report.md
node_modules/.cache/release-qa/report.json
node_modules/.cache/release-qa/browser/
```

`pnpm qa:smoke` can retest the same export without rebuilding. Source and artifact digests must match its build manifest; otherwise it refuses a stale candidate. A source/content/media change after QA requires a fresh full gate. Reports identify the SHA and dirty state rather than implying that a dirty checkout is represented solely by its SHA.

The smoke suite covers public navigation/project/sitemap routes, headings and overflow at phone/desktop widths in both appearances, internal destinations, local media and CV, mobile navigation/theme switching, contact validation/retry/simulated success, and serious/critical accessibility findings on key pages. The email fallback is checked when the provider is unconfigured, with submission checks marked skipped. It does not establish actual inbox delivery, external link availability, video quality, editorial truth, complete accessibility compliance, or physical-device behavior. The QA agent lists those limits and inspects changed images/video manually. Existing broader Playwright suites remain available for deeper changes.

The QA report decision is **PASS**, **PASS WITH NOTES**, or **BLOCKED**. Do not relabel a required failure as a note. For each defect, record the route, expected/actual behavior, reproduction, severity and evidence. Fix and retest the final candidate, not just the earlier draft.

## 5. Ship the exact tested export

- Pull requests to `master` run `.github/workflows/content-qa.yml`, a small automatic gate in addition to the existing deeper QA workflow.
- The Pages deployment workflow runs `pnpm qa:release` before uploading `out/`. A failed gate prevents upload and therefore prevents deployment. QA reports are uploaded even on failure and summarized in the Actions run.
- Editorial/visual review remains an agent/owner responsibility; a CI pass cannot approve factual claims or judge the quality of a demonstration.
- Publish only within the owner's release authorization. This setup does not merge the design branch or deploy it. Repository branch-protection rules are not changed here; making the PR check required is an optional repository setting.
- After an authorized deployment, do a brief live-page check. Actual provider inbox delivery is a separate owner-authorized test, not a simulated-QA claim.

## Practical improvements

Keep one claim/evidence ledger in each review, rather than scattering unanswered facts across messages. Give every selected project a clear individual role and one useful proof link or demonstration. Pick one primary audience for the homepage while letting project pages support deeper evaluation. Keep new media out of the release until it has a clear purpose and usable mobile presentation.
