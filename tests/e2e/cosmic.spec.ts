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

test("Sky persists through client navigation and respects Reduced Motion",async({page})=>{
  await page.goto("/");
  await page.locator(".cosmic-background").evaluate(c=>c.setAttribute("data-instance-check","original"));
  await page.locator('.project-ticket').first().click();
  const sky=page.locator(".cosmic-background");
  await expect(sky).toHaveAttribute("data-instance-check","original");
  await expect(page.getByRole("button",{name:"Pause background",exact:true})).toHaveCount(0);
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.waitForTimeout(100);
  const reduced=await sky.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
  await page.mouse.move(600,300);await page.waitForTimeout(150);
  expect(await sky.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(reduced);
});


test("Home name gathers into a semantic heading, with static reduced-motion fallback",async({page})=>{
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("Sidhartha Watsa");
  await expect(page.locator(".name-stars")).toHaveAttribute("data-particle-label","Sidhartha Watsa");
  await expect(page.locator("#hero-title")).toHaveAttribute("data-particle-ready","true");
  const rect=await page.locator("h1").boundingBox();
  const ink=()=>page.locator(".name-stars").evaluate((c:HTMLCanvasElement,r)=>{
    const dpr=c.width/innerWidth;
    const pixels=c.getContext("2d")!.getImageData(Math.round(r!.x*dpr),Math.round(r!.y*dpr),Math.round(r!.width*dpr),Math.round(r!.height*dpr)).data;
    let sum=0;for(let i=3;i<pixels.length;i+=4)sum+=pixels[i];return sum;
  },rect);
  const initial=await ink();
  await page.clock.runFor(8500);
  expect(await ink()).toBeGreaterThan(initial*2);
  await expect(page.getByRole("button",{name:"Pause background",exact:true})).toHaveCount(0);
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(page.locator(".name-stars")).toBeHidden();
  await expect(page.locator(".hero-name-fallback")).toHaveCSS("opacity","1");
});


test("Formed Home name stays anchored to its heading while scrolling",async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.clock.install();
  await page.goto("/");
  await page.clock.runFor(11000);
  const read=()=>page.locator(".name-stars").evaluate((canvas:HTMLCanvasElement)=>{
    const r=document.querySelector("h1")!.getBoundingClientRect(),scale=canvas.width/innerWidth;
    const data=canvas.getContext("2d")!.getImageData(Math.round(r.x*scale),Math.round(r.y*scale),Math.round(r.width*scale),Math.round(r.height*scale)).data;
    let mass=0;for(let i=3;i<data.length;i+=4)mass+=data[i];return {top:r.top,mass};
  });
  const before=await read();
  await page.evaluate(()=>scrollTo(0,150));
  await expect.poll(async()=>{await page.clock.runFor(16);return (await read()).mass/before.mass;},{intervals:[16,32,50],timeout:1000}).toBeGreaterThan(.9);
  const after=await read();
  expect(before.top-after.top).toBe(150);
  expect(after.mass/before.mass).toBeGreaterThan(.9);
  expect(after.mass/before.mass).toBeLessThan(1.1);
  await page.evaluate(()=>scrollTo(0,0));
  await expect.poll(async()=>{await page.clock.runFor(16);return (await read()).mass/before.mass;},{intervals:[16,32,50],timeout:1000}).toBeGreaterThan(.9);
  const returned=await read();
  expect(returned.top).toBe(before.top);
  expect(returned.mass/before.mass).toBeGreaterThan(.9);
});
