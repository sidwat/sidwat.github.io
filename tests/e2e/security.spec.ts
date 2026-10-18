// SEC-04…07 (04 §5.7). SEC-01/02 run outside the browser: tests/scripts/scan-out.mjs.

import { createHash } from "node:crypto";

import { expect, test } from "@playwright/test";

import { EXISTING_PAGES, has, needs, onlyOn } from "./helpers";

const pages = () => [...EXISTING_PAGES, "/blog/", ...(has.contact() ? ["/contact/"] : []), ...(has.post("qa-published") ? ["/blog/qa-published/"] : [])];

test("SEC-04 script inventory: Next chunks, theme script, JSON-LD only; no third-party origins", async ({ page }) => {
  for (const path of pages()) {
    await page.goto(path);
    const scripts = await page.$$eval("script", (ss) =>
      ss.map((s) => ({ src: (s as HTMLScriptElement).src, type: s.getAttribute("type") ?? "", text: s.src ? "" : (s.textContent ?? "").slice(0, 80) })),
    );
    const origin = new URL(page.url()).origin;
    for (const s of scripts) {
      if (s.src) {
        expect(new URL(s.src).origin, `${path}: ${s.src}`).toBe(origin);
        expect(new URL(s.src).pathname, `${path}: ${s.src}`).toMatch(/^\/_next\/static\//);
      } else {
        const ok = s.type === "application/ld+json" || /localStorage\.getItem\("theme"\)/.test(s.text) || /^\(self\.__next_f|self\.__next_f|^\$RC|\$RS|requestAnimationFrame/.test(s.text) || s.text === "";
        expect(ok, `${path}: unexpected inline script ${JSON.stringify(s.text)}`).toBe(true);
      }
    }
  }
});

test("SEC-05 /admin/ CMS script is pinned with integrity + crossorigin", async ({ page, request }) => {
  needs("admin", "I-2");
  await page.goto("/admin/");
  const ext = page.locator("script[src^='https://']");
  await expect(ext).toHaveCount(1);
  const src = (await ext.getAttribute("src"))!;
  expect(src, "exact version pinned").toMatch(/@\d+\.\d+\.\d+\//);
  const integrity = (await ext.getAttribute("integrity"))!;
  expect(integrity).toMatch(/^sha(256|384|512)-/);
  await expect(ext).toHaveAttribute("crossorigin", /anonymous|^$/);
  const [algo, b64] = [integrity.split("-")[0], integrity.slice(integrity.indexOf("-") + 1)];
  const body = await (await request.get(src)).body();
  expect(createHash(algo).update(body).digest("base64")).toBe(b64);
  expect(await page.locator("[onload],[onclick],[onerror]").count()).toBe(0);
});

test("SEC-06 external links carry noopener/noreferrer", async ({ page }) => {
  for (const path of pages()) {
    await page.goto(path);
    const bad = await page.$$eval("a[href^='http']", (as) =>
      as
        .filter((a) => new URL((a as HTMLAnchorElement).href).origin !== location.origin)
        .filter((a) => a.getAttribute("target") === "_blank")
        .filter((a) => !/noopener|noreferrer/.test(a.getAttribute("rel") ?? ""))
        .map((a) => a.outerHTML.slice(0, 120)),
    );
    expect(bad, `${path}\n${bad.join("\n")}`).toEqual([]);
  }
});

test("SEC-07 hostile Markdown produces no executable output", async ({ page }) => {
  onlyOn("B1X");
  needs("post", "F-2", "qa-hostile");
  const dialogs: string[] = [];
  page.on("dialog", (d) => {
    dialogs.push(d.message());
    void d.dismiss();
  });
  await page.goto("/blog/qa-hostile/", { waitUntil: "networkidle" });
  const body = page.getByTestId("post-body");
  await expect(body.locator("script, iframe, object, embed, form, svg[onload], details[ontoggle]")).toHaveCount(0);
  const unsafe = await body.evaluate((root) => {
    const out: string[] = [];
    for (const el of root.querySelectorAll("*")) {
      for (const attr of el.getAttributeNames()) {
        const v = el.getAttribute(attr) ?? "";
        if (/^on/i.test(attr)) out.push(`${el.tagName} ${attr}`);
        if (/^(href|src|xlink:href|action|formaction)$/i.test(attr) && /^\s*(javascript|vbscript|data:text\/html|data:image\/svg)/i.test(v)) out.push(`${el.tagName} ${attr}=${v.slice(0, 30)}`);
        if (attr === "style" && /javascript:/i.test(v)) out.push(`${el.tagName} style`);
      }
    }
    return out;
  });
  expect(unsafe).toEqual([]);
  for (const a of await body.locator("a").all()) await a.click({ trial: true }).catch(() => {});
  expect(dialogs).toEqual([]);
});
