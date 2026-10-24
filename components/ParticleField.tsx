"use client";

import { useEffect, useRef } from "react";

export type MotionStyle = "web" | "spotlight" | "orbit" | "hybrid";
type Dot = { x: number; y: number; depth: number; distance: number };

/** One decorative canvas shared by the homepage, project banners and motion demos. */
export default function ParticleField({
  mode = "hybrid", label = "SW", paused = false, subtle = false, heading = false,
}: {
  mode?: MotionStyle; label?: string; paused?: boolean; subtle?: boolean; heading?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-width: 767px)");
    const fine = matchMedia("(pointer: fine)");
    const isPaused = () => paused || document.documentElement.dataset.motion === "paused";
    const isWord = mode === "hybrid" || mode === "orbit";
    const count = heading ? 760 : subtle ? 140 : 300;
    const particles = Array.from({ length: count }, (_, index) => {
      const y = 1 - (index / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = index * Math.PI * (3 - Math.sqrt(5));
      return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius, phase: angle };
    });
    let width = 0, height = 0, raf = 0, last = 0;
    let time = elapsed.current;
    let visible = false;
    let color = "0,102,204";
    let symbol: { x: number; y: number }[] = [];
    const pointer = { x: -1000, y: -1000 };
    const smooth = (value: number) => {
      const x = Math.min(1, Math.max(0, value));
      return x * x * (3 - 2 * x);
    };

    function readColors() {
      const hex = getComputedStyle(document.documentElement).getPropertyValue("--cb").trim().replace("#", "");
      const n = parseInt(hex, 16);
      color = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
    }

    // Fit the complete word once per resize. Long project names never depend on an SW-sized mask.
    function buildWord() {
      const mask = document.createElement("canvas");
      mask.width = 1000; mask.height = 180;
      const m = mask.getContext("2d");
      symbol = [];
      if (!m) return;
      m.font = "650 140px system-ui";
      const size = Math.min(140, 900 / Math.max(m.measureText(label).width, 1) * 140);
      m.font = `650 ${size}px system-ui`;
      m.textAlign = "center"; m.textBaseline = "middle";
      m.fillText(label, 500, 90);
      const pixels = m.getImageData(0, 0, 1000, 180).data;
      for (let y = 5; y < 175; y += 3) {
        for (let x = 10; x < 990; x += 3) {
          if (pixels[(y * 1000 + x) * 4 + 3] > 120) symbol.push({ x: (x - 500) / 1000, y: (y - 90) / 1000 });
        }
      }
    }

    function drawWeb(points: Dot[], gather: number) {
      if (!fine.matches || reduced.matches || pointer.x < 0) return;
      const nearby = points.filter(p => p.distance < 155).slice(0, 85);
      // Bound connection work to a small neighborhood and at most three neighbors per point.
      for (let i = 0; i < nearby.length; i++) {
        let links = 0;
        for (let j = i + 1; j < nearby.length && links < 3; j++) {
          const a = nearby[i], b = nearby[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > 65) continue;
          const alpha = (1 - distance / 65) * (1 - Math.min(a.distance, b.distance) / 155) * .3 * (1 - gather);
          ctx!.strokeStyle = `rgba(${color},${alpha})`;
          ctx!.lineWidth = .7;
          ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke();
          links++;
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      const cycle = time % 18;
      // Project titles arrive promptly, hold long enough to read, then dissolve slowly.
      const gather = reduced.matches ? 1 : heading
        ? smooth(cycle / 2.5) * (1 - smooth((cycle - 9) / 4))
        : smooth((cycle - 4) / 3) * (1 - smooth((cycle - 12) / 3));
      const radius = subtle ? Math.min(width * .11, height * .27) : Math.min(width * .35, height * .36);
      const wordWidth = heading ? Math.min(width - 40, 1050) : subtle ? radius * 2.5 : radius * 3;
      const centers = subtle ? [width * .13, width * .87] : [width * (heading ? .5 : .68)];
      for (const cx of centers) {
        const cy = height * (heading ? .5 : .42);
        const points = particles.map((particle, index) => {
          const spin = time * .1;
          const x = particle.x * Math.cos(spin) + particle.z * Math.sin(spin);
          const z = -particle.x * Math.sin(spin) + particle.z * Math.cos(spin);
          const target = symbol[Math.floor(index / count * symbol.length)] ?? { x: 0, y: 0 };
          let px = cx + x * radius, py = cy + particle.y * radius;
          if (isWord) {
            px = px * (1 - gather) + (cx + target.x * wordWidth) * gather;
            py = py * (1 - gather) + (cy + target.y * wordWidth) * gather;
          } else {
            px = (.5 + Math.sin(particle.phase * 13.3) * .49) * width;
            py = (.5 + Math.cos(particle.phase * 7.1) * .49) * height;
            if (!reduced.matches) { px += Math.sin(time * .2 + particle.phase) * 6; py += Math.cos(time * .2 + particle.phase) * 6; }
          }
          const distance = Math.hypot(px - pointer.x, py - pointer.y);
          if (!isPaused() && !reduced.matches && fine.matches && distance > 1 && distance < 100) {
            const push = (1 - distance / 100) * 10 * (1 - gather);
            px += (px - pointer.x) / distance * push; py += (py - pointer.y) / distance * push;
          }
          return { x: px, y: py, depth: (z + 1) / 2, distance };
        });
        if (mode === "web" || mode === "hybrid") drawWeb(points, isWord ? gather : 0);
        if (mode === "spotlight" && pointer.x > 0) {
          const glow = ctx!.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 180);
          glow.addColorStop(0, `rgba(${color},.07)`); glow.addColorStop(1, `rgba(${color},0)`);
          ctx!.fillStyle = glow; ctx!.fillRect(0, 0, width, height);
        }
        for (const point of points) {
          const alpha = subtle ? .1 + point.depth * .1 : isWord ? .2 + gather * .55 + point.depth * .1 : .08 + Math.max(0, 1 - point.distance / 180) * .4;
          ctx!.fillStyle = `rgba(${color},${alpha})`;
          ctx!.beginPath(); ctx!.arc(point.x, point.y, heading ? (compact.matches ? .95 : 1.3) : 1.2, 0, Math.PI * 2); ctx!.fill();
        }
      }
    }

    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden || isPaused() || reduced.matches || (subtle && compact.matches)) return;
      if (!last) last = now;
      if (now - last >= 33) {
        time += Math.min((now - last) / 1000, .08); elapsed.current = time; last = now; draw();
      }
      raf = requestAnimationFrame(frame);
    }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    function start() {
      if (!raf && visible && !document.hidden && !isPaused() && !reduced.matches && !(subtle && compact.matches)) { last = 0; raf = requestAnimationFrame(frame); }
    }
    function preference() { stop(); draw(); start(); }
    function resize() {
      width = host!.clientWidth; height = host!.clientHeight;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas!.width = Math.round(width * ratio); canvas!.height = Math.round(height * ratio);
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0); buildWord(); draw();
    }
    function move(event: PointerEvent) {
      if (!fine.matches || reduced.matches || isPaused()) return;
      const rect = host!.getBoundingClientRect(); pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top;
    }
    function leave() { pointer.x = -1000; pointer.y = -1000; }
    const resizeObserver = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) start(); else stop(); });
    const theme = new MutationObserver(() => { readColors(); preference(); });
    readColors(); resize(); resizeObserver.observe(host); intersection.observe(host);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-motion"] });
    compact.addEventListener("change", preference); reduced.addEventListener("change", preference);
    document.addEventListener("visibilitychange", preference);
    host.addEventListener("pointermove", move, { passive: true }); host.addEventListener("pointerleave", leave);
    return () => {
      stop(); resizeObserver.disconnect(); intersection.disconnect(); theme.disconnect();
      compact.removeEventListener("change", preference); reduced.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", preference);
      host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave);
    };
  }, [mode, label, paused, subtle, heading]);

  return <canvas ref={ref} aria-hidden="true" data-particle-label={label} className={subtle ? "hero-particles" : "particle-canvas"} />;
}
