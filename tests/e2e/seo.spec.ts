// SEO-01…05 and REG-08 (04 §5.2, §5.6). Content types and statuses come from the local
// server (tests/scripts/serve-out.mjs) and are provisional until the post-deploy smoke.

import { expect, test } from "@playwright/test";

import { baselineText, BUILD, EXISTING_PAGES, has, internalLinks, needs, onlyOn } from "./helpers";

const SITE = "https://sidwat.github.io";

function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

test("REG-08 sitemap: every baseline URL is still listed, only intended additions", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const now = locs(await res.text());
  const base = baselineText("sitemap.txt").trim().split("\n");
  for (const u of base) expect(now, `baseline URL ${u}`).toContain(u);
  const intended = new RegExp(`^${SITE}/(contact|blog/[a-z0-9-]+)/$`);
  for (const u of now.filter((u) => !base.includes(u))) expect(u, "unexpected sitemap addition").toMatch(intended);
});

test("SEO-03 sitemap: contact, published post; no admin, drafts, future, gallery", async ({ request }) => {
  needs("newNav", "F-4");
  const now = locs(await (await request.get("/sitemap.xml")).text());
  expect(now).toContain(`${SITE}/contact/`);
  expect(now).toContain(`${SITE}/blog/`);
  for (const u of now) {
    expect(u).toMatch(/\/$/);
    expect(u).not.toMatch(/\/admin\/|\/gallery\/|qa-draft|qa-future/);
  }
  if (BUILD === "B1" || BUILD === "B1X") expect(now).toContain(`${SITE}/blog/qa-published/`);
});

test("SEO-04 robots.txt disallows /admin/ and names an absolute sitemap", async ({ request }) => {
  test.fixme(!has.newNav() && !has.admin(), "pending F-4/I-2: robots has no /admin/ rule yet");
  const txt = await (await request.get("/robots.txt")).text();
  expect(txt).toMatch(/^Disallow:\s*\/admin\/\s*$/m);
  expect(txt).toMatch(new RegExp(`^Sitemap:\\s*${SITE}/sitemap\\.xml\\s*$`, "m"));
});

test("SEO-05 /admin/ is noindex and not linked from any page", async ({ page }) => {
  needs("admin", "I-2");
  await page.goto("/admin/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const queue = ["/", ...EXISTING_PAGES, "/blog/", "/contact/"];
  const seen = new Set<string>();
  while (queue.length) {
    const p = queue.shift()!;
    if (seen.has(p) || p.startsWith("/admin")) continue;
    seen.add(p);
    const res = await page.goto(p);
    if (!res || res.status() >= 400) continue;
    const links = await internalLinks(page);
    expect(links.filter((l) => l.startsWith("/admin")), `admin link on ${p}`).toEqual([]);
    queue.push(...links.filter((l) => !/\.(pdf|xml|txt|png|jpe?g|mp4|webm)$/.test(l)));
  }
});

test("SEO-01 feed.xml is well-formed RSS 2.0 with absolute slashed URLs", async ({ page, request }) => {
  needs("feed", "F-4");
  const res = await request.get("/blog/feed.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  // Parse in the browser: DOMParser reports well-formedness errors as <parsererror>.
  await page.goto("/");
  const info = await page.evaluate((src) => {
    const doc = new DOMParser().parseFromString(src, "application/xml");
    return {
      error: doc.querySelector("parsererror")?.textContent ?? null,
      version: doc.documentElement.getAttribute("version"),
      root: doc.documentElement.nodeName,
      items: [...doc.querySelectorAll("item")].map((i) => ({
        link: i.querySelector("link")?.textContent ?? "",
        guid: i.querySelector("guid")?.textContent ?? "",
        pubDate: i.querySelector("pubDate")?.textContent ?? "",
        title: i.querySelector("title")?.textContent ?? "",
      })),
      channelLink: doc.querySelector("channel > link")?.textContent ?? "",
    };
  }, xml);
  expect(info.error).toBeNull();
  expect(info.root).toBe("rss");
  expect(info.version).toBe("2.0");
  expect(info.channelLink).toMatch(/^https:\/\/sidwat\.github\.io\/.*\/$|^https:\/\/sidwat\.github\.io\/$/);
  const rfc822 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} (GMT|[+-]\d{4})$/;
  for (const i of info.items) {
    expect(i.link).toMatch(/^https:\/\/sidwat\.github\.io\/blog\/[a-z0-9-]+\/$/);
    expect(i.pubDate).toMatch(rfc822);
  }
  if (BUILD === "B0" || BUILD === "B4") expect(info.items).toHaveLength(0);
  if (BUILD === "B1") expect(info.items.map((i) => i.link)).toEqual([`${SITE}/blog/qa-published/`]);
  for (const i of info.items) expect(i.link).not.toMatch(/qa-draft|qa-future/);
});

test("SEO-02 /blog/ advertises the feed and it resolves", async ({ page, request }) => {
  needs("feed", "F-4");
  await page.goto("/blog/");
  const alt = page.locator('link[rel="alternate"][type="application/rss+xml"]');
  await expect(alt).toHaveCount(1);
  const href = (await alt.getAttribute("href"))!;
  expect((await request.get(new URL(href, page.url()).pathname)).status()).toBe(200);
});

test("SEO-01 B1 feed excludes drafts and future posts", async ({ request }) => {
  onlyOn("B1", "B1X");
  needs("feed", "F-4");
  const xml = await (await request.get("/blog/feed.xml")).text();
  expect(xml).toContain("/blog/qa-published/");
  expect(xml).not.toMatch(/qa-draft|qa-future/);
});
