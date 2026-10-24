import { expect, test } from "@playwright/test";
import { projects } from "../../lib/content";
import AxeBuilder from "@axe-core/playwright";

for (const theme of ["light", "dark"]) {
  test(`Dedicated project pages in ${theme}: all content, labels, links and reflow`, async ({ page, request }) => {
    await page.addInitScript(value => localStorage.setItem("theme", value), theme);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const project of projects) {
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const response = await page.goto(`/projects/${project.slug}/`, { waitUntil: "networkidle" });
        expect(response?.status()).toBe(200);
        await expect(page.locator("h1")).toHaveText(project.title);
        await expect(page.locator(".project-details li")).toHaveText(project.points);
        await expect(page.locator(".project-banner canvas")).toHaveAttribute("data-particle-label", project.symbol);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(sitemap).toContain(`/projects/${project.slug}/`);
      }
    }
    expect((await request.get("/projects/unknown-project/")).status()).toBe(404);
  });
}

test("Project tickets use individual destinations and one keyboard stop each", async ({ page }) => {
  await page.goto("/projects/");
  await expect(page.locator(".project-ticket")).toHaveCount(projects.length);
  for (const project of projects) await expect(page.locator(`.project-ticket[href="/projects/${project.slug}/"]`)).toHaveCount(1);
  await expect(page.locator(".project-ticket a")).toHaveCount(0);
  await page.locator('.project-ticket[href="/projects/apv/"]').click();
  await expect(page).toHaveURL(/\/projects\/apv\/$/);
  await page.getByRole("link", { name: "All projects" }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
});

test("Particle banner pauses and respects Reduced Motion for long titles", async ({ page }) => {
  await page.goto("/projects/robomaster/", { waitUntil: "networkidle" });
  const canvas = page.locator(".project-banner canvas");
  await page.getByRole("button", { name: "Pause background", exact: true }).click();
  const paused = await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.waitForTimeout(200);
  expect(await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).toBe(paused);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  const reduced = await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.waitForTimeout(200);
  expect(await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).toBe(reduced);
});

test("Project gallery and detail have no serious accessibility violations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/projects/", "/projects/robomaster/", "/contact/"]) {
    await page.goto(route, { waitUntil: "networkidle" });
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(result.violations.filter(v => v.impact === "serious" || v.impact === "critical").map(v => v.id)).toEqual([]);
  }
});
