import { test, expect } from '@playwright/test';
import { fresh as monitor, KEY as monitorKey } from '../src/modules/the-shift/monitor/progress.js';
import { alarmChoices, alarmExplanations } from '../src/modules/the-shift/monitor/data.js';
import { fresh as discharge, KEY as dischargeKey } from '../src/modules/the-shift/discharge/progress.js';
import { fresh as conversation, KEY as conversationKey } from '../src/modules/the-shift/conversation/progress.js';
import { fresh, STORAGE_KEY, evaluateDispatch, evaluateCoverage } from '../src/modules/the-shift/shift5/rules.js';
test.use({storageState:{cookies:[],origins:[]}});
const scenes=[
 {id:'monitor-alarm',key:monitorKey,state:{...monitor(),stage:1},answer:'alarm'},
 {id:'discharge-puzzle',key:dischargeKey,state:{...discharge(),stage:1},answer:'start'},
 {id:'conversation',key:conversationKey,state:{...conversation(),notice:true,stage:1},answer:'opening'},
];
for(const width of [320,390,1440]) for(const scene of scenes) test(`${scene.id} confirmation and saved choice ${width}`,async({page})=>{
 await page.setViewportSize({width,height:844}); await page.goto('/');
 await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),scene);
 await page.goto(`/learn/shifts/${scene.id}`);
 const confirm=page.getByRole('button',{name:scene.id==='conversation'?'Say this response':'Confirm my response'});
 await expect(confirm).toBeDisabled();
 const choice=scene.id==='conversation'?page.locator('.conversation-replies button').first():page.getByRole('radio').first();
 await choice.focus(); await choice.press('Space');
 expect(await page.evaluate(({key,answer})=>JSON.parse(localStorage.getItem(key)!).answers[answer],scene)).toBeUndefined();
 await expect(confirm).toBeEnabled();
 if(width===390){await choice.scrollIntoViewIfNeeded();await page.screenshot({path:`/private/tmp/choice-${scene.id}.png`});}
 await confirm.click();
 const original=await page.evaluate(({key,answer})=>JSON.parse(localStorage.getItem(key)!).answers[answer],scene);
 expect(original).toBeTruthy(); await page.reload();
 expect(await page.evaluate(({key,answer})=>JSON.parse(localStorage.getItem(key)!).answers[answer],scene)).toBe(original);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('Shift 5 follow-up requires confirmation and named acceptance',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 const dispatch={assignments:{'410':'jordan','412':'you','416':'hold'},jordanDirection:'A',hold416:'A'};
 const state={...fresh(),stage:6,d1:{order:['414','412','410','416'],reason:'change'},d2:evaluateDispatch(dispatch),d3:evaluateCoverage('A')};
 await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:STORAGE_KEY,state});
 await page.goto('/learn/shifts/which-patient-first');
 const card=page.locator('.s5-loose').filter({has:page.getByRole('heading',{name:'Coverage / 410, 412, 416',exact:true})});
 await card.getByRole('radio').first().check();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).d5.coverage,STORAGE_KEY)).toBeUndefined();
 await card.getByRole('button',{name:'Confirm follow-up'}).click();
 await expect(card.getByText('Awaiting Dee',{exact:true})).toBeVisible();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).coverageAcknowledged,STORAGE_KEY)).toBeFalsy();
 await card.getByRole('button',{name:"Hear Dee's reply"}).click();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).coverageAcknowledged,STORAGE_KEY)).toBe(true);
 await card.scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/choice-which-patient-first.png'});
 await page.reload();expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).coverageAcknowledged,STORAGE_KEY)).toBe(true);
});

test('Monitor patient selection is provisional until confirmed',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 const state={...monitor(),stage:3,answers:{alarm:alarmChoices[0].id,explanation:alarmExplanations[0].id}};
 await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:monitorKey,state});
 await page.goto('/learn/shifts/monitor-alarm');
 const confirm=page.getByRole('button',{name:'Confirm patient selection'});
 await expect(confirm).toBeDisabled();
 await page.getByRole('button',{name:/Assess Room 24/}).click();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).answers.monitor,monitorKey)).toBeUndefined();
 await expect(page.getByRole('heading',{name:'Read the change.'})).toHaveCount(0);
 await confirm.click();
 await expect(page.getByRole('heading',{name:'Read the change.'})).toBeVisible();
 await page.reload();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).answers.monitor,monitorKey)).toBe('24');
});
