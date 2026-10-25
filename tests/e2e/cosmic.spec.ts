import { expect, test } from "@playwright/test";

for(const theme of ["light","dark"]){
  test(`Shared sky in ${theme}: all routes, no web, and no layout overflow`,async({page})=>{
    await page.addInitScript(t=>localStorage.setItem("theme",t),theme);
    const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
    for(const route of ["/","/projects/","/projects/apv/","/experience/","/publications/","/teaching/","/blog/","/contact/"]){
      await page.goto(route);
      await expect(page.locator(".cosmic-background")).toHaveCount(1);
      await expect(page.locator(".site-web")).toHaveCount(0);
      expect(await page.locator(".cosmic-background").evaluate((c:HTMLCanvasElement)=>{
        const data=c.getContext("2d")!.getImageData(0,0,c.width,c.height).data;
        return data.some((v,i)=>i%4===3&&v>0);
      })).toBe(true);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test("Sky persists through client navigation and respects pause and Reduced Motion",async({page})=>{
  await page.goto("/");
  await page.locator(".cosmic-background").evaluate(c=>c.setAttribute("data-instance-check","original"));
  await page.locator('.project-ticket').first().click();
  const sky=page.locator(".cosmic-background");
  await expect(sky).toHaveAttribute("data-instance-check","original");
  await page.getByRole("button",{name:"Pause background",exact:true}).click();
  const paused=await sky.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
  await page.waitForTimeout(150);
  expect(await sky.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(paused);
  await page.getByRole("button",{name:"Play background",exact:true}).click();
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.waitForTimeout(100);
  const reduced=await sky.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
  await page.mouse.move(600,300);await page.waitForTimeout(150);
  expect(await sky.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(reduced);
});
