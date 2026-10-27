import { test, expect, Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
const url=process.env.SHIFT10_RELEASE_URL||pathToFileURL(path.resolve('..','private-preview','shift10.html')).href;
const key='ce-private-shift10-v02-attempt';
const screenshotDir=path.resolve('..','verification','screenshots-flow');
test.beforeEach(async({page})=>{
 if(!process.env.SHIFT10_RELEASE_URL)return;
 const fixture=JSON.parse(readFileSync(new URL('./fixtures/consented-storage.json',import.meta.url),'utf8'));
 await page.addInitScript(items=>{for(const item of items)localStorage.setItem(item.name,item.name==='ce_consent'?JSON.stringify({...JSON.parse(item.value),analytics:false}):item.value);localStorage.setItem('ce_product_analytics_exclude','1');},fixture.origins[0].localStorage);
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
});
const current=(page:Page)=>page.getByRole('navigation',{name:'Scenario progress'}).locator('[aria-current=step]');
async function start(page:Page){await page.goto(url);await page.evaluate(k=>localStorage.removeItem(k),key);await page.reload();await page.getByRole('button',{name:'Answer Dana’s call'}).click();}
async function team(page:Page,person:'Marisol'|'Dr. Lin'){
 await page.getByRole('button',{name:'Unit team',exact:true}).click();
 await page.getByRole('dialog').getByRole('button',{name:new RegExp(`^${person}`)}).click();
}
async function receive(page:Page,topics:string[]=[],prepScreenshot?:string){
 if(topics.length){await team(page,'Marisol');for(const topic of topics)await page.getByRole('button',{name:topic}).click();await page.getByRole('button',{name:'Raise these with Marisol'}).click();await page.getByRole('button',{name:'Return to shift',exact:true}).click();}
 for(let i=0;i<5;i++)await page.getByRole('button',{name:'Continue ED report'}).click();
 await page.getByRole('button',{name:'Finish report / Prepare for arrival'}).click();
 await expect(page.getByRole('heading',{name:'Prepare for Ruth’s arrival.',exact:true})).toBeVisible();
 if(prepScreenshot)await page.screenshot({path:prepScreenshot,fullPage:true});
 await page.getByRole('button',{name:'Receive Ruth',exact:false}).click();
}
async function chart(page:Page){await page.getByRole('button',{name:'Records & rooms',exact:true}).click();await page.getByRole('tab',{name:/^Chart/}).click();}
async function assess(page:Page){
 for(const name of [/^Talk with Ruth/,/^Stay in conversation/,/^Ask Adaeze/,/^Take vital signs/])await page.locator('.s10-assessment-item').getByRole('button',{name}).click();
 await chart(page);await page.getByRole('button',{name:/^ED medication record/}).click();await page.getByRole('button',{name:/^Lab list/}).click();await page.getByRole('button',{name:'Close panel',exact:true}).click();
}
async function call(page:Page,lead="I'm concerned about her confusion.",providerScreenshot?:string){
 const direct=page.getByRole('button',{name:/^Call Dr. Lin(?: back)?$/,exact:true});
 if(await direct.count())await direct.click();else await team(page,'Dr. Lin');
 await page.getByRole('button',{name:lead,exact:true}).click();
 if(providerScreenshot)await page.screenshot({path:providerScreenshot,fullPage:true});
 for(let i=0;i<4;i++){
  const choices=page.getByRole('dialog').locator('.s10-choice');const count=await choices.count();
  for(let j=0;j<count-1;j++)await choices.nth(j).click();
  await page.getByRole('button',{name:'Say this to Dr. Lin'}).click();
 }
 const selects=page.getByRole('dialog').getByRole('combobox');for(let i=0;i<await selects.count();i++)await selects.nth(i).selectOption('You, receiving RN');
 await page.getByRole('button',{name:'Give my commitments & close call'}).click();
}
async function finish(page:Page){
 const assessment=page.getByRole('button',{name:'Finish receiving assessment'});if(await assessment.count())await assessment.click();
 await page.getByRole('button',{name:'Review your shift'}).click();
 for(let i=0;i<3;i++){const prompted=page.getByRole('button',{name:'I’m still finished'});if(await prompted.count())await prompted.click();}
 await page.getByRole('button',{name:'Close with my current record'}).click();
}
for(const [route,topics,room] of [
 ['A',['The ordered monitoring and the room capability.','The diarrhea, pending test and isolation placement.'],'422'],
 ['B',['The ordered monitoring and the room capability.'],'422'],
 ['C',['The diarrhea, pending test and isolation placement.'],'410'],['D',[],'418B'],
] as [string,string[],string][])test(`complete browser playthrough ${route}`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await start(page);await receive(page,topics);await expect(page.locator('.s10-room-label')).toContainText(`Room ${room}`);
 if(route==='D')await expect(page.locator('.s10-exposure')).toContainText('Mr. Bell is exposed');
 await assess(page);await call(page);await expect(current(page)).toContainText('Receive Ruth');
 await finish(page);await expect(page.getByRole('heading',{name:'What your receiving care carried.'})).toBeVisible();await expect(page.locator('.s10-debrief')).toContainText(`Room path ${route}`);
 await page.reload();await expect(page.locator('.s10-debrief')).toContainText(`Room path ${route}`);expect(errors).toEqual([]);
});
test('report interruption, unopened record, follow-up question and resume',async({page})=>{
 await start(page);await chart(page);await expect(page.locator('.s10-report')).toContainText('Segment 1 of 6');await expect(page.locator('.s10-workspace')).not.toContainText('1340');await page.getByRole('button',{name:'Close panel'}).click();
 await page.getByRole('button',{name:'Ask Dana',exact:true}).click();await page.getByRole('button',{name:/^When was the pain medication/}).click();await page.getByRole('button',{name:/^Can you give me the time/}).click();await expect(page.locator('.s10-clarification')).toContainText('1340, I think.');
 await page.reload();await expect(page.locator('.s10-report')).toContainText('Segment 1 of 6');await chart(page);await page.getByRole('button',{name:/^ED medication record/}).click();await expect(page.locator('.s10-workspace')).toContainText('1340');
});
test('unknown assessment returns to the same bedside moment without invented answers',async({page})=>{
 await start(page);await receive(page);await team(page,'Dr. Lin');await page.getByRole('button',{name:"I'm calling about a new admission.",exact:true}).click();
 await expect(page.getByRole('dialog').locator('.s10-choice')).toHaveCount(1);await expect(current(page)).toContainText('Receive Ruth');await page.reload();await expect(page.getByRole('dialog').locator('.s10-choice')).toHaveCount(1);
 await page.getByRole('button',{name:"I haven't checked her closely yet."}).click();await page.getByRole('button',{name:'Say this to Dr. Lin'}).click();
 await expect(page.getByRole('dialog')).not.toBeVisible();await expect(page.locator('.s10-flow-scene')).toContainText('Go back and look, then call me.');await expect(current(page)).toContainText('Receive Ruth');
});
for(const width of [375,390,1440])test(`layout and screenshots ${width}px`,async({page})=>{
 await mkdir(screenshotDir,{recursive:true});await page.setViewportSize({width,height:width>700?1000:844});
 await page.goto(url);await page.evaluate(k=>localStorage.removeItem(k),key);await page.reload();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:path.join(screenshotDir,`intro-${width}.png`),fullPage:true});
 await page.getByRole('button',{name:'Answer Dana’s call'}).click();await page.screenshot({path:path.join(screenshotDir,`report-${width}.png`),fullPage:true});
 await receive(page,['The ordered monitoring and the room capability.','The diarrhea, pending test and isolation placement.'],path.join(screenshotDir,`room-preparation-${width}.png`));await page.screenshot({path:path.join(screenshotDir,`arrival-${width}.png`),fullPage:true});
 await assess(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:path.join(screenshotDir,`bedside-${width}.png`),fullPage:true});
 await page.getByRole('button',{name:'Finish receiving assessment'}).click();await call(page,"I'm concerned about her confusion.",path.join(screenshotDir,`provider-call-${width}.png`));await finish(page);await page.screenshot({path:path.join(screenshotDir,`debrief-${width}.png`),fullPage:true});
});
test('keyboard tabs, dialog focus, return focus and reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await start(page);
 const records=page.getByRole('button',{name:'Records & rooms',exact:true});await records.click();await expect(page.getByRole('dialog')).toBeVisible();expect(await page.evaluate(()=>document.querySelector('dialog')?.contains(document.activeElement))).toBe(true);
 const orders=page.getByRole('tab',{name:/^Orders/});await orders.focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('tab',{name:/^Rooms/})).toBeFocused();await expect(page.getByRole('tab',{name:/^Rooms/})).toHaveAttribute('aria-selected','true');
 expect(await page.getByRole('tab',{name:/^Rooms/}).evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await expect(records).toBeFocused();await expect(page.locator('.s10-report')).toContainText('Segment 1 of 6');
});
test('one current scene, optional panels and deliberate preparation boundary',async({page})=>{
 await start(page);await expect(page.getByRole('group',{name:'Optional investigation'})).toHaveCount(1);await expect(page.locator('.s10-progress-action .s10-primary')).toHaveCount(1);await expect(page.locator('.s10-workspace')).toHaveCount(0);
 for(let i=0;i<5;i++)await page.getByRole('button',{name:'Continue ED report'}).click();await page.getByRole('button',{name:'Finish report / Prepare for arrival'}).click();
 await expect(current(page)).toContainText('Prepare');await expect(page.getByRole('heading',{name:'Ruth is here.',exact:true})).toHaveCount(0);await page.reload();await expect(page.getByRole('heading',{name:'Prepare for Ruth’s arrival.',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Receive Ruth',exact:false}).click();await expect(page.locator('.s10-room-label')).toContainText('418B');
 await page.getByRole('button',{name:'Nursing actions',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Phone commitments stay separate');await page.getByRole('button',{name:'Close panel'}).click();await expect(current(page)).toContainText('Receive Ruth');
});
test('baseline callback preserves first call and Replay clears only this attempt',async({page})=>{
 await start(page);await receive(page);await page.locator('.s10-assessment-item').getByRole('button',{name:/^Talk with Ruth/}).click();
 await team(page,'Dr. Lin');await page.getByRole('button',{name:"I'm concerned about her confusion.",exact:true}).click();await page.getByRole('dialog').locator('.s10-choice').first().click();await page.getByRole('button',{name:'Say this to Dr. Lin'}).click();await page.getByRole('button',{name:"I don't know yet.",exact:true}).click();await page.getByRole('button',{name:'Say this to Dr. Lin'}).click();
 await expect(page.getByRole('dialog')).not.toBeVisible();await expect(current(page)).toContainText('Receive Ruth');await assess(page);await call(page);await finish(page);await expect(page.locator('.s10-debrief')).toContainText('2 call attempt(s)');
 await page.getByRole('button',{name:'Replay this Shift'}).click();await page.getByRole('button',{name:'Start again',exact:true}).click();await expect(page.getByRole('button',{name:'Answer Dana’s call'})).toBeVisible();
});
test('saved communication moment and explicit return to assessment survive refresh',async({page})=>{
 await start(page);await receive(page);await page.getByRole('button',{name:'Finish receiving assessment'}).click();await page.reload();await expect(page.getByRole('heading',{name:'Assume care.',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Return to receiving assessment'}).click();await page.reload();await expect(page.getByRole('heading',{name:'Ruth is here.',exact:true})).toBeVisible();await expect(current(page)).toContainText('Receive Ruth');
});
for(const width of [375,390])test(`investigation panel returns focus and scroll ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:844});await start(page);await receive(page);
 const records=page.getByRole('button',{name:'Records & rooms',exact:true});await records.scrollIntoViewIfNeeded();
 const scroll=()=>page.evaluate(()=>({page:scrollY,feature:document.querySelector('.ce-shift-feature')?.scrollTop??0}));const before=await scroll();
 await records.click();await page.getByRole('tab',{name:/^Orders/}).click();await page.getByRole('dialog').evaluate(el=>{el.scrollTop=el.scrollHeight;});await expect(page.getByRole('button',{name:'Close panel'})).toBeInViewport();await page.getByRole('button',{name:'Close panel'}).click();await expect(records).toBeFocused();const after=await scroll();
 expect(Math.abs(after.page-before.page)).toBeLessThanOrEqual(2);expect(Math.abs(after.feature-before.feature)).toBeLessThanOrEqual(2);await expect(current(page)).toContainText('Receive Ruth');
});
