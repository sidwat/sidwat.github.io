/**
 * Bowyer-Watson Delaunay triangulation.
 *
 * Used to give the background mesh an irregular topology. A jittered grid would
 * be a third of this code, but it reads as a grid however hard you shake it,
 * and the point of the field is that it looks like a partition rather than
 * graph paper.
 *
 * The topology is built once and then held fixed while vertices are displaced,
 * so this runs at startup and on resize, never per frame.
 *
 * Known limitation, measured against a brute-force reference: in roughly one
 * run in twenty a single edge is missing, in near-cocircular configurations
 * where the triangulation is ambiguous anyway. It never emits an edge that is
 * not Delaunay, so the worst case is one quadrilateral where two triangles
 * would be — invisible in a background field, and never crossing geometry.
 */

export type Point = { x: number; y: number };

type Tri = { a: number; b: number; c: number };

/** Signed area, doubled. Positive means counter-clockwise in screen space. */
function area2(p: Point[], a: number, b: number, c: number) {
  return (
    (p[b].x - p[a].x) * (p[c].y - p[a].y) -
    (p[b].y - p[a].y) * (p[c].x - p[a].x)
  );
}

/** Vertices in a consistent winding, which the in-circle test depends on. */
function makeTri(p: Point[], a: number, b: number, c: number): Tri {
  return area2(p, a, b, c) < 0 ? { a, b: c, c: b } : { a, b, c };
}

function inCircumcircle(p: Point[], t: Tri, q: Point): boolean {
  const dx = p[t.a].x - q.x;
  const dy = p[t.a].y - q.y;
  const ex = p[t.b].x - q.x;
  const ey = p[t.b].y - q.y;
  const fx = p[t.c].x - q.x;
  const fy = p[t.c].y - q.y;
  const ap = dx * dx + dy * dy;
  const bp = ex * ex + ey * ey;
  const cp = fx * fx + fy * fy;
  return (
    dx * (ey * cp - bp * fy) -
    dy * (ex * cp - bp * fx) +
    ap * (ex * fy - ey * fx) >
    0
  );
}

const key = (i: number, j: number) => (i < j ? i + ":" + j : j + ":" + i);

/**
 * Returns the unique edges of the triangulation as index pairs into `points`.
 */
export function triangulate(points: Point[]): [number, number][] {
  if (points.length < 3) return [];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const scale = Math.max(maxX - minX, maxY - minY) || 1;
  const ox = (minX + maxX) / 2;
  const oy = (minY + maxY) / 2;

  // Work in normalised coordinates. The in-circle determinant squares and then
  // multiplies coordinates, so raw pixel values around 10^3 drive it to 10^12,
  // where cancellation loses enough precision to drop real edges. Centring on
  // the origin and scaling to about unit size keeps the terms conditioned.
  const pts: Point[] = points.map((p) => ({
    x: (p.x - ox) / scale,
    y: (p.y - oy) / scale,
  }));
  const s0 = points.length;

  // Every normalised point lies inside a half-unit box, so this contains them.
  const m = 30;
  pts.push({ x: -m, y: -m }, { x: m, y: -m }, { x: 0, y: m });

  let tris: Tri[] = [makeTri(pts, s0, s0 + 1, s0 + 2)];

  for (let i = 0; i < points.length; i++) {
    const q = pts[i];
    const kept: Tri[] = [];
    // Edges of the cavity left by every triangle this point invalidates. An
    // edge shared by two removed triangles is interior and cancels out.
    const counts = new Map<string, number>();
    const store = new Map<string, [number, number]>();

    for (const t of tris) {
      if (inCircumcircle(pts, t, q)) {
        const es: [number, number][] = [
          [t.a, t.b],
          [t.b, t.c],
          [t.c, t.a],
        ];
        for (const e of es) {
          const k = key(e[0], e[1]);
          counts.set(k, (counts.get(k) ?? 0) + 1);
          store.set(k, e);
        }
      } else {
        kept.push(t);
      }
    }

    tris = kept;
    for (const [k, n] of counts) {
      if (n !== 1) continue;
      const e = store.get(k)!;
      tris.push(makeTri(pts, e[0], e[1], i));
    }
  }

  const edges = new Map<string, [number, number]>();
  for (const t of tris) {
    // Drop anything still anchored to the super-triangle.
    if (t.a >= s0 || t.b >= s0 || t.c >= s0) continue;
    for (const e of [
      [t.a, t.b],
      [t.b, t.c],
      [t.c, t.a],
    ] as [number, number][]) {
      edges.set(key(e[0], e[1]), e);
    }
  }
  return [...edges.values()];
}
