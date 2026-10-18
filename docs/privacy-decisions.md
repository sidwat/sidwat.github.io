# Privacy decisions

Records what personal information the owner has chosen to make public. **Only the owner decides**; the Writer and Tech Lead record. The repo is public, so this file never contains the private values themselves.

Observed on 2026-10-17 (live site, `origin/master`). Each row needs a decision.

| Item | Where it is public today | Looks deliberate? | Owner decision | Date |
|---|---|---|---|---|
| UCSD email (`swatsa@ucsd.edu`) | Footer mailto on every page; planned contact page and form fallback | Yes (commit "Use UCSD email for site contact") | _pending (recommend: keep)_ | |
| **Personal Gmail address** | `public/cv.pdf` header (served at `/cv.pdf`) | **Probably not**: it contradicts the site's choice of the UCSD address | _pending (recommend: web CV uses the UCSD address)_ | |
| **Mobile phone number (+91)** | `public/cv.pdf` header | **No**: `CHANGELOG.md` 1.0.1 already lists it as a known issue ("serving a web variant without it needs a re-export from the LaTeX source") | _pending (recommend: remove from the web CV)_ | |
| Location (city) | `lib/site.ts` (`San Diego`); CV; experience pages list past cities | Yes, city level only | _pending (recommend: keep, city only)_ | |
| Photograph (portrait + wave video) | Home hero, `public/media/` | Yes (designed feature) | _pending (recommend: keep)_ | |
| Pronouns | Old Jekyll config only (not served) | n/a | _pending: show or not_ | |
| Social profiles (GitHub, LinkedIn, Scholar, ORCID) | Footer | Yes | _pending (recommend: keep)_ | |
| Grades (CPI) | `/experience/` education, CV | Yes, common for applicants | _pending_ | |
| Supervisor names | Experience, projects, teaching | Yes (public academic relationships) | _pending_ | |

## Notes
- Removing the phone number from `/cv.pdf` now won't remove it from the old versions in git history or from caches and crawlers. That's still worth doing; rewriting history is a separate, disruptive decision.
- Contact form messages go through a third-party form service (see `docs/03-integrations-spec.md`). Its retention must match the consent line in `docs/design/copy.md` (`contact.consent`).
- Changes to `public/cv.pdf` or `lib/content.ts` are the owner's to make (both are frozen for agents).
