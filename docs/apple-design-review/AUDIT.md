# Website design audit

Reviewed October 22, 2026. Base: `origin/master`, commit `37a59c6` (release 1.1.0).
Design branch: `codex/apple-design-review`. The default branch is named `master`; no `main` branch exists.

## Scope and evidence

Reviewed all active page components, shared shell, content data, blog visibility rules, contact adapter and state handling, editor entry/configuration, static export configuration, sitemap, robots, and deployment workflow. Captured the current site locally at 1440px and 390px. These are local development captures: draft posts are visible by default in development. Production currently has zero published posts because both existing Markdown files have `draft: true`.

The Graphify graph was inspected first. It contains 359 nodes but indexes legacy Jekyll paths rather than the active Next.js app. It is stale for this review; current source files and fresh browser captures are the evidence used below. No inference about authorship is made.

The `_legacy-jekyll/` and `_archive/` directories are historical material rather than current routes. They should not drive the redesign. `DEVELOPMENT.md` also contains older branch/roadmap notes; live code and Git configuration take precedence.

## Information architecture and content

| Surface | Current content and behavior | Redesign requirement |
| --- | --- | --- |
| Home `/` | Terminal introduction; MS CS at UCSD; brief bio; portrait with hover/tap wave and tilt; View CV and Download PDF; six section links | Communicate the research focus immediately, offer a clear primary route to work, retain both CV actions, and show selected work before a visitor has to navigate |
| Experience `/experience/` | Four roles: Samsung Senior Engineer; IISc Project Associate; ITC Techno-manager; IIT Kanpur Project Associate. Dates, organizations, units, locations, and detailed bullets | A readable chronology; dates subordinate to role and organization; all source bullets preserved |
| Publications `/publications/` | Two peer-reviewed papers (2025 journal and 2024 conference), abstracts, venues, citations, external links; three filed patents and summaries | Separate published research from filed applications, keep complete titles and citations, and make external destinations clear |
| Projects `/projects/` | Six projects: Halide NNLF inference; AI in-loop filters; AI intra prediction; APV; RoboMaster; Chandrayaan moon mapping | Give the strongest work a visual hierarchy; preserve all six entries and their complete source points; frame metrics with their original context |
| Teaching `/teaching/` | Two courses/workshops: device drivers at Samsung and Design Practicum at IIT Mandi; dates, invitation context, locations, descriptions | Distinct course blocks with scope and context; preserve recognition without inventing testimonials or teaching statistics |
| Blog `/blog/` | Year-grouped posts, tags, RSS, empty state. Both existing files are drafts | Public empty state and populated draft-fixture preview both required; no invented published articles |
| Article `/blog/[slug]/` | Dates and updates, draft/scheduled indicators, tags, optional cover, formatted Markdown, highlighted code, tables, footnotes, headings and adjacent-post navigation | A narrow reading column, overflow contained inside code/table blocks, meaningful heading hierarchy; preserve the complete renderer and publication rules |
| Contact `/contact/` | Name/email/message required; subject optional; 5,000-character message limit; third-party delivery; mail fallback; errors and recovery | Retain labels, validation summary, field errors, live status, focus management, preserved input on failure, and privacy copy |
| Gallery `/gallery/` | Empty existing route; not listed in primary navigation | Keep an honest empty state; leave out of the main navigation until real photography is available |
| Not found | Custom 404 with links to all primary sections | Clear recovery routes and an explicit not-found message |
| Editor `/admin/` | Sveltia CMS; loading, slow-loading and failure shell; GitHub token sign-in; saves to `master`; excluded from robots/sitemap | Restyle only the entry shell if approved. Vendor sign-in, collection list, editing, and authentication remain vendor UI |
| Download/feed/metadata | `/cv.pdf`, RSS XML, favicon, social preview, robots and sitemap | Preserve outputs and static hosting behavior; XML/PDF are files, not new portfolio pages |

Additional real content exists in `lib/content.ts`: full biography, three education entries, five research interests, three honors, and skills. Current home renders only the short hero copy and section navigation. The proposals surface biography, education, interests, and honors on home; skills remain source content for a later contextual treatment rather than a disconnected keyword wall. This is a proposed content arrangement for approval.

## Current design patterns

### What works

- The palette has a specific rationale: YCbCr-inspired blue and pink accents over near-black, plus a warm studio appearance sampled from the portrait wall.
- Archivo’s width axis creates display/body contrast within a family. IBM Plex Mono gives metadata a technical register.
- Repeated headers, ruled rows, consistent content width, and shared navigation create continuity.
- A real portrait and a short wave give the site personality without requiring generic stock imagery.
- The code already handles important accessibility details: skip link, labels, non-color active navigation, reduced-motion paths, live messages, and contact focus management.
- The static content/blog pipeline provides deterministic publishing and an existing editing workflow. The redesign can preserve these contracts.

### Where the design can improve

| Finding | Evidence | Proposed response |
| --- | --- | --- |
| The homepage provides little preview of the actual work | `app/page.tsx` renders Hero and section links | Add three selected-project previews and a clear “Explore my work” action |
| The visual introduction competes with the professional message | Terminal commands, timed reveals, blinking caret, triangulated background, portrait motion | Show identity and bio immediately; make retained motion optional and subordinate |
| Most detail pages use the same long ruled-list rhythm | Experience, publications, projects, teaching share similar text-heavy layouts | Use chronology for roles, distinct paper/patent groups, project spotlights, and course blocks |
| Small uppercase mono metadata slows scanning | Dates, units, organizations, navigation, captions use the eyebrow style | Reserve small labels for short metadata; use normal sentence case for longer information |
| The theme control exposes hex values as its visible label | `ThemeToggle.tsx` shows `#E9D5A3` / `#08090E` | Use a recognizable appearance control with system/light/dark choices and a persistent override |
| Mobile navigation consumes multiple rows | `Nav.tsx` wraps every section below the brand | Use a single compact header and a labeled, keyboard-operable disclosure menu |
| Important biography and education data are not visible on current home | `lib/content.ts` exports them; `app/page.tsx` does not render them | Introduce a deliberate about/education section without adding another navigation destination |
| Long research titles need breathing room | Actual paper and patent titles wrap across many lines at 390px | Keep full titles, simplify nearby metadata, avoid fixed card heights |

These are design judgments, not claims that the current functionality is broken. The existing site has considerable interaction and accessibility care worth retaining.

## Three alternative directions

### A — Clarity (recommended)

Bright neutral surfaces, a centered typographic introduction, small identity portrait, and grouped project cards. The homepage emphasizes research and evidence; interior pages use calm lists and clearly separated sections. Best balance for faculty, research collaborators, recruiters, and readers. Main tradeoff: less personal emphasis in the first screen.

### B — Focus

Dark surfaces, large left-aligned typography, a conceptual signal illustration, and larger project spotlights. The project page uses a single-column sequence rather than A’s grouped grid. Publications separate a broad lead patent from supporting applications. Best for a stronger technical impression. Main tradeoff: the large visual takes space that could show more work immediately.

### C — Studio

Warm off-white, forest-green accents, a portrait-led hero, persistent desktop navigation rail, and horizontal project previews. Interior content has a calmer editorial rhythm and stacks on mobile. Best for a personal portfolio with frequent section exploration. Main tradeoff: the desktop rail reduces available content width.

These are layout and hierarchy alternatives as well as palette alternatives. A and B use horizontal navigation; C uses a desktop rail. All use the native system sans-serif stack and retain real content. The proposed home headlines and short section headings are new presentation copy for approval. The decorative bars and orbit are conceptual graphics, not measurements, experimental results, or depictions of actual hardware.

## Interaction and accessibility specification

- Main navigation: maintain Home and all six named sections. On mobile, a labeled Menu disclosure must expose the same destinations. In production, preserve `aria-current`, route-aware active styling, sensible focus return/close behavior, and the skip link.
- Appearance: support system preference plus a saved override. Each concept currently illustrates one primary appearance; paired light/dark palettes still require implementation review after a concept is chosen.
- Motion: initial content is immediately available. Reduce Motion disables transforms, continuous mesh animation, tilt, and automatic wave playback. The portrait wave can be retained as a deliberate optional interaction if approved.
- Reading: body copy around 17–19 CSS px, line height around 1.6–1.8, approximately 65–75 characters for articles; scale headings with viewport and respect browser zoom. Native Dynamic Type guidance is adapted to web text resizing and reflow rather than copied as an API.
- Controls: target 44px minimum interactive height for key navigation and controls; clear focus rings; no state communicated only through color. Touch and keyboard paths must work independently of hover.
- Forms: keep semantic labels, field limits, the optional subject, inline errors plus focusable summary, sending/slow feedback, success, network/provider/rate/spam/validation errors, and preserved form values. Do not send a real message from the design review.
- Contact fallback: show email when configuration or JavaScript is unavailable; never present a fake deliverable form in production.
- Materials: solid content surfaces. Any later translucent navigation must have an opaque fallback and preserve contrast over actual scrolling content.
- Blog: no raw HTML execution; retain renderer safety, code highlighting, wide-table scrolling, accessible footnote return links, older/newer navigation, and build-time draft/scheduling rules. The template mockup is a visual specimen rather than an exhaustive renderer replacement.
- Editor: review the loading/failure shell only; do not modify CMS authentication or edit live content during design exploration.

## Implementation boundary and plan after approval

The production application has not been changed. All proposal HTML, PNGs, and scripts live under `docs/apple-design-review/` and are not included as production routes. Static mockup forms deliberately do not send messages.

After selection: define semantic tokens and both appearances; implement shared header/footer/type rules; build the selected homepage and page-specific layouts; preserve current content, metadata, blog pipeline, contact behavior, CMS and static export. Validate responsive layouts including long titles, 200% zoom, keyboard-only navigation, reduced motion, theme persistence, and contrast; run lint, TypeScript, production build, and relevant existing browser tests. Update the graph only if active code changes warrant it.

Commits belong on `codex/apple-design-review`; pushing that branch does not match the deployment workflow’s master-only publish condition. No merge or live deployment is part of the design approval step.

## Verification performed for the proposal package

See `verification.json`: 72 full-page proposal captures at 1440px and 390px, one H1 per proposal, no broken embedded images, no document-level horizontal overflow at those widths, and a working mobile menu-to-projects navigation check. Captured 20 current-site baseline pictures. Visually inspected the three home covers and representative long-content mobile views. These checks establish artifact integrity, not complete production accessibility conformance.

## Approval needed

Choose **A / Clarity**, **B / Focus**, **C / Studio**, or describe a combination. The default recommendation is A’s structure and typography; C’s larger portrait can be combined with it. Confirm whether the terminal introduction, mesh background, and portrait wave should be retained, simplified, or removed. Implementation begins only after this design approval.
