#!/usr/bin/env node
// Q-1 / REG-*: capture a comparison baseline from a static export (normally a build
// of origin/master made OUTSIDE this repo). Writes:
//   tests/fixtures/baseline/pages.json   title, description, canonical, h-levels, #main text, internal links
//   tests/fixtures/baseline/assets.json  status + sha256 of key assets
//   tests/fixtures/baseline/sitemap.txt  sitemap URLs (lastmod dropped: it is the build time)
//   tests/fixtures/baseline/robots.txt
//   tests/fixtures/baseline/route-js.json
//   docs/qa/baseline/*.jpg               12 small screenshots (<= 300 KB each)
//
//   node tests/scripts/capture-baseline.mjs <out-dir> [port=4180]
// Uses Chromium with prefers-reduced-motion so animated text is in its final state.

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.resolve(process.argv[2] ?? "out");
const port = Number(process.argv[3] ?? 4180);
const base = `http://127.0.0.1:${port}`;
const fixtures = path.join(repo, "tests/fixtures/baseline");
const shots = path.join(repo, "docs/qa/baseline");
mkdirSync(fixtures, { recursive: true });
mkdirSync(shots, { recursive: true });

const PAGES = ["/", "/experience/", "/publications/", "/projects/", "/teaching/", "/gallery/", "/blog/", "/404.html"];
const ASSETS = ["/cv.pdf", "/media/portrait.jpg", "/media/hero-wave.mp4", "/media/hero-wave.webm", "/icon.png", "/opengraph-image.png", "/robots.txt", "/sitemap.xml"];
// [name, path, width, ground]; 12 in total (docs/qa/baseline.md lists them).
const SHOTS = [
  ["home-1280-ink", "/", 1280, "ink"],
  ["home-1280-studio", "/", 1280, "studio"],
  ["home-375-ink", "/", 375, "ink"],
  ["experience-1280-ink", "/experience/", 1280, "ink"],
  ["publications-1280-ink", "/publications/", 1280, "ink"],
  ["publications-1280-studio", "/publications/", 1280, "studio"],
  ["projects-1280-ink", "/projects/", 1280, "ink"],
  ["projects-375-studio", "/projects/", 375, "studio"],
  ["teaching-1280-ink", "/teaching/", 1280, "ink"],
  ["teaching-375-ink", "/teaching/", 375, "ink"],
  ["blog-1280-ink", "/blog/", 1280, "ink"],
  ["404-1280-ink", "/404.html", 1280, "ink"],
];

const server = spawn(process.execPath, [path.join(repo, "tests/scripts/serve-out.mjs"), outDir, String(port)], { stdio: "inherit" });
await new Promise((r) => setTimeout(r, 600));

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const pages = {};
  for (const p of PAGES) {
    const res = await page.goto(base + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    pages[p] = await page.evaluate(() => {
      const meta = (sel) => document.querySelector(sel)?.getAttribute("content") ?? null;
      const main = document.querySelector("#main") ?? document.body;
      return {
        title: document.title,
        description: meta('meta[name="description"]'),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
        robots: meta('meta[name="robots"]'),
        ogImage: meta('meta[property="og:image"]'),
        headings: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => `${h.tagName}: ${h.textContent.trim()}`),
        navLabels: [...document.querySelectorAll('nav[aria-label="Sections"] a')].map((a) => a.textContent.trim()),
        text: main.innerText.replace(/\s+/g, " ").trim(),
        links: [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")))].sort(),
        scripts: [...document.querySelectorAll("script[src]")].map((s) => new URL(s.src).origin === location.origin ? "self" : new URL(s.src).origin),
      };
    });
    pages[p].status = res?.status() ?? null;
  }
  writeFileSync(path.join(fixtures, "pages.json"), JSON.stringify(pages, null, 2) + "\n");

  const assets = {};
  for (const a of ASSETS) {
    const res = await ctx.request.get(base + a);
    const body = await res.body();
    assets[a] = { status: res.status(), bytes: body.length, sha256: createHash("sha256").update(body).digest("hex"), contentType: res.headers()["content-type"] };
  }
  writeFileSync(path.join(fixtures, "assets.json"), JSON.stringify(assets, null, 2) + "\n");

  const sitemap = readFileSync(path.join(outDir, "sitemap.xml"), "utf8");
  writeFileSync(path.join(fixtures, "sitemap.txt"), [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).join("\n") + "\n");
  writeFileSync(path.join(fixtures, "robots.txt"), readFileSync(path.join(outDir, "robots.txt"), "utf8"));
  const rj = spawnSync(process.execPath, [path.join(repo, "tests/scripts/route-js.mjs"), outDir, "--json"], { encoding: "utf8" });
  const routeJs = JSON.parse(rj.stdout);
  routeJs.dir = "<baseline out/>";
  writeFileSync(path.join(fixtures, "route-js.json"), JSON.stringify(routeJs, null, 2) + "\n");

  for (const [name, p, width, ground] of SHOTS) {
    const c = await browser.newContext({ reducedMotion: "reduce", viewport: { width, height: width < 800 ? 812 : 900 }, deviceScaleFactor: 1 });
    await c.addInitScript((g) => localStorage.setItem("theme", g === "studio" ? "studio" : "plate"), ground);
    const pg = await c.newPage();
    await pg.goto(base + p, { waitUntil: "networkidle" });
    await pg.waitForTimeout(500);
    const file = path.join(shots, `${name}.jpg`);
    let quality = 60;
    await pg.screenshot({ path: file, type: "jpeg", quality, fullPage: true });
    while (statSync(file).size > 300 * 1024 && quality > 25) {
      quality -= 10;
      await pg.screenshot({ path: file, type: "jpeg", quality, fullPage: true });
    }
    if (statSync(file).size > 300 * 1024) await pg.screenshot({ path: file, type: "jpeg", quality: 50, fullPage: false });
    console.log(`${name}.jpg ${(statSync(file).size / 1024).toFixed(0)} KB (q${quality})`);
    await c.close();
  }
} finally {
  await browser.close();
  server.kill();
}
