# Development

Personal site for [sidwat.github.io](https://sidwat.github.io), rebuilt as a
statically exported Next.js app.

## Stack

| Piece            | Choice                                       |
| ---------------- | -------------------------------------------- |
| Framework        | Next.js 16, App Router, React 19             |
| Language         | TypeScript                                   |
| Styling          | Tailwind CSS v4 (`@import "tailwindcss"`)    |
| Package manager  | pnpm                                         |
| Output           | Static export (`output: 'export'` → `out/`)  |
| Hosting          | GitHub Pages via GitHub Actions              |

`framer-motion`, `three`, `@react-three/fiber`, and `@react-three/drei` are
installed ahead of Phase 2 but not yet used.

## Running locally

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

## Building

```bash
pnpm build
```

This writes a fully static site to `out/`. Because `output: 'export'` is set,
server-only features are unavailable: no Route Handlers, no Server Actions, no
`next/image` optimization (hence `images: { unoptimized: true }`), and no
dynamic `revalidate`. Any data fetching has to happen at build time.

`trailingSlash: true` is on so every route emits `out/<route>/index.html`, which
is what GitHub Pages serves cleanly without a redirect hop.

Other checks:

```bash
pnpm lint
pnpm exec tsc --noEmit
```

## Branch strategy

- `master` — the live site. Still the original Jekyll build until we merge.
- `nextjs-rebuild` — this rebuild. All Phase 1–3 work happens here.

The old Jekyll site is preserved at `_legacy-jekyll/` on this branch (moved with
`git mv`, so history follows the files) and is untouched on `master`. It is
excluded from ESLint. Delete it once the rebuild has everything it needs.

### Going live

1. Set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.
2. In `.github/workflows/deploy.yml`, add `master` to the `push.branches` list
   and remove the `if: github.ref == 'refs/heads/master'` guard on the `deploy`
   job — or just merge, since the guard already allows `master` to deploy.
3. Merge `nextjs-rebuild` into `master`.

Until then, pushes to `nextjs-rebuild` run the build and upload a Pages
artifact, but the `deploy` job is skipped, so the live site never changes.

## Design system

Every choice derives from video coding rather than from generic portfolio
styling. If you change one, change it knowing what it was for.

**Colour is YCbCr.** Codecs do not work in RGB; they work in luma plus two
chroma axes, so the two accents *are* those axes — `--cb` blue and `--cr`
magenta — over a blue-shifted near-black. Text sits at `--luma` `#e8eaf2`, not
pure white, because broadcast white is 235 rather than 255. Tokens live in
`app/globals.css` and are exposed to Tailwind through `@theme inline`, so use
`text-luma` / `border-line` and not raw hex.

**Type is one superfamily on a width axis.** Archivo carries a `wdth` axis, so
display type rides out to 118 (`.display`) for a broadcast-signage feel while
body text stays at normal width — contrast from width, not from a second face.
IBM Plex Mono handles labels and captions (`.eyebrow`), the register that
standards documents are actually written in.

**The hero is a figure, not a backdrop.** `components/QuadtreeScene.tsx` renders
a real recursive quadtree partition: blocks stay large where the frame is flat
and split along contours, exactly as a rate-distortion search behaves. It is
presented as a captioned plate ("Fig. 1"), which is why it can be bright and
legible instead of dimmed into illegibility behind text.

Two things in `lib/quadtree.ts` are load-bearing:

- **Probe density scales with cell size** (`FEATURE_WIDTH`). Contours are ~0.015
  wide; a fixed 5x5 probe samples a root cell every 0.25 and steps clean over
  the feature, leaving a whole quadrant as one flat block. Scaling the probe is
  what makes the partition correct.
- **The frame is two square roots side by side**, so blocks stay square. A
  single root stretched to 16:9 gives visibly rectangular blocks.

Motion is deliberately minimal: one staggered rise on load, and a slow
per-block oscillation weighted by detail. `prefers-reduced-motion` drops both,
and the canvas switches to R3F's on-demand frameloop so it draws once and stops.

## Roadmap

**Phase 1 — scaffold (done).** Next.js at the repo root, route structure with
placeholder content, shared `Nav` and `Footer`, static export, CI workflow.

**Phase 2 — design system + 3D hero (done).** Tokens, type scale, the quadtree
figure, and load motion. See the section above.

**Phase 3 — Notion as CMS.** Pull publications, projects, experience, and blog
posts from Notion databases at build time via the Notion API. Because the site
is statically exported, content refreshes need a scheduled or webhook-triggered
rebuild rather than ISR. Store the integration token as a repository secret and
pass it into the `pnpm build` step.

**Phase 4 — blog and gallery.** MDX or Notion-backed post rendering, syntax
highlighting, RSS, and an image gallery with proper responsive sources (note
that `next/image` optimization stays off under static export).

## Layout

```
app/            routes; one directory per page, all statically prerendered
components/     Nav, Footer, PageHeader
lib/site.ts     name, nav items, and social links — edit here, not in components
public/         static assets served at the domain root (drop cv.pdf here)
_legacy-jekyll/ the previous Jekyll site, kept for reference
```
