# Content checklist (pre-publish)

The Writer runs this on every draft and pastes the ticked list at the end of the draft. The owner rechecks the starred (★) items before publishing.

## Facts
- [ ] ★ Every claim, date, number, role, collaborator and citation has a source in the fact table (inbox item, `lib/content.ts` field, `public/cv.pdf` page, or a site page).
- [ ] Nothing is inflated: applications aren't called granted patents, submissions aren't called publications, team results say whose they were.
- [ ] Numbers match their source exactly (units, baselines, "%" vs "percentage points").
- [ ] Dates, titles, affiliations and role labels match **across** the home hero, bio, `/experience/`, `/projects/`, `/publications/`, `/teaching/` and `public/cv.pdf`. Any mismatch goes to the Owner as a Request; don't silently pick one.

## Confidentiality and privacy
- [ ] ★ No unreleased employer material (Samsung internal results, unpublished standards proposals, patent details beyond the public filing) without the owner's explicit OK, recorded in the inbox.
- [ ] No other person's personal data. Collaborators are named only where they're already public co-authors or supervisors on the site.
- [ ] Personal details match `docs/privacy-decisions.md` (e.g. no phone number, no personal email if that's the decision).
- [ ] Images: no GPS EXIF, no faces of people who haven't agreed, nothing private in the background.

## Links and media
- [ ] Every link resolves (200) and points where the text says; DOIs use `https://doi.org/…`.
- [ ] Internal links use trailing slashes (`/blog/slug/`).
- [ ] Every informative image has alt text that says what it shows; decorative images have empty alt. Cover images have `coverAlt`.
- [ ] Images ≤ 200 KB, ≤ 1600 px wide, stored under `public/images/blog/<slug>/`.

## Format (blog posts)
- [ ] Front matter is valid against `docs/00-overview.md` §5.1: `title` ≤ 90 chars; `date` ISO 8601 with timezone; `summary` ≤ 200 chars; tags lowercase-kebab; `coverAlt` if `cover`; `draft: true` until the owner publishes.
- [ ] Slug is lowercase-kebab, unique and final (it's the permanent URL).
- [ ] No raw HTML (it won't render). Headings start at `##`.

## Language
- [ ] Spelling and grammar checked; British spelling.
- [ ] Humanizer pass done: no banned phrases from `docs/voice-guide.md`, ≤ 1 em-dash per paragraph, varied sentence and bullet structure, no forced conclusion.
- [ ] Voice: terse, technical, first person, no exclamation marks, no emoji.
- [ ] Reads naturally aloud as the owner.

## Sign-off
- [ ] ★ Owner approved on: ____ (recorded in the draft's status line)
