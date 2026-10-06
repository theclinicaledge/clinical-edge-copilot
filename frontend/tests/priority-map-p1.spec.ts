import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { parsePriorities } from '../src/components/priorityMapModel.js';
const require = createRequire(import.meta.url);
const { positive } = require('../../backend/validation/p1/fixtures.js');
const { buildEvidence } = require('../../backend/priority-map-intelligence.js');
const { composePriorityMap } = require('../../backend/priority-map-p1.js');
const fixture = positive[0];
const evidence = buildEvidence(fixture.snapshot, 'MODERATE');
const map = composePriorityMap(evidence, fixture.reasoning);

test('P1 presentation retains exact observed evidence, separating all conditional interpretation', () => {
  const priorityContent = map.split('**Priorities**')[1].split('**Assess first**')[0];
  const [priority] = parsePriorities(priorityContent);
  expect(priority.observed).toEqual(evidence.evidence.map((e: { text: string }) => e.text));
  expect(priority.assessNow.join(' ')).toContain('Conditional interpretation: If');
  expect(priority.observed.join(' ')).not.toContain('If repeat');
});

for (const width of [390, 1280]) test(`P1 mock physiology and mechanism reasoning render at ${width}px without extra operations`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/**', route => {
    const body = route.request().postDataJSON();
    requests.push(body.learningRequest ? 'teach' : 'map');
    if (body.learningRequest) return route.fulfill({ json: { lesson: { active: false, conceptId: 'pattern-physiology', conceptLabel: 'Physiology of this pattern', keyIdea: fixture.reasoning.physiology.principle, whyItMatters: fixture.reasoning.physiology.application, scenarioConnection: fixture.reasoning.physiology.limitation, tags: ['Mechanism reasoning'] } } });
    return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: map })}\n\ndata: ${JSON.stringify({ done: true, priorityMapResolution: 'validated' })}\n\n` });
  });
  await page.goto('/copilot?capture=rapid');
  await page.getByLabel('Nurse narrative').fill('BP is 85/55. Patient is increasingly drowsy. Baseline pressure and onset are unknown.');
  await page.getByRole('button', { name: 'Structure my Snapshot' }).click();
  await expect(page.getByRole('heading', { name: 'I captured' })).toBeVisible();
  const context = page.getByRole('button', { name: 'Keep as context' });
  while (await context.count()) {
    const count = await context.count();
    await context.first().click();
    await expect(context).toHaveCount(count - 1);
  }
  await page.getByRole('button', { name: 'Confirm Snapshot' }).click();
  await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
  await expect(page.getByRole('heading', { name: 'Findings in context' })).toBeVisible();
  await page.getByRole('button', { name: /Possible contributors/ }).click();
  await expect(page.locator('.priority-reasoning')).toContainText(fixture.reasoning.possible_contributors[0].why_relevant);
  await expect(page.locator('.priority-reasoning')).toContainText(`Conditional support: ${fixture.reasoning.possible_contributors[0].would_strengthen}`);
  await expect(page.locator('.priority-observed')).not.toContainText('Conditional');
  await page.getByRole('button', { name: /Teach me why/ }).click();
  await expect(page.getByText(fixture.reasoning.physiology.principle, { exact: true })).toBeVisible();
  await expect(page.getByText(fixture.reasoning.physiology.limitation, { exact: true })).toBeVisible();
  expect(requests).toEqual(['map', 'teach']);
  const stored = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, history: history.state, url: location.href }));
  expect(stored).not.toContain('85/55');
  expect(stored).not.toContain(fixture.reasoning.physiology.principle);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
