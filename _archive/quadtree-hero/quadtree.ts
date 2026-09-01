export type Leaf = {
  /** Centre of the block. x spans 0..2, y spans 0..1 — a 2:1 frame. */
  x: number;
  y: number;
  /** Edge length of the block. Blocks are square, as coding units are. */
  size: number;
  /** 0..1 local structure, drives extrusion and chroma. */
  detail: number;
};

/**
 * Stand-in for the structure an encoder sees in a frame: near zero across flat
 * regions, rising sharply along a few contours. The quadtree reacts to this the
 * way a real rate-distortion search reacts to an image — big blocks where there
 * is nothing to describe, small ones along the edges.
 *
 * A tight falloff keeps each contour to a narrow band, so the tree splits hard
 * along it and leaves the flat majority in large blocks.
 */
function detailAt(x: number, y: number): number {
  const ring = Math.abs(Math.hypot(x - 0.62, y - 0.52) - 0.3);
  const wave = Math.abs(y - 0.48 - 0.2 * Math.sin((x - 0.1) * 3.1));
  const arc = Math.abs(Math.hypot(x - 1.52, y - 0.44) - 0.17);
  return Math.max(0, 1 - Math.min(ring, wave, arc) * 45);
}

/** Roughly the half-width of a contour band, given the falloff above. */
const FEATURE_WIDTH = 0.015;

/**
 * Highest detail found inside a cell.
 *
 * The probe density scales with the cell, so sample spacing always stays below
 * the width of a contour. A fixed grid cannot do this: at the root, a 5x5 probe
 * samples every 0.25 while a contour is ~0.015 wide, so it steps clean over the
 * feature and the whole quadrant is left as one flat block.
 */
function cellDetail(x: number, y: number, size: number): number {
  const steps = Math.min(64, Math.max(4, Math.ceil(size / FEATURE_WIDTH)));
  let max = 0;

  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      max = Math.max(
        max,
        detailAt(x + (i / steps - 0.5) * size, y + (j / steps - 0.5) * size),
      );
    }
  }

  return max;
}

/**
 * Recursively partitions the frame, splitting a block into four whenever it
 * still covers more structure than it can describe at its current size. The
 * frame starts as two square roots side by side, so every block stays square.
 */
export function buildQuadtree(maxDepth: number, threshold = 0.12): Leaf[] {
  const leaves: Leaf[] = [];

  const split = (x: number, y: number, size: number, depth: number) => {
    const detail = cellDetail(x, y, size);

    if (depth < maxDepth && detail > threshold) {
      const half = size / 2;
      const q = size / 4;
      split(x - q, y - q, half, depth + 1);
      split(x + q, y - q, half, depth + 1);
      split(x - q, y + q, half, depth + 1);
      split(x + q, y + q, half, depth + 1);
      return;
    }

    leaves.push({ x, y, size, detail });
  };

  split(0.5, 0.5, 1, 0);
  split(1.5, 0.5, 1, 0);

  return leaves;
}
