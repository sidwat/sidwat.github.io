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
chroma axes, so the two accents *are* those axes — `--cb` and `--cr` — over a
blue-shifted near-black. Text sits at `--luma` `#e8eaf2`, not pure white,
because broadcast white is 235 rather than 255. Tokens live in
`app/globals.css` and are exposed to Tailwind through `@theme inline`, so use
`text-luma` / `border-line` and not raw hex.

`--cb` is blue on ink and warm brown `#6f4718` on studio. That is not an
exception to the scheme but the point of it: Cb is the *blue-difference* axis,
so its far end is amber-brown. Blue highlights on a sand ground read as an
intrusion; the same axis, taken to its warm end, reads as the ground
concentrated. Both values clear AA against their own ground.

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
  all. `#e9d5a3` is sampled from `public/media/portrait.jpg`, matched to the
  wall at the *edges* of the frame rather than its overall mean, because the
  edges are the only part that has to disappear.

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

## The shell session

The hero opens as a shell session: `$ whoami` prints the name and the role
line, `$ cat about.txt` prints the bio, and it comes to rest on an empty prompt
with a blinking caret.

The split between the two components is the point of the whole thing:

- `components/Typed.tsx` types the **commands**, at a genuinely human 85ms per
  keystroke with ±35% jitter so it does not read as a metronome.
- `components/Printed.tsx` reveals the **output** in one go, because a shell
  prints its output rather than typing it.

That is what makes human typing speed affordable. Typing the bio's 190
characters at 85ms each would take sixteen seconds; typing `cat about.txt` takes
one, and the paragraph then arrives at once, exactly as a real terminal behaves.
The whole sequence runs about 3.5 seconds.

In both components the content is rendered up front and revealed by opacity
rather than appended to a growing string. That buys three things: the full copy
is in the server-rendered HTML for crawlers, it is in the accessibility tree
from the start so a screen reader is never made to wait on an animation, and the
layout never reflows, so nothing shifts as it runs. The prompt lines are
`aria-hidden`, since the shell framing is decoration — the name, role and bio
are the content.

**The chain is causal, not scheduled.** `Typed` reports completion through
`onDone` and the hero advances a `stage`; each step is gated on the one before
it. A precomputed timeline was the first attempt and it desynchronises:
keystrokes jitter by ±35% and `setTimeout` drifts under load, so the bio printed
while `$ cat about.txt` was still halfway through typing. Verified by sampling
the DOM 70 times across a run — the output is never visible while its own
command is unfinished.

The second prompt's `$` is revealed with its command rather than at load,
because a shell does not show the next prompt until the last one has finished.

The caret carries **no width and no height**. Height was the first attempt and
it is wrong twice over: a zero-height box with the block placed from its top
draws the caret entirely below the baseline, and giving the box a height to fix
that inflates the line it sits on, which visibly spread the display type apart
as the caret passed through. At zero height the box collapses onto the baseline
and the block is placed from there by a pseudo-element outside flow.

The name is set to `clamp(1.8rem, 4.8vw, 3.1rem)` so it holds one line at every
width — 53px of headroom at 1280, 72px at 375. The ceiling matters more than it
looks: the left column is only 493px at any viewport past `max-w-5xl`, so it is
the max, not the `vw` term, that binds on desktop.

## The mesh field

`components/MeshField.tsx` draws a triangulated field behind the whole site on a
`<canvas>` pinned at `-z-10`. At rest it is a faint wireframe; the cursor lights
the edges near it and the vertices part slightly around it.

The conceit is foveated coding. An encoder spends its bits where the viewer is
looking, so here the cursor is the fovea: the mesh resolves around it and fades
away everywhere else. That is also why the accent is `--cb` rather than a
decorative colour — it is one of the two chroma axes the palette is built from.

**The topology is built once**, by `lib/delaunay.ts`, and then held fixed while
vertices are displaced. Re-triangulating per frame would be both slower and
worse, since points drifting past each other produce sliver triangles that
flicker. Points come from a jittered grid extended one cell past the viewport,
so the mesh runs off every edge instead of ending in a visible border.

**The loop stops when nothing is changing.** A `dirty` flag tracks whether the
pointer actually moved, because `pointer.on` stays true while the cursor merely
rests inside the window — keying off that alone would leave the loop running
forever after the first mouse move. Measured: zero draw calls across three
seconds idle, and it wakes on the next move.

Opacities live in `--mesh-base` and `--mesh-lit` rather than in the component,
because `--line` sits at very different contrast against each ground: the same
alpha that reads as a whisper on sand is invisible on ink.

Reduced motion leaves the field static, and coarse pointers never animate it at
all. The canvas is `pointer-events-none` and `aria-hidden`.

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
