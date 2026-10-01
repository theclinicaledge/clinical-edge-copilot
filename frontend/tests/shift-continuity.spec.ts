import { test, expect } from '@playwright/test';

const narrative = 'BP dropped from 108/64 to 86/48. Norepinephrine is running but I do not have the dose.';
const response = `Urgency Level: HIGH
**Priorities**
### 1 · Reported perfusion change
Relevance: Important
Observed:
- Blood pressure fell from 108/64 to 86/48
Interpretation: The cause remains unresolved.
Assess now:
- Reassess perfusion
**Assess first**
- Focused reassessment
**Possible patterns**
- Several contributors remain possible
**Missing information**
- Medication dose
**Monitor and trend**
- Direction of change
**Escalation triggers**
- Worsening status
**SBAR-ready summary**
A pressure decline was reported.
**Teach me why**
Trends provide context.`;

for (const width of [390, 430, 1280]) {
  test('memory-only Shift Brain continuity at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    const analytics: string[] = [];
    page.on('console', (message) => { if (message.type() === 'debug') analytics.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    const requests: string[] = [];
    await page.route('**/api/**', async (route) => {
      const body = route.request().postDataJSON();
      requests.push(body.learningRequest ? 'teach' : route.request().url().includes('/sbar') ? 'sbar' : 'map');
      if (body.learningRequest) return route.fulfill({ json: { lesson: { active: false, keyIdea: 'Trends add context.', whyItMatters: 'Reassessment helps clarify uncertainty.', scenarioConnection: 'The reported pressure declined.', tags: ['Perfusion'] } } });
      if (route.request().url().includes('/sbar')) return route.fulfill({ json: { sbar: { situation: 'A pressure decline was reported.', background: 'Medication dose is unknown.', assessment: 'Cause is unresolved.', recommendation: 'Please assess at the bedside.' } } });
      return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ text: response })}\n\ndata: ${JSON.stringify({ done: true })}\n\n` });
    });
    await page.goto('/copilot?capture=rapid');
    await page.getByLabel('Nurse narrative').fill(narrative);
    const nav = page.getByRole('navigation', { name: 'Clinical Edge workspace' });
    const leave = async () => {
      await nav.getByRole('button', { name: 'Check something' }).click();
      await page.getByRole('dialog').getByRole('link', { name: 'Medication' }).click();
      await expect(page.getByText('Shift Brain active', { exact: true })).toBeVisible();
    };
    const resume = async () => {
      await nav.getByRole('link', { name: 'Return', exact: false }).click();
      await expect(page).toHaveURL(/\/copilot$/);
      await expect(nav.getByRole('link', { name: 'Shift Brain', exact: true })).toHaveAttribute('aria-current', 'page');
      await expect(page.getByRole('dialog')).toHaveCount(0);
    };
    await leave();
    await resume();
    await expect(page.getByLabel('Nurse narrative')).toHaveValue(narrative);
    await expect(page.getByLabel('Nurse narrative')).toBeFocused();
    await page.getByRole('button', { name: 'Structure my Snapshot' }).click();
    await expect(page.getByRole('heading', { name: 'I captured' })).toBeVisible();
    await leave();
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'I captured' })).toBeVisible();
    await page.getByRole('button', { name: 'Keep as context' }).click();
    await page.getByRole('button', { name: 'Confirm Snapshot' }).click();
    await leave();
    await resume();
    await expect(page.getByRole('heading', { name: 'Ready for Priority Map' })).toBeVisible();
    await page.getByRole('button', { name: 'Build my Priority Map →' }).click();
    await expect(page.getByRole('heading', { name: 'Reported perfusion change' })).toBeVisible();
    await page.screenshot({ path: `/private/tmp/clinical-edge-slice2-priority-${width}.png`, animations: 'disabled' });
    await page.getByRole('link', { name: 'Check medication' }).click();
    await expect(page.getByText('Shift Brain active', { exact: true })).toBeVisible();
    await page.screenshot({ path: `/private/tmp/clinical-edge-slice2-resource-${width}.png`, animations: 'disabled' });
    await resume();
    await expect(page.getByRole('heading', { name: 'Reported perfusion change' })).toBeVisible();
    await page.getByRole('button', { name: /Teach me why/ }).click();
    await expect(page.getByText('Trends add context.', { exact: true })).toBeVisible();
    await page.screenshot({ path: `/private/tmp/clinical-edge-slice2-teach-${width}.png`, animations: 'disabled' });
    await leave();
    await resume();
    await expect(page.getByText('Trends add context.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Prepare SBAR' }).click();
    await expect(page.getByRole('heading', { name: 'Situation', exact: true })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const scroll = await page.evaluate(() => scrollY);
    await leave();
    await resume();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(scroll, 0);
    await expect(page.getByRole('heading', { name: 'Situation', exact: true })).toBeVisible();
    await page.screenshot({ path: `/private/tmp/clinical-edge-slice2-resumed-${width}.png`, animations: 'disabled' });
    expect(requests).toEqual(['map', 'teach', 'sbar']);
    const persisted = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, history: history.state, url: location.href }));
    expect(persisted).not.toContain('108/64');
    expect(persisted).not.toContain('Norepinephrine');
    expect(analytics.join('\n')).not.toContain('108/64');
    expect(analytics.join('\n')).not.toContain('Norepinephrine');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'New Snapshot', exact: true }).click();
    await expect(page.getByLabel('Nurse narrative')).toHaveValue('');
    await expect(page.getByRole('heading', { name: 'Situation', exact: true })).toHaveCount(0);
    await page.getByLabel('Nurse narrative').fill(narrative);
    await page.reload();
    await page.getByRole('button', { name: "Describe what's happening", exact: true }).click();
    await expect(page.getByLabel('Nurse narrative')).toHaveValue('');
    expect(errors).toEqual([]);
  });
}
