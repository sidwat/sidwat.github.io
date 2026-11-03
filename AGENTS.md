<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Website content release workflow

- For supplied website drafts or an editorial review, use `.agents/skills/website-content-review/SKILL.md`. Review through professor and recruiter lenses; do not invent claims or rewrite current content before receiving the user's new material.
- When content/media changes are approaching release, delegate an independent QA reviewer using `.agents/skills/website-release-qa/SKILL.md` when collaboration is available. The user requested this QA role. Have it report defects and evidence first; the primary agent makes fixes. If delegation is unavailable, run the same checks and disclose that review was not independent.
- `pnpm qa:release` is the basic functional gate. Its report is in `node_modules/.cache/release-qa/report.md`. Fix required failures, then rerun on the final export. CI runs this command before uploading the exact tested `out/` for deployment.
- Editorial READY and QA PASS are separate decisions. Neither alone expands authorization to publish. See `docs/content/WORKFLOW.md` for intake, handoff, media and release reporting.
