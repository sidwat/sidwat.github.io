// Shared helpers for the QA specs (docs/04-qa-plan.md). Specs read the static export
// directly for features that do not exist yet, so a case marks itself `fixme` until
// the feature lands and then starts running on its own.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

/** Which build of the matrix (04 §3) is being served: B0 B1 B1X B2 B4. */
export const BUILD = (process.env.QA_BUILD ?? "B0").toUpperCase();
export const OUT_DIR = path.resolve(process.env.QA_OUT_DIR ?? "out");

/** Keep in sync with tests/scripts/build-matrix.mjs. Never a real provider. */
export const STUB_ENDPOINT = "https://contact-stub.qa.invalid/submit";
export const STUB_PATTERN = "https://contact-stub.qa.invalid/**";

/** Pages that exist on origin/master and must not regress (REG-*). */
export const EXISTING_PAGES = ["/", "/experience/", "/publications/", "/projects/", "/teaching/", "/gallery/"] as const;
export const GROUNDS = ["ink", "studio"] as const;
export type Ground = (typeof GROUNDS)[number];

function outFile(rel: string): string | undefined {
  const p = path.join(OUT_DIR, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : undefined;
}

/** Feature detection on the export, used to `fixme` cases whose page is not built yet. */
export const has = {
  /** F-2: the real blog index (not the "Coming soon." placeholder). */
  blog: () => /data-testid="(blog-empty|post-list)"/.test(outFile("blog/index.html") ?? ""),
  contact: () => existsSync(path.join(OUT_DIR, "contact/index.html")),
  feed: () => existsSync(path.join(OUT_DIR, "blog/feed.xml")),
  admin: () => existsSync(path.join(OUT_DIR, "admin/index.html")),
  /** F-4: the new nav (Contact link in the header). */
  newNav: () => /<nav[^>]*aria-label="Sections"[\s\S]*?href="\/contact\/?"/.test(outFile("index.html") ?? ""),
  post: (slug: string) => existsSync(path.join(OUT_DIR, `blog/${slug}/index.html`)),
};

/** Mark the current test fixme (pending) when its feature is not in this build. */
export function needs(feature: keyof typeof has, task: string, arg?: string) {
  const present = feature === "post" ? has.post(arg ?? "") : (has[feature] as () => boolean)();
  test.fixme(!present, `pending ${task}: ${feature}${arg ? ` ${arg}` : ""} not in ${OUT_DIR}`);
}

/** Skip unless the served build is one of `builds`. */
export function onlyOn(...builds: string[]) {
  test.skip(!builds.includes(BUILD), `runs on ${builds.join("/")}, this is ${BUILD}`);
}

/** Set the ground before the first script runs, the way a returning visitor has it. */
export async function useGround(page: Page, ground: Ground) {
  await page.addInitScript((g) => {
    try {
      localStorage.setItem("theme", g === "studio" ? "studio" : "plate");
    } catch {
      /* storage blocked */
    }
  }, ground);
}

/** Collect console errors/warnings and uncaught exceptions for the page's lifetime. */
export function watchConsole(page: Page): string[] {
  const messages: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") messages.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => messages.push(`pageerror: ${e.message}`));
  return messages;
}

/** Same-origin links on the current page, normalised to paths. */
export async function internalLinks(page: Page): Promise<string[]> {
  const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => (a as HTMLAnchorElement).href));
  const origin = new URL(page.url()).origin;
  return [...new Set(hrefs.filter((h) => h.startsWith(origin)).map((h) => new URL(h).pathname))];
}

/** Heading levels in document order. */
export async function headingLevels(page: Page): Promise<number[]> {
  return page.$$eval("h1,h2,h3,h4,h5,h6", (hs) => hs.map((h) => Number(h.tagName[1])));
}

export function expectNoSkippedLevels(levels: number[]) {
  expect(levels.filter((l) => l === 1), "exactly one h1").toHaveLength(1);
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i] - levels[i - 1], `heading h${levels[i - 1]} -> h${levels[i]}`).toBeLessThanOrEqual(1);
  }
}

/** Baseline captured from origin/master in Q-1 (tests/fixtures/baseline/). */
export function baseline<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(path.join(__dirname, "../fixtures/baseline", name), "utf8")) as T;
}

export function baselineText(name: string): string {
  return readFileSync(path.join(__dirname, "../fixtures/baseline", name), "utf8");
}

/**
 * Pre-existing defects filed in docs/qa-report.md. A case hit by one is marked
 * `test.fail`, so CI stays green while the bug is open and turns red ("expected to
 * fail") the moment it is fixed: then remove the entry and mark the bug fixed-verified.
 */
export const KNOWN_BUGS = {
  "BUG-001": "text contrast below 4.5:1 on /publications/ citation and home figcaption hint",
  "BUG-002": "nav link target size below 24px at narrow viewports",
  "BUG-003": "home hydration error #418 under prefers-reduced-motion; stored ground lost",
} as const;

export function knownBug(id: keyof typeof KNOWN_BUGS, when = true) {
  test.fail(when, `${id}: ${KNOWN_BUGS[id]}`);
}
