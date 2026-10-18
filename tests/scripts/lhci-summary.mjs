#!/usr/bin/env node
// Summarise an lhci `.lighthouseci/` directory: median-of-runs per URL (by performance
// score, as lhci's median-run does) -> markdown table or JSON. Used for the baseline
// (Q-1) and the release-gate comparison (PERF-03).
//
//   node tests/scripts/lhci-summary.mjs <dir-containing-lhr-*.json> [--json]

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const dir = path.resolve(args.find((a) => !a.startsWith("--")) ?? ".lighthouseci");
const byUrl = new Map();
for (const f of readdirSync(dir).filter((f) => /^lhr-.*\.json$/.test(f))) {
  const lhr = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
  const u = new URL(lhr.finalDisplayedUrl ?? lhr.finalUrl ?? lhr.requestedUrl);
  const key = u.pathname;
  const row = {
    perf: Math.round((lhr.categories.performance?.score ?? 0) * 100),
    a11y: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
    bp: Math.round((lhr.categories["best-practices"]?.score ?? 0) * 100),
    seo: Math.round((lhr.categories.seo?.score ?? 0) * 100),
    lcpMs: Math.round(lhr.audits["largest-contentful-paint"]?.numericValue ?? 0),
    cls: +(lhr.audits["cumulative-layout-shift"]?.numericValue ?? 0).toFixed(3),
    tbtMs: Math.round(lhr.audits["total-blocking-time"]?.numericValue ?? 0),
    preset: lhr.configSettings.formFactor,
    failing: Object.values(lhr.categories)
      .filter((c) => c.id !== "performance")
      .flatMap((c) => c.auditRefs.filter((r) => r.weight > 0).map((r) => lhr.audits[r.id]).filter((a) => a.score !== null && a.score < 1).map((a) => `${c.id}:${a.id}`)),
  };
  if (!byUrl.has(key)) byUrl.set(key, []);
  byUrl.get(key).push(row);
}
const median = [...byUrl].map(([url, rows]) => {
  rows.sort((a, b) => a.perf - b.perf);
  return { url, runs: rows.length, ...rows[Math.floor(rows.length / 2)] };
}).sort((a, b) => a.url.localeCompare(b.url));

if (args.includes("--json")) console.log(JSON.stringify(median, null, 2));
else {
  console.log("| URL | Runs | Perf | A11y | Best pr. | SEO | LCP ms | CLS | TBT ms | Non-perf audits below 1 |");
  console.log("|---|---:|---:|---:|---:|---:|---:|---:|---:|---|");
  for (const r of median) console.log(`| \`${r.url}\` | ${r.runs} | ${r.perf} | ${r.a11y} | ${r.bp} | ${r.seo} | ${r.lcpMs} | ${r.cls} | ${r.tbtMs} | ${r.failing.join(", ") || "none"} |`);
}
