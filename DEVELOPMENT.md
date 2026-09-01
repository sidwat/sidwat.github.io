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

## Roadmap

**Phase 1 — scaffold (done).** Next.js at the repo root, route structure with
placeholder content, shared `Nav` and `Footer`, static export, CI workflow.

**Phase 2 — design system + 3D hero.** Real type scale, color tokens, and
spacing; a `three` / react-three-fiber scene behind the landing hero with a
reduced-motion and mobile fallback; `framer-motion` page and section
transitions.

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
