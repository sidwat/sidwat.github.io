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

`framer-motion` drives the hero. `three`, `@react-three/fiber`, and
`@react-three/drei` are currently unused by the live site — they are kept only
for the archived quadtree figure in `_archive/quadtree-hero/`. Drop them from
`package.json` if that archive is ever deleted.

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

**The hero is a captioned figure, not a backdrop.** The portrait is presented as
a plate ("Fig. 1 — Myself"), which is why it can be bright and sharp instead of
dimmed into illegibility behind text.

### The two grounds

`components/ThemeToggle.tsx` switches `data-theme` on `<html>` between the
default (unset) and `studio`. It is not only a colour swap — the two states
differ in how the portrait meets the page:

- **Ink** — near-black. The portrait is a bordered plate: a deliberate figure
  sitting on the page, with a visible edge.
- **Studio** — the page takes the colour of the wall in the photograph, the
  border goes, and the portrait's edges feather out so there is no boundary at
  all. The ground is `#e7d09e`, the backdrop of `public/media/peek-*.jpg`. It
  was `#e9d5a3`, sampled from the hero portrait's wall; the two backdrops sit
  about six units apart and the corner portrait is the one that has to vanish
  completely, so it wins. Either way the colour is matched to the backdrop at
  the *edges* of a frame rather than to its overall mean, because the edges are
  the only part that has to disappear.

  Changing it moved `--cr` too: on the slightly darker ground the old `#a62c53`
  fell to 4.48:1 and out of AA, so it is now `#982848` (5.09:1). The token is
  currently unused, but a palette entry that cannot legally hold text is a trap
  for whoever reaches for it next.

### The corner portrait

`components/PeekAvatar.tsx` puts a second portrait in the top-right of the home
page, anchored past the viewport edge so he reads as peering in from outside.
He breaks into a smile whenever the cursor is over anything clickable, via one
delegated `pointerover` listener matching `closest()` against the semantic
interactive elements. Anything clickable but non-semantic — a `div` with an
`onClick` — will not be seen, which is one more reason to keep the markup
semantic.

The two frames came in at different resolutions (693×618 and 1094×976) but the
same framing: both ratios are 1.579, and the measured interocular distance
differs by the same factor, so scaling them to a common size lands the eyes
within a pixel or two with no warping. That is what makes the swap read as a
change of expression rather than a jump, and their backdrops are identical
enough that the area around him does not flicker as they cross-fade.

Only the two edges facing into the page are feathered; the top and right are the
viewport's own. He is `pointer-events-none` so he can never swallow a click, and
he appears only at `lg` and up — below about 1024px the nav's links run far
enough right to end up behind his face.

Three things make the seam vanish, and all three are needed:

1. **The page colour matches the wall.** On its own this is not enough: the wall
   is vignetted, running `#f2dcab` at the top down to `#d3b583` at the lower
   left, so no flat colour can match every edge.
2. **Each edge is feathered** by `.portrait-frame`, using one linear-gradient
   mask band per edge composited with `mask-composite: intersect`. A radial
   vignette is the obvious approach and the wrong one: any radial large enough
   to spare the face never reaches zero opacity inside the box, so the rectangle
   stays visible. The bands are asymmetric — tight at the top, where his hair
   nearly touches the frame, and generous at the bottom, where only clothing is
   lost. The radii are registered with `@property` so they interpolate; an
   unregistered custom property would snap.
3. **Grain over the whole page**, portrait included (`body::after`, an inline
   `feTurbulence`). A photograph carries sensor noise and flat CSS colour does
   not, so even a perfectly matched hue still reads as a seam — the eye catches
   the change in *texture*, not in colour. The blend mode is a token because
   `overlay` leaves near-black untouched; ink screens the grain in instead.

The choice is stored in `localStorage` and applied by a literal inline script at
the top of `<body>`, before anything paints. That script must stay inline:
`next/script` with `beforeInteractive` compiles to a `self.__next_s` push under
static export, which does not run until the Next bundle loads — long after first
paint, which is the whole point. `<html>` carries `suppressHydrationWarning`
because the script deliberately makes the server and client markup differ.

## The portrait hero

`components/Hero.tsx` layers a still photo and a short video of Sidhartha
waving. On hover (or tap, on touch) the video restarts and plays; on leave it
pauses and resets to the rest pose. The frame tilts a few degrees toward the
cursor for depth.

**The photo is a real base layer, not the video's `poster`.** This matters: when
a video's sources fail to load, browsers drop the poster and paint an empty box,
so a visitor on a slow connection or an unsupported codec would see black where
a face should be. Instead `next/image` renders the portrait underneath and the
video fades in over it only once `canplay` fires. With no video file present at
all, the page still shows the photo and simply does not wave.

### Adding or replacing the wave video

Everything the hero loads lives in `public/media/`, served from `/media/`.

Shoot or generate a clip that **opens and closes on the same rest pose** — the
current one starts and ends with folded hands — so `loop` is seamless and
leaving the figure mid-wave returns to a frame that matches the still.

These are the commands that produced the current files, from a 720x1280 source:

```bash
SRC=source.mp4
CROP="crop=720:900:0:0"   # 9:16 source -> the figure's 4:5 frame

ffmpeg -i "$SRC" -vf "$CROP" -c:v libx264 -crf 27 -preset slow \
  -pix_fmt yuv420p -profile:v high -level 4.0 -an \
  -movflags +faststart public/media/hero-wave.mp4

ffmpeg -i "$SRC" -vf "$CROP" -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -an \
  public/media/hero-wave.webm

# Still MUST come from the same crop, frame 0, or the fade-in jumps.
ffmpeg -i "$SRC" -vf "$CROP" -frames:v 1 -q:v 3 public/media/portrait.jpg
```

Three things are not optional:

- **Crop at encode time**, not with CSS. The source is 9:16 and the figure is
  4:5; leaving it to `object-cover` slices the top of the head off. Re-derive
  the crop if you change the source framing.
- **`-an`.** Browsers refuse to autoplay anything with an audio track, so a
  clip with sound will not play on hover at all. This is not a size decision.
- **`+faststart`**, so the moov atom precedes mdat and playback can begin
  before the file has finished arriving.

Keep the result under roughly 1 MB. It is preloaded in full on every page load
and GitHub Pages serves it uncompressed.

Motion is deliberately minimal: one staggered rise on load plus the hover wave.
`prefers-reduced-motion` disables the tilt and the playback, leaving the still
photo.

The earlier quadtree figure is archived in `_archive/quadtree-hero/` with notes
on restoring it. That directory is excluded from ESLint and TypeScript.

## Roadmap

**Phase 1 — scaffold (done).** Next.js at the repo root, route structure with
placeholder content, shared `Nav` and `Footer`, static export, CI workflow.

**Phase 2 — design system + portrait hero (done).** Tokens, type scale, the
captioned portrait with a hover wave, and load motion. See above.

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
components/     Nav, Footer, Hero, PageHeader
lib/site.ts     name, nav items, and social links — edit here, not in components
public/media/   portrait.jpg and hero-wave.{mp4,webm}, served from /media/
public/         other static assets at the domain root (cv.pdf goes here)
_archive/       superseded work, kept for reference; excluded from lint and tsc
_legacy-jekyll/ the previous Jekyll site, kept for reference
```
