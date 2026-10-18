# Changelog

Versions follow [semantic versioning](https://semver.org): the major number
moves on a redesign or a change in what the site *is*, the minor on new
sections or features, the patch on content and fixes.

## 1.1.0 (unreleased)

A blog and a contact page. The date is set when `integration/blog-contact`
merges to `master`.

### Fixes (F-6)

- **Home with reduced motion:** the figcaption hint was added or removed from
  `useReducedMotion()`, which differs between server and first client render.
  That caused React hydration error #418 and dropped the stored studio ground.
  The hint now uses a hydration-safe media query.
- **Contrast:** publications citations and the home caption hint use `--muted`
  at full strength (4.8:1 ink, 5.4:1 studio).
- **Dependencies:** `next` and `eslint-config-next` 16.3.8; `sharp` 0.35.5 and
  `source-map-js` 1.2.2 re-locked. `pnpm audit --prod` has no high or critical.

### Blog

- **`/blog/` is real.** It replaces the "Coming soon" placeholder: posts listed
  newest first and grouped by year, each with date, title, summary, reading
  time and tags. With nothing published it shows a deliberate empty state, and
  the link stays in the nav (decision Q9).
- **Post pages at `/blog/<slug>/`,** rendered at build time from Markdown in
  `content/blog/`: headings with anchors, GFM tables and footnotes, syntax
  highlighting (Shiki, no client JS), figures, older/newer links and a "Write a
  message" link at the end. Each page has its own title, description,
  canonical URL, Open Graph article tags and JSON-LD.
- **Nothing is published by accident.** A post is public only when
  `draft: false` and its date has passed at build time. `pnpm build:drafts`
  shows drafts and scheduled posts with a visible marker, for previewing.
  Front matter is validated and a bad post fails the build, naming the file
  and field. Raw HTML in a post is not rendered.
- **An RSS 2.0 feed** at `/blog/feed.xml` (summaries only), linked from the
  blog index.
- **A CMS at `/admin/`** (Sveltia, Git-based) for writing posts in the
  browser; it commits Markdown to the repository like any other edit.
  *(Lands with task I-2, still open when this entry was written; drop this
  line if 1.1.0 ships without it.)*
- Sitemap lists every published post; `robots.txt` disallows `/admin/`.

### Contact

- **`/contact/`, a contact form,** sent through a third-party form service
  (Web3Forms) behind a one-file adapter, `lib/contact/provider.ts`. Every
  state is designed: field errors with a summary, submitting, success, provider
  and network failures, rate limiting, spam rejection, no JavaScript, and not
  configured. Each failure keeps what the visitor typed and offers the
  `mailto:` instead.

### Navigation

- **Contact joins the nav, and "Blogs" becomes "Blog".** Below 1024px the bar
  wraps (brand and theme toggle on top, links beneath) and is no longer sticky,
  so a three-row bar never pins a third of a phone screen; from 1024px it is
  one sticky row as before. Links are 28px tall, 44px on touch screens, and the
  current page is underlined as well as brighter, since the colour change alone
  was 2.34:1 on studio.
- **The footer adds "Write a message →"** under the email address, which stays.
- The page wrapper is now a `<main>` landmark, and post links use a
  full-strength underline (it was 2.60:1).

### Removed

- **The Jekyll placeholder posts.** `_legacy-jekyll/_posts/` (the template's
  four numbered sample posts and a sample dated 2199) and
  `_legacy-jekyll/_drafts/` were never built or served by the Next.js site, but
  they were the only "posts" in the repository and would have been confused
  with real ones. The rest of `_legacy-jekyll/` stays (decision Q6).

### Known

- **Drafts are public in the repository.** `draft: true` keeps a post off the
  site, but the repository is public, so anyone can read it on GitHub. Do not
  put anything in a draft that must stay private.
- **The CMS needs a GitHub token.** Signing in at `/admin/` takes a personal
  access token with write access to this repository, stored in that browser.
- **The contact form needs the Web3Forms key.** Until
  `NEXT_PUBLIC_CONTACT_ACCESS_KEY` (and the endpoint) are set for the deploy
  build, `/contact/` shows the not-configured state with the `mailto:`
  fallback. The key is not a secret: it is inlined into the page by design.

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
