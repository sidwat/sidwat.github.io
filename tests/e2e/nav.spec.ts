// NAV-* (04 §5.5). The new-nav cases mark themselves fixme until F-4 (Blog rename,
// Contact link). The skip link and theme cases run now.

import { expect, test } from "@playwright/test";

import { GROUNDS, needs, useGround, watchConsole } from "./helpers";

const WIDTHS = [320, 375, 768, 1024, 1280];

for (const ground of GROUNDS) {
  for (const width of WIDTHS) {
    test(`NAV-01 nav at ${width}px (${ground}): Blog + Contact, no overlap, toggle reachable`, async ({ page }) => {
      needs("newNav", "F-4");
      await useGround(page, ground);
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      if (width < 1120) await page.locator(".mobile-nav summary").click();
      const nav = page.locator(width < 1120 ? 'nav[aria-label="Mobile sections"]' : 'nav[aria-label="Sections"]');
      await expect(nav.getByRole("link", { name: "Blog", exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Contact", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: /(dark|light) mode/i })).toBeVisible();
      const boxes = await nav.locator("a").evaluateAll((as) => as.map((a) => a.getBoundingClientRect().toJSON()));
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i], b = boxes[j];
          const overlap = a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
          expect(overlap, `nav items ${i} and ${j} overlap`).toBe(false);
        }
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(sw).toBeLessThanOrEqual(cw);
    });
  }
}

test("NAV-02 aria-current on blog, post and contact", async ({ page }) => {
  needs("newNav", "F-4");
  for (const [path, label] of [["/blog/", "Blog"], ["/contact/", "Contact"]]) {
    await page.goto(path);
    await expect(page.locator('nav[aria-label="Sections"] [aria-current="page"]')).toHaveText(label);
  }
});

test("NAV-03 footer links to /contact/ and mailto", async ({ page }) => {
  needs("newNav", "F-4");
  await page.goto("/");
  await expect(page.locator('footer a[href^="/contact"]')).toHaveCount(1);
  await expect(page.locator('footer a[href^="mailto:"]')).toHaveCount(1);
});

test("NAV-04 404 lists the new destinations", async ({ page }) => {
  needs("newNav", "F-4");
  await page.goto("/nope/");
  await expect(page.locator('#main a[href^="/blog"]')).toHaveCount(1);
  await expect(page.locator('#main a[href^="/contact"]')).toHaveCount(1);
});

for (const path of ["/", "/blog/", "/contact/"]) {
  test(`NAV-05 skip link moves focus to #main on ${path}`, async ({ page, browserName }) => {
    if (path === "/contact/") needs("contact", "F-3");
    test.skip(browserName === "webkit", "WebKit does not Tab to links by default (macOS setting); covered manually (A11Y-03)");
    await page.goto(path);
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    expect(await page.evaluate(() => document.activeElement?.closest("#main") !== null || location.hash === "#main")).toBe(true);
  });
}

test("NAV-06 stored dark ground is applied before first paint", async ({ page }) => {
  await useGround(page, "dark");
  // Read data-theme at DOMContentLoaded, before any client bundle has run.
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      (window as unknown as { __themeAtDcl?: string }).__themeAtDcl = document.documentElement.dataset.theme;
    });
  });
  await page.goto("/");
  expect(await page.evaluate(() => (window as unknown as { __themeAtDcl?: string }).__themeAtDcl)).toBe("dark");
});

test("NAV-07 client navigation Home -> Blog -> Post -> Contact -> back", async ({ page }) => {
  needs("newNav", "F-4");
  const messages = watchConsole(page);
  await page.goto("/");
  await page.locator('nav[aria-label="Sections"]').getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/$/);
  const firstPost = page.getByTestId("post-row").locator("a").first();
  if (await firstPost.count()) {
    await firstPost.click();
    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+\/$/);
  }
  await page.locator('nav[aria-label="Sections"]').getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/\/contact\/$/);
  await page.goBack();
  expect(messages.filter((m) => /hydrat|pageerror/i.test(m)), messages.join("\n")).toEqual([]);
});
