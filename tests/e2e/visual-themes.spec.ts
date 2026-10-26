import { expect, test } from "@playwright/test";
import { visualTheme } from "../../lib/visual-theme";

for(const appearance of ["light","dark"]){
  test(`Active ${visualTheme} preset in ${appearance}: consistent backgrounds and headings`,async({page})=>{
    await page.addInitScript(t=>localStorage.setItem("theme",t),appearance);
    for(const route of ["/","/projects/","/projects/chandrayaan/","/contact/"]){
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-visual-theme",visualTheme);
      await expect(page.locator("h1")).toBeVisible();
      if(visualTheme==="web"){
        await expect(page.locator(".site-web")).toHaveCount(1);
        await expect(page.locator(".cosmic-background,.cosmic-haze,.name-stars,.project-stars")).toHaveCount(0);
        if(route==="/")await expect(page.locator(".hero-name-fallback")).toHaveCSS("opacity","1");
      }else{
        await expect(page.locator(".cosmic-background")).toHaveCount(1);
        await expect(page.locator(".site-web")).toHaveCount(0);
      }
    }
  });
}

test("Web responds to the pointer and settles; Reduced Motion stays still",async({page})=>{
  test.skip(visualTheme!=="web","Web preset is inactive");
  await page.goto("/");
  const mesh=page.locator(".site-web");
  const before=await mesh.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
  await page.mouse.move(700,250);await page.waitForTimeout(300);
  expect(await mesh.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).not.toBe(before);
  await page.emulateMedia({reducedMotion:"reduce"});await page.waitForTimeout(100);
  const still=await mesh.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
  await page.mouse.move(300,100);await page.waitForTimeout(150);
  expect(await mesh.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(still);
});
