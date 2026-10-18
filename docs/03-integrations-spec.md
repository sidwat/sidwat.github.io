# 03 — Integrations spec (Integrations Engineer)

Audience: Integrations Engineer · Prereq: [00-overview.md](00-overview.md) §0, §4, §5, §6, §8 · Tasks: I-1 … I-5 in [STATUS.md](STATUS.md)

---

## 1. Scope

Everything that connects the static site to something outside it, plus the content scaffolding and CI wiring:

1. **Contact:** third-party form service, the provider adapter `submitContact`, public config.
2. **Blog authoring:** content directory + schema, the Sveltia CMS at `/admin/` (static, GitHub-token sign-in), media handling.
3. **CI/CD:** environment injection and an optional scheduled rebuild in `deploy.yml`.
4. **Secrets handling policy** (§5) and **owner runbooks** (§8).
5. **Login roadmap** (§6) — a document, not an implementation.

Facts about the platform that constrain every choice here (verified, see `00` §0): static export on GitHub Pages — **no server, no env at runtime, nothing in the browser bundle is secret, the repo is public, `master` is unprotected and deploys on push** (`.github/workflows/deploy.yml`, Node 22, pnpm).

## 2. Files owned

```
lib/contact/provider.ts              adapter; implements 00 §5.2 exactly
lib/contact/provider.test.md         (optional) notes of manual provider checks; no test framework required
content/blog/**                      content directory, README, two DRAFT sample posts
public/images/blog/**                CMS media folder (+ .gitkeep)
public/admin/index.html              static CMS boot page
public/admin/config.yml              CMS schema
.env.example                         documents NEXT_PUBLIC_CONTACT_* (no values)
.gitignore                           only: add `!.env.example` (the existing `.env*` rule would otherwise ignore it)
.github/workflows/deploy.yml         only: env injection, optional schedule, nothing else
docs/runbooks/**                     editing-posts.md, contact-form.md, token-rotation.md, troubleshooting.md, login-roadmap.md (if you extract §6)
```

You do **not** own: any `app/`, `components/`, `lib/blog/`, `lib/site.ts`, `package.json` (Frontend), `tests/` or `qa.yml` (QA), `docs/design/` (Designer). Need a dependency or a page change? Raise a Request in STATUS.md.

## 3. Contact form service (tasks I-3, I-4)

### 3.1 Choice and why

**Web3Forms free tier**, behind a one-file adapter (`00` §4.1). Alternatives, if it fails vetting: Formspree free (50/mo), then a Cloudflare Worker + Turnstile (§3.6).

### 3.2 Setup steps (owner performs the account steps; you document them in `docs/runbooks/contact-form.md`)

1. Create a Web3Forms access key bound to the **destination inbox** decided in Q3.
2. Record, in the runbook, the **verified** answers to: free monthly cap; whether a key can be restricted to `https://sidwat.github.io`; whether Turnstile/reCAPTCHA exist on the free tier (secondary sources say no and say hCaptcha is available — **confirm on the vendor dashboard/docs; the vendor pricing page returned 403 to our fetch**); retention period; whether a submission-count alert exists.
3. Store the key as a **GitHub Actions repository variable** (`Settings → Secrets and variables → Actions → Variables`) named `CONTACT_ACCESS_KEY` — a *variable*, not a secret, because it ships to every browser. Calling it a secret would mislead future maintainers.
4. Record the vendor endpoint URL as variable `CONTACT_ENDPOINT` (default `https://api.web3forms.com/submit`).

### 3.3 Adapter: `lib/contact/provider.ts`

Implements `00` §5.2. Requirements:

- **Step 1 of I-3 (do this first, alone, in its own commit):** land the file with the exported types and a `submitContact` that returns `{ ok:false, code:"provider", … }` so Frontend can build against the interface. Then complete it.
- Reads `process.env.NEXT_PUBLIC_CONTACT_ENDPOINT` and `NEXT_PUBLIC_CONTACT_ACCESS_KEY` (inlined at build). If either is missing, `submitContact` returns `provider` without a network call; never throw at import time.
- `POST` JSON (`Content-Type: application/json`, `Accept: application/json`) with: `access_key`, `name`, `email`, `subject` (default `"Message from sidwat.github.io"`; if the visitor gave a subject, prefix it), `message`, `botcheck` (honeypot), `from_name: "sidwat.github.io"`. Do not send anything the visitor did not type except those.
- **Client-side bot gates run before the network:** non-empty honeypot **or** `elapsedMs < 3000` ⇒ return `{ ok:false, code:"spam" }` without sending (to a bot, the UI treats this per the Designer decision).
- Timeout 15 s via `AbortController`; map outcomes: HTTP 2xx and body `success:true` ⇒ `ok`; 429 or body indicating the quota ⇒ `rate_limited`; 400-class validation from provider ⇒ `validation`; fetch rejects/timeout/offline ⇒ `network`; anything else ⇒ `provider`. `message` is a **safe, user-facing string key**, never the raw provider text (providers may echo unsafe content).
- No retries (avoids duplicate emails). No `console.log` of input or the key. No third-party SDK.
- Input constraints re-checked here (length limits in `00` §5.2) even though the UI checks them.
- Pure function of its inputs aside from the single `fetch`; easy to stub in QA.

### 3.4 Spam strategy (defence in depth, all free)

| Layer | Where | Notes |
|---|---|---|
| Honeypot `botcheck` | UI + adapter + provider | Web3Forms also recognises this field name natively |
| Time-trap (`elapsedMs < 3000`) | adapter | Beware autofill + paste: legitimate users can be fast; 3 s is the floor; QA tests a fast human |
| Provider spam filtering | provider | Enabled by default |
| Message-shape checks | adapter | e.g. reject if > 2 URLs when the message is < 200 chars; **log nothing**, just return `spam` |
| hCaptcha | optional, behind Q4 | Only if spam is observed. Changes: adds a third-party script (CSP, Lighthouse, privacy copy) — requires a Request to Frontend and Designer |
| Quota guard | runbook | If the free cap is hit, the form fails over to the mailto fallback automatically (`rate_limited` result); the owner is told in the runbook how to notice (provider email) |

### 3.5 CI wiring (I-4) — `deploy.yml`

Minimal diff, nothing else touched:

```yaml
      - run: pnpm build
        env:
          NEXT_PUBLIC_CONTACT_ENDPOINT: ${{ vars.CONTACT_ENDPOINT }}
          NEXT_PUBLIC_CONTACT_ACCESS_KEY: ${{ vars.CONTACT_ACCESS_KEY }}
```

- Do **not** set `BLOG_INCLUDE_DRAFTS` here, ever.
- If Q8 (scheduled posts) is "yes": add `schedule: - cron: "17 3 * * *"` (daily) to `on:`. Keep `workflow_dispatch`. Note GitHub disables scheduled workflows after 60 days of repo inactivity on public repos — a daily rebuild does not count as activity; document that a CMS commit resets it, and that the cron is best-effort. If Q8 is "no", do not add it.
- Keep the `deploy` job guarded to `master`. Keep `permissions` least-privilege (`contents: read`, `pages: write`, `id-token: write`) as it is.
- Pin newly added third-party actions by major version tag or SHA; add none unless needed.
- A failed build must still leave the previous deployment live (it does: deploy only runs after build success). Confirm and state so in the runbook.

### 3.6 Fallback / upgrade: Worker (not built in this phase)

If the free form tier proves inadequate: a Cloudflare Worker that (1) verifies a Turnstile token (free, unlimited verifications per Cloudflare docs; max 20 widgets), (2) checks `Origin`, (3) forwards via an email API. Secrets (`TURNSTILE_SECRET`, email API key) live in the Worker's secret store, never in GitHub vars. Only the `provider.ts` body and the form's hidden Turnstile widget change. Write this up as a 1-page design in the runbook but **do not build it** without a new decision.

## 4. Blog authoring (tasks I-1, I-2)

### 4.1 I-1 — Content scaffold

- `content/blog/README.md`: schema (copy of `00` §5.1), rules, "drafts are public".
- Two sample posts, **both `draft: true`**: `content/blog/hello-world.md` (exercises headings, lists, code, table, footnote, link, image) and `content/blog/edge-cases.md` (long title, long unbroken string, wide table, long code line, `<script>` text in Markdown to prove raw HTML is not rendered). They are fixtures for Frontend/QA and examples for the owner; they never reach production while `draft: true`. State in `README.md` that the owner may delete them once the first real post is published.
- `public/images/blog/hello-world/` with one small (< 100 KB) image used by the sample.

### 4.2 I-2 — CMS (`public/admin/`)

**Stack:** Sveltia CMS, loaded from a CDN with a **pinned exact version and SRI hash** (record both in the runbook with the date; this is the one place a third-party script runs on the site origin).

`public/admin/index.html` (static, no site JS, no mesh/grain, follows `prefers-color-scheme`):
- `<meta name="robots" content="noindex">`, `<title>Editor</title>`.
- Loads the CMS script (pinned, `integrity`, `crossorigin="anonymous"`).
- States per `docs/design/admin-entry.md`: `loading editor…`, `<noscript>`, and a script-load-failure message after a timeout (small inline script; no framework).
- Not linked from anywhere; not in the sitemap.

`public/admin/config.yml` (starting point — adjust per the verified CMS docs; unverified items are flagged **[verify]**):

```yaml
backend:
  name: github
  repo: sidwat/sidwat.github.io
  branch: master
  # No base_url / auth_endpoint: sign-in is by personal access token (PAT).
  # Add them only when a Worker-based OAuth flow is introduced (§6).
site_url: https://sidwat.github.io
display_url: https://sidwat.github.io
publish_mode: simple              # master is unprotected; commit = publish. editorial_workflow needs PR permission on the token
media_folder: public/images/blog
public_folder: /images/blog       # [verify per-entry subfolders: /images/blog/{{slug}}]
commit_messages:
  create: 'Blog: add "{{slug}}"'
  update: 'Blog: update "{{slug}}"'
  delete: 'Blog: delete "{{slug}}"'
collections:
  - name: blog
    label: Blog posts
    label_singular: Blog post
    folder: content/blog
    extension: md
    format: frontmatter
    create: true
    slug: "{{slug}}"              # filename = slug, no date prefix (stable URLs)
    identifier_field: title
    sortable_fields: [date, title, draft]
    fields:
      - { label: Draft (hidden from the site), name: draft, widget: boolean, default: true }
      - { label: Title, name: title, widget: string, pattern: ['^.{1,90}$', "1–90 characters"] }
      - { label: Publish date, name: date, widget: datetime, picker_utc: true, format: "YYYY-MM-DDTHH:mm:ss[Z]" }   # [verify output format keeps the Z]
      - { label: Last updated, name: updated, widget: datetime, picker_utc: true, format: "YYYY-MM-DDTHH:mm:ss[Z]", required: false }
      - { label: Summary, name: summary, widget: text, pattern: ['^.{1,200}$', "1–200 characters"], hint: "Shown in the list, search results and RSS" }
      - { label: Tags, name: tags, widget: list, required: false, default: [], hint: "lowercase-kebab-case" }
      - { label: Cover image, name: cover, widget: image, required: false }
      - { label: Cover alt text, name: coverAlt, widget: string, required: false, hint: "Required if there is a cover" }
      - { label: Body, name: body, widget: markdown, hint: "Raw HTML is not rendered. Use Markdown." }
```

Notes for the implementer:
- The CMS cannot validate "coverAlt required iff cover set" nor slug uniqueness; the **build** does (Frontend F-1). So a bad save is caught by a failed Action, not by the editor — document this clearly in the runbook (`troubleshooting.md`: "my change isn't live → check the Actions tab, read the red message, fix the field, save again").
- `gray-matter`/js-yaml parses an unquoted ISO timestamp as a JS `Date`. Frontend's loader is specified (`02` F-1) to accept both `Date` and string; verify with the sample posts that the CMS's written format round-trips.
- Tag format is enforced by the build, not the widget; keep the hint.
- Images: encourage ≤ 200 KB and ≤ 1600 px wide (the site does not optimise images; `next/image` is unoptimised under export). If the CMS offers upload-time resizing/WebP conversion **[verify]**, enable it.
- If the owner enables branch protection on `master` later, `simple` mode will start failing with a permissions error; the fix is `publish_mode: editorial_workflow` plus Pull-requests permission on the token. Note in the runbook.

### 4.3 Authentication (PAT)

Verified from Sveltia's docs (2026-10-17): token sign-in needs no OAuth app or Worker; fine-grained token needs *Contents: read and write* (plus *Pull requests: read and write* only for editorial workflow); PKCE sign-in is not available yet; the token is stored in the browser's local storage.

Runbook (`docs/runbooks/token-rotation.md`) must give the exact clicks to create: **fine-grained PAT, resource owner = owner, Only select repositories → `sidwat/sidwat.github.io`, Repository permissions: Contents = Read and write (nothing else), expiry ≤ 90 days**, and the calendar reminder to rotate it. Explain what to do if it leaks (revoke at github.com/settings/personal-access-tokens, then check `git log` for unexpected commits).

**Why this matters:** the token sits in `localStorage` on the origin `sidwat.github.io`. Any script that runs on that origin can read it — including pages from *other* repos if they are ever published as project pages under the same user site. Mitigations required: (a) token scoped to this one repo, contents-only; (b) no third-party scripts on any page of the site (the CDN script on `/admin/` is the only exception, pinned + SRI); (c) raw HTML disabled in posts (Frontend, so a post cannot inject script); (d) sign out/clear on shared machines.

### 4.4 Media and content hygiene

- Everything under `content/` and `public/` is public, forever, including git history. Runbook rule: no private images, no EXIF location data (strip before upload), no unpublished figures you can't have public.
- Add `content/blog/.gitattributes`? Not needed. Do add `public/images/blog/.gitkeep`.

## 5. Secrets handling

| Item | Secret? | Where it lives | Notes |
|---|---|---|---|
| Web3Forms access key | **No** (public by design; ends up in the JS bundle) | GitHub Actions *variable* `CONTACT_ACCESS_KEY` → `NEXT_PUBLIC_CONTACT_ACCESS_KEY` at build | Abuse limited by quota/captcha, not secrecy. Rotating it = new key + update variable + redeploy |
| Contact endpoint URL | No | variable `CONTACT_ENDPOINT` | |
| GitHub fine-grained PAT (CMS) | **Yes** | Owner's browser `localStorage` only. Never in the repo, in Actions, in a password-less note | Repo-scoped, contents-only, ≤ 90 days |
| Notion token (only if Q2 → Notion) | **Yes** | Actions *secret* `NOTION_TOKEN`; used only in the build step | Appears nowhere in `out/` — QA greps for it |
| Worker secrets (only if §3.6 / §6 happen) | **Yes** | Cloudflare secret store | Never in GitHub vars |
| `.env*` files | — | `.gitignore` already ignores `.env*`; add the single line `!.env.example` so the value-less example file can be committed | |

Rules: (1) nothing prefixed `NEXT_PUBLIC_` may be sensitive; (2) no secret is ever echoed in a workflow log (`::add-mask::` if constructed); (3) `git log -p` + `grep` for the key shapes before every merge (QA repeats on `out/`).

## 6. Login roadmap (goal G3)

Principle: static hosting means **identity must be delegated** to a service; the browser cannot hold a trustworthy "logged in" state without one, and **private content must never be in the public repo or the static bundle**.

| Stage | What | Trigger to start | How (all free-tier first; **re-verify limits then**) | Effort | Risks |
|---|---|---|---|---|---|
| **L0** (delivered by I-2) | Owner signs in to edit | — | Fine-grained PAT in the CMS. Later: PKCE when the CMS supports it → no token paste | done | Token in `localStorage` (§4.3) |
| **L0.5** | A second editor (co-author) | Another person must write | Deploy the CMS's Cloudflare-Worker OAuth authenticator + a GitHub OAuth App; add `base_url` to `config.yml`; invite as repo collaborator | ½ day | Collaborator has repo write — blast radius = whole site |
| **L1** | Visitor identity for comments | Owner wants comments | Zero-backend: GitHub-login comments on GitHub Discussions (e.g. giscus) — requires enabling Discussions (currently disabled). Loads a third-party script → CSP/privacy/Lighthouse impact; needs Designer + Frontend + Q-plan updates | 1 day | Third-party script; commenters need GitHub accounts |
| **L1b** | Email/subscriber list | Owner wants newsletter | Use an email service's hosted form (same adapter pattern as contact) — no login needed | ½ day | GDPR-style consent copy |
| **L2** | Members-only / private posts | Some posts must not be public | Needs a server-side check. Options: (a) Worker + BaaS auth (Supabase/Firebase/Auth0/Clerk free tiers) serving post HTML from a private store; (b) private second repo built into **encrypted** payloads decrypted client-side after sign-in (weak: anyone with the ciphertext can attack it offline); (c) move off GitHub Pages (e.g. an access-gating host) — **violates the stay-on-Pages constraint; needs the owner to waive it** | 3–5 days | Highest: new backend, secrets, uptime, data protection. Do not start without explicit scope |

Decision gate for L1/L2: owner answers Q5. Until then **build nothing**. The one rule v1 must obey so these stay possible: *the content schema and loader have a single seam (`lib/blog`)*, and no private material is committed.

## 7. Tasks

| ID | Deliverable | Depends on |
|---|---|---|
| I-1 | §4.1 content scaffold | TL-1 |
| I-2 | §4.2–4.4 CMS + docs of the three owner-visible states | I-1, D-3 |
| I-3 | §3 adapter (step 1 interface first), runbook `contact-form.md` | O-1 (inbox + key) |
| I-4 | §3.5 `deploy.yml` env (+ cron if Q8) | I-3, F-3 |
| I-5 | §8 runbooks | I-2 |

## 8. Runbooks (`docs/runbooks/`) — written for the owner, not for engineers

Plain language, numbered steps, screenshots of the three CMS states. Each runbook ends with "If this doesn't work".

1. `editing-posts.md` — sign in; write a post; add an image; save as draft; publish; edit; unpublish; delete; what "live in ~3 minutes" means and how to check the **Actions** tab; what happens on a failed build; the drafts-are-public warning in the first paragraph.
2. `contact-form.md` — how messages arrive; where the key lives; how to see the quota; what visitors see when it fails; how to swap provider.
3. `token-rotation.md` — create/rotate/revoke the PAT (§4.3), calendar reminder.
4. `troubleshooting.md` — CMS won't load (CDN/blocker), save fails (token expired/permission), build red (read the file+field message), post missing (draft / future date / cron), image too big, form not delivering.
5. `login-roadmap.md` — extract §6 if the owner wants a stand-alone page.

## 9. Acceptance criteria

1. `content/blog/` contains the README and the two sample posts, both `draft: true`; `pnpm build` (production) emits no post pages; `pnpm build:drafts` emits both.
2. `public/admin/index.html` is served at `https://sidwat.github.io/admin/` after merge, loads the pinned CMS script with an SRI hash that verifies, is `noindex`, is disallowed in `robots.txt` (Frontend) and absent from the sitemap.
3. In the CMS, as the owner, with a fine-grained PAT scoped to this repo: **create** a post, **save as draft** → commit appears on `master`, site unchanged; **publish** (Draft off) → deploy succeeds and the post is live and in RSS/sitemap within ~3 minutes; **edit** → updated; **delete** → gone. Tested once by the owner against the real repo after merge (QA's post-merge smoke test, `04` §10), and rehearsed beforehand in CMS local mode / a throwaway fork.
4. A post saved with a missing summary or `cover` without `coverAlt` makes the Action fail with a message naming file and field, while the previous site stays live.
5. The CMS commit message format matches `config.yml`; no file outside `content/blog/` and `public/images/blog/` is ever changed by the CMS.
6. `submitContact` meets every behaviour in §3.3 (verified by QA with a stubbed `fetch`: success, 429, validation, offline, timeout, malformed JSON, honeypot, fast submit).
7. A real message sent from the production build arrives in the chosen inbox with correct name/email/subject/body, and `Reply-To` (or equivalent) lets the owner answer the visitor.
8. `deploy.yml` change is limited to the `env` block (and the cron if Q8); `git diff` is shown in the PR. Variables exist in repo settings; **no secret** is read by the workflow in the default setup.
9. `out/` (production build) contains the contact key and endpoint and **no other** configuration value; QA's grep for tokens/`.env` content finds nothing.
10. The five runbooks exist, are accurate on a fresh walkthrough by someone who hasn't seen the system (QA performs a dry run), and the verified vendor facts from §3.2 are recorded with the date.
11. `.env.example` lists both variables with no values.
12. Nothing outside the files in §2 was modified.

## 10. Open questions for the owner

| # | Question |
|---|---|
| I-Q1 | Inbox for contact messages, and is a US/EU third-party form processor acceptable (Q3)? |
| I-Q2 | Is it acceptable that unpublished drafts are visible in the public repo (Q2)? If not, we implement the Notion appendix below instead of §4. |
| I-Q3 | Will anyone besides you ever edit posts (L0.5)? If yes the Worker-based OAuth moves into scope. |
| I-Q4 | Do you want a daily rebuild so future-dated posts publish themselves (Q8)? |
| I-Q5 | Will you enable branch protection on `master`? (If yes, we must use the CMS editorial workflow with PRs.) |
| I-Q6 | What does "login management" cover (Q5)? Comments? Private posts? Only your own editing? |
| I-Q7 | Do you accept a CDN-served CMS script (pinned + SRI) on your site origin, with the localStorage-token risk described in §4.3? Alternative: vendor the script into `public/admin/` and update it manually. |

---

## Appendix A — If the owner chooses Notion (Q2 = "drafts must stay private")

Replace §4 with the following; everything else (contact, secrets policy, login roadmap) is unchanged and no other spec changes because of the `lib/blog` seam.

- Notion database "Blog" with properties mapping 1:1 to `00` §5.1 (`Title`, `Slug`, `Date`, `Updated`, `Summary`, `Tags`, `Cover`, `Cover alt`, `Status` = Draft/Published). A page is public iff `Status = Published` and `Date ≤ now`.
- Notion internal integration shared with that database only; token stored as Actions **secret** `NOTION_TOKEN`; database id as a variable. Read-only capability.
- `lib/blog/load.ts` (Frontend) swaps to the Notion client; block → HTML/Markdown conversion; **download images at build time** into `out`-bound `public/images/blog/` because Notion's file URLs are short-lived **[verify]**; respect API rate limits.
- **Rebuild trigger** (the real cost): `schedule` cron every 15–60 min in `deploy.yml` and a manual `workflow_dispatch` button/runbook; "publish" = set Status then wait for the next run. Webhook relays need a hosted endpoint and a GitHub token — avoid.
- No `/admin/`, no PAT, no `public/admin/`. Runbook: "write in Notion, set Published, wait ≤ N minutes".
- New failure modes for QA: Notion outage ⇒ build fails ⇒ site stays on last good deploy (good); schema edit in Notion breaks the build; token expiry.
