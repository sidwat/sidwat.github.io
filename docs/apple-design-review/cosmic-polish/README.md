# Restrained cosmic finishing touches

Planets have small surface marks projected onto a rotating sphere. Marks pass behind the limb instead of rotating as flat stickers; the lighting direction and ring orientation stay stable. Motion follows the same time source and Reduced Motion behavior as the existing sky.

Two faint blue/violet radial haze patches sit beyond the viewport edges. Their low opacity preserves the reading areas. The static CSS layer sits beneath the sky so clearing particles away from text cannot leave rectangular seams.

Project particle titles have muted accents: NNLF ice blue, NNFilter teal, NNIntra violet, APV amber, ROBOMASTER rose, CHANDRAYAAN silver. Most stars stay neutral. Home keeps its existing cool star palette. No formation forces or timing changed.

Validation: production export, lint and TypeScript passed. All 20 Chromium/WebKit sky and project checks passed, including each project's accent, text clearances, Home gathering, pointer response, reduced motion, mobile reflow and accessibility. The final haze layering also passed both browser physics/text-clearance checks; its CSS gradient rendered successfully. APV's dark screenshot was visually reviewed.
