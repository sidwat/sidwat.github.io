# Owner actions

The **one place** listing everything that needs Sidhartha (the owner). The Tech Lead keeps it current; agents never ask you directly. Each item has a recommended answer, so you can reply in chat with just the ID, e.g. `A2: recommended` or `A3: student`.

Public repo: never write private values (phone numbers, keys) here. Answer sensitive items in chat.

Last updated: 2026-10-18

## Blocking the pipeline now
_None._ The pipeline keeps running on the documented defaults.

## Needed before go-live (M-1)
| ID | Question | Recommended | Why it matters |
|---|---|---|---|
| A1 | Design mockup PNGs (~20 MB in `docs/design/assets/`): drop them, recompress, or keep? | **Drop** (keep the HTML mockups); rewrite local commits before the first push | Public repo history is permanent |
| A2 | `public/cv.pdf` shows a personal Gmail address and a phone number. Replace with a web CV without them? | **Yes**: re-export with `swatsa@ucsd.edu` and no phone | Privacy; already a known issue in CHANGELOG 1.0.1 |
| A3 | Your role label: the site says "Research Engineer" (UC San Diego) and the hero says "MS Computer Science"; the CV says MS "(Incoming)". Which is right? | You decide (fact) | Credibility; the reviewer will flag it |
| A17 | The `/admin/` editor loads extra files from public CDNs (unpkg, jsDelivr) that can't be integrity-checked; a CDN compromise during an editing session could read your GitHub token. Accept, given a repo-only, contents-only, ≤90-day token? (I-Q7) | **Accept**, and keep the editor version current | Only alternative is bundling the CMS ourselves (more work) |
| A13 | May I push `integration/blog-contact` (**not** `master`, so no deploy) to GitHub so the QA workflow runs in CI? Only after A1 is settled | **Yes, after A1** | CI has never run |
| A14 | Real devices for manual QA: which iPhone/Android can you test on? (QA-Q1) | Tell me the models; otherwise results are marked emulation-only | Manual cases are blocked without it |
| A15 | May QA send up to 3 real messages through the live contact form after go-live? (QA-Q3) | **Yes** | Uses your free quota |
| A16 | May the smoke test create and then delete a public `qa-smoke-delete-me` post on `master`? It stays in git history (QA-Q4) | **Yes** | Public history |

## Needed for the writer and reviewer
| ID | Question | Recommended |
|---|---|---|
| A4 | May Samsung work, standards proposals or patents be written about beyond what's already on the site? | **Only what's already public**; ask per item |
| A5 | Personal details (city, photo, grades, supervisor names): keep public? See `docs/privacy-decisions.md` | Keep (city only, no phone) |
| A6 | Blog cadence | **One post a month** |
| A7 | First post | **A short "why this blog" introduction** (W-3) |
| A8 | Contact reply time to promise, and an auto-reply? | "Within a week"; **no** auto-reply on the free tier |
| A9 | Which writing tasks to release now (W-1 to W-4)? | **W-4 now**; W-1 and W-3 after you add 2–3 writing samples to `docs/voice-guide.md` |
| A10 | First reviewer pass: wait for the new pages (plan), or baseline the live site now too? | **Wait** |

## After go-live (you only)
| ID | Task |
|---|---|
| A11 | Send a test message through https://sidwat.github.io/contact/ and confirm it arrives and Reply works (also tells us whether Web3Forms accepts github.io) |
| A12 | Create a fine-grained GitHub token for the CMS (steps will be in `docs/runbooks/token-rotation.md`) and do the smoke-test post |

## Done
| ID | What | Date |
|---|---|---|
| — | Web3Forms key created; `CONTACT_ACCESS_KEY` and `CONTACT_ENDPOINT` repository variables added (names verified) | 2026-10-18 |
