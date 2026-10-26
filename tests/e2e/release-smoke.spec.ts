import { expect, test, type APIRequestContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { nav, site } from "../../lib/site";
import { projects } from "../../lib/content";

const slash = (p:string) => p === "/" ? p : p.replace(/\/$/, "") + "/";
const coreRoutes = [...new Set(["/", ...nav.map(n => slash(n.href)), ...projects.map(p => `/projects/${p.slug}/`)])];
test.use({serviceWorkers:"block"});
test.beforeEach(async({context})=>{
  await context.route("**/*",route=>["GET","HEAD","OPTIONS"].includes(route.request().method())?route.continue():route.abort());
});
async function publicRoutes(request:APIRequestContext){
  const response=await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const published=[...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
  return [...new Set([...coreRoutes,...published])];
}

for (const appearance of ["light", "dark"]) {
  test(`Public routes, headings and mobile/desktop layout in ${appearance}`, async ({page, request}) => {
    test.setTimeout(120_000);
    const routes = await publicRoutes(request);
    const errors:string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.addInitScript(t => localStorage.setItem("theme", t), appearance);
    for (const width of [390, 1440]) {
      await page.setViewportSize({width, height:900});
      for (const route of routes) {
        const response = await page.goto(route, {waitUntil:"networkidle"});
        expect(response?.status(), route).toBe(200);
        await expect(page.locator("h1"), route).toHaveCount(1);
        await expect(page.locator("#main"), route).toBeVisible();
        expect((await page.title()).trim(), route).not.toBe("");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}px`).toBe(true);
        expect(errors, `${route}: runtime errors`).toEqual([]);
      }
    }
    await page.goto("/");
    await page.screenshot({path:test.info().outputPath(`home-${appearance}.png`), fullPage:true});
  });
}

test("Internal destinations, images/media and CV resolve without 404s", async ({page,request,baseURL}) => {
  test.setTimeout(90_000);
  const links=new Set<string>(),media=new Set<string>();
  for (const route of await publicRoutes(request)) {
    await page.goto(route);
    const paths = await page.locator('a[href]').evaluateAll(nodes => nodes.map(n => n.getAttribute("href")!));
    for (const href of paths) {
      const url = new URL(href, new URL(route, baseURL));
      if ([new URL(baseURL!).origin, new URL(site.url).origin].includes(url.origin)) links.add(url.pathname + url.search + url.hash);
    }
    const resources = await page.locator('img[src],video[src],video[poster],video source[src],audio source[src]').evaluateAll(nodes => nodes.flatMap(n => [n.getAttribute("src"), n.getAttribute("poster")]).filter((v):v is string => Boolean(v)));
    for (const resource of resources) {
      const url = new URL(resource, baseURL);
      if (url.origin === new URL(baseURL!).origin) media.add(url.pathname + url.search);
    }
    expect(await page.locator("img:not([alt])").count(), `${route}: missing image alt attribute`).toBe(0);
    const broken=await page.locator("img[src]").evaluateAll(async nodes=>{
      const failures:string[]=[];
      await Promise.all(nodes.map(async node=>{const image=node as HTMLImageElement;image.loading="eager";try{await image.decode();}catch{failures.push(image.getAttribute("src")??"unknown");}}));
      return failures;
    });
    expect(broken,`${route}: images must decode`).toEqual([]);
  }
  for (const destination of links){
    const response=await request.get(destination);
    expect(response.status(),destination).toBe(200);
    const url=new URL(destination,baseURL);
    if(url.hash && response.headers()["content-type"]?.includes("text/html")){
      await page.goto(url.pathname+url.search);
      expect(await page.evaluate(id=>Boolean(document.getElementById(id)||document.getElementsByName(id).length),decodeURIComponent(url.hash.slice(1))),destination).toBe(true);
    }
  }
  for (const asset of media) {
    const response = await request.head(asset);
    expect(response.status(), asset).toBe(200);
    expect(response.headers()["content-type"], `${asset}: must not be a fallback HTML page`).not.toContain("text/html");
  }
  const cv = await request.get("/cv.pdf");
  expect(cv.status()).toBe(200);
  expect((await cv.body()).subarray(0,4).toString()).toBe("%PDF");
  expect((await request.get("/qa-unknown-page/" )).status()).toBe(404);
});

test("Theme toggle, mobile navigation and project destinations work",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("/");
  const prior=await page.locator("html").getAttribute("data-theme");
  await page.getByRole("button",{name:prior==="dark"?"Light mode":"Dark mode",exact:true}).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme",prior==="dark"?"light":"dark");
  await page.locator(".mobile-nav summary").click();
  await page.getByRole("navigation",{name:"Mobile sections"}).getByRole("link",{name:"Projects",exact:true}).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  if(projects.length){
    await page.locator(`.project-ticket[href="/projects/${projects[0].slug}/"]`).click();
    await expect(page.locator("h1")).toHaveText(projects[0].title);
  }
});

test("Contact validates and recovers from a simulated provider failure without sending mail",async({page,context})=>{
  let calls=0;
  await context.route("**/*",async route=>{
    const request=route.request();
    if(!["GET","HEAD","OPTIONS"].includes(request.method())){
      calls++;
      return route.fulfill({status:calls===1?500:200,contentType:"application/json",body:JSON.stringify({success:calls>1})});
    }
    return route.continue();
  });
  await page.goto("/contact/");
  await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible();
  if(await page.getByTestId("contact-unconfigured").isVisible()){
    test.skip(true,"Email fallback verified; form provider is unconfigured. Simulated submission was NOT checked.");
    return;
  }
  await page.getByTestId("contact-submit").click();
  await expect(page.getByTestId("contact-error-summary")).toBeVisible();
  expect(calls).toBe(0);
  await page.getByLabel(/^Name/).fill("Release QA");
  await page.getByLabel(/^Email/).fill("qa@example.com");
  await page.getByRole("textbox",{name:"Message",exact:true}).fill("This is a simulated release check and must not be delivered.");
  await page.waitForTimeout(3100);
  await page.getByTestId("contact-submit").click();
  await expect(page.getByTestId("contact-submit")).toHaveText(/Try again/);
  await expect(page.getByRole("textbox",{name:"Message",exact:true})).toHaveValue(/simulated release check/);
  await page.getByTestId("contact-submit").click();
  await expect(page.getByTestId("contact-success")).toBeVisible();
  expect(calls).toBe(2);
});

test("Key pages have no serious/critical accessibility violations",async({page})=>{
  for(const route of ["/","/projects/","/contact/"]){
    await page.goto(route,{waitUntil:"networkidle"});
    const results=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
    expect(results.violations.filter(v=>v.impact==="serious"||v.impact==="critical").map(v=>v.id),route).toEqual([]);
  }
});
