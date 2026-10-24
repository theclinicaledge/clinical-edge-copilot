import { test, expect, type Page } from '@playwright/test';
import { KEY, actions, questions, evidence, rewinds } from '../src/modules/the-shift/shift7/data.js';
import { fresh } from '../src/modules/the-shift/shift7/rules.js';
const PATH='/learn/shifts/missing-time';
test('plain-language timeline and full answer preserve the original attempt',async({page,isMobile})=>{
 await openHistory(page);
 await page.getByRole('button',{name:/Linda 0 asked/}).click();
 await page.getByRole('button',{name:'Do you know when he got up this morning?'}).click();
 if(isMobile)await page.getByRole('button',{name:/^Timeline/}).click();
 await page.getByText('What do the three choices mean?',{exact:true}).click();
 await expect(page.getByText('A device logged an event.',{exact:false})).toBeVisible();
 const category=page.getByLabel('06:05 machine classification',{exact:true});
 await expect(category.locator('option')).toHaveText(['Choose what this tells you','Usual function reported','Symptoms noticed or found','Activity recorded by a device']);
 await category.selectOption({label:'Activity recorded by a device'});
 await page.getByLabel('06:05 machine limit',{exact:true}).selectOption('Who started it or how he was');
 await bedside(page);
 for(const name of [/Left facial droop, left arm drift/,/Last known well not established/,/Exact onset remains uncertain/])await page.getByRole('button',{name}).click();
 await page.getByRole('button',{name:'Give handoff'}).click();
 const before=await page.evaluate(()=>localStorage.getItem('ce-shift7-missing-time-v1'));
 await page.getByText('Show the full case answer',{exact:true}).click();
 await expect(page.locator('.s7-answer-times')).toContainText('≈06:00');
 await expect(page.locator('.s7-answer-times')).toContainText('≈06:30');
 await expect(page.locator('.s7-answer-times')).toContainText('07:15');
 await expect(page.locator('.s7-timing-answer')).toContainText('does not change your original handoff');
 expect(await page.evaluate(()=>localStorage.getItem('ce-shift7-missing-time-v1'))).toBe(before);
 await page.getByText('Your spoken handoff',{exact:true}).click();
 await expect(page.locator('.s7-debrief')).not.toContainText('Last known well approximately 0600');
 await page.reload();
 await expect(page.getByRole('heading',{name:'The story you handed over.'})).toBeVisible();
 await page.getByText('Review your evidence (1)',{exact:true}).click();
 await expect(page.getByRole('region',{name:'Evidence and original classifications'})).toContainText('Supported answer: Activity recorded by a device');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
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

test('all history questions and timeline controls retain source-qualified answers', async ({ page, isMobile }, info) => {
 await openHistory(page);
 for (const person of ['ems', 'linda', 'walter']) {
  await page.getByRole('group', { name: 'Choose who to speak with' }).getByRole('button', { name: new RegExp(person, 'i') }).click();
  for (const q of questions.filter(q => q.person === person)) {
   const button = page.getByRole('button', { name: q.q, exact: false });
   await button.click();
   await expect(page.locator(`#s7-answer-${q.id}`)).toContainText(q.a);
   const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY);
   await button.click();
   expect((await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY)).asked).toEqual(saved.asked);
  }
 }
 if (isMobile) await page.getByRole('button', { name: /^Timeline/ }).click();
 await expect(page.locator('.s7-evidence')).toHaveCount(7);
 const guide = page.getByText('What do the three choices mean?', { exact: true });
 await guide.focus(); await page.keyboard.press('Enter');
 await expect(page.locator('.s7-timeline-guide dl')).toBeVisible();
 for (const card of evidence) {
  const classification = page.getByLabel(`${card.time} ${card.id} classification`, { exact: true });
  const limit = page.getByLabel(`${card.time} ${card.id} limit`, { exact: true });
  // Native menu popups are not driven by headless macOS; type-ahead is keyboard-only.
  await classification.focus(); await page.keyboard.press('u'); await page.keyboard.press('Tab');
  await expect(classification).toHaveValue('Reported baseline or function');
  for (const value of ['Reported baseline or function', 'Symptoms noticed', 'Activity record']) {
   await classification.selectOption(value);
   await expect(classification).toHaveValue(value);
  }
  for (const value of [...card.alternatives, card.limit]) {
   await limit.selectOption(value); await expect(limit).toHaveValue(value);
  }
  await classification.selectOption(card.category);
 }
 await expect(page.getByText('Supported answer:', { exact: false })).toHaveCount(0);
 await page.screenshot({ path: `test-results/shift7-${info.project.name}-clarity-timeline.png`, fullPage: true });
 await page.reload();
 if (isMobile) await page.getByRole('button', { name: /^Timeline/ }).click();
 for (const card of evidence) {
  await expect(page.getByLabel(`${card.time} ${card.id} classification`, { exact: true })).toHaveValue(card.category);
  await expect(page.getByLabel(`${card.time} ${card.id} limit`, { exact: true })).toHaveValue(card.limit);
 }
 await bedside(page);
 await expect(page.getByRole('button', { name: /Last known well not established/ })).toHaveCount(0);
 await expect(page.getByRole('button', { name: /cell number confirmed/ })).toHaveCount(0);
 await expect(page.getByRole('button', { name: /Agrees to wait nearby/ })).toBeVisible();
 await expect(page.getByRole('button', { name: 'Give handoff' })).toBeDisabled();
 for (const name of [/Left facial droop, left arm drift/, /Last known well approximately 0600/, /Walter estimates first noticing/, /Linda found him with symptoms/, /Exact onset remains uncertain/]) {
  const button = page.getByRole('button', { name });
  await button.focus(); await page.keyboard.press('Space');
 }
 expect((await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY)).handoff).toBeNull();
 await page.getByRole('button', { name: 'Give handoff' }).click();
 await expect(page.getByText('Handoff essentials communicated', { exact: true })).toBeVisible();
 const before = await page.evaluate(key => localStorage.getItem(key), KEY);
 for (const summary of await page.locator('.s7-debrief > details > summary').all()) { await summary.focus(); await page.keyboard.press('Enter'); }
 await expect(page.locator('.s7-evidence-review')).toHaveCount(7);
 for (const card of evidence) await expect(page.getByRole('region', { name: 'Evidence and original classifications' })).toContainText(card.note);
 const full = page.getByText('Show the full case answer', { exact: true });
 await full.focus(); await page.keyboard.press('Enter');
 await expect(page.locator('.s7-timing-answer')).toContainText('Uncertain onset does not automatically exclude treatment');
 expect(await page.evaluate(key => localStorage.getItem(key), KEY)).toBe(before);
 await page.screenshot({ path: `test-results/shift7-${info.project.name}-clarity-answer.png`, fullPage: true });
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('legacy timeline choice and other Shift progress survive migration and restart cancellation', async ({ page, isMobile }) => {
 const old = { ...fresh(), version: '1.0.0', stage: 2, answers: { opening: ['activate'] }, asked: ['machine'], classifications: { machine: 'Unresolved timing' }, limits: { machine: 'Who started it or how he was' } };
 await page.goto(PATH);
 await page.evaluate(({ key, old }) => { localStorage.setItem(key, JSON.stringify(old)); localStorage.setItem('ce-shift6-progress-release-sentinel', 'preserve'); }, { key: KEY, old });
 await page.reload();
 if (isMobile) await page.getByRole('button', { name: /^Timeline/ }).click();
 const classification = page.getByLabel('06:05 machine classification', { exact: true });
 await expect(classification).toHaveValue('Unresolved timing');
 await expect(classification.locator('option:checked')).toHaveText('Unresolved timing (previous choice)');
 await page.getByRole('button', { name: 'Restart Shift 7' }).click();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).not.toBeVisible();
 await expect(classification).toHaveValue('Unresolved timing');
 expect(await page.evaluate(() => localStorage.getItem('ce-shift6-progress-release-sentinel'))).toBe('preserve');
 expect((await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY)).version).toBe('1.0.1');
});

test('320px timeline keeps full selected wording readable', async ({ page }) => {
 await page.setViewportSize({ width: 320, height: 900 });
 await openHistory(page);
 await page.getByRole('button', { name: /Walter 0 asked/ }).click();
 await page.getByRole('button', { name: 'What’s the last time', exact: false }).click();
 await page.getByRole('button', { name: /^Timeline/ }).click();
 await page.getByLabel('≈06:00 morning classification', { exact: true }).selectOption('Reported baseline or function');
 await page.getByLabel('≈06:00 morning limit', { exact: true }).selectOption('Whether his speech was normal');
 await expect(page.getByText('Selected: Whether his speech was normal', { exact: true })).toBeVisible();
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 await page.locator('.s7-card-fields').scrollIntoViewIfNeeded();
 await page.screenshot({ path: `test-results/shift7-${test.info().project.name}-320-selected.png` });
});

test('delayed response, unsafe water and absent contact are not credited as safe original actions', async ({ page }) => {
 await start(page);
 for (const action of actions) {
  const button = page.getByRole('button', { name: action.title, exact: false });
  await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'true');
  await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'false');
 }
 await page.getByRole('button', { name: 'Clarify the exact time first', exact: false }).click();
 expect((await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY)).answers).toEqual({});
 await page.getByRole('button', { name: 'Start selected actions' }).click();
 await expect(page.getByRole('status')).toContainText('charge nurse Ana Reyes');
 await page.getByRole('button', { name: 'Talk with the people' }).click();
 await page.getByRole('button', { name: 'Continue to bedside' }).click();
 await page.getByRole('button', { name: 'A small sip is fine.' }).click();
 await page.getByRole('button', { name: 'Confirm water response' }).click();
 await page.getByRole('button', { name: 'Sure, take your time.' }).click();
 await page.getByRole('button', { name: 'Confirm contact response' }).click();
 await page.getByRole('button', { name: 'Build your handoff' }).click();
 await expect(page.getByRole('button', { name: /Last known well approximately 0600/ })).toHaveCount(0);
 await expect(page.getByRole('button', { name: /cell number|Agrees to wait nearby/ })).toHaveCount(0);
 await page.getByRole('button', { name: /^Onset 0715/ }).click();
 await page.getByRole('button', { name: 'Give handoff' }).click();
 await expect(page.locator('.s7-review-summary')).toContainText('Handoff to revisit');
 await expect(page.locator('.s7-ending')).toContainText('Whether she can be reached is not yet known');
 await page.getByText('Your initial actions', { exact: true }).click();
 await expect(page.locator('.s7-debrief')).toContainText('You allowed a sip; Ana prevented it');
 await page.reload();
 const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY);
 expect(saved.answers.opening).toEqual(['wait']); expect(saved.water).toBe('sip'); expect(saved.contact).toBe('leave'); expect(saved.handoff).toEqual(['onset']);
});

for (const rewind of rewinds) for (const [id, text, feedback] of rewind.options) {
 test(`Rewind ${rewind.id}/${id}: selection, exact feedback and original-record isolation`, async ({ page }) => {
  const completed = { ...fresh(), version: '1.0.0', stage: 5, answers: { opening: ['activate'] }, water: 'hold', contact: 'phone', handoff: ['observed', 'no-baseline', 'unknown'] };
  await page.goto(PATH);
  await page.evaluate(({ key, completed }) => localStorage.setItem(key, JSON.stringify(completed)), { key: KEY, completed });
  await page.reload();
  await page.getByRole('button', { name: new RegExp(rewind.title) }).click();
  const choice = page.getByRole('button', { name: text, exact: false });
  await choice.focus(); await page.keyboard.press('Space');
  expect((await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY)).rewinds).toEqual({});
  await page.getByRole('button', { name: 'Confirm response' }).click();
  await expect(page.locator('.s7-rewind-case .s7-feedback')).toContainText(feedback);
  await expect(page.locator('.s7-rewind-case .s7-feedback')).toContainText(id === rewind.correct ? 'Accepted' : 'Revisit');
  await expect(choice).toBeDisabled();
  await page.reload();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY);
  expect(saved.rewinds).toEqual({ [rewind.id]: id });
  expect(saved.handoff).toEqual(completed.handoff); expect(saved.asked).toEqual([]); expect(saved.answers).toEqual(completed.answers);
 });
}
