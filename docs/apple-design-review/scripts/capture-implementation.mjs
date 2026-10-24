import fs from 'node:fs';
import path from 'node:path';
import {chromium} from '@playwright/test';
const root=path.resolve('docs/apple-design-review/implementation');
const browser=await chromium.launch({headless:true});
const routes=[['home','/'],['experience','/experience/'],['publications','/publications/'],['projects','/projects/'],['teaching','/teaching/'],['blog','/blog/'],['contact','/contact/'],['gallery','/gallery/'],['motion','/motion-studies/']];
const checks=[];
for(const theme of ['light','dark']){
 for(const [device,width] of [['desktop',1440],['mobile',390]]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  await page.addInitScript(t=>localStorage.setItem('theme',t),theme);
  for(const [name,route] of routes){
   await page.goto(`http://127.0.0.1:4190${route}`,{waitUntil:'networkidle'});
   await page.evaluate(()=>{for(const i of document.images)i.loading="eager";return Promise.all([...document.images].map(i=>i.decode()));});
   const metric=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.naturalWidth).length,h1:document.querySelectorAll('h1').length}));
   if(metric.overflow||metric.broken||metric.h1!==1)throw Error(JSON.stringify({route,theme,device,...metric}));
   await page.screenshot({path:path.join(root,`${name}-${theme}-${device}.png`),fullPage:true});
   checks.push({route,theme,device,...metric});
  }
  await page.close();
 }
}
// Motion stills at the collection phase, with full animation enabled.
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
await page.goto('http://127.0.0.1:4190/motion-studies/',{waitUntil:'networkidle'});
for(const [id,label] of [['web','01 — Pointer web'],['spotlight','02 — Soft spotlight'],['orbit','03 — Gather & scatter']]){
 await page.getByRole('button',{name:label,exact:true}).click();
 await page.locator('.motion-stage').hover({position:{x:400,y:180}});
 if(id==='orbit')await page.waitForTimeout(8500);else await page.waitForTimeout(200);
 await page.screenshot({path:path.join(root,`demo-${id}.png`),fullPage:true});
}
await page.close();await browser.close();
fs.writeFileSync(path.join(root,'render-checks.json'),JSON.stringify(checks,null,2));
console.log(`Exported ${checks.length} implementation screenshots and three motion studies.`);
