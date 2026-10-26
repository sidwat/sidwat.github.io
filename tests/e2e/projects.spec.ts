import { expect, test } from "@playwright/test";
import { usesGalacticTheme } from "../../lib/visual-theme";
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
        if (usesGalacticTheme()) {
          await expect(page.locator(".project-banner canvas")).toHaveAttribute("data-particle-label", project.symbol);
          await expect(page.locator(".project-banner canvas")).toHaveAttribute("data-particle-accent", project.accent);
        } else await expect(page.locator(".project-banner")).toHaveCount(0);
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

test("Particle banner respects Reduced Motion for long titles", async ({ page }) => {
  test.skip(!usesGalacticTheme(), "Particle formation belongs to the Galactic preset");
  await page.goto("/projects/robomaster/", { waitUntil: "networkidle" });
  const canvas = page.locator(".project-banner canvas");
  await expect(page.getByRole("button", { name: "Pause background", exact: true })).toHaveCount(0);
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

test("Stars gather from the viewport and the assembled word yields to the pointer", async ({ page }) => {
  test.skip(!usesGalacticTheme(), "Particle formation belongs to the Galactic preset");
  await page.setViewportSize({width:1440,height:1000});
  await page.clock.install();
  await page.goto("/projects/nnlf-halide/");
  const canvas=page.locator(".project-stars");
  const banner=await page.locator(".project-banner").boundingBox();
  expect(banner).not.toBeNull();
  const center={x:banner!.x+banner!.width/2,y:banner!.y+banner!.height/2};
  const ink=()=>canvas.evaluate((el:HTMLCanvasElement,p)=>{
    const scale=el.width/innerWidth;
    const bytes=el.getContext("2d")!.getImageData(Math.round((p.x-45)*scale),Math.round((p.y-45)*scale),Math.round(90*scale),Math.round(90*scale)).data;
    let sum=0;for(let i=3;i<bytes.length;i+=4)sum+=bytes[i];return sum;
  },center);
  const drifting=await ink();
  await page.clock.runFor(16000);
  const assembled=await ink();
  expect(assembled).toBeGreaterThan(drifting*2);
  await page.mouse.move(center.x,center.y);
  await page.clock.runFor(1200);
  expect(await ink()).toBeLessThan(assembled*.8);

});
