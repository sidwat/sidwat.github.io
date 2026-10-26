# Visual themes

Themes are saved visual presets for occasions. They are independent of the visitor's Light/Dark appearance setting. Switching a preset preserves all website content, routes, form configuration and unrelated improvements.

## Available presets

| Preset | Description | Snapshot |
| --- | --- | --- |
| Web | Original triangular pointer mesh, slightly denser spacing, faint resting lines and gentle blue illumination; ordinary readable headings | `theme/web-v1` |
| Galactic | Stars, shaded rotating planets, occasional shooting stars, edge haze, particle Home name and project titles | `theme/galactic-v1` at `72ae11a` |

Web is currently active. Galactic remains implemented; it is not deleted or reverted. The Galactic snapshot tag also preserves its original exact state, and every earlier commit remains in Git history.

## Switch a preset

From the repository root:

```sh
pnpm theme:galactic
pnpm run build:webpack
```

To return:

```sh
pnpm theme:web
pnpm run build:webpack
```

The commands change `lib/visual-theme.json`. Commit and push that change to save an activation. A static preview serving `out/` picks up the rebuilt export; production requires the normal deployment. For development, restart `pnpm dev` if necessary.

Prefer these switches over checking out an old snapshot: that keeps later content and functional fixes. Use the Git tags only to inspect or recover an exact historical design. For another occasion, add a new named preset while retaining existing ones.

## Verification

Both presets are built and tested independently. `visual-themes.spec.ts` verifies active background selection and that Web renders no Galactic particle canvases. Galactic-specific tests run only when Galactic is active. Project content/routing checks run for either preset. Both retain Reduced Motion behavior. Web screenshots show light and dark appearance.

Validation on 2026-10-26: both preset production exports passed, along with lint and TypeScript. Galactic activation: 13 Chromium checks passed, one Web-only check skipped. Final Web activation: 59 Chromium/WebKit checks passed, seven inactive-preset/platform-specific cases skipped. Shared navigation/footer/project links use `prefetch={false}` to avoid unnecessary background route requests and Safari prefetch cancellation errors. Local preview is left serving the Web export.
