# Project media source review — 26 October 2026

Prepared for the resume-aligned website draft. These are technology references and illustrative images, not evidence of sponsorship or of the author's personal contribution. Only display a tool where the resume or existing supported project description establishes its use. No remote media was downloaded in this research pass.

## APV assets ready for implementation

| Asset | Primary source / stable asset URL | Usage and placement |
| --- | --- | --- |
| OpenAPV PNG wordmark | [Official repository PNG](https://github.com/AcademySoftwareFoundation/openapv/blob/main/readme/img/oapv_logo_bar_512.png), [raw PNG](https://raw.githubusercontent.com/AcademySoftwareFoundation/openapv/main/readme/img/oapv_logo_bar_512.png) | Put on the APV detail page in a restrained linked technology panel. Preserve original proportions and link to the project. |
| OpenAPV light/dark marks | The [official README](https://github.com/AcademySoftwareFoundation/openapv) references [black variant](https://raw.githubusercontent.com/AcademySoftwareFoundation/openapv/main/readme/img/oapv_logo_black_bar_256.png) and [white variant](https://raw.githubusercontent.com/AcademySoftwareFoundation/openapv/main/readme/img/oapv_logo_white_bar_256.png). | Prefer these against the respective site surfaces, without recolouring the logo. |
| Professional videography thumbnail | [Video Camera.JPG, by Popperipopp](https://commons.wikimedia.org/wiki/File:Video_Camera.JPG), [original JPEG](https://upload.wikimedia.org/wikipedia/commons/4/41/Video_Camera.JPG), 1204 × 800 | Real photograph of a video camera in action. The author explicitly releases it into the public domain worldwide. Credit is still good practice: “Video camera photograph: Popperipopp / Wikimedia Commons (public domain).” Caption as an illustrative image, not the user's camera or APV hardware. |

OpenAPV's [repository license](https://github.com/AcademySoftwareFoundation/openapv/blob/main/LICENSE) is a BSD-style three-clause license, copyright Samsung Electronics (2022); retain its full notice with redistributed repository material. Its non-endorsement condition still applies. The README identifies OpenAPV as the reference implementation for professional video recording/editing workflows. That establishes relevance; it does not verify this individual's contribution. No separate logo-specific license was found, so keep it as an unchanged, linked project identification and retain upstream notice.

## Selective technology identification

Use at most five to eight distinct technologies across the portfolio, and normally two to four on each project. A row labelled “Tools and context” works better than a wall of badges. Links and plain text are suitable where a reusable logo is unclear.

| Technology | Verified primary source | Recommended treatment |
| --- | --- | --- |
| OpenAPV | Official PNG/repository above | Linked original PNG on APV. |
| FFmpeg | [Official site](https://ffmpeg.org/), [official website repository](https://github.com/FFmpeg/web), [license information](https://ffmpeg.org/legal.html) | Linked text badge in APV. Software licensing alone is not logo permission; a current logo-specific reuse statement was not established here. Avoid fetching an arbitrary third-party SVG. |
| Adobe Premiere Pro | [Adobe icon guidelines](https://www.adobe.com/legal/permissions/icons-web-logos.html), [trademark guidelines](https://www.adobe.com/legal/permissions/trademarks.html) | Use a neat linked text badge spelling “Adobe Premiere Pro.” Adobe's general policy does not allow third-party product icons without an applicable partnership agreement. The developer-program asset allowance is scoped to qualifying developers and does not establish permission for this portfolio. Do not fabricate a Pr icon. |
| Halide | [Official project](https://halide-lang.org/), [repository license](https://github.com/halide/Halide/blob/main/LICENSE.txt) | Linked text badge on NNLF/Halide. No authoritative distinct logo file or logo-specific policy established. |
| OpenCV | [Official media kit](https://opencv.org/media-kit/), [official PNG mark](https://opencv.org/wp-content/uploads/2020/07/OpenCV_logo_no_text_.png), [black-wordmark PNG](https://opencv.org/wp-content/uploads/2020/07/OpenCV_logo_black_.png) | Official linked mark in the relevant robotics project. Media kit says to link to OpenCV and not imply sponsorship or use it to brand one's own site. Keep its original colours and identity separate from the portfolio branding. |
| ROS | [Official media policy](https://www.ros.org/blog/media), [Open Robotics artwork repository](https://github.com/openrobotics/artwork), [official SVG](https://raw.githubusercontent.com/openrobotics/artwork/master/ros_logo.svg), [artwork license](https://github.com/openrobotics/artwork/blob/master/LICENSE) | Text badge is the simplest option for the recruiting draft. Artwork repository uses CC BY-NC 4.0; official trademark rules allow identification of implementation of ROS, without misleading affiliation. Avoid assuming the noncommercial artwork license covers every recruiting/promotional setting. The live ros.org page was bot-protected; its indexed official policy and repository were accessible. |
| PyTorch | [Current official brand guidance](https://pytorch.org/brand-guidelines/), [framework visual guide](https://docs.pytorch.org/assets/brand-guidelines/PyTorch-Brand-Guidelines.pdf) | Linked text badge pending exact framework asset/policy selection. Current page discusses the PyTorch Foundation and asks users to check in before promotional website use. Do not substitute a foundation/member lockup for framework use. |
| SwinIR | [Authors' official repository](https://github.com/JingyunLiang/SwinIR) | Plain linked paper/model name where source material establishes its use. Repository has Apache-2.0 license; no distinct official logo established. Do not reuse a published result figure as though it were the author's own experiment. |

## Media hierarchy for this draft

1. APV: professional camera thumbnail → OpenAPV identity → user's precise contribution and supported results → external source links.
2. NNLF/Halide: one explanatory processing/scheduling diagram is more useful than unrelated stock photography; label a diagram created for the portfolio as an explanation, never a measured result.
3. Robotics: prefer the user's actual robot/competition image or video when supplied. External illustrative pictures must say that they are illustrative.
4. Comparison media should identify the input, baseline, method and setting. Until actual results are supplied, do not invent before/after pairs or numeric captions.
5. Keep any video click-to-play, captioned, with a poster image and no autoplay/audio. Links to public demonstrations are preferable to unlicensed copies.

## Implementation checks

- Keep source, creator, license and any transformations beside each stored asset in the media attribution record.
- Use descriptive alt text; decorative duplicate technology marks can have empty alt text when adjacent link text already identifies them.
- Preserve image proportions, reserve dimensions, lazy-load below the fold and keep thumbnail payloads small.
- No vendor endorsement, partnership, membership or ownership should be suggested by a row of technology labels.
