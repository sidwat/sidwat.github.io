# Project pages and contact update — 2026-10-24

The approved Clarity design now uses six individual static project routes. Every ticket links to its own page, with the original project title and all original bullet points preserved. Particle banners form NNLF, NNFilter, NNIntra, APV, ROBOMASTER and CHANDRAYAAN.

A design-review subagent advised using a shallow decorative banner above a normal readable heading, keeping motion away from body text and forms, fitting long words, and limiting pointer connections. These suggestions are implemented. The reviewer used an Apple HIG-informed perspective, not an affiliation with Apple.

The combined animation gathers, holds and scatters over an 18-second cycle. Pointer-local connections fade as the word assembles. It pauses when offscreen or the page is hidden; Reduced Motion produces a static word. The existing motion control remains available.

## Preview

- `apv-light.png`: desktop, light appearance, reduced motion.
- `robomaster-dark-mobile.png`: mobile, dark appearance, reduced motion.
- Local interactive preview: http://127.0.0.1:4190/projects/

## Contact configuration

The supplied public Web3Forms access key is stored in ignored `.env.local` and verified GitHub Actions repository variables. The existing deployment workflow supplies it to the build. No key was added to tracked source. Missing configuration shows a neutral email invitation; actual submission errors still preserve visitor input and offer retry/email.

GitHub Pages hosts the static site, with Web3Forms handling submissions. Production changes require a deployment from master. No live test message was sent, so inbox delivery and provider acceptance remain to be checked after deployment.

## Validation

- Lint, TypeScript and configured production webpack export passed.
- Chromium: 104 passed, 2 intentionally skipped across regression, layout, navigation, accessibility, project routes and SEO.
- WebKit: all 5 project tests passed, including every route in both appearances at mobile and desktop widths.
- Contact simulated-provider suite: 21 passed, 1 skipped; missing-configuration fallback: 1 passed.
- Desktop APV and mobile ROBOMASTER screenshots visually checked; long labels fit.

Automated form tests intercept the service and do not send email. These checks cover observed behavior; they do not guarantee third-party service availability.
