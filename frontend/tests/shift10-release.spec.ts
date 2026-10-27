import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/consented-storage.json',import.meta.url),'utf8'));
test.beforeEach(async({page})=>{
  await page.addInitScript(items=>{for(const item of items)localStorage.setItem(item.name,item.name==='ce_consent'?JSON.stringify({...JSON.parse(item.value),analytics:false}):item.value);localStorage.setItem('ce_product_analytics_exclude','1');},fixture.origins[0].localStorage);
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
});
for(const width of [390,1440])test(`public library, route and saved report ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:width<700?844:1000});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/learn/shifts');
  await page.getByRole('button',{name:'Show more shifts'}).click();
  const card=page.locator('.shift-library-card').filter({has:page.getByRole('heading',{name:"The Transfer That Isn't Ready",exact:true})});
  await expect(card).toContainText('SHIFT 10');
  await card.getByRole('link',{name:'Begin shift'}).click();
  await expect(page).toHaveURL(/\/learn\/shifts\/transfer-not-ready$/);
  await expect(page.locator('.s10-header')).toContainText('Fictional case');
  await expect(page.locator('.s10-header')).not.toContainText('Private preview');
  await page.getByRole('button',{name:'Answer Dana’s call'}).click();
  await page.getByRole('button',{name:'Continue ED report'}).click();await page.reload();
  await expect(page.locator('.s10-report')).toContainText('Segment 2 of 6');
  await page.getByRole('link',{name:/Shift Library/}).first().click();
  await page.getByRole('button',{name:'Show more shifts'}).click();
  await expect(card).toContainText('In progress');
  await expect(card.getByRole('link',{name:'Continue shift'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('existing public routes and unrelated saved progress survive integration',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('ce-release-existing-sentinel','keep'));
  for(const id of ['drowsy-patient','monitor-alarm','discharge-puzzle','conversation','which-patient-first','stable-number','missing-time','code-blue']){
    await page.goto(`/learn/shifts/${id}`);await expect(page.locator('.shift-scenario-scroll h1').first()).toBeVisible();
    expect(await page.evaluate(()=>localStorage.getItem('ce-release-existing-sentinel'))).toBe('keep');
  }
});
