import { test, expect } from '@playwright/test';
import { seedTrack } from './med-surg-fixtures.mjs';

for (const [id, route, sourceKey] of [['a1', 'drowsy-patient', 'ce-private-shift-drowsy-r2'], ['a2', 'which-patient-first', 'ce_shift_005_v04']]) {
  test(`${route}: debrief practice, save, resume and original preservation`, async ({ page }) => {
    const seed = seedTrack(); const original = JSON.stringify(seed.assignments[id].runs[0].snapshot);
    await page.addInitScript(({ sourceKey, original }) => {
      if (!localStorage.getItem(sourceKey)) localStorage.setItem(sourceKey, original);
    }, { sourceKey, original });
    await page.goto(`/learn/shifts/${route}`);
    await page.getByRole('button', { name: 'Explore Rewind' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Start Rewind' }).click();
    await page.getByRole('button', { name: 'Choose my response' }).click();
    await expect(page.getByRole('button', { name: 'Check my response' })).toBeDisabled();
    await page.getByRole('radio', { name: /Escalate now/ }).check();
    await page.getByRole('button', { name: 'Check my response' }).click();
    await expect(page.getByRole('region', { name: 'Practice feedback' })).toBeVisible();
    await page.getByRole('button', { name: 'Finish for now and see summary' }).click();
    await page.getByRole('button', { name: /^Review feedback/ }).click();
    await expect(page.getByText('Your latest response:', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Back to Rewind summary' }).click();
    await expect(page.getByRole('region', { name: 'Rewind summary' })).toBeVisible();
    await page.getByRole('button', { name: 'Close Rewind and return to debrief' }).click();
    await expect(page.getByRole('button', { name: 'Continue Rewind' })).toBeFocused();
    const answers = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), sourceKey);
    expect(answers.answers ?? answers.d4).toEqual(JSON.parse(original).answers ?? JSON.parse(original).d4);
    expect(await page.evaluate(() => localStorage.getItem('ce-med-surg-track-private'))).toBeNull();
    await page.reload();
    await page.getByRole('button', { name: 'Continue Rewind' }).click();
    await expect(page.getByRole('heading', { name: 'Pick up where you left off.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View my Rewind summary' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue Rewind', exact: false }).last().click();
    await expect(page.getByRole('heading', { name: /^Situation 2 of 3/ })).toBeVisible();
    expect(await page.evaluate(id => JSON.parse(localStorage.getItem(`ce-standalone-rewind-${id}`)).attempts.length, id)).toBe(1);
  });
}

// Completed fictional source fixtures exercise the debrief integration without
// rewriting any real learner's browser data. Each test has an isolated context.
import * as monitor from '../src/modules/the-shift/monitor/data.js';
import * as discharge from '../src/modules/the-shift/discharge/data.js';
import * as conversation from '../src/modules/the-shift/conversation/data.js';
const newPacks = [
  { id: 'monitor-alarm', key: 'ce-private-shift-monitor-r2', original: { version: 1, stage: 7, answers: { alarm: monitor.alarmChoices[0].id, explanation: monitor.alarmExplanations[0].id, monitor: monitor.monitorChoices[0].id, rhythm: monitor.rhythmChoices[0].id, cues: [], actions: ['notify', 'stay', 'recheck'], chips: [], recommendation: monitor.recommendations[0].id } }, choices: ['Check electrode contact and leads, then confirm the tracing and reassess him', 'Stay with him and summon urgent bedside help through the unit’s response process', 'Continue assessment and monitoring, and promptly report the new rhythm for evaluation'] },
  { id: 'discharge-puzzle', key: 'ce-private-shift-discharge-v02', original: { version: '0.2', stage: 6, inspected: ['lasix', 'furosemide'], answers: { start: discharge.startChoices[0].id, flags: [], actions: ['provider', 'charge'], teach: discharge.teachChoices[0].id, fix: discharge.fixChoices[0].id } }, choices: ['Contact the discharging prescriber and reconcile the instructions before completing discharge', 'Explain the two names using the confirmed list, then repeat the show-me', 'Document what he demonstrated and complete the remaining discharge checks'] },
  { id: 'conversation', key: 'ce-private-shift-conversation-v04', original: { version: conversation.CONTENT_VERSION, notice: true, stage: 6, revealed: conversation.cues.length, answers: { opening: conversation.opening[0].id, cues: [], asking: conversation.asking[0].id, confidentiality: conversation.confidentiality[0].id, actions: Object.fromEntries(conversation.actions.map(a => [a.id, conversation.zones[0].id])) } }, choices: ['“You sound worried about being a burden. Are you thinking about killing yourself?”', 'Stay with him, call for help from the room and initiate the unit’s safety response', '“Thank you for trusting me. I need to involve the team to help keep you safe, and I will stay with you.”'] },
];
for (const pack of newPacks) test(`${pack.id}: all three tailored Rewinds, reload and review preserve source answers`, async ({ page }) => {
  await page.addInitScript(({ key, original }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(original));
  }, pack);
  await page.goto(`/learn/shifts/${pack.id}`);
  await page.getByRole('button', { name: 'Explore Rewind' }).click();
  const sourceAnswers = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).answers, pack.key);
  await page.getByRole('button', { name: 'Start Rewind' }).click();
  for (let i = 0; i < pack.choices.length; i++) {
    await expect(page.getByRole('heading', { name: new RegExp(`^Situation ${i + 1} of 3:`) })).toBeVisible();
    await page.getByRole('button', { name: 'Choose my response' }).click();
    await expect(page.getByRole('button', { name: 'Check my response' })).toBeDisabled();
    await page.getByRole('radio', { name: pack.choices[i], exact: true }).check();
    await page.getByRole('button', { name: 'Check my response' }).click();
    await expect(page.getByRole('region', { name: 'Practice feedback' })).toContainText('Accepted');
    if (i < 2) await page.getByRole('button', { name: `Try situation ${i + 2}` }).click();
  }
  await page.getByRole('button', { name: 'See my Rewind summary' }).click();
  await expect(page.getByRole('region', { name: 'Rewind summary' })).toContainText('3 of 3 situations tried');
  await page.reload();
  await page.getByRole('button', { name: 'Review Rewind' }).click();
  await expect(page.getByRole('region', { name: 'Rewind summary' })).toBeVisible();
  await page.getByRole('button', { name: /^Review feedback/ }).first().click();
  await expect(page.getByRole('region', { name: 'Practice feedback' })).toContainText(pack.choices[0]);
  expect(await page.evaluate(id => JSON.parse(localStorage.getItem(`ce-standalone-rewind-${id}`)).attempts.length, pack.id)).toBe(3);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).answers, pack.key)).toEqual(sourceAnswers);
  expect(await page.evaluate(() => localStorage.getItem('ce-med-surg-track-private'))).toBeNull();
});
