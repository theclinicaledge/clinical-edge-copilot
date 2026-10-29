import {test,expect,type Page} from '@playwright/test';
import {KEY,questions,evidence} from '../src/modules/the-shift/shift7/data.js';
import {fresh} from '../src/modules/the-shift/shift7/rules.js';
async function history(p:Page){await p.goto('/learn/shifts/missing-time');await p.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:KEY,state:{...fresh(),stage:2,answers:{opening:['activate']}}});await p.reload();}
const saved=(p:Page)=>p.evaluate(key=>localStorage.getItem(key),KEY);
async function ask(p:Page,id:string){const q=questions.find(q=>q.id===id)!;await p.getByRole('button',{name:q.q,exact:false}).click();return p.locator(`[data-s7-evidence-link="${id}"]`);}
for(const width of [320,375,390,1440])test(`new evidence and exact conversation return at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await history(page);
 await expect(page.getByRole('button',{name:'View this evidence'})).toHaveCount(0);
 await ask(page,'ems-scene');await expect(page.getByRole('button',{name:'View this evidence'})).toHaveCount(0);
 const link=await ask(page,'ems-time');await link.focus();const box=(await link.boundingBox())!;const before=await saved(page);await link.press('Enter');
 const card=page.locator('[data-s7-evidence="ems-time"]');await expect(card).toBeFocused();await expect(card.locator('select')).toHaveCount(2);for(const select of await card.locator('select').all())await expect(select).toHaveValue('');
 await expect(page.locator('[data-s7-evidence]')).toHaveCount(1);await expect(card).not.toContainText(evidence.find(e=>e.id==='ems-time')!.note);
 expect(await saved(page)).toBe(before);const back=page.getByRole('button',{name:'Return to conversation with EMS',exact:true});await back.focus();await back.press('Enter');await expect(link).toBeFocused();
 expect(Math.abs((await link.boundingBox())!.y-box.y)).toBeLessThan(4);await expect(page.locator('.s7-answer')).toContainText(questions.find(q=>q.id==='ems-time')!.a);expect(await saved(page)).toBe(before);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
for(const width of [390,1440])test(`multiple cards, old questions and follow-ups target the right evidence ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await history(page);await page.getByRole('button',{name:/Linda 0 asked/}).click();
 for(const id of ['bedtime','overnight','discovery']){const link=await ask(page,id);await link.click();await expect(page.locator(`[data-s7-evidence="${id}"]`)).toBeFocused();await page.getByRole('button',{name:'Return to conversation with Linda',exact:true}).click();await expect(link).toBeFocused();}
 await expect(page.locator('[data-s7-evidence]')).toHaveCount(3);
 const before=await saved(page);const old=await ask(page,'bedtime');await old.click();await expect(page.locator('[data-s7-evidence="bedtime"]')).toBeFocused();expect(await saved(page)).toBe(before);
 if(width===1440)await page.getByRole('button',{name:/Walter 0 asked/}).click();
 await page.getByRole('button',{name:'Return to conversation with Linda',exact:true}).click();await expect(old).toBeFocused();expect(await saved(page)).toBe(before);
});
test('same-card follow-up, intentional classifications, reload and existing Conversations return',async({page})=>{
 await page.setViewportSize({width:390,height:900});await history(page);await page.getByRole('button',{name:/Walter 0 asked/}).click();await ask(page,'morning');const link=await ask(page,'hands');await link.click();
 const card=page.locator('[data-s7-evidence="morning"]');await expect(card).toBeFocused();await expect(page.locator('[data-s7-evidence]')).toHaveCount(1);
 const data=evidence.find(e=>e.id==='morning')!;await card.locator('select').nth(0).selectOption(data.category);await card.locator('select').nth(1).selectOption(data.limit);const before=await saved(page);
 await page.getByRole('button',{name:'Conversations',exact:true}).click();await expect(link).toBeFocused();expect(await saved(page)).toBe(before);
 await page.reload();await expect(page.getByRole('button',{name:/Return to conversation with/})).toHaveCount(0);const state=JSON.parse((await saved(page))!);expect(state.classifications.morning).toBe(data.category);expect(state.limits.morning).toBe(data.limit);
 await page.getByRole('button',{name:/Walter 2 asked/}).click();const again=await ask(page,'hands');const unchanged=await saved(page);await again.click();await expect(card).toBeFocused();await expect(card.locator('select').nth(0)).toHaveValue(data.category);expect(await saved(page)).toBe(unchanged);
});
test('touch and normal motion return to the conversation without extra steps',async({browser})=>{
 const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();await history(p);await p.getByRole('button',{name:/Linda 0 asked/}).tap();const link=await ask(p,'machine');await link.tap();const card=p.locator('[data-s7-evidence="machine"]');await expect(card).toBeFocused();
 await p.screenshot({path:'/private/tmp/ce-shift7-nav/mobile-evidence.png'});await p.getByRole('button',{name:'Return to conversation with Linda',exact:true}).tap();await expect(link).toBeFocused();await p.screenshot({path:'/private/tmp/ce-shift7-nav/mobile-return.png'});await ctx.close();
});
