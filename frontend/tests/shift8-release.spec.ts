import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { KEYS, fresh, opening } from '../src/modules/the-shift/shift8/engine.js';
import { shift8Entry } from '../src/modules/the-shift/shift8/metadata.js';

test.beforeEach(async({page})=>{
  const fixture=JSON.parse(readFileSync(new URL('./fixtures/consented-storage.json',import.meta.url),'utf8'));
  await page.addInitScript(items=>{ for(const item of items) localStorage.setItem(item.name,item.name==='ce_consent'?JSON.stringify({...JSON.parse(item.value),analytics:false}):item.value); localStorage.setItem('ce_product_analytics_exclude','1'); },fixture.origins[0].localStorage);
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
});
test('public library entry, source record, direct route and saved progress work in the app shell',async({page},info)=>{
  const errors=[];const clinicalCalls=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(request.method()==='POST'&&/api|posthog/i.test(request.url()))clinicalCalls.push(request.url());});
  await page.goto('/learn');
  await expect(page.getByRole('heading',{name:'The Shift Library'})).toBeVisible();
  const more=page.getByRole('button',{name:'Show more shifts'});if(await more.isVisible())await more.click();
  const card=page.locator('.shift-library-card').filter({has:page.getByRole('heading',{name:'Code Blue',exact:true})});
  await expect(card).toContainText('Not started');
  await card.getByRole('link',{name:'Begin shift'}).click();
  await expect(page).toHaveURL(/\/learn\/shifts\/code-blue$/);
  await expect(page.locator('.s8-app')).toBeVisible();
  await expect(page.locator('.s8-app')).not.toContainText('PRIVATE PREVIEW');
  await page.getByRole('button',{name:'Sources & review',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('confidential medical-surgical nurse educator');
  await expect(page.getByRole('dialog')).toContainText('no signed reviewer record');
  await page.getByRole('button',{name:'Close source record'}).click();
  await page.getByRole('button',{name:'Enter room'}).click();
  await page.getByRole('link',{name:'Shift Library',exact:false}).first().click();
  if(await more.isVisible())await more.click();
  await expect(card).toContainText('In progress');
  await card.getByRole('link',{name:'Continue shift'}).click();
  await expect(page.locator('.s8-view-assess')).toBeVisible();
  await page.reload();await expect(page.locator('.s8-view-assess')).toBeVisible();
  const value={...fresh(),stage:'debrief',opening:opening(['press','check','compress']),staffing:'S1',answers:{summary:[],handoff:Object.fromEntries(['course','now','treatment','pending','uncertain'].map(id=>[id,'good'])),synthesis:['dose','stable']}};
  await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:KEYS.main,value});await page.reload();
  await expect(page.locator('.s8-view-debrief')).toBeVisible();
  await page.getByRole('link',{name:'Shift Library',exact:false}).first().click();
  if(await more.isVisible())await more.click();
  await expect(card).toContainText('Finished');
  await card.getByRole('link',{name:'Review debrief'}).click();
  await expect(page.locator('.s8-view-debrief')).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Clinical Edge workspace'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`/tmp/shift8-release-${info.project.name}-debrief.png`,fullPage:true});
  expect(errors).toEqual([]);expect(clinicalCalls).toEqual([]);
  expect(shift8Entry.contentVersion).toBe('0.8.1');expect(shift8Entry.analytics).toBe(false);
});
test('existing scenarios and local records remain accessible and unchanged',async({page})=>{
  const sentinel={one:'keep-one',nine:'keep-nine',legacy:'{"version":"0.7","original":"keep"}'};
  await page.addInitScript(items=>{localStorage.setItem('ce-shift-existing-release-sentinel',items.one);localStorage.setItem('ce-shift9-release-sentinel',items.nine);localStorage.setItem('ce-private-shift8-main-v0.7',items.legacy);},sentinel);
  for(const id of ['drowsy-patient','monitor-alarm','discharge-puzzle','conversation','which-patient-first','stable-number','missing-time','code-blue']){
    await page.goto(`/learn/shifts/${id}`);await expect(page.locator('.shift-scenario-scroll h1').first()).toBeVisible();
    await expect(page.locator('.ce-not-found')).toHaveCount(0);
  }
  expect(await page.evaluate(()=>localStorage.getItem('ce-shift-existing-release-sentinel'))).toBe(sentinel.one);
  expect(await page.evaluate(()=>localStorage.getItem('ce-shift9-release-sentinel'))).toBe(sentinel.nine);
  expect(await page.evaluate(()=>localStorage.getItem('ce-private-shift8-main-v0.7'))).toBe(sentinel.legacy);
});
test('keyboard feedback and Continue remain above the mobile dock after scroll',async({page},info)=>{
  const value={...fresh(),stage:'leader',opening:opening(['press','check','compress']),staffing:'S1'};
  await page.addInitScript(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:KEYS.main,value});
  await page.goto('/learn/shifts/code-blue');await expect(page.locator('.s8-app')).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.s8-choices input').first().focus();await page.keyboard.press('Space');
  await page.getByRole('button',{name:'Confirm response'}).focus();await page.keyboard.press('Enter');
  await expect(page.locator('.s8-moment-response')).toBeFocused();
  const button=page.getByRole('button',{name:'Continue →',exact:true});await button.scrollIntoViewIfNeeded();
  const bounds=await button.boundingBox(),dock=await page.getByRole('navigation',{name:'Clinical Edge workspace'}).boundingBox();
  expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(dock!.y+1);
  await page.screenshot({path:`/tmp/shift8-release-${info.project.name}-feedback.png`,fullPage:true});
  await button.focus();await page.keyboard.press('Enter');
  await expect(page.locator('.s8-view-page')).toBeVisible();
});
