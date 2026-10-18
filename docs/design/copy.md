# Copy deck

Tasks D-1 to D-4 · Spec: [01-design-spec.md](../01-design-spec.md) §10.2 · Single source of every visitor-visible string for `/blog/`, `/blog/<slug>/`, `/contact/` and `/admin/`, plus the nav/footer strings they change.

**Rules**

1. Frontend's `lib/blog/copy.ts` and `components/contact/copy.ts` are generated 1:1 from the IDs below (02 §F-3). No inline user-facing literals in JSX. The `admin.*` strings are copied into `public/admin/index.html` by Integrations.
2. `{placeholders}` are filled at render time. `{email}` is `site.email` (`swatsa@ucsd.edu` under the Q3 default). `{name}` is `site.name`.
3. Voice: terse, technical, first person where a person speaks; no exclamation marks, no emoji. Arrows `→`, `←` and glyph `!` are decorative and `aria-hidden`.
4. Decorative or generated text that is not a string constant is marked "Lives in CSS".
5. Strings that were suggested by the spec are kept verbatim where they pass this deck's rules; the few deliberate deviations are: the post-end link says "Write a message" rather than "Reply by email" (it opens the form, and it matches the footer link); the empty state's action is "Write a message" rather than "Write to me" (same destination, same name everywhere).
6. Not designed because there is nothing to say: the honeypot field (no label, `aria-hidden`), loading/skeleton states for `/blog/` and `/blog/<slug>/` (pre-rendered), and the CMS's own UI.
7. The two live-region announcements on the contact form (`contact.status.*`, `contact.counter.status.*`) are the only strings with `role="status"`. Validation and failure messages are announced by moving focus, not by live regions (see [contact.md](contact.md) §6).


## Shell: navigation and footer

Labels come from `lib/site.ts`; unchanged strings are listed because the wireframes show them and QA asserts them.

| ID | String | Where and when | Notes |
|---|---|---|---|
| `nav.aria` | `Sections` | `aria-label` of the header `<nav>` | Unchanged |
| `nav.home` | `Home` | 404 link list only (filtered out of the bar) | Unchanged |
| `nav.experience` | `Experience` | Nav link | Unchanged |
| `nav.publications` | `Publications` | Nav link | Unchanged |
| `nav.projects` | `Projects` | Nav link | Unchanged |
| `nav.teaching` | `Teaching` | Nav link | Unchanged |
| `nav.blog` | `Blog` | Nav link, 404 list, sitemap label | **Changed from `Blogs`** (D-Q2) |
| `nav.contact` | `Contact` | Nav link, 404 list | **New** (Q10) |
| `footer.elsewhere` | `Elsewhere` | Footer column label | Unchanged |
| `footer.touch` | `Get in touch` | Footer column label | Unchanged |
| `footer.write` | `Write a message` | Footer link to `/contact/`; the `→` after it is a decorative `aria-hidden` glyph | **New** |
| `footer.copyright` | `© {year} {name}` | Footer | Unchanged |

## Blog index (`/blog/`)

| ID | String | Where and when | Notes |
|---|---|---|---|
| `blog.meta.title` | `Blog` | `<title>` base (template appends the site name) |  |
| `blog.meta.description` | `Notes on compression, vision, and the occasional detour.` | `<meta name="description">` | Same text as the intro |
| `blog.index.label` | `Writing` | PageHeader eyebrow | Unchanged |
| `blog.index.title` | `Blog` | PageHeader `h1` | **Changed from `Blogs`** |
| `blog.index.intro` | `Notes on compression, vision, and the occasional detour.` | PageHeader intro | Unchanged |
| `blog.index.year` | `{year}` | Year `h2` eyebrow, e.g. `2026` |  |
| `blog.readingtime` | `{n} min read` | Index row meta and post meta; `n` is an integer >= 1 | Plain text, not `<time>` |
| `blog.date.format` | `2 Nov 2026` | Format of every visible date: `Intl.DateTimeFormat("en-GB",{timeZone:"UTC",day:"numeric",month:"short",year:"numeric"})` | `en-GB` renders September as "Sept" |
| `blog.index.empty.label` | `No entries` | Empty-state eyebrow (10rem column) |  |
| `blog.index.empty.body` | `Nothing published yet. The first post is in progress.` | Empty state, `.prose-body` | `data-testid="blog-empty"` |
| `blog.index.empty.cta` | `Write a message` | Empty-state link to `/contact/` (arrow `→` decorative) | Same text as the footer and post-end links |
| `blog.index.rss.label` | `Subscribe` | End-of-list row eyebrow (hidden when empty) |  |
| `blog.index.rss.link` | `RSS feed` | End-of-list link to `/blog/feed.xml` |  |

## Draft and scheduled markers (dev and QA builds only)

Never rendered in production. The glyph `!` is `aria-hidden`; the words carry the meaning.

| ID | String | Where and when | Notes |
|---|---|---|---|
| `blog.draft.chip.draft` | `Draft` | Index row marker, before the date | `data-testid="post-draft-badge"` |
| `blog.draft.chip.scheduled` | `Scheduled` | Index row marker when `draft:false` and the date is in the future |  |
| `blog.draft.chip.both` | `Draft · Scheduled` | Index row marker when both apply |  |
| `blog.draft.banner.draft` | `Draft — not published` | Post-page banner |  |
| `blog.draft.banner.scheduled` | `Scheduled — not published until {date}` | Post-page banner for a future-dated, non-draft post |  |

## Blog post (`/blog/<slug>/`)

| ID | String | Where and when | Notes |
|---|---|---|---|
| `blog.post.back` | `Blog` | Back link text (rendered `← Blog`; arrow `aria-hidden`) |  |
| `blog.post.updated` | `Updated {date}` | Meta row, second date, when `updated` is set |  |
| `blog.post.tags.label` | `Tags` | Eyebrow label and `aria-label` of the tag list |  |
| `blog.post.reply.label` | `Reply` | End-of-post eyebrow |  |
| `blog.post.reply.body` | `Found a mistake, or want to discuss this?` | End-of-post sentence |  |
| `blog.post.reply.cta` | `Write a message` | Link to `/contact/` (arrow decorative) |  |
| `blog.post.nav.aria` | `More posts` | `aria-label` of the older/newer `<nav>` |  |
| `blog.post.nav.older` | `Older` | Eyebrow inside the older-post link | Accessible name is "Older: <title>" |
| `blog.post.nav.newer` | `Newer` | Eyebrow inside the newer-post link | Accessible name is "Newer: <title>" |
| `blog.post.anchor.label` | `Link to section: {heading}` | `aria-label` of the heading `#` anchor |  |
| `blog.post.code.aria` | `Code, {language}` | `aria-label` of a fenced code block region |  |
| `blog.post.code.aria.plain` | `Code` | `aria-label` when the language is unknown |  |
| `blog.post.table.aria` | `Table` | `aria-label` of the table scroll region |  |
| `blog.post.footnotes.heading` | `Footnotes` | Visually hidden `h2` of the footnote section | `sr-only` |
| `blog.post.footnote.backref` | `Back to reference {n}` | `aria-label` of `↩` | Plugin default is acceptable |
| `blog.post.figure.prefix` | `Fig. {n} —` | Generated by CSS before each figure caption | Lives in CSS `content`, not in JSX |

## Contact (`/contact/`)

| ID | String | Where and when | Notes |
|---|---|---|---|
| `contact.meta.title` | `Contact` | `<title>` base |  |
| `contact.meta.description` | `Send Sidhartha Watsa a message about anything.` | `<meta name="description">` |  |
| `contact.label` | `Contact` | PageHeader eyebrow |  |
| `contact.title` | `Get in touch` | PageHeader `h1` |  |
| `contact.intro` | `Write to me about anything: research, a collaboration, a correction, a question about a post.` | PageHeader intro | The owner's brief: "contact me about anything" |
| `contact.field.name.label` | `Name` | Field label |  |
| `contact.field.email.label` | `Email` | Field label |  |
| `contact.field.subject.label` | `Subject` | Field label |  |
| `contact.field.message.label` | `Message` | Field label |  |
| `contact.field.optional` | `(optional)` | Muted suffix after the Subject label |  |
| `contact.counter.text` | `{n} / 5,000` | Character counter, shown only once the message exceeds 4,000 characters | Visual only; not read per keystroke |
| `contact.counter.status.warn` | `{n} characters left` | Polite status, announced once each at 4,000 and 4,750 characters | `role="status"` |
| `contact.counter.status.limit` | `Character limit reached` | Polite status at 5,000 | `role="status"` |
| `contact.consent` | `Messages go through a third-party form service to my inbox, and the service may keep a copy for a short time. I use what you send only to reply to you.` | Small text above the submit button | **Wording depends on D-Q6**: Integrations must confirm retention (I-3) before publishing. Deliberately names no vendor and no number of days |
| `contact.submit` | `Send message` | Submit button, idle | `data-testid="contact-submit"` |
| `contact.submit.busy` | `Sending…` | Submit button label while the request is in flight | `aria-disabled="true"`, not `disabled` |
| `contact.submit.retry` | `Try again` | Submit button label after any failure | Same button; resubmits |
| `contact.status.sending` | `Sending your message` | Visually hidden polite status at submit | `role="status"`, `sr-only` |
| `contact.status.slow` | `Still sending… this is taking longer than usual.` | Visible polite status after 8 seconds | `role="status"` |
| `contact.error.prefix` | `Error:` | Visually hidden prefix before every inline error message | `sr-only` |
| `contact.error.name.required` | `Enter your name.` | Inline, under Name |  |
| `contact.error.name.long` | `Use 100 characters or fewer.` | Inline, under Name |  |
| `contact.error.email.required` | `Enter your email so I can reply.` | Inline, under Email |  |
| `contact.error.email.invalid` | `Enter an email like name@example.com` | Inline, under Email | Wording from the spec |
| `contact.error.email.long` | `Use 254 characters or fewer.` | Inline, under Email |  |
| `contact.error.subject.long` | `Use 150 characters or fewer.` | Inline, under Subject |  |
| `contact.error.message.required` | `Write a message.` | Inline, under Message |  |
| `contact.error.message.short` | `Write at least 10 characters.` | Inline, under Message |  |
| `contact.error.message.long` | `Use 5,000 characters or fewer.` | Inline, under Message | Backstop; `maxlength` normally prevents it |
| `contact.summary.title.one` | `Fix 1 field before sending` | Error summary heading, one problem | Receives focus; `data-testid="contact-error-summary"` |
| `contact.summary.title.many` | `Fix {n} fields before sending` | Error summary heading, several problems |  |
| `contact.summary.item` | `{label}: {message}` | Each summary list item; an in-page link to the field | `label` is the field label without "(optional)" |
| `contact.fail.title` | `Message not sent` | Heading of the failure panel (all failure kinds) | Receives focus |
| `contact.fail.network` | `Could not reach the message service. Your message is still here: check your connection and press Try again, or email me directly.` | Failure panel body, `code: "network"` |  |
| `contact.fail.provider` | `The message service had a problem. Your message is still here: press Try again in a moment, or email me directly.` | Failure panel body, `code: "provider"` and the **not configured** build | Not-configured shows this same text |
| `contact.fail.rate` | `Too many messages right now. Try again later or email me directly. Your message is still here.` | Failure panel body, `code: "rate_limited"` |  |
| `contact.fail.spam` | `The spam filter held this message back. Check it for links, wait a few seconds, then press Try again, or email me directly.` | Failure panel body, `code: "spam"` when the honeypot is empty | A filled honeypot shows the success state instead; see contact.md §7. **Do not "fix" this** |
| `contact.fail.validation` | `The service rejected something in the form. Check your entries and press Try again, or email me directly.` | Failure panel body, `code: "validation"` |  |
| `contact.fail.mailto` | `Email me instead` | Link in the failure panel; `mailto:` with subject and, when short enough, the message as body | `data-testid="contact-fallback"` |
| `contact.fail.mailto.toolong` | `Your message is too long to prefill. It is still in the box: copy it into your email.` | Shown beside the link when the encoded body exceeds 1,800 characters |  |
| `contact.success.title` | `Message sent` | Success heading | Receives focus; `data-testid="contact-success"` |
| `contact.success.body` | `Thanks — I read everything and reply from {email}.` | Success sentence | The user's text is not echoed |
| `contact.success.again` | `Send another` | Secondary button; resets the form and focuses Name |  |
| `contact.success.home` | `Back to home` | Secondary button, link to `/` |  |
| `contact.alt` | `Or email {email}` | Always-visible line under the form; `{email}` is a `mailto:` link | Also the no-JS fallback |
| `contact.noscript` | `The contact form needs JavaScript to run. You can still email me at {email}.` | Inside `<noscript>`, replaces the form | D-Q1: no native POST fallback |
| `contact.mailto.subject` | `Message from sidwat.github.io` | Default subject of the `mailto:` link | Matches the provider default subject |
| `contact.honeypot` | `(none)` | The `botcheck` field has no visible or accessible text | **Do not add a label or "fix" it** |

## Admin entry (`/admin/`, static page)

Lowercase mono, command register. No site shell.

| ID | String | Where and when | Notes |
|---|---|---|---|
| `admin.title` | `Editor` | `<title>` |  |
| `admin.loading` | `loading editor…` | Initial state |  |
| `admin.slow` | `still loading… slow connection?` | After 8 seconds if the editor script has not run |  |
| `admin.noscript` | `The editor needs JavaScript.` | Inside `<noscript>` |  |
| `admin.fail.title` | `Could not load the editor.` | Shown on script `error`, or after 20 seconds without `load` |  |
| `admin.fail.hint` | `Check your connection or content blocker, then reload.` | Under the failure title |  |
| `admin.fail.retry` | `Reload` | Link that reloads the page |  |

## CMS field hints (owner-facing, for `public/admin/config.yml`)

Not visitor-facing. Integrations pastes these into the Sveltia field `hint`s.

| ID | String | Where and when | Notes |
|---|---|---|---|
| `cms.title.hint` | `Up to 90 characters.` | Title field |  |
| `cms.summary.hint` | `Up to 200 characters; aim for 140. The first 100 must make sense on their own: phones show about that much in the list.` | Summary field |  |
| `cms.slug.hint` | `Becomes the web address. It cannot change later without breaking links.` | File name / slug |  |
| `cms.date.hint` | `Publishing time. A future date keeps the post hidden until the next site build after that time.` | Date field |  |
| `cms.draft.hint` | `On = hidden from the site. Turn off when the post is ready. New posts start with this on.` | Draft toggle |  |
| `cms.tags.hint` | `Lowercase words joined by hyphens, for example video-coding.` | Tags field |  |
| `cms.cover.hint` | `Optional. 1200 x 630 works best; keep the subject in the middle 60%. Under 200 KB.` | Cover image |  |
| `cms.cover_alt.hint` | `Required if there is a cover. Say what the picture shows, not "image of".` | Cover alt |  |
| `cms.body.hint` | `Markdown. Give every image alt text that says what it shows; add a title to get a numbered caption. Raw HTML is not rendered.` | Body field |  |

## Coverage check (for Frontend and QA)

- Every string visible in the wireframes and hi-fi pages in `assets/` is produced from this table; the wireframe generator looks strings up by ID, so a missing ID would have failed the build of the wireframes.
- Specimen article text, specimen post titles and the figure/cover placeholders in `assets/post-*.html` and the sample titles in [blog-index.md](blog-index.md) are **placeholders, not copy**: real post content comes from `content/blog/`.
- Metadata strings (`*.meta.title`, `*.meta.description`) are included because they are visible in tabs and search results.
