import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
const root=path.resolve('docs/apple-design-review');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const browser=await chromium.launch({headless:true});
const results=[];
for(const c of manifest.concepts){
 for(const [p] of manifest.pages){
  for(const [device,width] of Object.entries(manifest.widths)){
   const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'});
   await page.goto(pathToFileURL(path.join(root,'mockups',`${c.id}-${p}.html`)).href);
   await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
   const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,headings:document.querySelectorAll('h1').length,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length}));
   if(metrics.scrollWidth>width||metrics.headings!==1||metrics.brokenImages)throw new Error(`${c.id}/${p}/${device}: ${JSON.stringify(metrics)}`);
   await page.screenshot({path:path.join(root,'images',`${c.id}-${p}-${device}.png`),fullPage:true});
   if(p==='home'&&device==='desktop')await page.screenshot({path:path.join(root,'images',`${c.id}-home-cover.png`)});
   results.push({concept:c.id,page:p,device,...metrics});
   await page.close();
  }
 }
 console.log(`Captured ${c.name}: desktop and mobile for every page and state sheet.`);
}
const baselines=[['home','/'],['experience','/experience/'],['publications','/publications/'],['projects','/projects/'],['teaching','/teaching/'],['blog','/blog/'],['contact','/contact/'],['gallery','/gallery/'],['404','/missing-design-review-page/'],['admin','/admin/index.html']];
const baselineResults=[];
for(const [name,route] of baselines){
 for(const [device,width] of Object.entries(manifest.widths)){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:3000')?r.continue():r.abort());
  const response=await page.goto(`http://127.0.0.1:3000${route}`,{waitUntil:'networkidle'});
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:path.join(root,'baseline',`${name}-${device}.png`),fullPage:true});
  baselineResults.push({page:name,device,status:response.status(),title:await page.title(),width,scrollWidth:await page.evaluate(()=>document.documentElement.scrollWidth)});
  await page.close();
 }
}
// Check real navigation and the compact menu in the proposal, without submitting forms.
const p=await browser.newPage({viewport:{width:390,height:844}});
await p.goto(pathToFileURL(path.join(root,'mockups','a-home.html')).href);
await p.locator('.mobile-menu summary').click();
await p.locator('.mobile-menu nav a').filter({hasText:'Projects'}).click();
if(!(await p.title()).includes('Projects'))throw new Error('Mobile navigation failed');
await p.close();
fs.writeFileSync(path.join(root,'verification.json'),JSON.stringify({mockups:results,baselines:baselineResults,mobileNavigation:'passed',notes:['Static proposal only; no form submissions, CMS authentication, or production accessibility certification.','Baseline admin captures block third-party CMS loading and show its failure shell.']},null,2));
await browser.close();
console.log(`Verified ${results.length} proposal images and ${baselineResults.length} current-site captures.`);
