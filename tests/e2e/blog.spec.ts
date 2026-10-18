// BLG-* (04 §5.1). Cases mark themselves fixme until F-2 builds the real blog pages,
// and run only on the build they describe (QA_BUILD).

import { readdirSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { BUILD, expectNoSkippedLevels, GROUNDS, headingLevels, needs, onlyOn, OUT_DIR, useGround, watchConsole } from "./helpers";

test("BLG-01 B0: /blog/ shows the empty state", async ({ page }) => {
  onlyOn("B0", "B4");
  needs("blog", "F-2");
  const res = await page.goto("/blog/");
  expect(res?.status()).toBe(200);
  await expect(page.getByTestId("blog-empty")).toBeVisible();
  await expect(page.getByTestId("post-list")).toHaveCount(0);
  await expect(page.locator("h1")).toHaveCount(1);
  const postDirs = readdirSync(path.join(OUT_DIR, "blog"), { withFileTypes: true }).filter((d) => d.isDirectory());
  expect(postDirs.map((d) => d.name), "no post pages in out/blog").toEqual([]);
});

test("BLG-02 B1: exactly one row, qa-published", async ({ page }) => {
  onlyOn("B1");
  needs("blog", "F-2");
  await page.goto("/blog/");
  const rows = page.getByTestId("post-row");
  await expect(rows).toHaveCount(1);
  await expect(rows.locator('a[href^="/blog/qa-published"]')).toHaveCount(1);
});

test("BLG-02 B1X: newest first and grouped by year across the boundary", async ({ page }) => {
  onlyOn("B1X");
  needs("blog", "F-2");
  await page.goto("/blog/");
  const hrefs = await page.getByTestId("post-row").locator("a[href^='/blog/']").evaluateAll((as) =>
    as.map((a) => a.getAttribute("href")!.replace(/\/$/, "").split("/").pop()),
  );
  const order = hrefs.filter((h, i) => hrefs.indexOf(h) === i);
  expect(order.indexOf("qa-order-new")).toBeLessThan(order.indexOf("qa-order-old"));
  expect(order.indexOf("qa-published")).toBeLessThan(order.indexOf("qa-order-new"));
  // Year headings: 2026 must precede 2025, and the 2025-12-31 post sits under 2025.
  const text = await page.locator("#main").innerText();
  expect(text.indexOf("2026")).toBeLessThan(text.indexOf("2025"));
});

test("BLG-03 B1: draft and future posts are not exposed anywhere", async ({ page, request }) => {
  onlyOn("B1", "B1X");
  needs("blog", "F-2");
  await page.goto("/blog/");
  const html = await page.content();
  expect(html).not.toMatch(/qa-draft|qa-future/);
  for (const slug of ["qa-draft", "qa-future"]) {
    expect(readdirSync(path.join(OUT_DIR, "blog"))).not.toContain(slug);
    expect((await request.get(`/blog/${slug}/`)).status()).toBe(404);
  }
  expect(await (await request.get("/sitemap.xml")).text()).not.toMatch(/qa-draft|qa-future/);
});

test("BLG-04 B2: both sample drafts listed with a text DRAFT badge", async ({ page }) => {
  onlyOn("B2");
  needs("blog", "F-2");
  await page.goto("/blog/");
  await expect(page.getByTestId("post-row")).toHaveCount(2);
  const badges = page.getByTestId("post-draft-badge");
  await expect(badges).toHaveCount(2);
  for (const t of await badges.allInnerTexts()) expect(t.trim().length, "badge is not colour-only").toBeGreaterThan(0);
});

test.describe("post page", () => {
  const slug = BUILD === "B2" ? "hello-world" : "qa-published";

  test("BLG-05 title, time, reading time, tags, body, canonical", async ({ page }) => {
    needs("post", "F-2", slug);
    await page.goto(`/blog/${slug}/`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByTestId("post-title")).toBeVisible();
    await expect(page.getByTestId("post-date").locator("time[datetime]")).toHaveCount(1);
    await expect(page.getByTestId("post-body")).not.toBeEmpty();
    await expect(page.getByTestId("post-tags")).toBeVisible();
    await expect(page).toHaveTitle(/ — Sidhartha Watsa$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://sidwat.github.io/blog/${slug}/`);
    expectNoSkippedLevels(await headingLevels(page));
  });

  test("BLG-08 description, OG article tags, BlogPosting JSON-LD", async ({ page }) => {
    needs("post", "F-2", slug);
    await page.goto(`/blog/${slug}/`);
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc?.length).toBeGreaterThan(0);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    await expect(page.locator('meta[property="article:published_time"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsed = ld.map((t) => JSON.parse(t));
    const post = parsed.flatMap((p) => (Array.isArray(p) ? p : [p])).find((p) => p["@type"] === "BlogPosting");
    expect(post, "BlogPosting JSON-LD").toBeTruthy();
    expect(post.headline).toBe(await page.getByTestId("post-title").innerText());
    expect(Date.parse(post.datePublished)).not.toBeNaN();
  });

  test("BLG-10 previous/next omitted at the ends", async ({ page }) => {
    onlyOn("B1");
    needs("post", "F-2", slug);
    await page.goto(`/blog/${slug}/`);
    // A single post has neither neighbour.
    await expect(page.locator('a[rel="prev"], a[rel="next"]')).toHaveCount(0);
  });

  test("BLG-12 cover image reserves its box and has alt", async ({ page }) => {
    onlyOn("B2");
    needs("post", "F-2", "hello-world");
    await page.goto("/blog/hello-world/");
    const img = page.locator("main img, #main img").first();
    await expect(img).toHaveAttribute("alt", /.+/);
    await expect(img).toHaveAttribute("width", /\d+/);
    await expect(img).toHaveAttribute("height", /\d+/);
  });

  test("BLG-13 body images have width/height and load", async ({ page }) => {
    onlyOn("B2");
    needs("post", "F-2", "hello-world");
    await page.goto("/blog/hello-world/", { waitUntil: "networkidle" });
    for (const img of await page.getByTestId("post-body").locator("img").all()) {
      await expect(img).toHaveAttribute("width", /\d+/);
      await expect(img).toHaveAttribute("height", /\d+/);
      expect(await img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
    }
  });

  for (const ground of GROUNDS) {
    test(`BLG-14 no console errors or warnings (${ground})`, async ({ page }) => {
      needs("post", "F-2", slug);
      const messages = watchConsole(page);
      await useGround(page, ground);
      await page.goto("/blog/", { waitUntil: "networkidle" });
      await page.goto(`/blog/${slug}/`, { waitUntil: "networkidle" });
      expect(messages, messages.join("\n")).toEqual([]);
    });
  }
});

test("BLG-07 edge post: no page scroll at 320px; markup text stays text", async ({ page }) => {
  onlyOn("B1X");
  needs("post", "F-2", "qa-edge");
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/blog/qa-edge/", { waitUntil: "networkidle" });
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(sw).toBeLessThanOrEqual(cw);
  expect(await page.evaluate(() => (window as unknown as { __qaPwned?: number }).__qaPwned)).toBeUndefined();
  const body = page.getByTestId("post-body");
  await expect(body.locator("script")).toHaveCount(0);
  await expect(body).toContainText("<script>");
});

test("BLG-09 unknown slug renders the site 404", async ({ page }) => {
  const res = await page.goto("/blog/nope/");
  expect(res?.status()).toBe(404); // provisional: local server (04 §10)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/no such page/i);
});

test("BLG-11 date is UTC and identical before and after hydration", async ({ browser }) => {
  onlyOn("B1X");
  needs("post", "F-2", "qa-edge");
  const ctx = await browser.newContext({ timezoneId: "Pacific/Auckland", javaScriptEnabled: false });
  const ssr = await ctx.newPage();
  await ssr.goto("/blog/qa-edge/");
  const before = await ssr.getByTestId("post-date").innerText();
  await ctx.close();
  const ctx2 = await browser.newContext({ timezoneId: "Pacific/Auckland" });
  const page = await ctx2.newPage();
  const messages = watchConsole(page);
  await page.goto("/blog/qa-edge/", { waitUntil: "networkidle" });
  expect(await page.getByTestId("post-date").innerText()).toBe(before);
  expect(before).toMatch(/1 Nov 2025/);
  expect(messages.filter((m) => /hydrat/i.test(m))).toEqual([]);
  await ctx2.close();
});

test("BLG-06 prose elements match design in both grounds", async () => {
  test.fixme(true, "pending Q-2: visual check against docs/design/prose.md (A+M)");
});
