# Voice guide

Owner of this file: Writer (it records the owner's voice; the owner has the final say). The repo is public, so don't paste anything private here.

## Who is speaking
Sidhartha Watsa: an engineer-researcher in robotics, vision and efficient on-device AI. He spent two years on video codec standards at Samsung Research and is now an MS CS student at UC San Diego. He writes as someone who has built and measured things, not as someone selling them.

## Who is reading (in priority order)
1. Researchers and faculty in robotics / computer vision: possible supervisors, collaborators, hosts for a talk.
2. Admissions committees (PhD/postdoc).
3. Industry hiring managers and recruiters.
4. Peers who arrive from a paper, a GitHub repo or a post.

They are expert, busy and sceptical. They reward precision and punish padding.

## Tone
- Terse, technical, plain. First person where a person speaks ("I built", "we found"). Use "we" only when the work was a team's, and say whose.
- Modest and exact: "reduced decoder complexity from 600% to 130% of the VTM anchor", not "dramatically improved efficiency".
- No exclamation marks, no emoji, no hype. British spelling (optimised, behaviour, colour), matching `lib/content.ts`.
- Dates in the site format: `2 Nov 2026`; periods as `Aug 2024 — Aug 2026` (matching existing pages).

## Do
- Lead with the concrete: the problem, what he did, the number, what broke, what he'd do next.
- Name tools and constraints (Halide, SADL, VVC, KUKA arm, 1k MAC/pixel) when they carry meaning for an expert.
- Say what *he* did inside a team effort.
- Vary sentence length. Short sentences are fine. So are fragments, sparingly.
- End when the content ends. No summary paragraph that restates the post.

## Don't
- Promote. Avoid adjectives that do no work ("innovative", "novel" without a claim, "impactful").
- Inflate status: a filed patent is an application, and a submitted paper isn't published.
- Use metaphors in place of mechanisms.
- Write bullets that all start with the same verb form ("Designed… Developed… Delivered…"). Mix the structure.
- Use the `→` arrow or other decorative glyphs in prose (they're UI only).

## Banned phrases and patterns (LLM tells)
delve · tapestry · landscape · leverage · seamless(ly) · robust (unless it's the technical term) · cutting-edge · state-of-the-art (unless backed by a cited comparison) · game-changer · unlock · harness · empower · navigate (figuratively) · realm · journey · "in today's fast-paced world" · "it's worth noting" · "it is important to note" · "not only… but also" · "whether you're X or Y" · "let's dive in" · "in conclusion" · "I hope this helps" · rhetorical-question openers · heavy em-dash use (≤ 1 per paragraph) · triplets of adjectives · forced sign-offs ("Happy coding", "Stay tuned").

## Sample paragraphs (illustrative, written by the Writer, not by the owner)
These show the target register. **Facts in them come from `lib/content.ts` and must not be reused as new claims without checking.**

> The Halide work started as a feasibility question: could kernel-level optimisation alone get a neural loop filter under the decoder complexity budget? On one x86 core the answer was nearly yes. Our pipeline ran at 130% of the anchor decoder, against 600% for the SADL baseline, and 115% across cores.

> At IISc I worked on learning from demonstrations that were not very good. Most human demos on a robot arm contain wasted motion. Before training, I scored every state–action pair for feasibility and optimality and threw out the worst.

## Owner's samples (REQUIRED before final drafts)
> **Owner: paste 2–3 pieces you wrote yourself here, or link them**, e.g. an email to a professor, the introduction of a paper you drafted, a post or README. Remove anything private first; this file is public.

<!-- OWNER SAMPLE 1 -->

<!-- OWNER SAMPLE 2 -->

<!-- OWNER SAMPLE 3 -->

## Notes the Writer has learned from the samples
_(Empty until samples arrive: sentence length, favourite constructions, words he uses and avoids.)_
