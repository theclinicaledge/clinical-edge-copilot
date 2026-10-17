import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { conversationEntry } from '../src/modules/the-shift/conversation/metadata.js';

test('public review record preserves exact authored v0.4 clinical content', () => {
  const data = readFileSync(new URL('../src/modules/the-shift/conversation/data.js', import.meta.url));
  expect(createHash('sha256').update(data).digest('hex')).toBe('26a468da12de6ab17a08716bd915db3b54e005bded5477a060e9d5854e4f976f');
  expect(conversationEntry.private).toBe(false);
  expect(conversationEntry.review.approvedVersion).toBe('0.4');
  expect(conversationEntry.review.reviewer).toBeNull();
  expect(conversationEntry.review.reviewDate).toBeNull();
  expect(conversationEntry.review.status).toContain('reported by the founder');
});
test('production exposes four scenarios, notice, skip and truthful review without API calls', async ({ page }) => {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (['fonts.googleapis.com', 'fonts.gstatic.com', 'va.vercel-scripts.com'].includes(url.hostname)) return route.fulfill({ body: '' });
    expect(url.hostname).toBe('127.0.0.1');
    expect(route.request().method()).toBe('GET');
    expect(url.pathname).not.toMatch(/\/api\//);
    return route.continue();
  });
  page.on('pageerror', error => { throw error; });
  await page.goto('/learn/shifts');
  await expect(page.locator('.shift-library-card')).toHaveCount(4);
  await page.locator('.shift-library-card').last().getByRole('link', { name: 'Begin shift' }).click();
  await expect(page.locator('.conversation-root')).toBeVisible();
  await expect(page.locator('.conversation-notice')).toBeVisible();
  await page.getByRole('button', { name: 'Sources & review', exact: true }).click();
  await expect(page.locator('.shift-review-dialog')).toContainText('Nurse approval of this scenario and its references is reported by the founder');
  await expect(page.locator('.shift-review-dialog')).toContainText('Not supplied');
  await page.getByRole('button', { name: 'Close source record' }).click();
  await page.getByRole('button', { name: 'Skip this Shift' }).click();
  await expect(page.getByRole('heading', { name: 'You can step away.' })).toBeVisible();
  await page.getByRole('link', { name: 'Return to Shift Library' }).click();
  await expect(page.locator('.shift-library-card')).toHaveCount(4);
  await page.goto('/learn/shifts/conversation/ask');
  await expect(page.locator('.shift-handoff')).toContainText('Ask may decline');
  await expect(page.locator('.shift-handoff')).toContainText('Nothing is submitted automatically');
});
