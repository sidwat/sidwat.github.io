# Home name and shooting stars — 2026-10-24

The home heading now forms “Sidhartha Watsa” from drifting stars. Its assembly force and density are tuned for the longer name; it stays formed after its opening gather and continues to yield to the pointer. The semantic H1 remains in the DOM; without JavaScript or with Reduced Motion the normal text heading is displayed. Existing project-name formation timing and forces are unchanged.

Occasional shooting stars cross the shared background with short fading trails. Their velocity is affected by a slight downward acceleration and the pointer's repulsion. Emission is staggered rather than continuous, and stops with Reduced Motion or document visibility. Text and control clearances apply to the trails too.

The visible page-level “Pause background” controls were removed from Home and project pages. The old stored pause flag is no longer restored, preventing an invisible Home heading for visitors who previously paused motion. Reduced Motion remains supported. The dedicated motion demo's own “Pause animation” control remains within its demo.

Validation:
- Production static build, lint and TypeScript passed.
- Initial Chromium/WebKit sky and project suite: 20 passed.
- Final Chromium layout, accessibility, sky and Home-name checks: 30 passed.
- Final WebKit home-name/reduced-motion check passed after readability tuning.
- A live canvas-render inspection verified shooting-star trail emission; 120 trail segments were painted during the capture.
- Dark/light screenshots visually checked; `shooting-star.png` captures a meteor example.

Possible next refinements, not implemented: faint nebula haze at the far edges, slow planet surface rotation, or a restrained color accent for each project's particle title. Add these selectively to preserve clarity.
