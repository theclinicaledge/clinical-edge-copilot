import { test, expect } from '@playwright/test';
import { scenario } from '../src/modules/the-shift/scenario.js';
import { freshProgress, STORAGE_KEY as DROWSY_KEY } from '../src/modules/the-shift/progress.js';
import { fresh as freshMonitor, KEY as MONITOR_KEY } from '../src/modules/the-shift/monitor/progress.js';
import { alarmChoices, alarmExplanations, monitorChoices, rhythmChoices, recommendations } from '../src/modules/the-shift/monitor/data.js';
import { fresh as freshDischarge, KEY as DISCHARGE_KEY } from '../src/modules/the-shift/discharge/progress.js';
import { startChoices, teachChoices, fixChoices } from '../src/modules/the-shift/discharge/data.js';
import { fresh as freshConversation, KEY as CONVERSATION_KEY } from '../src/modules/the-shift/conversation/progress.js';
import { opening, asking, confidentiality, cues, actions } from '../src/modules/the-shift/conversation/data.js';
import { fresh as freshFifth, STORAGE_KEY as FIFTH_KEY, evaluateDispatch, evaluateCoverage, evaluateReport } from '../src/modules/the-shift/shift5/rules.js';
// Complete synthetic progress records let every authored stage and its feedback render.
const drowsy = { ...freshProgress(), viewed: ['12','14','9'], revealed: scenario.cues.map(c => c.id), answers: { priority: '12', cues: scenario.cues.map(c => c.id), action: scenario.actions[0].id, abg: scenario.interpretations[0].id, sbar: scenario.sbars[0].id } };
const monitor = { ...freshMonitor(), answers: { alarm: alarmChoices[0].id, explanation: alarmExplanations[0].id, monitor: monitorChoices[0].id, rhythm: rhythmChoices[0].id, cues: [], actions: ['notify','stay','ecg'], chips: [], recommendation: recommendations[0].id } };
const discharge = { ...freshDischarge(), inspected: ['lasix','furosemide'], answers: { start: startChoices[0].id, flags: ['stop-apixaban','continue-thinner','resume-all'], actions: ['provider','charge'], teach: teachChoices[0].id, fix: fixChoices[0].id } };
const placements = Object.fromEntries(actions.map(a => [a.id, a.placements[0].groups[0]]));
const conversation = { ...freshConversation(), notice: true, revealed: cues.length, placements, answers: { opening: opening[0].id, asking: asking[0].id, confidentiality: confidentiality[0].id, cues: cues.map(c => c.id), actions: placements } };
const dispatch = { assignments: { '410': 'jordan', '412': 'you', '416': 'hold' }, jordanDirection: 'A', hold416: 'A' };
const fifth = { ...freshFifth(), d1: { order: ['414','412','410','416'], reason: 'change' }, d2Draft: dispatch, d2: evaluateDispatch(dispatch), d3: evaluateCoverage('A'), d4: { phase: 3, revealed: ['vitals','dressing'], helpDraft: ['provider'], help: { submitted: ['provider'], reasons: ['Accepted'], bridges: [] }, reportDraft: ['trend','dressing'], report: evaluateReport(['trend','dressing'], ['vitals','dressing']), checkback: { submitted: 'repeat', reasons: ['Accepted'], bridges: [] } }, d5: Object.fromEntries(['410','412','414','416','coverage','jordan'].map(id => [id, { submitted: 'accepted', reasons: ['Accepted'], bridges: [] }])), coverageAcknowledged: true };
const SCENES = [
  { id: 'drowsy-patient', key: DROWSY_KEY, state: drowsy, stages: 7 },
  { id: 'monitor-alarm', key: MONITOR_KEY, state: monitor, stages: 8 },
  { id: 'discharge-puzzle', key: DISCHARGE_KEY, state: discharge, stages: 7 },
  { id: 'conversation', key: CONVERSATION_KEY, state: conversation, stages: 7 },
  { id: 'which-patient-first', key: FIFTH_KEY, state: fifth, stages: 8 },
];

test.use({ storageState: { cookies: [], origins: [] } });
for (const width of [320, 390, 1440]) for (const scene of SCENES) {
 test(`${scene.id} debrief jumps at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/learn');
  await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: scene.key, state: { ...scene.state, stage: scene.stages - 1 } });
  await page.goto('/learn/shifts/' + scene.id);
  const nav = page.getByRole('navigation', { name: 'Debrief sections' });
  await expect(nav).toBeVisible();
  const before = await page.evaluate(key => localStorage.getItem(key), scene.key);
  for (const name of ['Your choices', 'Takeaways', 'Sources', 'Next step']) {
   const button = nav.getByRole('button', { name, exact: true });
   await button.focus();
   await button.press('Enter');
   const target = page.locator('.shift-debrief-target:focus');
   await expect(target).toHaveCount(1);
   const box = await target.boundingBox();
   const dock = await page.locator('.ce-tool-dock').boundingBox();
   expect(box!.y).toBeGreaterThanOrEqual(0);
   expect(box!.y).toBeLessThan(dock!.y - 24);
   if (name === 'Sources') await expect(target).toContainText(/reference|source/i);
  }
  expect(await page.evaluate(key => localStorage.getItem(key), scene.key)).toBe(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await nav.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `/private/tmp/ce-debrief-nav-${scene.id}-${width}.png`, animations: 'disabled' });
 });
}

