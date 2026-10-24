# Portfolio design review

**Status:** A approved and implemented with light/dark appearances. See [version 1](implementation/README.md) and the live local preview at http://127.0.0.1:4190/. The original proposal pictures below remain the historical design exploration.

Start with `index.html` for the full review gallery or `comparison.html` for the three directions. `images/comparison.png` is the shareable comparison picture. Every concept includes desktop/mobile full-page PNGs for Home, Experience, Publications, Projects, Teaching, Blog, Article template, Contact, Gallery, 404, Editor entry, and an interaction-state sheet.

- A — **Clarity**: light, spacious, research-first. Recommended.
- B — **Focus**: dark, cinematic, engineering-focused.
- C — **Studio**: warm, portrait-led, desktop navigation rail.

Read `AUDIT.md` for the complete site/content review, design rationale, proposed behavior, and implementation plan. Read `RESEARCH.md` for Apple sources and evaluated design tools/skills. `verification.json` records render checks. `baseline/` contains current-site captures from the local development server (including draft fixtures where development exposes them).

## Open locally

Open `index.html` in a browser, or from the repository root:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory docs/apple-design-review
```

Then visit http://127.0.0.1:4173/. All mockups use embedded local imagery. Internal page links work; CV/RSS links point to the existing public site. External links are not evidence of a live form or preview deployment. Form buttons are intentionally inert.

## Rebuild the pictures

Use the project’s existing dependencies. From the repository root:

```sh
node docs/apple-design-review/scripts/generate.mjs
node docs/apple-design-review/scripts/gallery.mjs
# In another terminal, start the current-site server for baseline captures:
pnpm dev --hostname 127.0.0.1
# Then:
node docs/apple-design-review/scripts/capture.mjs
node docs/apple-design-review/scripts/compare.mjs
```

Requires the installed Playwright Chromium runtime. The generator reads current `lib/content.ts`, portrait, and sample-post cover; after content edits the exports will reflect that new content. No new package dependencies were added.

## Approval

A was selected. Version 1 preserves source content, adds light/dark modes, linked campus photographs, illustrative project imagery and motion demos. The next feedback decision is which animation treatment to retain.

Base: `origin/master` at `37a59c6`. Branch: `codex/apple-design-review`. The review commit contains proposals; the following implementation commit contains the approved A version. No merge or live deployment has been performed.
