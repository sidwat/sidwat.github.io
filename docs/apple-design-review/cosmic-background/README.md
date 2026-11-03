# Persistent stars and planets — 2026-10-24

The rendered site-wide silk web has been replaced by `CosmicBackground` in the root layout. The sky persists across client navigation on every page. It contains 520 stars and three small shaded planets on desktop; 240 stars and two planets on narrow screens. One planet has a quiet ring.

Stars and planets drift with damped velocity, soft restoring forces, and mouse repulsion. Planets react more slowly to suggest greater mass. Their safe positions are selected from open regions; text and controls remain clear. The field pauses when hidden, follows the existing motion toggle, and stays static for Reduced Motion. The DPR and frame rate are capped.

The project-name formation component is unchanged. Its separate stars continue to form the project label over the shared sky; formation/dynamics changes are intentionally deferred for the next review.

Validation: lint, TypeScript, production static export, and 18 Chromium/WebKit tests passed. Tests cover eight routes in both themes, persistent canvas identity through navigation, absence of the old web canvas, pause and Reduced Motion, project routing/layout/accessibility, and existing name-formation physics checks. Desktop light/dark and mobile images were reviewed.

Images: `projects-dark.png`, `home-light.png`, `projects-mobile.png`.
