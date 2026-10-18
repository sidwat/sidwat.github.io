# Blog editor (Sveltia CMS): technical reference

For: whoever maintains the site (engineer-level). The owner's how-to is [editing-posts.md](editing-posts.md).
Files: `public/admin/index.html`, `public/admin/config.yml` (served at `/admin/` and `/admin/config.yml`). Spec: `docs/03-integrations-spec.md` §4. Last checked: 2026-10-17.

---

## 1. Pinned version and integrity

| Item | Value |
|---|---|
| Package | `@sveltia/cms` (npm), classic-script CDN build `dist/sveltia-cms.js` |
| Version | **0.246.1** (published 2026-10-16 19:21 UTC; release notes: "Bug fixes and improvements") |
| URL | `https://unpkg.com/@sveltia/cms@0.246.1/dist/sveltia-cms.js` |
| SRI | `sha384-MesywyNCDYtPV/xerXlPq0YXvMWNmWdmHGo1FQ7TotJtZ6QSLe7Nd2quNAdpni4j` |
| Size | 2,545,172 bytes |
| Recorded | 2026-10-17 |

How the hash was verified (2026-10-17):

1. Downloaded the file from three places: unpkg, jsDelivr (`cdn.jsdelivr.net/npm/@sveltia/cms@0.246.1/dist/sveltia-cms.js`), and the npm tarball. All three were byte-identical and gave the hash above (`openssl dgst -sha384 -binary | openssl base64 -A`).
2. The tarball's sha512 matched the registry's `dist.integrity`, and the release has npm provenance (SLSA v1 attestation).
3. In headless Chromium against a local build of `out/`, the script loaded with that `integrity` attribute and the CMS started (no console errors). When the same URL was made to serve different bytes, the browser refused it ("Failed to find a valid digest in the 'integrity' attribute") and the page showed its failure state.

Why 0.246.1 and not the newest (0.248.0, published the same day as this check): it was the newest release that had been public for about 24 hours. 0.247.0 and 0.248.0 add features this site doesn't use. Every published security advisory (GHSA list, latest patched in 0.238.1) is fixed in 0.246.1.

**The vendor advises against exact pinning** ("pinning to an exact version is discouraged for long-term use", Releases page) because pinned installs miss security fixes. Pinning is required here for SRI (03 §4.2). The cost is that someone has to bump it (§2).

## 2. Updating the editor (about every 1 to 3 months, and soon after any security advisory)

1. Watch releases: on <https://github.com/sveltia/sveltia-cms>, choose **Watch → Custom → Releases** and **Security alerts**. Advisories are listed at <https://github.com/sveltia/sveltia-cms/security/advisories>.
2. Pick a version that has been out for at least a day. Read the release notes since the pinned version. Before 1.0, minor versions can break things.
3. Compute the hash from two sources and check they agree:
   ```sh
   V=0.246.1   # the new version
   for u in "https://unpkg.com/@sveltia/cms@$V/dist/sveltia-cms.js" \
            "https://cdn.jsdelivr.net/npm/@sveltia/cms@$V/dist/sveltia-cms.js"; do
     curl -sSL "$u" | openssl dgst -sha384 -binary | openssl base64 -A; echo
   done
   ```
4. Change the version in the `src` and the `integrity` value in `public/admin/index.html`. Update the table in §1 and the version noted at the top of `config.yml`.
5. Rehearse it (§5), merge, then open `/admin/` on the live site and sign in.

Inside the CMS a banner may say a new version is available. With a pinned script it **cannot** update itself: the browser console says "Update the pinned version in your script tag". The owner can ignore the banner.

## 3. What the page loads from other servers

The SRI hash covers **only the main script**. The CDN build fetches more files at runtime, and those are not covered by SRI (browsers can't apply it to dynamic `import()`). Observed on 2026-10-17, plus the vendor's own list:

| When | Request | Host |
|---|---|---|
| Every load | the pinned script | unpkg.com |
| Every load | `@sveltia/cms/package.json`, then `@sveltia/cms@<latest>/package.json` (update check, data only) | unpkg.com |
| Every load | UI fonts (Source Sans 3, Material Symbols) | cdn.jsdelivr.net |
| Every load | GitHub status (`/api/v2/status.json`) | www.githubstatus.com |
| Signed in | GitHub REST and GraphQL API | api.github.com |
| Some actions only | extra libraries at exact versions: WebP/HEIC encoders (image upload), `exifr` (image details), `turndown` (pasting HTML), `immutable`/`react-dom` chunks, syntax highlighting definitions, non-English UI strings | unpkg.com |

What this means: a compromised unpkg could still serve a malicious lazily-loaded file to an editor session, and that code would run on `sidwat.github.io`, where it could read the token in `localStorage`. SRI on the main script narrows the risk but does not remove it. If that's not acceptable, the vendor's fix is the NPM build bundled by a build tool, which contacts no CDN. That would need a Vite/webpack step and a `package.json` change (a Frontend decision, not in scope). Vendoring `sveltia-cms.js` into `public/admin/` does **not** help: the vendor states the CDN build "still" loads those files when copied to your own site.

Privacy: fonts from jsDelivr and the files from unpkg mean those CDNs see the editor's IP address. Visitors to the public site are not affected: only `/admin/` loads the CMS.

## 4. Configuration decisions and the `[verify]` items from 03 §4.2

All checked against the official docs at sveltiacms.app (Markdown pages, read 2026-10-17) and rehearsed (§5).

| Item | Result | Status |
|---|---|---|
| Script tag | Classic script, **no** `type="module"` (the docs say adding it "may lead to unexpected behavior"). Loaded `async` with `integrity` and `crossorigin="anonymous"`. unpkg and jsDelivr both send `Access-Control-Allow-Origin: *`, so SRI works | Verified + rehearsed |
| `config.yml` location | Next to `index.html` in `public/admin/`; copied verbatim to `out/admin/` | Verified + rehearsed |
| Sign-in | PAT. Fine-grained token: Contents read and write (Metadata read is added automatically); Pull requests only for editorial workflow. Stored in the browser's local storage. PKCE "unimplemented", waiting on GitHub | Verified (GitHub backend page) |
| Hide "Sign In with GitHub" | `backend.auth_methods: [token]`. Without it the login screen also offers OAuth, which defaults to Netlify's OAuth service and would fail here | Verified + rehearsed (button gone) |
| "Work with Local Repository" button | Shown only on `localhost`/`127.0.0.1` (bundle check `isLocalHost`); not on the live site | Verified in code; live view not seen |
| Token dialog link | Opens `github.com/settings/personal-access-tokens/new?name=Sveltia+CMS&contents=write`: a fine-grained token with Contents write preselected. Repository choice and expiry are **not** preselected | Rehearsed (dialog opened, nothing entered) |
| `commit_messages` | Must sit **under `backend:`**, not at the top level as drafted in 03. Also set `uploadMedia`/`deleteMedia` | Verified (Backends page) |
| `publish_mode: simple` | Default; a save commits straight to `master`. A protected branch makes simple-mode collections read-only. The fix is `editorial_workflow` plus Pull requests permission | Verified |
| Per-post image folders | Collection `media_folder: /public/images/blog/{{filename}}`, `public_folder: /images/blog/{{filename}}`. `{{filename}}` is the entry file name, which equals the slug | Verified + rehearsed: `public/images/blog/<slug>/<file>.webp`, front matter `/images/blog/<slug>/<file>.webp` |
| Date format keeps the `Z` | No custom `format` (the vendor recommends ISO); `output_utc: true` stores UTC with `Z` while the picker uses the editor's local time. `picker_utc` is legacy | Rehearsed: `date: 2026-10-18T02:17:00Z` (entered as 19:17 Pacific time), unquoted. gray-matter reads it as a `Date`, which the loader accepts |
| Upload-time resizing / WebP | `media_libraries.default.config.transformations.raster_image: {format: webp, quality: 80, width: 1600, height: 1600}`. Exif (including GPS) is stripped. Animated images are left as they are | Rehearsed: a 2400×1200 PNG (168 KB) was saved as a 1600×800 WebP (10.6 KB) |
| File-name hygiene | `slugify_filename: true` (`Big Test Photo.png` became `big-test-photo.webp`). Global `slug: {encoding: ascii, clean_accents: true, maxlength: 80}` | Rehearsed |
| Slug | `slug: {template: "{{slug}}", editable: [create], pattern: lowercase-kebab}` plus the `cms.slug.hint` string. Editable only while creating, so a saved post can't be renamed by accident | Verified (Slugs page); create rehearsed |
| README in `content/blog/` | `filter: {field: draft, value: [true, false]}` hides files without a `draft` field | Rehearsed: list shows 2 entries, not 3 |
| Length limits | `maxlength: 90` / `200` (counter shown) instead of a regex `pattern` | Rehearsed |
| Tag format | A simple list's `pattern` is tested against the items joined by commas, so the regex allows commas. `Video Coding` is rejected in the editor | Rehearsed |
| Empty optional fields | Written as `updated: ''`, `cover: ''`, `coverAlt: ''`, `tags: []`. The loader treats empty as absent | Rehearsed + production build passed |
| Stock photos | Off (`stock_assets.providers: []`): Lorem Picsum has no alt text and needs no key, so it would otherwise appear | Verified |
| Raw HTML in the editor | The CMS preview sanitises (`sanitize_preview` defaults to true). The site does not render raw HTML at all (Frontend) | Verified (Security page) |
| Required fields vs build checks | The editor cannot express "coverAlt required if cover", or check slug uniqueness across files. The build does. A bad save gives a red Action and the old site stays live | Rehearsed: build failed with `content/blog/<slug>.md: "coverAlt" is required when cover is set` |
| Deleting a post | Deletes the `.md` only. The post's image folder **stays** (the CMS only auto-deletes media when each entry has a folder of its own). Delete images in **Assets** | Rehearsed |
| GPG-signed commits | The vendor says GitHub commits made by the CMS are signed and verified | Unverified here (needs a real sign-in) |
| The owner-visible states in the boot page | admin-entry.md §3 | Rehearsed: loading at 1 s, "still loading…" at 9 s, failure at 21 s; blocked script fails in about 20 ms; SRI mismatch fails; no-JS message; `Reload` reachable with Tab; ink/studio follow `prefers-color-scheme` |

Note: after it loads, the CMS changes the tab title from `Editor` to `Sveltia CMS`. The `Editor` title only shows while loading or on failure.

## 5. How to rehearse without touching the real repo

1. `pnpm build`, then serve `out/` on localhost, for example `python3 -m http.server 4310 -d out`.
2. Open `http://localhost:4310/admin/` in Chrome or Edge. **Work with Local Repository** works on a clone: pick the repo root and the CMS edits files on disk without signing in. It doesn't commit unless you turn on Settings → Developer → Commit Changes to Git. Review the files with `git diff` and discard them.
3. The 2026-10-17 rehearsal was automated in headless Chromium (Playwright). The folder picker was replaced by a copy of `content/blog/`, `public/images/blog/` and `public/admin/` in the browser's private file system, so nothing on disk changed. It created a post with a cover, published it, deleted it, and saved one with no tags and one with a bad tag. The created post, dropped into `content/blog/`, passed `pnpm build`: page emitted, listed in `feed.xml` and `sitemap.xml`. With `coverAlt` blanked, the build failed with the message above. The rehearsal files were then removed.
4. Not rehearsed (needs the real repo and a token, done once after merge per 04 §10): token sign-in, a real commit to `master`, the deploy, commit-message format on GitHub, and signed commits.

Screenshots from the rehearsal are in [images/](images/). They come from local mode, so the top-right shows `Local` instead of the GitHub account.
