import { test, expect, type Page } from '@playwright/test';
const PATH='/learn/shifts/missing-time';
async function start(page:Page){await page.goto(PATH); await page.getByRole('button',{name:'Step into the ED'}).click();}
async function openHistory(page:Page){await start(page);await page.getByRole('button',{name:'Activate Code Stroke Use Harbor'}).click();await page.getByRole('button',{name:'Start selected actions'}).click();await page.getByRole('button',{name:'Talk with the people'}).click();}
async function bedside(page:Page,unsafe=false){await page.getByRole('button',{name:'Continue to bedside'}).click();await page.getByRole('button',{name:unsafe?'A small sip is fine.':'Not yet. He needs'}).click();await page.getByRole('button',{name:'Confirm water response'}).click();await page.getByRole('button',{name:'Could you stay nearby'}).click();await page.getByRole('button',{name:'Confirm contact response'}).click();await page.getByRole('button',{name:'Build your handoff'}).click();}
test.beforeEach(async({page})=>{await page.route(/posthog|anthropic|\/api\//,route=>route.abort());});
test('complete sparse-history attempt, correction, resume and isolated Rewind',async({page})=>{
 await openHistory(page);await bedside(page,true);
 await page.getByRole('button',{name:/Left facial droop, left arm drift/}).click();
 await page.getByRole('button',{name:/Last known well not established/}).click();
 await page.getByRole('button',{name:/Exact onset remains uncertain/}).click();
 await expect(page.getByRole('button',{name:/cell number/})).toHaveCount(0);
 await page.getByRole('button',{name:'Give handoff'}).click();
 await expect(page.getByText('Uncertainty communicated; history has gaps')).toBeVisible();
 await page.reload();await expect(page.getByRole('heading',{name:'The story you handed over.'})).toBeVisible();
 await page.getByRole('button',{name:/Breakfast together/}).click();
 await page.getByRole('button',{name:/Last seen normal at 0650/}).click();
 await page.getByRole('button',{name:'Confirm response'}).click();
 await expect(page.locator('.s7-rewind-case')).toContainText('Accepted');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('ce-shift7-missing-time-v1')!));
 expect(saved.asked).toEqual([]);expect(saved.water).toBe('sip');expect(saved.handoff).not.toContain('baseline');
 await page.screenshot({path:`test-results/shift7-${test.info().project.name}-debrief.png`,fullPage:true});
});
test('followups, timeline and qualified patient handoff',async({page,isMobile})=>{
 await openHistory(page);
 await page.getByRole('button',{name:'Is 0715 when it started'}).click();
 await page.getByRole('button',{name:/Walter 0 asked/}).click();
 await page.getByRole('button',{name:'What’s the last time'}).click();
 await page.getByRole('button',{name:'What do you mean by fine'}).click();
 await page.getByRole('button',{name:'When did your arm start'}).click();
 if(isMobile)await page.getByRole('button',{name:/^Timeline/}).click();
 await expect(page.getByRole('region',{name:'Your evidence timeline'})).toContainText('left hand');
 await page.getByLabel('≈06:00 morning classification').selectOption('Reported baseline or function');
 await page.getByLabel('≈06:00 morning limit').selectOption('Whether his speech was normal');
 await page.screenshot({path:`test-results/shift7-${test.info().project.name}-timeline.png`,fullPage:true});
 await bedside(page);
 for(const name of [/Left facial droop, left arm drift/,/Last known well approximately 0600/,/Walter estimates first noticing/,/EMS clarified that 0715/,/Exact onset remains uncertain/])await page.getByRole('button',{name}).click();
 await page.getByRole('button',{name:'Give handoff'}).click();await expect(page.getByText('Uncertainty communicated; history has gaps')).toBeVisible();
});
test('opening and library fit viewport; populated filters and show more',async({page})=>{
 await page.goto(PATH);await expect(page.getByRole('heading',{name:/The Missing/})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`test-results/shift7-${test.info().project.name}-arrival.png`,fullPage:true});
 await page.goto('/learn/shifts');
 await expect(page.locator('.shift-library-card')).toHaveCount(6);
 if(process.env.VITE_SHIFT_006_PREVIEW==='true'){await page.getByRole('button',{name:'Show more shifts'}).click();await expect(page.locator('.shift-library-card')).toHaveCount(7);}else{await expect(page.getByRole('button',{name:'Show more shifts'})).toHaveCount(0);}
 await page.getByRole('button',{name:'ED',exact:true}).click();await expect(page.locator('.shift-library-card')).toHaveCount(1);
 await expect(page.locator('.shift-library-card')).toContainText('The Missing Time');
 await page.screenshot({path:`test-results/shift7-${test.info().project.name}-library.png`,fullPage:true});
});
