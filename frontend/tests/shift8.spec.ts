import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fresh, opening, KEYS } from '../src/modules/the-shift/shift8/engine.js';
import { VERSION, CHOICES, REPLAY, REWIND } from '../src/modules/the-shift/shift8/data.js';

const url='/learn/shifts/code-blue';
const seed=async(page,state)=> { await page.addInitScript(({key,state})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(state));},{key:KEYS.main,state}); await page.goto(url); await expect(page.locator('.s8-app')).toBeVisible(); };
const choose=async(page,index=0)=> { const priya=await page.locator('.s8-main.s8-view-priya').count(); if(priya && !await page.locator('.s8-choices input').count()) await page.locator('.s8-person.active').click(); await page.locator('.s8-choices input').nth(index).check(); await page.getByRole('button',{name:priya?'Send request to Priya':'Confirm response',exact:false}).click(); };
const state=async page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEYS.main);
test('handoff and read-back feedback pauses survive refresh without changing original decisions or clock',async({page},info)=>{
  await seed(page,{...fresh(),stage:'handoff',staffing:'S1',opening:opening(['press','check','compress'])});
  const groups=await page.locator('.s8-handoff').all();
  for(let i=0;i<groups.length;i++) await groups[i].locator('input').nth(i===0?0:i===1?2:1).check();
  await expect(page.locator('.s8-handoff-feedback')).toHaveCount(0);
  await page.getByRole('button',{name:'Give handoff'}).focus();await page.keyboard.press('Enter');
  const original=(await state(page)).answers.handoff;
  expect((await state(page)).stage).toBe('handoff');
  await expect(page.locator('.s8-handoff-feedback')).toBeFocused();
  await expect(page.locator('.s8-handoff-feedback')).toContainText('Accurately communicated');
  await expect(page.locator('.s8-handoff-feedback')).toContainText('Omitted');
  await expect(page.locator('.s8-handoff-feedback')).toContainText('Misleading');
  await expect(page.locator('.s8-sim-orientation')).toContainText('07:00');
  await page.reload();expect((await state(page)).answers.handoff).toEqual(original);
  await expect(page.getByRole('button',{name:'Give handoff'})).toHaveCount(0);
  await page.getByRole('button',{name:'Continue →',exact:true}).click();
  await page.getByRole('button',{name:'Answer Rosa · Prompted'}).click();
  expect((await state(page)).stage).toBe('synthesis');
  await page.getByRole('button',{name:'Yes, that’s right'}).click();
  expect((await state(page)).stage).toBe('synthesis');
  await expect(page.locator('.s8-readback-feedback')).toContainText('Not corrected in this response');
  await page.reload();expect((await state(page)).answers.synthesis).toEqual([]);
  await page.getByRole('button',{name:'Continue →',exact:true}).click();
  await page.locator('.s8-choices input').first().check();
  await page.getByRole('button',{name:'Say these corrections'}).click();
  expect((await state(page)).stage).toBe('correction');
  await expect(page.locator('.s8-readback-feedback')).toContainText('You corrected after prompting');
  await expect(page.locator('.s8-readback-feedback')).toContainText('will supply the correction');
  await page.reload();expect((await state(page)).answers.synthesis).toEqual([]);
  expect((await state(page)).answers.handoff).toEqual(original);
  await page.screenshot({path:`/tmp/shift8-feedback-${info.project.name}.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Continue →',exact:true}).click();
  expect((await state(page)).stage).toBe('transfer');
  await expect(page.locator('.s8-scene')).toContainText('You (prompted)');
});
test('frame team requests stay visible across views without early disclosure or changed choices', async ({page},info)=>{
  await page.goto(url);
  const base={...fresh(),stage:'leader',staffing:'S1',opening:opening(['press','check','compress'])};
  const restore=async value=>{await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:KEYS.main,value});await page.reload();};
  await restore(base);
  await expect(page.getByRole('list',{name:'Team requests'})).toHaveCount(0);
  await restore({...base,stage:'page'});
  const summary=page.getByRole('list',{name:'Team requests'});
  await expect(summary).toContainText('Requested, no one acknowledged');
  for(const view of ['Chart','Team']) {
    await page.getByRole('button',{name:view,exact:true}).click();
    await expect(summary).toBeVisible();
    expect((await state(page)).answers.page).toBeUndefined();
  }
  await page.locator('.s8-choices input').first().check();
  expect((await state(page)).answers.page).toBeUndefined();
  await page.getByRole('button',{name:'Confirm response'}).click();
  await expect(summary).toContainText('Beth acknowledged / pending completion');
  await page.reload();
  const submitted=await state(page);
  await page.getByRole('button',{name:'Continue →',exact:true}).click();
  await expect(summary).toContainText('Beth acknowledged / pending completion');
  await expect(summary).toContainText('Family call completed');
  await restore({...submitted,stage:'given',feedback:null});
  await expect(summary).toContainText('Completed by Beth / callback pending');
  await expect(summary).toBeVisible();
  expect((await state(page)).answers.page).toEqual(submitted.answers.page);
  await page.screenshot({path:`/tmp/shift8-flow-${info.project.name}-requests.png`,fullPage:true});
  await restore({...base,stage:'given'});
  await expect(summary).toContainText('Requested, no one acknowledged');
  await restore({...base,stage:'handoff',opening:opening(['check','compress'])});
  await expect(summary).toContainText('Completed by Beth / callback pending');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('assigned recorder remains on current task until the scripted airway relief',async({page},info)=>{
  await page.goto(url);
  for(const late of [false,true]) for(const held of [false,true]) {
    const mask=CHOICES.mask.find(o=>o.id===(held?'hold':'decline'));
    const value={...fresh(),stage:'leader',staffing:'S1',opening:opening(late?['check','compress']:['press','check','compress']),answers:{mask:held?[mask]:[mask,mask]}};
    await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:KEYS.main,value});await page.reload();
    await expect(page.locator('.s8-role-transition')).toHaveCount(0);
    await choose(page);
    await expect(page.locator('.s8-role-transition')).toContainText('Assigned Recorder');
    await expect(page.locator('.s8-role-transition')).toContainText(held?'Mask seal':'Standing by at cart');
    await expect(page.locator('.s8-role-transition')).toContainText(`Awaiting airway relief at ${late?'03:10':'02:40'} before recording`);
    const answers=(await state(page)).answers;
    await page.reload();expect((await state(page)).answers).toEqual(answers);
    if(!late&&held) await page.screenshot({path:`/tmp/shift8-flow-${info.project.name}-role.png`,fullPage:true});
    await page.getByRole('button',{name:'Continue →',exact:true}).click();
    await expect(page.locator('.s8-role-transition')).toHaveCount(0);
    await expect(page.locator('.s8-scene-status')).toContainText('You Recorder');
    expect((await state(page)).answers.recordedEvent).toBeUndefined();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});
test('handoff framing preserves choices, drafts and the fixed outcome distinction',async({page},info)=>{
  await seed(page,{...fresh(),stage:'handoff',staffing:'S1',opening:opening(['press','check','compress'])});
  await expect(page.locator('.s8-handoff-transition')).toHaveText('Harold has a pulse, but he still needs breathing support. As the team prepares for transfer, your final task is to give Rosa an accurate account of the code, what remains uncertain, and what still needs follow-up.');
  expect(await page.locator('.s8-handoff').count()).toBe(5);
  for(const group of await page.locator('.s8-handoff').all()) await group.locator('input').first().check();
  const draft=(await state(page)).drafts.handoff;
  await page.reload();expect((await state(page)).drafts.handoff).toEqual(draft);
  expect((await state(page)).answers.handoff).toBeUndefined();
  await page.screenshot({path:`/tmp/shift8-flow-${info.project.name}-handoff.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Give handoff'}).click();
  expect((await state(page)).stage).toBe('handoff');
  await expect(page.locator('.s8-handoff-feedback')).toBeVisible();
  await page.getByRole('button',{name:'Continue →',exact:true}).click();
  await expect(page.locator('.s8-dialogue')).toContainText('So two shocks and two doses');
  expect((await state(page)).answers.handoff).toEqual(draft);
});
test('manual sequence on all staffing paths keeps transition, clearance and shock attribution separate', async ({page},info)=>{
  await page.goto(url);
  for(const staffing of ['S1','S2','S3']) {
    const s={...fresh(),stage:'analysis',staffing,opening:opening(staffing==='S3'?['wait']:['press','check','compress'])};
    await page.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key:KEYS.main,s}); await page.reload();
    await expect(page.locator('.s8-sim-orientation')).toContainText('01:20');
    await page.locator('.s8-choices input').first().focus(); await page.keyboard.press('Space');
    expect((await state(page)).answers.analysis).toBeUndefined();
    await page.getByRole('button',{name:'Confirm response'}).focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.s8-sim-orientation')).toContainText('01:22');
    await expect(page.locator('.s8-equipment-scene')).toContainText('Marcus compresses during charging');
    const original=(await state(page)).answers.analysis;
    await page.getByRole('button',{name:'Continue →',exact:true}).click();
    expect((await state(page)).stage).toBe('clearance');
    await expect(page.locator('.s8-sim-orientation')).toContainText('01:24');
    await expect(page.getByRole('button',{name:'Confirm response'})).toBeDisabled();
    await page.locator('.s8-choices input').last().check(); await page.reload();
    await expect(page.locator('.s8-choices input').last()).toBeChecked();
    expect((await state(page)).answers.clearance).toBeUndefined();
    await page.getByRole('button',{name:'Confirm response'}).click();
    await expect(page.locator('.s8-sim-orientation')).toContainText('01:25');
    await expect(page.locator('.s8-equipment-scene')).toContainText('Shock 1 delivered by Priya');
    expect((await state(page)).answers.analysis).toEqual(original);
    expect((await state(page)).answers.clearance[0].label).toBe('Unsafe');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(staffing==='S1') await page.screenshot({path:`/tmp/shift8-v081-${info.project.name}-clearance.png`,fullPage:true});
    await page.getByRole('button',{name:'Continue →',exact:true}).click();
    expect((await state(page)).stage).toBe('restartCPR');
  }
});
test('room examination does not warn the team; recorder entry follows reported administration',async({page},info)=>{
  const s={...fresh(),stage:'safety',opening:opening(['shout','press','check','compress']),staffing:'S1'};
  await seed(page,s);
  const resources=page.locator('.s8-resources');
  await resources.locator(':scope > summary').focus(); await page.keyboard.press('Enter');
  await resources.locator('.s8-reference > summary').click();
  await expect(resources.locator('.s8-reference a').first()).toBeVisible();
  await expect(resources.locator('.s8-reference')).toContainText('independent confidential medical-surgical nurse educator');
  await expect(resources.locator('.s8-reference')).toContainText('No signed reviewer record');
  await expect(resources.getByRole('link',{name:/S11:/})).toHaveAttribute('href','https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/adult-advanced-life-support-guidelines');
  await expect(resources.getByRole('link',{name:/S13:/})).toHaveAttribute('href','https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support');
  await resources.locator('.s8-resource-content > details').first().locator('summary').click();
  await expect(resources).toContainText('Compressions only until the cart arrives is a scenario-specific constraint');
  await resources.locator('.s8-resource-content > details').nth(1).locator('summary').click();
  await expect(resources.locator('.s8-resource-content > details').nth(1).locator('ol')).toBeVisible();
  expect(await state(page)).toEqual(s);
  await resources.locator(':scope > summary').click();
  await expect(page.locator('.s8-safety-priority')).toContainText('Charged');
  await expect(page.locator('.s8-safety-priority')).toContainText('Hand touching Harold’s arm');
  await page.getByRole('button',{name:"Inspect Marcus's hand on Harold's arm"}).focus(); await page.keyboard.press('Enter');
  expect((await state(page)).answers.safety).toBeUndefined();
  await expect(page.locator('.s8-room figcaption')).toContainText('does not warn the team');
  await page.getByRole('button',{name:'Team',exact:true}).click();
  await page.getByRole('button',{name:'Bedside',exact:true}).click();
  await expect(page.getByRole('button',{name:'Close bedside detail'})).toBeVisible();
  await page.screenshot({path:`/tmp/shift8-${info.project.name}-room.png`,fullPage:true});
  await page.getByRole('button',{name:'Team',exact:true}).click();
  await choose(page,2);
  await expect(page.getByRole('button',{name:'Bedside',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#s8-room-description')).toContainText('withdrawn his hand');
  await expect(page.locator('.s8-safety-priority.is-clear')).toContainText('Contact cleared');
  await expect(page.getByRole('heading',{name:'Marcus is clear'})).toBeFocused();
  expect((await page.getByRole('heading',{name:'Marcus is clear'}).boundingBox()).y).toBeGreaterThanOrEqual(0);
  expect((await page.getByRole('heading',{name:'Marcus is clear'}).boundingBox()).y).toBeLessThan(page.viewportSize().height / 2);
  await expect(page.locator('.s8-room figcaption')).toContainText('her intervention, not yours');
  await page.screenshot({path:`/tmp/shift8-${info.project.name}-room-cleared.png`,fullPage:true});
  await page.getByRole('button',{name:'Continue →',exact:true}).click();
  await choose(page,2); await page.getByRole('button',{name:'Continue →',exact:true}).click();
  expect((await state(page)).stage).toBe('given');
  expect((await state(page)).answers.recordedEvent).toBeUndefined();
  await page.reload(); await expect(page.locator('.s8-record-workspace')).toContainText('premature entry');
  await page.screenshot({path:`/tmp/shift8-${info.project.name}-record.png`,fullPage:true});
  await page.getByRole('button',{name:'Team',exact:true}).click();
  await page.getByRole('button',{name:'Correct entry & record completed event'}).click();
  await expect(page.getByRole('button',{name:'Chart',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.s8-record-result')).toContainText('Jordan administered');
  await expect(page.locator('.s8-record-result')).toContainText('You recorded');
  await expect(page.getByRole('heading',{name:'Entry recorded'})).toBeFocused();
  expect((await page.getByRole('heading',{name:'Entry recorded'}).boundingBox()).y).toBeGreaterThanOrEqual(0);
  expect((await page.getByRole('heading',{name:'Entry recorded'}).boundingBox()).y).toBeLessThan(page.viewportSize().height / 2);
  await page.screenshot({path:`/tmp/shift8-${info.project.name}-entry-recorded.png`,fullPage:true});
  expect((await state(page)).stage).toBe('given');
  const end=await state(page); expect(end.answers.recordedEvent).toEqual({actor:'Jordan',time:230,prompted:true});
  expect(end.answers.medication[0].id).toBe('record'); expect(end.answers.safety[0].id).toBe('point');
  await page.reload(); expect((await state(page)).answers).toEqual(end.answers);
  await expect(page.locator('.s8-record-result')).toBeVisible();
});
test('role details close when the scene changes',async({page})=>{
  await seed(page,{...fresh(),stage:'page',opening:opening(['shout','press','check','compress']),staffing:'S1'});
  await page.getByRole('button',{name:'Team',exact:true}).click();
  await page.locator('.s8-person.active').click();
  await expect(page.locator('.s8-person-detail')).toBeVisible();
  await choose(page); await page.getByRole('button',{name:'Continue →',exact:true}).click();
  await expect(page.locator('.s8-person-detail')).toHaveCount(0);
});
test.beforeEach(async({page})=> {
  const fixture=JSON.parse(readFileSync(new URL('./fixtures/consented-storage.json',import.meta.url),'utf8'));
  await page.addInitScript(items=>{ for(const item of items) localStorage.setItem(item.name,item.name==='ce_consent'?JSON.stringify({...JSON.parse(item.value),analytics:false}):item.value); localStorage.setItem('ce_product_analytics_exclude','1'); },fixture.origins[0].localStorage);
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
});
test('compact opening has one continuation and optional playback never changes choices',async({page})=>{
  const s={...fresh(),stage:'playback',opening:opening(['shout','press','check','compress'])};
  await seed(page,s);
  await expect(page.locator('.s8-opening-record li')).toHaveCount(s.opening.events.length);
  await expect(page.locator('.s8-sim-orientation')).toContainText('00:15');
  await expect(page.getByRole('button',{name:'Next event'})).toHaveCount(0);
  await page.getByRole('button',{name:'Replay sequence'}).click();
  await page.getByRole('button',{name:'Pause playback'}).click();
  expect((await state(page)).opening).toEqual(s.opening);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByRole('button',{name:'Replay sequence'}).click();
  await page.reload();
  expect((await state(page)).opening).toEqual(s.opening);
  await page.getByRole('button',{name:'Meet Priya'}).click();
  expect((await state(page)).stage).toBe('priya');
  await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:KEYS.main,value:{...fresh(),stage:'playback',opening:opening([])}});
  await page.reload();
  await expect(page.locator('.s8-bedside-active')).toHaveCount(0);
});
test('multi-view delegation preserves branches and equipment arrives only at cart', async ({page}, info) => {
  await page.goto(url);
  for (const id of ['cart', 'count', 'gap', 'vague', 'waiting']) {
    const value = {...fresh(),stage:'priya',opening:opening(id === 'waiting' ? ['shout','press','check','wait'] : ['shout','press','check','compress'])};
    await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:KEYS.main,value});
    await page.reload();
    await page.getByRole('button',{name:'Team',exact:true}).click();
    await expect(page.locator(id==='waiting'?'.s8-live-team':'.s8-priya-state')).toContainText('Priya');
    await page.getByRole('button',{name:'Chart',exact:true}).click();
    await expect(page.getByRole('heading',{name:'History from report'})).toBeVisible();
    expect((await state(page)).answers.priya).toBeUndefined();
    await page.getByRole('button',{name:'Bedside',exact:true}).focus();
    await page.keyboard.press('Enter');
    if(id==='waiting') await page.locator('.s8-person.active').click();
    await expect(page.locator('.s8-equipment')).toContainText('Not yet arrived');
    if(id==='cart') await page.screenshot({path:`/tmp/shift8-multiview-${info.project.name}-priya.png`,fullPage:true});
    await choose(page,id==='waiting'?0:['cart','count','gap','vague'].indexOf(id));
    if(id==='vague') {
      await expect(page.locator('.s8-priya-state .s8-state-status')).toContainText('no task acknowledged');
      await page.getByRole('button',{name:'Respond again'}).click();
      await choose(page);
    }
    const original=(await state(page)).answers.priya[0].id;
    await expect(page.locator('.s8-equipment')).not.toContainText('Arrived ·');
    await page.getByRole('button',{name:'Team',exact:true}).click();
    if(['count','gap'].includes(id)) {
      await expect(page.locator('.s8-priya-state .s8-state-status')).toContainText('handover pending');
      await expect(page.locator('.s8-scene')).toContainText(id==='count'?'You remain on compressions until the counted handover':'Compressions paused during the switch');
    }
    await page.getByRole('button',{name:'Continue →',exact:true}).click();
    if((await state(page)).stage==='marcus') {
      await choose(page); await page.getByRole('button',{name:'Continue →',exact:true}).click();
    } else await page.getByRole('button',{name:'Return with the cart'}).click();
    expect((await state(page)).stage).toBe('cart');
    await expect(page.locator('.s8-scene-status.has-arrived')).toContainText('01:10');
    await expect(page.locator('.s8-equipment')).toContainText('Crash cart arrived');
    await expect(page.locator('.s8-arrival')).toHaveCount(0);
    await expect(page.locator('.s8-scene .s8-dialogue')).toHaveCount(1);
    await expect(page.locator('.s8-scene .s8-muted')).toContainText('fictional policy');
    await page.reload();
    expect((await state(page)).answers.priya[0].id).toBe(original);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(id==='cart') await page.screenshot({path:`/tmp/shift8-consolidated-${info.project.name}-equipment.png`,fullPage:true});
    await page.getByRole('button',{name:'Continue to rhythm check'}).click();
    await expect(page.locator('.s8-simulation')).toHaveCount(1);
    expect((await state(page)).stage).toBe('analysis');
  }
});
test('room-framed opening to Priya preserves choices and acknowledgment', async ({page}, info) => {
  await page.goto(url);
  await page.screenshot({path:`/tmp/shift8-consolidated-${info.project.name}-opening.png`,fullPage:true});
  await page.getByRole('button',{name:'Enter room'}).click();
  await choose(page);
  await page.getByRole('button',{name:'Continue →',exact:true}).click();
  for (const text of ['Shout for help','Press Code Blue','Check breathing and pulse together (up to 10 seconds)','Start compressions']) await page.getByRole('button',{name:`＋ ${text}`,exact:true}).click();
  await page.reload();
  expect((await state(page)).drafts.opening).toEqual(['shout','press','check','compress']);
  await page.getByRole('button',{name:'Go →',exact:true}).click();
  await expect(page.locator('.s8-sim-orientation')).toContainText('00:15');
  await page.getByRole('button',{name:'Meet Priya'}).click();
  await expect(page.locator('.s8-choices input')).toHaveCount(4);
  await page.locator('.s8-choices input').first().focus();
  await expect(page.locator('.s8-choices input').first()).toBeFocused();
  await page.screenshot({path:`/tmp/shift8-consolidated-${info.project.name}-priya.png`,fullPage:true});
  await page.locator('.s8-choices input').first().check();
  expect((await state(page)).answers.priya).toBeUndefined();
  await page.getByRole('button',{name:'Send request to Priya'}).click();
  await expect(page.locator('.s8-priya-speech')).toContainText('Cart and pads, got it.');
  await expect(page.locator('.s8-priya-state .s8-state-status')).toContainText('acknowledged, not completed');
  await page.reload();
  expect((await state(page)).answers.priya[0].id).toBe('cart');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:`/tmp/shift8-upgrade-${info.project.name}-acknowledged.png`,fullPage:true});
});
test('complete accepted path, saved draft, handoff, optional modes stay separate',async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);
  await page.screenshot({path:`/tmp/shift8-unified-${info.project.name}-opening.png`,fullPage:true});
  await page.getByRole('button',{name:'Enter room'}).click();
  await expect(page.locator('.s8-state-panel')).toContainText('Harold is slumped in bed');
  await choose(page); await page.getByRole('button',{name:'Continue',exact:false}).click();
  for(const text of ['Shout for help','Press Code Blue','Check breathing and pulse together (up to 10 seconds)','Start compressions']) await page.getByRole('button',{name:`＋ ${text}`,exact:true}).click();
  await page.screenshot({path:`/tmp/shift8-${info.project.name}-opening.png`,fullPage:true});
  await page.reload(); expect((await state(page)).drafts.opening).toHaveLength(4);
  await page.getByRole('button',{name:'Go →',exact:true}).click();
  while((await state(page)).stage==='playback') await page.locator('.s8-scene .s8-primary').click();
  for(const step of ['priya','marcus','cart','analysis','clearance','restartCPR','mask','summary','leader','page','time','charge','safety','medication','given','rosc','transport','handoff','synthesis','transfer']) {
    expect((await state(page)).stage).toBe(step);
    await expect(page.locator('.s8-sim-orientation')).toContainText('Harold Kim');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const captures={priya:'priya',marcus:'marcus-delegation',analysis:'aed',safety:'marcus-safety',leader:'leadership'};
    if(captures[step]) await page.screenshot({path:`/tmp/shift8-unified-${info.project.name}-${captures[step]}.png`,fullPage:true});
    await expect(page.locator('.s8-simulation img, .s8-simulation svg')).toHaveCount(0);
    expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(entry=>entry.name.includes('room-states')))).toBe(false);
    if(step==='analysis') { await expect(page.locator('.s8-equipment-scene')).toContainText('Shockable rhythm.'); await expect(page.locator('.s8-equipment-scene svg')).toHaveCount(0); }
    if(step==='leader') await expect(page.locator('.s8-scene .s8-lead')).toHaveText('The code team has arrived. What will you say to make leadership and your next role explicit?');
    if(['safety','handoff'].includes(step)) await page.screenshot({path:`/tmp/shift8-integrated-${info.project.name}-${step==='safety'?'marcus':'handoff'}.png`,fullPage:false});
    if(step==='summary') { for(let i=0;i<5;i++) await page.locator('.s8-choices input').nth(i).check(); await page.getByRole('button',{name:'Say this summary'}).click(); await page.getByRole('button',{name:'Continue →',exact:true}).click(); }
    else if(step==='handoff') { for(const group of await page.locator('.s8-handoff').all()) await group.locator('input').first().check(); await page.getByRole('button',{name:'Give handoff'}).click(); await page.getByRole('button',{name:'Continue →',exact:true}).click(); }
    else if(step==='synthesis') { for(const input of await page.locator('.s8-choices input').all()) await input.check(); await page.getByRole('button',{name:'Say these corrections'}).click(); await page.getByRole('button',{name:'Continue →',exact:true}).click(); }
    else if(step==='given') { await page.getByRole('button',{name:'Record completed event'}).click(); await expect(page.locator('.s8-record-result')).toBeVisible(); await page.evaluate(()=>scrollTo(0,0)); await page.screenshot({path:`/tmp/shift8-integrated-${info.project.name}-jordan.png`,fullPage:false}); await page.getByRole('button',{name:'Continue to the rhythm check'}).click(); }
    else if(['cart','charge','rosc','transport','transfer'].includes(step)) await page.locator('.s8-scene .s8-primary').click();
    else { await choose(page); await page.getByRole('button',{name:'Continue →',exact:true}).click(); }
  }
  expect((await state(page)).stage).toBe('debrief');
  await expect(page.getByText('In this fictional case, Harold’s pulse came back.',{exact:false})).toBeVisible();
  const original=await state(page); await page.screenshot({path:`/tmp/shift8-${info.project.name}-debrief.png`,fullPage:true});
  await page.screenshot({path:`/tmp/shift8-integrated-${info.project.name}-debrief.png`,fullPage:false});
  await page.getByRole('button',{name:'Same code, from the doorway'}).click();
  await expect(page.locator('.s8-sim-orientation')).toContainText('PRIYA REPLAY');
  for(let i=0;i<REPLAY.length;i++) { await choose(page); await page.locator('.s8-side .s8-primary').click(); }
  await page.getByRole('button',{name:'Return to main debrief'}).click(); expect(await state(page)).toEqual(original);
  await page.getByRole('button',{name:'Rewind Three recorder'}).click();
  await expect(page.locator('.s8-sim-orientation')).toContainText('REWIND');
  for(let i=0;i<REWIND.length;i++) { await choose(page); await page.locator('.s8-side .s8-primary').click(); }
  await page.getByRole('button',{name:'Return to main debrief'}).click(); expect(await state(page)).toEqual(original);
  await page.getByRole('button',{name:'Start over',exact:true}).click(); await page.getByRole('button',{name:'Keep my progress'}).click(); expect(await state(page)).toEqual(original);
  expect(errors).toEqual([]);
});

test('consulting the occurred-event record preserves summary and handoff drafts', async ({page}) => {
  await page.goto(url);
  for(const stage of ['summary','leader','handoff']) {
    const value={...fresh(),stage,opening:opening(['shout','press','check','compress']),staffing:'S1'};
    await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:KEYS.main,value});
    await page.reload();
    const panel=stage==='handoff'?page.locator('#s8-view-content > div:not([hidden]) .s8-frame-record'):page.locator('.s8-record-access');
    if(stage==='leader') { await page.locator('.s8-person.active').click(); await expect(page.locator('.s8-person-detail')).toContainText('Code team leader; rhythm interpretation'); }
    await panel.locator('summary').focus(); await page.keyboard.press('Enter');
    await expect(panel.locator('ol')).toBeVisible();
    await panel.locator('ol').focus(); await page.keyboard.press('End');
    const times=await panel.locator('time').allTextContents();
    expect(times.length).toBeGreaterThan(0);
    expect(times.every(time=>{const [m,s]=time.split(':').map(Number);return m*60+s<=(stage==='handoff'?420:150);})).toBe(true);
    if(stage!=='handoff') { await expect(panel).not.toContainText('One dose of epinephrine'); await expect(panel).not.toContainText('Pulse returns'); }
    expect((await state(page)).answers).toEqual({});
    await page.locator('.s8-choices input').first().check();
    const draft=(await state(page)).drafts;
    await page.getByRole('button',{name:'Team',exact:true}).click();
    await page.getByRole('button',{name:'Chart',exact:true}).click();
    expect((await state(page)).drafts).toEqual(draft);
    expect((await state(page)).answers).toEqual({});
    await page.reload();
    expect((await state(page)).drafts).toEqual(draft);
    await expect(page.locator('.s8-choices input').first()).toBeChecked();
  }
});

test('every main choice renders exact feedback and preserves original on refresh',async({page})=>{
  test.setTimeout(240000);
  for(const [key,options] of Object.entries(CHOICES)) for(const o of options) {
    const stage=key==='priyaWait'?'priya':key==='analysisAway'?'analysis':key;
    const s={...fresh(),stage,opening:opening(key==='priyaWait'?['wait']:['shout','press','check','compress']),staffing:key==='analysisAway'?'S2':'S1'};
    await page.goto(url); await page.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key:KEYS.main,s}); await page.reload(); await expect(page.locator('.s8-app')).toBeVisible();
    if(stage==='priya' && !await page.locator('.s8-choices input').count()) await page.locator('.s8-person.active').click();
    await page.locator('.s8-choices input').nth(options.indexOf(o)).check(); expect((await state(page)).answers[stage]).toBeUndefined();
    await page.getByRole('button',{name:stage==='priya'?'Send request to Priya':'Confirm response'}).click(); await expect(page.locator('.s8-feedback').first()).toContainText(o.label);
    await expect(page.locator('.s8-visible-reason')).toBeVisible();
    if(stage==='safety') { await expect(page.locator('#s8-room-description')).toContainText('withdrawn his hand'); await expect(page.locator('.s8-room figcaption')).toContainText(['stop','leader'].includes(o.id)?'Your spoken warning':'her intervention'); }
    await page.reload(); expect((await state(page)).answers[stage][0].id).toBe(o.id);
  }
});
test('bad handoff, skipped essentials and teammate correction do not credit learner',async({page})=>{
  const s={...fresh(),stage:'handoff',staffing:'S3',opening:opening(['wait'])}; await seed(page,s);
  const groups=await page.locator('.s8-handoff').all();
  for(let i=0;i<groups.length;i++) await groups[i].locator('input').nth(i<3?2:1).check();
  await page.getByRole('button',{name:'Give handoff'}).click();
  await page.getByRole('button',{name:'Continue →',exact:true}).click();
  for(let i=0;i<3;i++) await page.locator('.s8-scene .s8-primary').click();
  await expect(page.locator('.s8-dialogue').last()).toContainText('He collapsed at 1411');
  await page.getByRole('button',{name:'Yes, that’s right'}).click(); await page.getByRole('button',{name:'Continue →',exact:true}).click(); await page.getByRole('button',{name:'Leave remaining corrections'}).click(); await page.getByRole('button',{name:'Continue →',exact:true}).click();
  await expect(page.locator('.s8-scene')).toContainText('Jordan'); await expect(page.locator('.s8-scene')).toContainText('1416'); await expect(page.locator('.s8-scene')).toContainText('I have him');
  const n=await state(page); expect(n.answers.handoff.course).toBe('skip'); expect(n.answers.handoff.uncertain).toBe('bad'); expect(n.answers.synthesis).toEqual([]);
});
test('phone layout, keyboard selection, reduced motion and untouched other progress',async({page},info)=>{
  await page.addInitScript(()=>localStorage.setItem('ce-shift-existing-test','preserve-me'));
  await seed(page,{...fresh(),stage:'priya',opening:opening(['shout','press','check','compress']),staffing:'S1'});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.s8-choices input').first().focus();
  await page.locator('.s8-choices input').first().focus(); await page.keyboard.press('Space');
  expect((await state(page)).answers.priya).toBeUndefined();
  await page.reload(); await expect(page.locator('.s8-choices input').first()).toBeChecked();
  await page.getByRole('button',{name:'Send request to Priya'}).focus(); await page.keyboard.press('Enter');
  expect((await state(page)).answers.priya[0].id).toBe('cart');
  for(const width of [320,390,768,1440]) { await page.setViewportSize({width,height:900}); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true); }
  await page.setViewportSize({width:390,height:844}); await page.screenshot({path:`/tmp/shift8-${info.project.name}-team.png`,fullPage:true});
  await page.addStyleTag({content:'.s8-app {font-size:24px}'}); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.evaluate(()=>localStorage.getItem('ce-shift-existing-test'))).toBe('preserve-me');
});

for(const tiles of [['shout','check','compress'],['wait'],[]]) test(`late and prompted path ${tiles.join('-')||'empty'} completes with original credit`,async({page})=>{
  await page.goto(url); await page.getByRole('button',{name:'Enter room'}).click(); await choose(page,3); await page.getByRole('button',{name:'Continue →',exact:true}).click();
  const tileLabels={shout:'Shout for help',check:'Check breathing and pulse together (up to 10 seconds)',compress:'Start compressions',wait:'Wait for the crash cart'};
  for(const t of tiles) await page.getByRole('button',{name:`＋ ${tileLabels[t]}`,exact:true}).click();
  await page.getByRole('button',{name:'Go →',exact:true}).click();
  for(let guard=0;guard<80;guard++) {
    const s=await state(page); if(s.stage==='debrief') break;
    if(s.stage==='playback') {
      if(s.opening.needsEndChoice) await page.getByRole('button',{name:'Wait for the crash cart · Prompted',exact:true}).click();
      else await page.locator('.s8-scene .s8-primary').click();
    } else if(s.drafts.feedbackPause) await page.getByRole('button',{name:'Continue →',exact:true}).click();
    else if(s.feedback) await page.locator('.s8-feedback .s8-primary').click();
    else if(s.stage==='summary') await page.getByRole('button',{name:'Say this summary'}).click();
    else if(s.stage==='handoff') { for(const group of await page.locator('.s8-handoff').all()) await group.locator('input').last().check(); await page.getByRole('button',{name:'Give handoff'}).click(); }
    else if(s.stage==='synthesis') await page.getByRole('button',{name:'Yes, that’s right'}).click();
    else if(s.stage==='correction') await page.getByRole('button',{name:'Leave remaining corrections'}).click();
    else if(s.stage==='priya') await choose(page,s.opening.waiting?0:s.answers.priya?1:3);
    else if(await page.locator('.s8-choices input').count()) {
      const count=await page.locator('.s8-choices input').count();
      // Vague requests and neutral inquiries are tried once, then resolved explicitly.
      const index=s.stage==='priya'&&!s.opening.waiting ? (s.answers.priya?1:3) : s.stage==='page' ? (s.answers.page?3:2) : count-1;
      await choose(page,index);
    } else await page.locator('.s8-scene .s8-primary').click();
  }
  const s=await state(page); expect(s.stage).toBe('debrief'); expect(s.opening.sequence).toEqual(tiles); expect(s.answers.assess[0].id).toBe('leave');
  expect(s.answers.mask.map(a=>a.id)).toEqual(['decline','decline']); expect(s.answers.synthesis).toEqual([]);
  await expect(page.locator('.s8-scene')).toContainText('Priya managed one-person bag-mask');
  await page.reload(); expect((await state(page)).answers).toEqual(s.answers);
});

test('every replay and Rewind option, separate resume and explicit restart',async({page})=>{
  const main={...fresh(),stage:'debrief',opening:opening(['shout','press','check','compress']),staffing:'S1',answers:{summary:[],handoff:Object.fromEntries(['course','now','treatment','pending','uncertain'].map(k=>[k,'good'])),synthesis:['dose','stable']}};
  await seed(page,main);
  for(const mode of ['replay','rewind']) for(const [index,item] of (mode==='replay'?REPLAY:REWIND).entries()) for(const option of item.options) {
    await page.evaluate(({key,index,version})=>localStorage.setItem(key,JSON.stringify({version,index,answers:{},drafts:{}})),{key:KEYS[mode],index,version:mode==='replay'?VERSION:'0.6'});
    await page.reload(); await page.getByRole('button',{name:mode==='replay'?'Same code, from the doorway':'Rewind Three recorder'}).click();
    await page.locator('.s8-choices input').nth(item.options.indexOf(option)).check(); await page.getByRole('button',{name:'Confirm response'}).click();
    await expect(page.locator('.s8-feedback')).toContainText(option.feedback);
    if(mode==='replay' && ['rhythm','clear'].includes(item.id)) await expect(page.locator('.s8-sim-orientation')).toContainText(item.id==='rhythm'?'01:22':'01:25');
    expect((await state(page)).answers).toEqual(main.answers);
  }
  await page.getByRole('button',{name:'← Main Shift debrief'}).click();
  const rewind=await page.evaluate(key=>localStorage.getItem(key),KEYS.rewind);
  await page.getByRole('button',{name:'Start over',exact:true}).click(); await page.getByRole('button',{name:'Restart main Shift',exact:true}).click();
  expect((await state(page)).stage).toBe('report'); expect(await page.evaluate(key=>localStorage.getItem(key),KEYS.rewind)).toBe(rewind);
});
