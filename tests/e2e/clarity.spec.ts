import { expect, test } from "@playwright/test";

const routes=["/","/experience/","/publications/","/projects/","/teaching/","/blog/","/contact/","/gallery/","/motion-studies/"];
for(const theme of ["light","dark"]){
 test(`Clarity ${theme}: every page reflows and renders without runtime errors`,async({page})=>{
  test.setTimeout(60000);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.addInitScript(t=>localStorage.setItem("theme",t),theme);
  for(const width of [320,768,1440]){
   await page.setViewportSize({width,height:900});
   for(const route of routes){
    await page.goto(route, {waitUntil:"networkidle"});await expect(page.locator("html")).toHaveAttribute("data-theme",theme);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} at ${width}`).toBe(true);
   }
  }
  expect(errors).toEqual([]);
 });
}

test("Clarity appearance: system default, manual override, and legacy migration",async({page})=>{
 await page.emulateMedia({colorScheme:"dark"});await page.goto("/");
 await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
 await page.getByRole("button",{name:"Light mode",exact:true}).click();
 await page.reload();await expect(page.locator("html")).toHaveAttribute("data-theme","light");
 await page.evaluate(()=>localStorage.setItem("theme","plate"));await page.reload();
 await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
 await page.evaluate(()=>localStorage.setItem("theme","studio"));await page.reload();
 await expect(page.locator("html")).toHaveAttribute("data-theme","light");
});

test("Clarity mobile menu: keyboard dismissal and route selection",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/");
 const summary=page.locator(".mobile-nav summary");await summary.click();
 await page.keyboard.press("Escape");await expect(summary).toBeFocused();
 await expect(page.locator(".mobile-nav")).not.toHaveAttribute("open");
 await summary.click();await page.getByRole("navigation",{name:"Mobile sections"}).getByRole("link",{name:"Projects",exact:true}).click();
 await expect(page).toHaveURL(/\/projects\/$/);await expect(page.locator(".mobile-nav")).not.toHaveAttribute("open");
});

test("Clarity pictures: real assets, project anchors and institution destinations",async({page})=>{
 await page.goto("/");const images=page.locator(".project-photo img,.institution-card img");
 await expect(images).toHaveCount(6);
 await images.evaluateAll(async nodes=>{for(const n of nodes)(n as HTMLImageElement).loading="eager";await Promise.all(nodes.map(n=>(n as HTMLImageElement).decode()));});
 expect(await images.evaluateAll(nodes=>nodes.every(n=>(n as HTMLImageElement).naturalWidth>0))).toBe(true);
 await expect(page.locator('.institution-card>a[href="https://cse.ucsd.edu/"]')).toHaveCount(1);
 await expect(page.locator('.institution-card>a[href="https://www.iitk.ac.in/"]')).toHaveCount(2);
 await page.locator(".project-ticket").first().click();await expect(page).toHaveURL(/\/projects\/nnlf-halide\/$/);
 await expect(page.locator(".project-detail h1")).toContainText("Halide");
});

test("Motion demos: all modes, pause control, and Reduced Motion",async({page})=>{
 await page.goto("/motion-studies/");const canvas=page.locator(".particle-canvas");
 for(const name of ["01 — Pointer web","02 — Soft spotlight","03 — Gather & scatter"]){
  const choice=page.getByRole("button",{name,exact:true});await choice.click();await expect(choice).toHaveAttribute("aria-pressed","true");
  await expect(canvas).toBeVisible();
 }
 await page.getByRole("button",{name:"Pause animation",exact:true}).click();
 await page.waitForTimeout(100);const before=await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
 await page.waitForTimeout(200);expect(await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(before);
 await page.getByRole("button",{name:"Play animation",exact:true}).click();
 await page.emulateMedia({reducedMotion:"reduce"});await page.waitForTimeout(100);
 const still=await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL());await page.waitForTimeout(200);
 expect(await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(still);
});
