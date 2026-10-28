import {test,expect,type Page} from '@playwright/test';
import {fresh,KEY} from '../src/modules/the-shift/monitor/progress.js';
import {alarmChoices,alarmExplanations,monitorChoices,rhythmChoices} from '../src/modules/the-shift/monitor/data.js';
import {rrIntervals,earlierSpacing} from '../src/modules/the-shift/monitor/ecg/caliper.js';
const path='/learn/shifts/monitor-alarm';
async function open(page:Page){await page.goto(path);await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:KEY,state:{...fresh(),stage:3,answers:{alarm:alarmChoices[0].id,explanation:alarmExplanations[0].id,monitor:monitorChoices[0].id}}});await page.reload();}
for(const width of [320,390,1440])test(`optional caliper connects actual spacing without changing signal or answer at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:1000});await open(page);
 const tracing=page.locator('[data-ecg="E"]:not(.is-compact)');await expect(tracing).toBeVisible();
 for(const desc of await page.locator('[data-ecg="E"] svg desc').allTextContents())expect(desc).not.toMatch(/atrial fibrillation/i);
 const original=await tracing.locator('[data-signal-path]').evaluateAll(ns=>ns.map(n=>n.getAttribute('d')));
 await expect(page.getByLabel('Move the R-to-R caliper')).toHaveCount(0);
 const regularity=page.getByRole('button',{name:/01 Regularity/});await regularity.focus();await regularity.press('Enter');
 const select=page.getByLabel('Move the R-to-R caliper');await expect(select).toBeVisible();
 await expect(select).toHaveValue('0');
 const check=async(index:number)=>{await select.selectOption(String(index));await expect(tracing.getByRole('status')).toContainText(rrIntervals('E')[index].seconds.toFixed(3)+' s');await expect(tracing.getByRole('status')).toContainText(earlierSpacing().toFixed(3)+' s');};
 await check(1);await check(rrIntervals('E').findIndex(p=>p.start<3&&p.end>3));
 const after=await tracing.locator('.ecg-overview [data-signal-path],.ecg-mobile-rows [data-signal-path],.ecg-dialog [data-signal-path]').evaluateAll(ns=>ns.map(n=>n.getAttribute('d')));
 expect(after).toEqual(original);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(width<640){await expect(tracing.locator('.ecg-caliper-focus')).toBeVisible();await expect(tracing.locator('.ecg-caliper-focus [data-caliper]')).toHaveCount(2);}
 await tracing.getByRole('button',{name:'Expand strip E'}).click();await expect(page.getByRole('dialog').locator('[data-caliper]')).toHaveCount(4);await page.keyboard.press('Escape');await expect(tracing.getByRole('button',{name:'Expand strip E'})).toBeFocused();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).answers.rhythm,KEY)).toBeUndefined();
 await page.reload();await expect(page.getByLabel('Move the R-to-R caliper')).toBeVisible();await expect(page.getByLabel('Move the R-to-R caliper')).toHaveValue('0');
 await page.getByRole('radio').first().check();await page.getByRole('button',{name:'Confirm my response',exact:true}).click();
 await expect(page.getByRole('region',{name:'Decision feedback'}).last()).toContainText(rhythmChoices[0].feedback);
 await expect(tracing.locator('.ecg-overview svg desc')).toContainText('atrial fibrillation');
 await page.reload();expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).answers.rhythm,KEY)).toBe(rhythmChoices[0].id);
 await page.getByRole('button',{name:'Assess Room 24',exact:true}).click();await expect(page.getByText("At Room 24's bedside. Tap each item to reveal it:",{exact:true})).toBeVisible();
});
test('keyboard, touch equivalent and reduced motion keep optional investigation unscored',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});const page=await context.newPage();await open(page);
 await page.getByRole('button',{name:/01 Regularity/}).tap();const select=page.getByLabel('Move the R-to-R caliper');await select.focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await expect(select).toHaveValue('1');
 const aria=await page.locator('[data-ecg="E"]:not(.is-compact)').ariaSnapshot();expect(aria).toContain('Move the R-to-R caliper');expect(aria).toContain('Solid:');
 await page.getByRole('button',{name:/01 Regularity/}).tap();await expect(select).toHaveCount(0);expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).answers.rhythm,KEY)).toBeUndefined();await context.close();
});

for(const [index,choice] of rhythmChoices.entries())test(`original rhythm choice ${choice.id} remains available without using calipers`,async({page})=>{
 await open(page);await expect(page.getByLabel('Move the R-to-R caliper')).toHaveCount(0);
 await page.getByRole('radio').nth(index).check();await page.getByRole('button',{name:'Confirm my response',exact:true}).click();
 await expect(page.getByRole('region',{name:'Decision feedback'}).last()).toContainText(choice.feedback);
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).answers.rhythm,KEY)).toBe(choice.id);
});
