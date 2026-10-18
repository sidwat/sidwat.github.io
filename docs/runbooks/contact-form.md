# Contact form: how it works and how to look after it

For: the site owner. Last checked: 2026-10-17 (state updated 2026-10-18 UTC).

The form at `/contact/` sends messages through **Web3Forms**, a free form-to-email service. Nothing is stored on the site itself. If the form ever fails, visitors are shown your email address instead, so no message is ever lost silently.

**Current state: half done.** The repository variables `CONTACT_ACCESS_KEY` and `CONTACT_ENDPOINT` exist (created 2026-10-18 UTC; step 3 below done). The deploy workflow passes them into the build (step 5, task I-4, waiting to be merged). The `/contact/` page goes live with the rest of this release. **Still to do after it is live:** the test message in step 6, including the check that Web3Forms accepts `sidwat.github.io` (§4 known risk), and the dashboard checks in §4. Until a build includes the key, the form shows its "couldn't send, email me instead" state with your `mailto:` link. That is the intended fallback.

---

## 1. Set it up (one time, about 30 minutes)

You do these steps yourself. Do not paste the key into a chat, an issue or a commit.

1. Go to <https://web3forms.com/>, enter the inbox that should receive messages (default decision Q3: **swatsa@ucsd.edu**) and create an access key. It arrives by email.
2. Before you rely on it, **test that `sidwat.github.io` is accepted** (see "Known risk" in §4). The easy way is step 6 below.
3. On GitHub, open the repository → **Settings** → **Secrets and variables** → **Actions** → **Variables** tab (not "Secrets") → **New repository variable**:
   - Name `CONTACT_ACCESS_KEY`, value = the access key from the email.
   - Name `CONTACT_ENDPOINT`, value = `https://api.web3forms.com/submit`.
4. Why *Variables* and not *Secrets*: the key is built into the site's JavaScript and every visitor's browser can read it. Web3Forms designs it to be public ("Access key is public... Think of it as an alias to your email", Web3Forms FAQ). Storing it as a secret would mislead whoever looks after this later. **Anything named `NEXT_PUBLIC_*` in this project ends up public. Never put a real secret in one.**
5. The deploy workflow (`.github/workflows/deploy.yml`, the `pnpm build` step) feeds those two variables into the build as `NEXT_PUBLIC_CONTACT_ACCESS_KEY` and `NEXT_PUBLIC_CONTACT_ENDPOINT`. A variable change only reaches the site with the next deploy. After creating or changing one, re-run it: **Actions** → **Deploy to GitHub Pages** → **Run workflow** on `master`. If either variable is missing, the build still succeeds and the form shows its fallback.
6. Open <https://sidwat.github.io/contact/>, send yourself a short message, and check that:
   - it arrives (look in Spam/Promotions the first time; drag it to the inbox and mark `notify@web3forms.com` as a safe sender);
   - the subject reads `Message from sidwat.github.io` (or `Message from sidwat.github.io: <their subject>`);
   - pressing **Reply** in your mail client addresses the visitor. Web3Forms uses the `email` field as the Reply-To by default.

For local testing, copy `.env.example` to `.env.local` and fill in the same two values. `.env.local` is git-ignored. Never commit it.

## 2. Day to day

- **How messages arrive:** as emails from Web3Forms (`notify+…@web3forms.com`), sender name `sidwat.github.io`. Reply to them as you would to any email.
- **Where the key lives:** only in the GitHub Actions variable `CONTACT_ACCESS_KEY`, and from there in the built site. It is not in any file in the repo.
- **How to see usage and quota:** sign in at <https://app.web3forms.com> with the same email. The free plan allows about **250 submissions a month** (see §4).
- **What visitors see when it fails:**

  | What happened | What the visitor sees |
  |---|---|
  | Not set up / bad key / service error | "Couldn't send", their text kept, plus your email link with the message pre-filled |
  | No connection or timeout (15 s) | "Couldn't reach the service", retry button, plus your email link |
  | Monthly cap or rate limit hit | "Too many messages right now", plus your email link |
  | Looks like a bot (hidden field filled, sent in under 3 s, or a short message with lots of links) | The spam behaviour the designer chose. Nothing is sent |

  The exact wording lives in `docs/design/copy.md`.

## 3. Spam

Several layers, all free:

1. A hidden `botcheck` field. Humans never see it, and if it is filled in nothing is sent. Web3Forms also checks this field itself.
2. A time trap. Anything submitted less than 3 seconds after the page loaded is treated as a bot.
3. A shape check. A message under 200 characters with more than two links is treated as spam.
4. Web3Forms's own server-side spam filter, which is always on.
5. **hCaptcha is not enabled** (decision Q4: only if spam shows up). It is free on Web3Forms, but it adds a third-party script and a puzzle for visitors. If spam becomes a problem, raise it with the Tech Lead. It needs design and frontend changes as well as a dashboard switch.

Because the key is public, someone *could* script submissions and use up the monthly cap. If that happens the form falls back to your email link automatically. See §5 for the next step up.

## 4. Vendor facts (checked 2026-10-17)

Sources: the official docs at <https://docs.web3forms.com> (read as Markdown via `docs.web3forms.com/llms.txt`). **The pricing page `web3forms.com/pricing` returned HTTP 403 to automated fetches**, so the plan figures come from a search-engine summary of that page. Confirm them on the dashboard when you sign up.

| Question | Answer | Status |
|---|---|---|
| Endpoint | `POST https://api.web3forms.com/submit`, JSON body, `access_key` required | **Verified** (API Reference) |
| Responses | `200 {success:true}`; `400 {success:false, body:{message}}`; `429` rate limit; `500` server error | **Verified** (API Reference) |
| Must the call come from the browser? | Yes. Server-side calls need a paid plan and IP allow-listing, otherwise `403` | **Verified** (API Reference, Troubleshooting) |
| Free monthly cap | 250 submissions/month, unlimited forms and domains | Partly verified (official pricing page via search summary only) |
| Restrict the key to `sidwat.github.io` | **No on the free plan.** "Restrict to Domain" is a Pro feature | **Verified** (Pro Features, Restrict to Domain) |
| Captcha on the free plan | hCaptcha: yes, zero-config. reCAPTCHA and Cloudflare Turnstile: **Pro only** | **Verified** (Captcha & SPAM, hCaptcha, Pro Features) |
| Honeypot `botcheck` | Supported, but the vendor now marks it "not recommended / deprecated" and suggests captcha | **Verified** (Honeypot page) |
| Reply-To | The visitor's `email` field becomes Reply-To by default | **Verified** (Custom Reply-To) |
| Retention | Vendor FAQ: "We do not store any form submissions"; server logs with personal data are deleted about every 2 months. Third-party reviews say the free dashboard keeps 30 days of history | Conflicting; **unverified**. Check the dashboard. The privacy line on `/contact/` ("the service may keep a copy for a short time", design question D-Q6) was written to fit every one of these answers. **If the dashboard shows submissions kept for much longer than about 2 months, or with no limit, tell the Designer**: the words "for a short time" must then go |
| Where data is processed | Servers in the US (US-East); the company is in India | **Verified** (FAQ) |
| Submission-count or quota alert email | Not documented | **Unverified**. Check the dashboard settings |
| Per-IP rate limit | Too many requests from one IP in a short time gets `429`, cleared automatically after about 1 hour | **Verified** (Troubleshooting) |
| **Known risk: free subdomains** | Troubleshooting says some free platform subdomains are blocked by default and "won't be approved" on the free plan (paid plan or custom domain needed). The vendor's own GitHub Pages guide says `username.github.io` "will work absolutely fine" | **Conflicting; unverified.** Test in §1 step 6. If it is blocked, contact Web3Forms support or switch to Formspree (§6) |

Re-check this table whenever you rotate the key, and at least once a year.

## 5. Changing or rotating the key

1. Create a new access key on Web3Forms (same inbox, or a new one).
2. Update the `CONTACT_ACCESS_KEY` variable in GitHub (§1 step 3).
3. Re-run the deploy (§1 step 5) and send a test message.
4. Delete the old key on the Web3Forms dashboard.

To change the inbox, create a new key for the new address. A key is tied to the address it was created for.

## 6. Swapping provider

Only one file knows about Web3Forms: `lib/contact/provider.ts`. To switch (for example to Formspree, whose free plan is reported at about 50 messages/month, unverified):

1. Ask the Integrations engineer to rewrite the body of `submitContact` for the new service. Its inputs, results and the form itself stay the same.
2. Change `CONTACT_ENDPOINT` (and `CONTACT_ACCESS_KEY` if the new service uses a different ID).
3. Deploy and test as in §1 step 6.

**Upgrade path if spam or the cap become a problem (not built):** a small Cloudflare Worker that checks a Cloudflare Turnstile token (free), checks the request comes from `https://sidwat.github.io`, then forwards the message through an email API. The Turnstile secret and email API key would live in Cloudflare's secret store, never in GitHub variables or the repo. Only `provider.ts` and a hidden Turnstile widget on the form change. This needs a new decision before anyone builds it.

## 7. For engineers: adapter behaviour

`submitContact(input)` in `lib/contact/provider.ts` never throws and makes at most one request, with no retries.

1. A filled-in honeypot, `elapsedMs < 3000`, or a non-numeric `elapsedMs` returns `spam`. No request.
2. Fields are trimmed. Control characters are stripped and CR/LF in name, email and subject become spaces (header-injection guard). Length and email checks follow `00` §5.2 and fail with `validation` plus a field key (`contact.error.<field>.invalid`). No request.
3. A message under 200 characters with more than two URLs returns `spam`. No request.
4. A missing endpoint or key, or an endpoint that is not `https://`, returns `provider` with key `contact.error.not_configured`. No request. `isContactConfigured()` lets the UI show this up front.
5. Then `POST` JSON with exactly `access_key, name, email, subject, message, botcheck, from_name`, `credentials: "omit"`, and one 15 s `AbortController` budget for the request and the body.
6. Result mapping:
   - `2xx` with `success:true` gives `ok`.
   - `429`, or provider text mentioning a quota or limit, gives `rate_limited`.
   - Provider text about the access key or "not allowed/blocked" gives `provider`.
   - `400`/`422` give `validation` (`contact.error.validation`).
   - A rejected fetch or an abort gives `network`.
   - Anything else, including malformed JSON, gives `provider`.
7. `message` is always one of `CONTACT_MESSAGE_KEYS`, never provider text.

Unverified detail: the vendor's honeypot example is a checkbox. The adapter always sends `botcheck: ""` (an empty string, which counts as false). If Web3Forms ever flags empty-string submissions, switch it to `false`.

Rehearsed on 2026-10-17 with a stubbed `fetch` (no real submissions). All of these behaved as listed: missing config, success, no subject, 429, quota body, 400 validation, 400 bad key, 500, malformed JSON, `200 success:false`, offline, 15 s timeout, honeypot, fast submit, link spam, every length limit, CRLF injection.

## If this doesn't work

- **Message not arriving:** check Spam/Promotions; check the Web3Forms dashboard for the submission; check the GitHub variable names are exactly `CONTACT_ACCESS_KEY` / `CONTACT_ENDPOINT` and that you redeployed after setting them.
- **Every send says "couldn't send":** the build has no key (open the latest **Actions** run and check it ran after you set the variables), or Web3Forms is blocking `github.io` (§4 known risk). Contact Web3Forms support with the domain `sidwat.github.io`.
- **"Too many messages":** the monthly cap was hit, or one IP was rate-limited (clears after about 1 hour). Visitors can still email you directly. Check the dashboard for bot traffic and consider hCaptcha (§3).
- Still stuck: open an issue in the repo describing what you saw. Never include the key.
