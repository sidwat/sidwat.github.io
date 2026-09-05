# Changelog

Versions follow [semantic versioning](https://semver.org): the major number
moves on a redesign or a change in what the site *is*, the minor on new
sections or features, the patch on content and fixes.

## 1.0.1

Gaps found in the pre-launch audit, and one that only became obvious once the
site was finished.

- **A contact route.** There was no way to reach him from the site at all:
  `site.email` had been in `lib/site.ts` since the scaffold but was rendered
  nowhere, and every footer link led off-site. The footer now carries a
  `mailto:`.
- **A real 404.** It was Next's default "This page could not be found", inside
  the layout. Now a proper page that says what happened and lists the sections,
  which matters more than usual here: the Jekyll site's URLs (`/publication/…`,
  `/Experiences/…`, `/talks/`) all change with this rebuild, so anyone
  following an old link lands on it.
- **Removed `three`, `@react-three/fiber` and `@react-three/drei`.** Nothing on
  the live site imported them; they were left over from the archived quadtree
  hero. Both the archive README and DEVELOPMENT.md claimed they were still
  installed, and both now say how to reinstall them instead.

## 1.0.0 — 2026-09-05

First public release. Replaces the Jekyll site that had served
[sidwat.github.io](https://sidwat.github.io) until now.

### The site

- Next.js 16 with the App Router, statically exported to GitHub Pages. No
  server, no runtime dependencies.
- Two grounds — ink and studio — switched by a toggle and remembered across
  visits. They differ in more than colour: on studio the page takes the colour
  of the wall behind the portrait, and the portrait's edges feather so the
  figure has no boundary to sit against.
- A design system derived from video coding rather than generic portfolio
  styling: the palette is YCbCr, and type is one superfamily riding a width
  axis.

### Signature elements

- **The portrait hero.** A captioned plate, "Fig. 1 — Myself", that waves when
  hovered.
- **The shell session.** The hero copy arrives as `$ whoami` and
  `$ cat about.txt` — commands typed at human speed, output printed, because
  that is what a shell does.
- **The mesh field.** A triangulated field behind the page that lights up
  around the cursor. The conceit is foveated coding: an encoder spends its bits
  where the viewer is looking.

### Content

- Experience, publications, patents, projects and a full CV, all ported from
  the Jekyll site and then synced to the current CV.
- Blog and gallery have routes but no content, so they are kept out of the nav
  rather than sending anyone to a dead end.

### Known, for the next version

- `public/cv.pdf` carries a phone number. Serving a web variant without it
  needs a re-export from the LaTeX source.
- No contact route on the site itself. `site.email` exists but is rendered
  nowhere; the footer links only GitHub, LinkedIn, Scholar and ORCID.
- The eyes-follow-cursor portrait was attempted and shelved: the gaze range
  available from a single photograph is a few pixels, and the AI-generated
  footage moved the head too much to composite against a static base.
- `_legacy-jekyll/` is still in the repository for reference. It is not built
  and not served.
