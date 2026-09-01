# Archived: quadtree hero figure

The Phase 2 landing figure — a recursive quadtree partition rendered with
react-three-fiber, blocks splitting along image contours and tinted along the
YCbCr chroma axes. Replaced by the portrait video hero.

Kept because it works and the algorithm was tuned: probe density scales with
cell size (a fixed probe steps over thin contours and leaves whole quadrants
unsplit), and the frame is two square roots side by side so blocks stay square.

To restore, move both files back to `lib/` and `components/` and render
`<QuadtreeScene />`. It needs `three` and `@react-three/fiber`, which are still
in package.json.
