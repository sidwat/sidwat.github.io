# Admin entry — `/admin/`

Task D-3 · Spec: [01-design-spec.md](../01-design-spec.md) §4.4 · Tokens: [tokens.md](tokens.md) · Strings: [copy.md](copy.md) (`admin.*`, `cms.*`) · Nav and footer study (also D-3): [contact.md](contact.md) §8 and §9

Rendered states, both schemes: [assets/admin-states.html](assets/admin-states.html), exported as `assets/admin-states.png` (top row dark = ink, bottom row light = studio).

`/admin/` is a static HTML file (`public/admin/index.html`) that loads a third-party CMS script, which then takes over the whole viewport. The CMS UI cannot be restyled. What is designed here is only the page *before* the CMS runs and *if it fails to*.

---

## 1. Principles

1. **Not part of the site shell.** No nav, no footer, no mesh, no grain, no site JavaScript, no fonts from the site bundle. It has to work even when the Next bundle is broken, and it must not load anything but the pinned CMS script (token-in-`localStorage` risk, 03 §4.3).
2. **Theme follows `prefers-color-scheme`**: dark → ink tokens, light → studio tokens. The page cannot safely run the site's theme script (it would need the site's `localStorage` key and an inline script on an origin that holds the GitHub token), so it does not read the saved site theme; the owner's OS setting decides. `<meta name="color-scheme" content="dark light">`.
3. **Command register**: IBM Plex Mono if available else the system monospace (no webfont download), lowercase text.
4. **Deliberately undiscoverable, not secret.** Never linked from the site, not in the nav, not in the sitemap, `<meta name="robots" content="noindex">`, `Disallow: /admin/` in `robots.txt`. This is tidiness, not security: the real control is the fine-grained GitHub token. State this in the runbook so nobody treats the URL as protection.

## 2. Page contract (for Integrations, task I-2)

```
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="dark light">
<title>Editor</title>                                        (admin.title)
```

CSS custom properties, named as in the site: `--ink --luma --muted --cb --cr`; values from [tokens.md](tokens.md) §1 (ink values by default; studio values inside `@media (prefers-color-scheme: light)`). Body: `margin:0; min-height:100dvh; display:grid; place-items:center; padding:1.5rem; background:var(--ink); color:var(--luma); font: 400 0.875rem/1.6 ui-monospace, "SF Mono", Menlo, Consolas, monospace; text-align:center`.

## 3. States before and around the CMS

| State | When | What is shown | Notes |
|---|---|---|---|
| **Loading** | Script requested, not yet executed (about 1 to 2 s) | `loading editor…` (admin.loading), centred, `--luma` | A `role="status"` paragraph. No spinner, no animation, no skeleton (nothing new moves). Hidden by the inline script once the CMS script's `load` event has fired (the CMS then renders into the page) |
| **Slow** | 8 s without `load` | Text becomes `still loading… slow connection?` (admin.slow) | Same element; polite status |
| **No JavaScript** | Scripting disabled | `The editor needs JavaScript.` (admin.noscript) | In `<noscript>`; the loading paragraph is `hidden` in the markup and un-hidden by the inline script, so a no-JS visitor never sees "loading" |
| **Script failed to load** | The script element fires `error` (blocked, offline, SRI mismatch), or 20 s with no `load` | Glyph `!` box in `--cr`, `Could not load the editor.` (`--luma`), then `Check your connection or content blocker, then reload.` (`--muted`), then a `Reload` link (`--luma`, accent underline, 44px high, `location.reload()`) | `role="alert"` is acceptable here: the page has no focus management and the message appears without user action. The glyph box has the `!`; the text carries the meaning, so colour is never the only signal. Message sits on the ground, never in a filled box |

Timing notes: `error` fires immediately for blocked or offline loads, so the 20 s timer is only for stalled connections. An SRI mismatch (a CDN serving different bytes) also surfaces as `error`; the same message is right (the hint tells the owner to try reloading; the runbook covers SRI).

Contrast: `--luma` on `--ink` 16.56 / 12.56; `--muted` on `--ink` 4.81 / 5.37; `--cr` glyph and border on `--ink` 6.77 / 4.67 (non-text 3:1 met); focus ring `--cb` 5.38 / 5.60. All ratios in [tokens.md](tokens.md) §2.

## 4. Wireframes

```
Loading (dark = ink tokens, light = studio tokens; same layout)
┌───────────────────────────────────────────┐
│                                           │
│               loading editor…             │
│                                           │
└───────────────────────────────────────────┘

Failed
┌───────────────────────────────────────────┐
│          [!] Could not load the editor.   │
│   Check your connection or content        │
│   blocker, then reload.                   │
│                 Reload                    │
└───────────────────────────────────────────┘
```

Responsive: the same single centred block at 320 to 1920; the text wraps; no breakpoints.

## 5. What the CMS owns (out of scope; listed so the runbook can screenshot them)

Third-party UI, not restyled. Integrations (I-2, I-5) should capture these five for `docs/runbooks/editing-posts.md` and `troubleshooting.md` once the CMS is rehearsed locally; the descriptions below come from the integrations spec, not from running the CMS (the CMS was not available to the Designer):

1. **Sign-in with a token:** the CMS asks for a GitHub personal access token (fine-grained, this repo only, Contents read and write, expiring), stored in the browser.
2. **Collection list:** the Blog collection and its posts, with a `New` action.
3. **Editor:** the fields for title, date, summary, tags, cover, cover alt, **Draft** (on by default), and the Markdown body. Use the hint strings in [copy.md](copy.md) (`cms.*`).
4. **Save and publish confirmation:** saving commits to `master`; the site is live after the deploy workflow finishes, about 3 minutes. The runbook must say so, because the CMS shows "saved" long before the site changes.
5. **Save failed:** typically an expired or under-permissioned token; the runbook points to `token-rotation.md`.

## 6. Accessibility

- `lang="en"` on `<html>`. One landmark-free page with a single status message; the failure state's `Reload` link is keyboard reachable with the global-style ring (`outline: 2px solid var(--cb); outline-offset: 3px`).
- Text ≥ 14px, scales with browser text size; reflows at 400% (one centred paragraph).
- `prefers-reduced-motion` is moot: nothing animates.
- The CMS's own accessibility is out of the Designer's control; note it in the runbook if it matters.

## 7. Implementation notes for Integrations

| Item | Note |
|---|---|
| Files | `public/admin/index.html` with a small inline script (no framework): show the status paragraph on load, start an 8 s timer (slow) and a 20 s timer (fail), attach `load`/`error` to the pinned CMS `<script>` (`integrity`, `crossorigin="anonymous"`) |
| Order | Insert the CMS script with `async`; hide the status when `load` fires |
| CSP | None on GitHub Pages, so inline script is fine; keep it under ~25 lines |
| Strings | Exactly the `admin.*` IDs in [copy.md](copy.md) |
| Not in the site build | The page is under `public/`, copied verbatim into `out/admin/`; it does not use `app/layout.tsx` |
| Frontend | `robots.ts` adds `Disallow: /admin/`; `sitemap.ts` does not list it (02 §F-4) |
