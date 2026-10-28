import {test,expect,type Page} from '@playwright/test';
import {d2,ROOM14_VITALS} from '../src/modules/the-shift/shift6/data.js';
const KEY='ce-shift-stable-number-v0.4';
async function open(page:Page,draft?:string){
 await page.goto('/learn/shifts/stable-number');
 await page.evaluate(({key,draft})=>localStorage.setItem(key,JSON.stringify({version:1,contentVersion:'0.4',stage:2,answers:{d1:'14'},...(draft?{drafts:{d2:draft}}:{}),viewed:[],selected:[],revealed:[],sbarDraft:{chips:[],recommendation:null},tomorrow:null})),{key:KEY,draft});
 await page.reload();
}
for(const width of [320,375,390,1440]) test(`linked values, spacing, flowsheet and resume at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000}); await open(page);
 const times=page.getByRole('group',{name:'Observation times'});
 for(const r of ROOM14_VITALS){
  const label=r.time==='y2000'?times.locator('.s6-linked-baseline'):times.getByRole('button',{name:`Select ${r.label} on trends`});
  await expect(label).toBeVisible(); const box=(await label.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);
 }
 await expect(page.getByRole('button',{name:'Confirm this time'})).toBeDisabled();
 await times.getByRole('button',{name:'Select Today 1200 on trends'}).click();
 for(const [key,values] of [['hr',['78','94','+16']],['sys',['152','134','-18']],['rr',['16','18','+2']]] as const){
  const row=page.locator(`[data-metric="${key}"]`);await expect(row.locator('dd')).toHaveText([...values]);await expect(row.locator('.is-selected')).toHaveCount(1);
 }
 await expect(page.getByRole('button',{name:'Today 1200',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('region',{name:'Decision feedback'})).toHaveCount(0);
 const xs=await page.locator('[data-metric="hr"] [data-elapsed-x]').evaluateAll(nodes=>nodes.map(n=>Number(n.getAttribute('data-elapsed-x'))));
 expect((xs[1]-xs[0])/(xs[4]-xs[0])).toBeCloseTo(720/1390,8);
 for(const text of ['152/78','108/80','37.1','Taken by the learner','Anxious about discharge'])await expect(page.getByRole('table')).toContainText(text);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.reload();await expect(times.getByRole('button',{name:'Select Today 1200 on trends'})).toHaveAttribute('aria-pressed','true');
 expect(await page.locator('thead .is-selected').evaluate(el=>{const a=el.getBoundingClientRect(),b=el.closest('.trend-scroll')!.getBoundingClientRect();return a.left>=b.left && a.right<=b.right+1;})).toBe(true);
});
test('keyboard, original correction, locked answer and committed resume',async({page})=>{
 await open(page);const target=page.getByRole('button',{name:'Select Today 1910 on trends'});
 await target.focus();await page.keyboard.press('Space');await expect(target).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Confirm this time'}).click();const feedback=page.getByRole('region',{name:'Decision feedback'});
 await expect(feedback).toContainText(d2.choices.find(c=>c.id==='1910')!.feedback);await expect(target).toBeDisabled();
 await page.reload();await expect(feedback).toBeVisible();
 const save=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),KEY);
 expect(save.answers.d2).toBe('1910');expect(save.drafts.d2).toBe('1910');expect(save.contentVersion).toBe('0.4');
 await expect(page.locator('thead .is-highlighted')).toContainText('Today 1200');
});
test('touch plot selection, accessible equivalents and reduced motion',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});const page=await context.newPage();
 await open(page,'0800');await page.locator('[data-metric="rr"] [data-time="1600"] .s6-linked-hit').tap();
 const button=page.getByRole('button',{name:'Select Today 1600 on trends'});await expect(button).toHaveAttribute('aria-pressed','true');
 expect(await button.evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
 await expect(page.locator('[data-metric="rr"] dd')).toHaveText(['16','20','+4']);
 const snapshot=await page.locator('.s6-linked').ariaSnapshot();expect(snapshot).toContain('Observation times');expect(snapshot).toContain('Admission');expect(snapshot).toContain('Room 14 flowsheet');await context.close();
});
