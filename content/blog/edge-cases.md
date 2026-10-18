---
title: "Edge cases: a deliberately long title that tests how the heading wraps on narrow screens"
date: "2026-10-16T18:30:00Z"
summary: "A draft fixture for layout and safety: long title, long unbroken string, wide table, long code line, and raw HTML that must not be rendered."
tags: [notes, testing]
draft: true
---
This **sample draft** stress-tests layout and safety. Its date is quoted, so the loader is exercised on a string timestamp as well as a YAML date. It never appears on the live site while `draft: true` is set.

## Long unbroken string

Supercalifragilisticexpialidocious_is_short_compared_to_this_identifier_which_keeps_going_without_any_spaces_or_hyphens_at_all_0123456789

A long URL as text: https://example.com/a/very/long/path/that/keeps/going/and/going/and/going/without/a/break/to/test/overflow?query=parameters&and=more

## Wide table

| Sequence | Resolution | Frame rate | Bit depth | QP 22 kbps | QP 27 kbps | QP 32 kbps | QP 37 kbps | BD-rate Y | BD-rate Cb | BD-rate Cr | Encode time | Decode time |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Tango2 | 3840x2160 | 60 | 10 | 12345.6 | 6543.2 | 3456.7 | 1876.5 | -3.21% | -4.56% | -5.67% | 312% | 101% |
| BasketballDrive | 1920x1080 | 50 | 8 | 9876.5 | 4321.0 | 2109.8 | 1098.7 | -2.10% | -3.45% | -2.98% | 287% | 99% |

## Long code line

```js
const result = someFunctionWithAVeryLongName(argumentNumberOne, argumentNumberTwo, argumentNumberThree, { option: true, anotherOption: "a long string value that pushes this line well past any sensible width" });
```

## Raw HTML must not render

Everything in this section must show up as text, or be removed. It must never run or become an element.

Inline: <script>alert("inline script")</script> and <img src="x" onerror="alert('onerror')"> and <a href="javascript:alert('js')">a javascript link</a>.

<script>alert("block script")</script>

<iframe src="https://example.com"></iframe>

<div style="position:fixed;inset:0;background:red">full-screen overlay</div>

A Markdown link with a dangerous scheme: [click me](javascript:alert('markdown-link')).

The same strings as code, which must display literally: `<script>alert(1)</script>` and `onerror=alert(1)`.

## Empty-ish elements

-

>

Done.
