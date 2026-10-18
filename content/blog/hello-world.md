---
title: "Hello, world: a sample post"
date: 2026-10-17T09:00:00Z
updated: 2026-10-17T12:00:00Z
summary: "A draft fixture that exercises every Markdown element the blog design supports: headings, lists, code, a table, a footnote, links and an image."
tags: [notes, video-coding]
cover: /images/blog/hello-world/blocks.png
coverAlt: "A grid of coloured squares shading from green to blue across and from green to orange down, like a chroma plane split into blocks."
draft: true
---
This is a **sample draft**. It shows every element a post can use, so the design can be checked in both themes. It never appears on the live site while `draft: true` is set.

## Headings

The post title is the page's only top-level heading, so the body starts at level two.

### A third-level heading

#### A fourth-level heading

Body text continues under each heading. It can be *emphasised*, **strong**, ~~struck through~~, or `inline code`.

## Lists

An unordered list:

- Luma carries most of the detail
- Chroma can be subsampled
  - 4:2:0 halves it in both directions
  - 4:4:4 keeps it all
- Blocks are predicted, then the residual is coded

An ordered list:

1. Predict
2. Transform
3. Quantise
4. Entropy-code

A task list:

- [x] Write the sample post
- [ ] Publish a real one

## Code

A fenced block with a language, so it is highlighted:

```python
def psnr(mse: float, peak: float = 255.0) -> float:
    """Peak signal-to-noise ratio in dB."""
    import math
    return float("inf") if mse == 0 else 10 * math.log10(peak**2 / mse)
```

And one without a language:

```
ffmpeg -i in.y4m -c:v libx265 -crf 28 out.mp4
```

## A table

| Format | Luma samples | Chroma samples (each) | Relative size |
|---|---:|---:|---:|
| 4:4:4 | 4 | 4 | 100% |
| 4:2:2 | 4 | 2 | 67% |
| 4:2:0 | 4 | 1 | 50% |

## A quotation

> All models are wrong, but some are useful.
>
> — George Box

## Links and a footnote

Read more in the [H.266/VVC overview](https://en.wikipedia.org/wiki/Versatile_Video_Coding) or go back to the [blog index](/blog/). The number in brackets is a footnote.[^vvc]

## An image

![A grid of coloured squares shading from green to blue across and from green to orange down.](/images/blog/hello-world/blocks.png)

---

That rule above ends the body.

[^vvc]: Versatile Video Coding was finalised in 2020.
