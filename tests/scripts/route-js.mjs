#!/usr/bin/env node
// REG-07 / PERF-04: First Load JS per route and out/ size, measured from the export.
// Next 16 (Turbopack) no longer prints "First Load JS" in `next build`, so this sums the
// unique <script src> chunks each route's HTML loads (raw and gzip -9 bytes).
//
//   node tests/scripts/route-js.mjs [dir=out] [--json]

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const args = process.argv.slice(2);
const json = args.includes("--json");
const root = path.resolve(args.find((a) => !a.startsWith("--")) ?? "out");

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(root);
const sizeOf = (p) => statSync(p).size;
const gz = new Map();
const gzipSize = (p) => {
  if (!gz.has(p)) gz.set(p, gzipSync(readFileSync(p), { level: 9 }).length);
  return gz.get(p);
};

const routes = files
  .filter((f) => f.endsWith(".html"))
  .map((f) => {
    const rel = "/" + path.relative(root, f).replace(/\\/g, "/");
    const route = rel === "/index.html" ? "/" : rel.replace(/index\.html$/, "");
    const html = readFileSync(f, "utf8");
    const srcs = [...new Set([...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]))].filter((s) => s.startsWith("/"));
    const chunks = srcs.map((s) => path.join(root, s.split("?")[0])).filter((p) => files.includes(p));
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].length;
    return {
      route,
      chunks: chunks.length,
      rawKB: +(chunks.reduce((n, p) => n + sizeOf(p), 0) / 1024).toFixed(1),
      gzipKB: +(chunks.reduce((n, p) => n + gzipSize(p), 0) / 1024).toFixed(1),
      inlineScripts: inline,
      htmlKB: +(sizeOf(f) / 1024).toFixed(1),
    };
  })
  .sort((a, b) => a.route.localeCompare(b.route));

const total = files.reduce((n, f) => n + sizeOf(f), 0);
const jsFiles = files.filter((f) => f.endsWith(".js"));
const summary = {
  dir: root,
  files: files.length,
  totalKB: +(total / 1024).toFixed(1),
  htmlPages: routes.length,
  jsChunks: jsFiles.length,
  jsTotalKB: +(jsFiles.reduce((n, f) => n + sizeOf(f), 0) / 1024).toFixed(1),
  routes,
};

if (json) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log(`out/: ${summary.files} files, ${summary.totalKB} KB; ${summary.htmlPages} HTML pages; ${summary.jsChunks} JS chunks (${summary.jsTotalKB} KB)`);
  console.log("| Route | Chunks | First Load JS raw KB | gzip KB | Inline scripts | HTML KB |");
  console.log("|---|---:|---:|---:|---:|---:|");
  for (const r of routes) console.log(`| \`${r.route}\` | ${r.chunks} | ${r.rawKB} | ${r.gzipKB} | ${r.inlineScripts} | ${r.htmlKB} |`);
}
