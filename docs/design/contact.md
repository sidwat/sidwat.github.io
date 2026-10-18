# Contact — `/contact/`, plus the navigation and footer study

Task D-2 (contact) and D-3 (nav/footer study, §8 and §9 of this file) · Spec: [01-design-spec.md](../01-design-spec.md) §4.3, §5 · Tokens and contrast: [tokens.md](tokens.md) · Strings: [copy.md](copy.md) (`contact.*`, `nav.*`, `footer.*`)

**Where the nav study lives: this file, §8 (nav) and §9 (footer), with the rendered study in [assets/nav-study.html](assets/nav-study.html) / `assets/nav-study.png`.**

Hi-fi, both grounds (one field in error with the summary, a submit-failure panel, the 8-second status line, and the success state): [assets/contact-ink.html](assets/contact-ink.html), [assets/contact-studio.html](assets/contact-studio.html), exported as `assets/contact-{ink,studio}-{1280,375}.png`. The HTML is responsive.

---

## 1. Decisions (answers to the open design questions)

| Id | Question | Recommendation | Why |
|---|---|---|---|
| **D-Q1** | No-JS: native form POST with a redirect page, or `mailto:` fallback? | **`mailto:` fallback inside `<noscript>`; no native POST.** | (a) The honeypot and time-trap are JavaScript; a native POST would bypass both, so the no-JS path would be the spam path. (b) A native POST to the provider lands on the vendor's page or needs a `/contact/thanks/` page plus redirect configuration, a second page to design, build and test. (c) The no-JS audience is tiny and every one of them has a mail client or can copy an address. (d) The form is a client component, so its markup is present in the static HTML; it must therefore be inert until it hydrates (see §3.4), or a no-JS submit would send a GET to the same page and put the message in the URL. Revisit only if real traffic shows no-JS visitors or the provider offers a same-origin redirect without JS. |
| **Spam rejection** | What does a rejected message look like? | **Two behaviours, split on cause.** (1) Honeypot filled → show the **success state**, send nothing, make no network call. (2) Honeypot empty but the adapter returned `spam` (time-trap under 3 s, or message-shape filter) → show the **failure panel** with `contact.fail.spam`, preserve the text, keep the Try again button and the mailto link. | A filled honeypot field is invisible to humans and filled only by bots; a success screen gives the bot no signal to adapt to and costs nothing. The time-trap and shape filters can trip a real person (fast autofill plus paste plus Enter; a short note with links), and silently dropping a real person's message is the worst outcome here, so they get an honest, recoverable error. The UI can tell the cases apart without any contract change: it owns the honeypot input, so it knows whether it was filled. QA must test both and know the fake success is intentional (copy.md says "do not fix"). |
| **D-Q6** | Is "not stored on the site" accurate for the provider (30-day history on the free tier)? | **No. Do not use that wording.** Use `contact.consent`: "Messages go through a third-party form service to my inbox, and the service may keep a copy for a short time. I use what you send only to reply to you." | It is true whether the provider keeps history or not, names no vendor (swappable adapter), and states no number of days that could go stale. **Integrations must confirm actual retention and that the wording is not misleading (task I-3) before it ships**; if the provider turns out to keep copies indefinitely, the sentence needs "for a while" replaced by the real period. |
| Q10 | Contact in the nav? | **Yes**, as the seventh item (Home is the brand link; six visible links), and in the footer. | Discoverability is the whole point of G1; the cost is a third nav row at 320px (§8). |

## 2. Anatomy

```
PageHeader (unchanged)
  label  Contact
  title  Get in touch
  intro  Write to me about anything: research, a collaboration, a correction, a question about a post.
  ──────────────────────────────
form block (.reading veil, max-width 36rem, mt-12)
  [failure panel | error summary]      (only when relevant; above the first field)
  Name          input   required
  Email         input   required
  Subject       input   (optional)
  Message       textarea   required, counter only past 4,000
  consent line  small muted text
  Send message  primary button
  status line   (role=status; only while submitting)
Or email swatsa@ucsd.edu                  (always visible; plain mailto link)
<noscript>    replaces the form block: "The contact form needs JavaScript to run. You can still email me at …"
```

Not drawn, by design: the `botcheck` honeypot (see §3.5).

## 3. Specification

### 3.1 Fields

| Field | Label | Control | Attributes |
|---|---|---|---|
| Name | `contact.field.name.label` | `input[type=text]` | `required`, `autocomplete="name"`, `maxlength=100`, `enterkeyhint="next"` |
| Email | `...email.label` | `input[type=email]` | `required`, `autocomplete="email"`, `inputmode="email"`, `spellcheck="false"`, `maxlength=254`, `enterkeyhint="next"` |
| Subject | `...subject.label` + muted `(optional)` | `input[type=text]` | `autocomplete="off"`, `maxlength=150`, `enterkeyhint="next"` |
| Message | `...message.label` | `textarea` (min-height 9rem ≈ 6 rows, grows via `field-sizing: content` where supported, `resize: vertical`) | `required`, `autocomplete="off"`, `minlength` not set natively (own message), `maxlength=5000` |

- Labels are always visible above the control; there are **no placeholders**. All styling is in [tokens.md](tokens.md) §4.1 to §4.6: control borders are `--muted`, height 3rem, font 16px.
- `noValidate` on the form with own messages; native `required`/`type` attributes stay for semantics.
- Required fields carry no asterisk; the one optional field says `(optional)`.
- **Character counter:** hidden until the message passes 4,000 characters (80%), then `4,102 / 5,000` in mono `--muted` right-aligned under the textarea (`aria-live="off"`; it is not read per keystroke). Polite `role="status"` announcements fire once each at 4,000 (`1,000 characters left`), 4,750 (`250 characters left`) and 5,000 (`Character limit reached`).

### 3.2 Validation (copy IDs under `contact.error.*`)

- **When:** on submit, and per field on blur **after** that field has been touched; an error clears as soon as the value becomes valid (on input). Never validate on first focus or on every keystroke of an untouched field.
- **Inline error** (see tokens §4.3): under the field, on the page ground (never in a `--surface` box: studio `--cr` on `--surface` is 4.16:1), glyph `!` + visually hidden `Error:` + message, border 2px `--cr`, `aria-invalid="true"`, `aria-describedby` → the message.
- **Messages tell the fix**, not the fault: "Enter an email like name@example.com", "Write at least 10 characters."
- **Error summary** on a failed submit, above the first field: heading (`Fix 1 field before sending` / `Fix {n} fields before sending`), then one in-page link per problem, `Email: Enter an email like name@example.com`, each jumping to its field. It has `tabindex="-1"` and **receives focus**; clicking a link focuses the field. It is a `role="group"` labelled by its heading, **not** `role="alert"` (see §6).

### 3.3 Submit

- Button: `Send message` (primary, tokens §4.5), 3rem tall, full width below `sm`.
- **Submitting:** label `Sending…`, `aria-disabled="true"` and a click guard (not the `disabled` attribute: a disabled button that has focus drops focus to the body in some browsers, which strands keyboard and screen-reader users mid-submit), `aria-busy="true"` on the form, all fields `readOnly` (not `disabled`, so text stays selectable and readable), `cursor: progress`. Double submit is impossible: the handler returns early while busy. A visually hidden polite status says `Sending your message`.
- **Slow (> 8 s):** a visible, polite status line under the button: `Still sending… this is taking longer than usual.` No spinner (nothing new animates).
- **Timeout** is the adapter's 15 s; the result then arrives as `network`.

### 3.4 No JavaScript and pre-hydration

- The server HTML contains the form (it is a client component) **and** a `<noscript>` block. Without JS: the `<noscript>` shows `contact.noscript` with the mailto link, and a `<noscript><style>` rule hides the form block (`.js-only{display:none}`). The mailto line `contact.alt` stays visible in all cases.
- Before hydration (slow phone): the submit button is rendered `disabled` in the server HTML and enabled on mount, so Enter in a field does nothing instead of a GET submit that would leak the message into the URL. It looks identical to the idle button (a disabled attribute with the same styling), because the window is a fraction of a second.

### 3.5 Honeypot (do not "fix" it)

A text input named `botcheck`, `tabindex="-1"`, `autocomplete="off"`, wrapped in an element with `aria-hidden="true"` and positioned off-screen (`position:absolute; left:-10000px; width:1px; height:1px; overflow:hidden`). **Not** `display:none` or `visibility:hidden` (bots skip those), and it has **no label and no visible text**. Do not add a label "for accessibility": it is removed from the accessibility tree on purpose.

### 3.6 Failure states (all preserve what the visitor typed)

A failure panel appears above the form (same pattern as the summary: 2px `--cr` left rule on the ground, heading in `--luma`, `tabindex="-1"`, **receives focus**), the Send button label becomes `Try again`, and the mailto link is in the panel. Heading is always `Message not sent`.

| Result | Body copy ID | Notes |
|---|---|---|
| `network` | `contact.fail.network` | Differs from provider: the remedy is "check your connection" |
| `provider`, and **not configured** (build without the endpoint key) | `contact.fail.provider` | Never a blank page; same text for both |
| `rate_limited` | `contact.fail.rate` | Distinct copy; the mailto link is the real action |
| `spam` with honeypot empty | `contact.fail.spam` | See §1 and §7 |
| `validation` (provider-side) | `contact.fail.validation` | Generic: the provider's own text is never shown |
| `spam` with honeypot filled | **success state** | Intentional; no network call |

**mailto fallback link** (`contact.fail.mailto`, `data-testid="contact-fallback"`): `mailto:{email}?subject={encodeURIComponent(subject || contact.mailto.subject)}&body={encodeURIComponent(message)}`. If the encoded body exceeds about 1,800 characters (mail clients and some browsers truncate or refuse long `mailto:` URLs) omit the `body` and show `contact.fail.mailto.toolong` beside the link: the text is still in the box.

### 3.7 Success

The form block is replaced in place by: `h2` `Message sent`, sentence `Thanks — I read everything and reply from {email}.`, and two secondary buttons: `Send another` and `Back to home` (a link styled as a button). The container is `tabindex="-1"`, `role="group"`, `aria-labelledby` the heading, `aria-describedby` the sentence, and **receives focus**, so the screen reader says "Message sent, group, Thanks — …" once. It is not also a live region. The visitor's text is **not echoed**. `Send another` resets the form, resets `elapsedMs`, and moves focus to Name. `data-testid="contact-success"`.

## 4. Wireframes

### 4.1 Idle, 1280 (frame 1024, form 36rem, left-aligned)

```
   CONTACT
   Get in touch
   Write to me about anything: research, a collaboration, a
   correction, a question about a post.
   ─────────────────────────────────────────────────────────────────
   NAME
   ┌───────────────────────────────────────┐
   │                                       │   3rem, 1px --muted, fill --surface
   └───────────────────────────────────────┘
   EMAIL
   ┌───────────────────────────────────────┐
   └───────────────────────────────────────┘
   SUBJECT (optional)
   ┌───────────────────────────────────────┐
   └───────────────────────────────────────┘
   MESSAGE
   ┌───────────────────────────────────────┐
   │                                       │   9rem min
   │                                       │
   └───────────────────────────────────────┘
   Messages go through a third-party form service to my inbox, and the
   service may keep a copy for a short time. I use what you send only to
   reply to you.
   [ Send message ]
   Or email swatsa@ucsd.edu
```

At 768 the form is the same 36rem column; at 375/320 it is full width (327/272px) with the button full width.

### 4.2 Field error with summary

```
   │ Fix 1 field before sending                     <- 2px --cr rule, luma heading
   │ Email: Enter an email like name@example.com    <- link to the field
   NAME   [ Ada Lovelace            ]
   EMAIL  [ ada@example             ]   <- 2px --cr border
   [!] Enter an email like name@example.com        <- --cr on ground, glyph + text
```

### 4.3 Failure panel

```
   │ Message not sent
   │ Could not reach the message service. Your message is still here: check
   │ your connection and press Try again, or email me directly.
   │ Email me instead →
   NAME … (all fields filled)
   [ Try again ]
   Or email swatsa@ucsd.edu
```

### 4.4 Submitting

```
   [ Sending… ]            <- aria-disabled, fields read-only
   Still sending… this is taking longer than usual.     <- after 8 s only
```

### 4.5 Success

```
   ─────────────────────────────────────
   Message sent
   Thanks — I read everything and reply from swatsa@ucsd.edu.
   [ Send another ]  [ Back to home ]
   ─────────────────────────────────────
```

### 4.6 No JavaScript

```
   The contact form needs JavaScript to run. You can still email me at swatsa@ucsd.edu.
```

## 5. State matrix

| State | Where shown | Focus goes to | Announced by |
|---|---|---|---|
| Idle | §4.1 | (page order) | |
| Field error (blur) | inline | stays | `aria-describedby` on next focus |
| Field error (submit) | summary + inline | the summary | focus move |
| Submitting | button + status | stays on button | `role=status` "Sending your message" |
| Slow | status line | stays | `role=status` |
| Network, provider, not configured, rate-limited, spam-empty-honeypot, validation | failure panel | the panel heading | focus move |
| Spam (honeypot filled) | success | the success container | focus move |
| Success | §4.5 | the success container | focus move |
| No JS | §4.6 | n/a | static text |

## 6. Focus and live-region policy

- Anything that replaces or inserts a block the visitor must act on (summary, failure panel, success) **receives focus** and is *not* a live region. One mechanism, announced once.
- Only transient text that appears without moving focus uses `role="status"` (polite): the sending status, the slow message, the counter thresholds.
- `role="alert"` is not used on this page, so nothing is announced twice (spec §8.5).
- Tab order: Name, Email, Subject, Message, Send, mailto link. The honeypot is skipped (`tabindex=-1`, `aria-hidden`).
- Focus ring visible on every control (tokens §4.2, §4.13).

## 7. Spam handling in the UI (detail)

```
result = await submitContact({... honeypot, elapsedMs})
if (!result.ok && result.code === "spam" && honeypot !== "") -> render success (no further call)
else if (!result.ok && result.code === "spam")               -> failure panel contact.fail.spam
```
The adapter already returns `spam` without a network call when the honeypot is filled or `elapsedMs < 3000`. A human who pressed Send within 3 s sees the failure panel and the second press (more than 3 s later) goes through. QA cases: honeypot filled (success, zero requests), fast human (panel, then success), message with 3 links (panel).

## 8. Navigation study (D-3)

### 8.1 Facts

- `nav` in `lib/site.ts` has 7 entries after this work: Home plus six visible links (Experience, Publications, Projects, Teaching, **Blog**, **Contact**). Home is the brand link and is filtered out of the bar. "7 items" in the spec therefore means brand + six links.
- All nav type is IBM Plex Mono (advance 0.6em): `.eyebrow` 11px with 0.18em tracking is 8.58px per character, so label widths are exact: `EXPERIENCE` 86px, `PUBLICATIONS` 103px, `PROJECTS` 69px, `TEACHING` 69px, `BLOG` 34px, `CONTACT` 60px; 24px gaps. Brand 126px; toggle ≈78px.
- One-row fit needs about 808px of content width (856px viewport). Single row from **`lg` (1024px)**, deliberately a little late for slack against font fallback widths.

### 8.2 Problems found with the shipped bar once it has to hold 6 links

1. **Hit area:** links are 11px type with no padding, about 17px tall: below the 24px WCAG 2.5.8 floor on their own and far from the 44px design target.
2. **Wrap:** below 856px the toggle drops to its own line; below ~353px the links need three rows. With 44px rows that is a **193px** header at 320, on a sticky bar.
3. **Active state:** colour only (`--luma` vs `--muted`): 3.45:1 on ink, **2.34:1 on studio**, below 3:1, so the active page is not distinguishable without colour (WCAG 1.4.1).

### 8.3 Recommended layout (R1): keep the wrap, no hamburger

| Rule | Value |
|---|---|
| Row 1 (below `lg`) | brand left, theme toggle right (`order` swaps the toggle ahead of the links visually; DOM order stays brand, nav, toggle; the visual swap below `lg` is acceptable: focus order stays logical) |
| Row 2 (below `lg`) | the links, `flex-wrap`, 24px column gap |
| `lg` and up | one row: brand, links, toggle right (today's layout) |
| Hit height | 28px (`py-1.5`) for fine pointers; 44px under `(pointer: coarse)` for links, brand and toggle |
| Sticky | `sticky` from `lg`; **static below `lg`**. A 3-row 44px bar would pin 193px (34% of a 568px screen, most of a 375px-tall landscape one) |
| Active | `--luma` **plus** a 1px `--cb` underline, `text-underline-offset: 6px` (non-colour cue; matches `aria-current`) |
| `aria-current` | `pathname.startsWith(item.href)`: `/blog/<slug>/` keeps `Blog` lit, `/contact/` lights `Contact` |
| Touch | wrap stays (no overflow scroll, no hamburger) |

Measured in headless Chrome from [assets/nav-study.html](assets/nav-study.html) (touch metrics below 1024, fine-pointer from 1024):

| Width | Header height | Link rows | Footer height | Layout |
|---|---|---|---|---|
| 320 | 193px | 3 (Experience Publications / Projects Teaching Blog / Contact) | 392px | brand + toggle, 3 link rows |
| 375 | 149px | 2 (Experience Publications Projects / Teaching Blog Contact) | 392px | brand + toggle, 2 rows |
| 768 | 105px | 1 | 243px | brand + toggle, then all six links on one row |
| 1024 | 53px | single row | 211px | one row, sticky |
| 1280 | 53px | single row | 211px | one row, sticky (frame is 1024 wide, centred) |

Both grounds were rendered; layout is identical, only token values differ. At 1920 the frame stays 1024 wide and centred. Landscape: 375×667 behaves as the 375 row (static bar); 768×1024 behaves as the 1024 row.

### 8.4 Alternative (R2): disclosure menu below `sm`

At 320/375 the bar becomes brand + a `Menu` button (`aria-expanded`, 44px), the six links appear as a two-column list of 44px rows with the theme toggle at the bottom, and the bar is **105px closed** (237px open at 320). It would be sticky-able. **Not recommended**: it adds a client state, an extra tap to reach any page, and focus management (Esc, return focus), to save about 90px at the narrowest width. Choose it only if the owner dislikes a 193px static header at 320. Rendered in the second block of the study.

### 8.5 Contact as a right-hand button (considered, rejected)

Pinning Contact as a bordered button beside the toggle saves one link of width but does not remove a row at 768 and below (brand + five links + button + toggle still exceed 720px), splits one nav list into two groups, and has to appear separately in the 404 list. Plain seventh link wins on simplicity and consistent active state.

### 8.6 404

`app/not-found.tsx` renders `nav` automatically, so the list becomes Home, Experience, Publications, Projects, Teaching, Blog, Contact. Confirmed; no change needed.

## 9. Footer

The "Get in touch" column keeps the mailto and adds `Write a message →` (`footer.write`) directly beneath it, in `--luma` with the accent underline (tokens §4.8). Both links are 44px tall under coarse pointers and 28px otherwise. Below `sm` the column is left-aligned (it already drops under the socials, where a right-aligned single block looked adrift in the study); from `sm` it is right-aligned as today. Result is in [assets/nav-study.html](assets/nav-study.html) next to each width.

## 10. Contrast used by this page

From [tokens.md](tokens.md) §2.

| Element | Pair | Ink | Studio |
|---|---|---|---|
| Labels, typed text, summary heading and links | `--luma` / `--ink` or `--surface` | 16.56 / 15.56 | 12.56 / 11.18 |
| Intro, consent, `(optional)`, counter, status line | `--muted` / `--ink` | 4.81 | 5.37 |
| Inline error text, glyph, panel rule | `--cr` / `--ink` | 6.77 | 4.67 |
| Control border at rest (3:1 needed) | `--muted` vs ground / vs fill | 4.81 / 4.52 | 5.37 / 4.79 |
| Error border (3:1) | `--cr` vs ground / vs fill | 6.77 / 6.36 | 4.67 / 4.16 |
| Primary button label / boundary | `--ink` on `--cb` / `--cb` vs ground | 5.38 / 5.38 | 5.60 / 5.60 |
| Secondary button border | `--muted` vs ground | 4.81 | 5.37 |
| Focus ring | `--cb` vs ground / fill | 5.38 / 5.06 | 5.60 / 4.99 |
| Veil worst case on a lit strand: luma / muted / cr | | 15.37 / 4.46 / 6.29 | 11.09 / 4.75 / 4.12 |

The form uses the 90% reading veil ([tokens.md](tokens.md) §3), which also keeps the error text legible on studio under a lit mesh strand.

## 11. Responsive

| Width | Notes |
|---|---|
| 320 | Gutter 24px; form 272px; buttons full width; header 193px static |
| 375 portrait | form 327px; header 149px |
| 375 landscape | as 375; static header; the form scrolls normally |
| 768 | form 36rem left-aligned; header 105px static |
| 1024, 1280, 1920 | form 36rem left-aligned in the frame; sticky one-row bar from 1024 |

Fields are ≥16px (no iOS zoom). Everything reflows at 400% zoom; no fixed heights on text. The textarea is the only control that grows.

## 12. Implementation notes for Frontend

| Component | Reuses unchanged | New / notes |
|---|---|---|
| `app/contact/page.tsx` | `PageHeader` | renders `<ContactForm/>`, the `contact.alt` line and the `<noscript>` block |
| `ContactForm` (client) | | owns field state, touched, busy, result; renders summary / panel / success |
| `FieldError` | | glyph + sr-only prefix + message; wires `aria-describedby` |
| `ErrorSummary`, `FailurePanel` | | focusable `tabindex=-1` groups |
| `Field` (label + control + error) | | one component for all four fields |
| Styles | tokens only | inside `/* ---- contact form ---- */`: field, button, panel, veil, autofill rule |
| `Nav.tsx` | `ThemeToggle` unchanged | add `order` classes, hit-height classes, `lg:sticky`, active underline; keep `aria-current` logic |
| `Footer.tsx` | | add the `footer.write` link; left-align below `sm` |
| `lib/site.ts` | | add Contact; rename `Blogs` to `Blog` (D-Q2) |
| `app/not-found.tsx` | **unchanged** | |

Test hooks from 02 §3 are kept: `contact-form`, `contact-error-summary`, `contact-submit`, `contact-success`, `contact-fallback`.
