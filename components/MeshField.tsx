"use client";

import { useEffect, useRef } from "react";
import { triangulate, type Point } from "@/lib/delaunay";

/** Roughly one vertex per this many square pixels of viewport. */
const AREA_PER_VERTEX = 15000;
const MIN_VERTICES = 45;
const MAX_VERTICES = 170;

/** How far the illumination reaches, and how far the mesh parts, in px. */
const LIGHT_RADIUS = 240;
const PUSH_RADIUS = 175;
const PUSH_MAX = 13;

/** Below these, the field is settled and the animation loop can stop. */
const REST_VELOCITY = 0.02;
const REST_OFFSET = 0.08;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace("#", "");
  const full =
    h.length === 3
      ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
      : h.slice(0, 6);
  const n = parseInt(full, 16);
  return Number.isNaN(n)
    ? [128, 128, 128]
    : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Jittered-grid sampling, extended one cell beyond the viewport so the mesh
 * runs off every edge instead of ending in a visible border. Even coverage
 * without the clumping that uniform random sampling produces.
 */
function sample(w: number, h: number, target: number): Point[] {
  const cell = Math.sqrt((w * h) / target);
  const cols = Math.ceil(w / cell) + 2;
  const rows = Math.ceil(h / cell) + 2;
  const pts: Point[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      pts.push({
        x: (c - 1) * cell + Math.random() * cell,
        y: (r - 1) * cell + Math.random() * cell,
      });
    }
  }
  return pts;
}

/**
 * A triangulated field behind the page. At rest it is almost invisible; the
 * cursor lights the edges near it and the vertices part around it.
 *
 * The conceit is foveated coding: an encoder spends its bits where the viewer
 * is looking, and here the cursor is the fovea — the mesh resolves around it
 * and fades away everywhere else.
 */
export default function MeshField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let home: Point[] = [];
    let cur: Point[] = [];
    let vel: { x: number; y: number }[] = [];
    let edges: [number, number][] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let base: [number, number, number] = [30, 33, 48];
    let lit: [number, number, number] = [76, 125, 255];
    let baseAlpha = 0.3;
    let litAlpha = 0.9;
    const pointer = { x: -9999, y: -9999, on: false };
    // Set whenever the pointer moves or leaves. Without it the loop would run
    // forever after the first mouse move, since pointer.on stays true while the
    // cursor merely rests inside the window and nothing is actually changing.
    let dirty = true;

    const readColours = () => {
      const cs = getComputedStyle(document.documentElement);
      base = hexToRgb(cs.getPropertyValue("--line") || "#1e2130");
      lit = hexToRgb(cs.getPropertyValue("--cb") || "#4c7dff");
      baseAlpha = parseFloat(cs.getPropertyValue("--mesh-base")) || 0.3;
      litAlpha = parseFloat(cs.getPropertyValue("--mesh-lit")) || 0.9;
    };

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      // Capped at 2: beyond that the extra pixels cost more than they show.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(
        MAX_VERTICES,
        Math.max(MIN_VERTICES, Math.round((w * h) / AREA_PER_VERTEX)),
      );
      home = sample(w, h, target);
      cur = home.map((p) => ({ ...p }));
      vel = home.map(() => ({ x: 0, y: 0 }));
      edges = triangulate(home);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Base pass: the whole mesh, barely there.
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${base[0]},${base[1]},${base[2]},${baseAlpha})`;
      ctx.beginPath();
      for (const [i, j] of edges) {
        ctx.moveTo(cur[i].x, cur[i].y);
        ctx.lineTo(cur[j].x, cur[j].y);
      }
      ctx.stroke();

      if (!pointer.on) return;

      // Lit pass: only edges within reach, each at its own alpha. Batching by
      // colour is not possible here, but the count is small by construction.
      for (const [i, j] of edges) {
        const mx = (cur[i].x + cur[j].x) / 2;
        const my = (cur[i].y + cur[j].y) / 2;
        const d = Math.hypot(mx - pointer.x, my - pointer.y);
        if (d > LIGHT_RADIUS) continue;
        const t = 1 - d / LIGHT_RADIUS;
        ctx.strokeStyle = `rgba(${lit[0]},${lit[1]},${lit[2]},${litAlpha * t * t})`;
        // Weight as well as brightness: the lines nearest the cursor thicken
        // slightly, which reads as focus rather than as a colour wash.
        ctx.lineWidth = 1 + 0.75 * t * t;
        ctx.beginPath();
        ctx.moveTo(cur[i].x, cur[i].y);
        ctx.lineTo(cur[j].x, cur[j].y);
        ctx.stroke();
      }

      // Vertices, brightest at the centre of the pool.
      for (let i = 0; i < cur.length; i++) {
        const d = Math.hypot(cur[i].x - pointer.x, cur[i].y - pointer.y);
        if (d > LIGHT_RADIUS * 0.75) continue;
        const t = 1 - d / (LIGHT_RADIUS * 0.75);
        ctx.fillStyle = `rgba(${lit[0]},${lit[1]},${lit[2]},${litAlpha * 0.85 * t * t})`;
        ctx.beginPath();
        ctx.arc(cur[i].x, cur[i].y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    /** Returns true while anything is still moving. */
    const step = () => {
      let moving = false;
      for (let i = 0; i < cur.length; i++) {
        let tx = home[i].x;
        let ty = home[i].y;
        if (pointer.on) {
          const dx = cur[i].x - pointer.x;
          const dy = cur[i].y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < PUSH_RADIUS && d > 0.001) {
            const f = 1 - d / PUSH_RADIUS;
            tx += (dx / d) * PUSH_MAX * f * f;
            ty += (dy / d) * PUSH_MAX * f * f;
          }
        }
        vel[i].x = (vel[i].x + (tx - cur[i].x) * 0.14) * 0.82;
        vel[i].y = (vel[i].y + (ty - cur[i].y) * 0.14) * 0.82;
        cur[i].x += vel[i].x;
        cur[i].y += vel[i].y;
        if (
          Math.abs(vel[i].x) > REST_VELOCITY ||
          Math.abs(vel[i].y) > REST_VELOCITY ||
          Math.abs(cur[i].x - tx) > REST_OFFSET ||
          Math.abs(cur[i].y - ty) > REST_OFFSET
        ) {
          moving = true;
        }
      }
      return moving;
    };

    const frame = () => {
      const changed = dirty;
      dirty = false;
      const moving = step();
      draw();
      // Stop once the field has settled and the pointer has stopped moving:
      // the last painted frame is already correct. The loop restarts on the
      // next move, so a cursor resting on the page costs nothing.
      if (moving || changed) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0;
      }
    };

    const kick = () => {
      if (!raf && !motionQuery.matches) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.on = true;
      dirty = true;
      kick();
    };
    const onLeave = () => {
      pointer.on = false;
      dirty = true;
      kick();
    };

    const onResize = () => {
      build();
      draw();
      kick();
    };

    readColours();
    build();
    draw();

    // Coarse pointers have no hover, so the field simply stays at rest.
    const fine = window.matchMedia("(pointer: fine)");
    if (fine.matches && !motionQuery.matches) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
      window.addEventListener("blur", onLeave);
    }
    window.addEventListener("resize", onResize);

    // The palette flips with the theme, and the mesh has to follow.
    const themeObserver = new MutationObserver(() => {
      readColours();
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", onResize);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
