# Apple-informed design research

Researched October 22, 2026. This is a web portfolio, so Apple’s native-platform advice is translated into web behavior. These proposals are independent designs, not official Apple templates or an assertion of Apple certification.

## Authoritative principles and how they affect this project

| Primary source | Guidance applied | Portfolio interpretation |
| --- | --- | --- |
| [Apple HIG: Layout](https://developer.apple.com/design/human-interface-guidelines/layout) — Visual hierarchy; Adaptability | Put essential information first; express relationships through grouping and alignment; adapt across sizes | Lead with research identity and selected work, distinguish page types, stack dense layouts on mobile, preserve complete titles |
| [Apple HIG: Typography](https://developer.apple.com/design/human-interface-guidelines/typography) — Ensuring legibility; Conveying hierarchy | Use readable sizes and weights, a restrained family set, and a consistent hierarchy | System sans-serif stack; large but purposeful headings; readable metadata; narrow article column |
| [Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials) — Liquid Glass; Standard materials | Reserve expressive glass for functional controls/navigation and use it sparingly | Keep long-form content on solid surfaces; consider subtle navigation translucency only when useful, with an opaque fallback |
| [Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) — Vision; Mobility; Cognitive | Support text enlargement, sufficient contrast, multiple state cues, usable controls, and comfortable motion | Browser zoom/reflow, contrast checks, keyboard focus, explicit form messages, reduced-motion behavior |

The official pages were accessed through their linked Markdown versions after the web reader returned only a JavaScript shell. Current Markdown was retrieved successfully for all four topics. Raw copies were used for verification and are not redistributed in this package. The summary above is an application of their guidance, not copied HIG prose.

## Tools and skills researched

| Option | Source and fit | Decision |
| --- | --- | --- |
| Apple Design Resources | [Official resource page](https://developer.apple.com/design/resources/) provides Figma and Sketch templates and other platform assets | Use as authoritative visual-reference material. Native UI kits do not directly become HTML components for this portfolio |
| Figma with Apple resources | [Figma’s Apple kit documentation](https://help.figma.com/hc/en-us/articles/24037833895831-Get-started-with-Apple-s-UI-kit) describes adding the library | Useful for collaborative component editing. No Figma workspace/file was provided; a separate account dependency is unnecessary for delivering this review |
| Sketch with Apple resources | Linked from [Apple Design Resources](https://developer.apple.com/design/resources/) | Appropriate for native platform mockups; no installation needed for the requested page pictures |
| Raintree Apple HIG agent skills | [Upstream release](https://github.com/raintree-technology/hig-doctor/releases) describes the HIG skill collection | The existing project already contains `.claude/skills/hig-foundations/SKILL.md`; loaded that file and its layout, typography, materials and accessibility references, then checked against current Apple guidance. No duplicate skill was installed |
| Deterministic browser mockups and Playwright | Existing repository tooling, using actual content and portrait | Selected for exact text, full-page exports, responsive variants, linked navigation, repeatable renders, and direct layout verification |
| Image generation | Existing imagegen skill examined as a possible UI-picture tool | Not used: native HTML/CSS mockups provide accurate content and deterministic page layouts; no new photographic or raster illustration assets are necessary |

The local HIG reference files label themselves a February 2025 snapshot; that date is not treated as evidence of current Apple policy. Current official guidance takes precedence. The skill’s UIKit/SwiftUI examples and SF Symbols recommendations are native-specific: no native API, Apple logo, proprietary icon asset, or downloaded SF font is shipped here. `-apple-system` uses the visitor’s installed system font when available and falls back elsewhere.

## Design choices versus Apple requirements

The neutral/blue, dark/ice-blue, and warm/green palettes are our design choices. The headline wording, 24px-style card rounding, navigation rail, project cards, and metric layout are also proposals. They are informed by hierarchy, restraint, and legibility rather than mandated by Apple. The native guidelines do not specify a universal portfolio layout or require glass on a website.

The proposed production target is WCAG AA, to be checked in the implementation phase. The static pictures are not an accessibility certification and do not yet provide paired light/dark appearances for each concept.
