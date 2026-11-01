import { test, expect } from '@playwright/test';

for (const width of [375, 390, 768, 1440]) test(`answer navigation and references at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  let requests = 0;
  await page.route('**/api/**', route => { requests++; return route.abort(); });
  await page.goto('/ask-reading-preview.html');
  const nav = page.getByRole('navigation', { name: 'Answer sections' });
  await expect(nav.getByRole('link')).toHaveCount(3);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByText('Model-generated education, not independently source-verified. Pending clinical accuracy review.')).toBeVisible();
  await page.locator('.ce-ask-answer').evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top - 76));
  await page.screenshot({ path: `/private/tmp/ce-ask-v2/after/answer-${width}.png` });
  await page.screenshot({ path: `/private/tmp/ce-ask-v2/after/full-${width}.png`, fullPage: true });
  const reference = nav.getByRole('button', { name: 'References & limitations' });
  await reference.focus();
  const readingPosition = await page.evaluate(() => scrollY);
  await reference.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'References and limitations' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Return to reading' })).toBeFocused();
  await expect(page.getByText(/Reference check required/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(reference).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(readingPosition);
  await page.getByRole('button', { name: 'Back to explanation' }).click();
  await expect(page.locator('.ce-ask-explanation')).toBeFocused();
  for (const label of ['Why it matters', 'What changes interpretation', 'At the bedside']) {
    await nav.getByRole('link', { name: label, exact: true }).click();
    const heading = page.getByRole('heading', { name: label, exact: true });
    await expect(heading).toBeFocused();
    expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(70);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(requests).toBe(0);
});

test('short answers stay compact; safety text and source limitations remain intact', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ask-reading-preview.html');
  await page.getByLabel('Preview response').selectOption('Short answer');
  await expect(page.getByRole('navigation', { name: 'Answer sections' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Main answer' })).toHaveCount(0);
  await expect(page.locator('.ce-ask-direct')).toHaveText('The follow-up uses the preceding educational explanation.');
  await page.getByText('References and limitations', { exact: true }).click();
  await expect(page.getByText(/Reference check required/)).toBeVisible();
  await page.screenshot({ path: '/private/tmp/ce-ask-v2/after/short-390.png', fullPage: true });
  await page.getByLabel('Preview response').selectOption('Safety & references');
  await page.getByRole('link', { name: 'Safety', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Safety', exact: true })).toContainText('Acute deterioration warrants timely bedside assessment and local escalation, not reassurance or waiting for the assistant.');
  await expect(page.getByRole('heading', { name: 'Safety', exact: true })).toBeFocused();
  await page.screenshot({ path: '/private/tmp/ce-ask-v2/after/safety-390.png' });
  await page.getByRole('button', { name: 'References & limitations' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('link', { name: 'Safe reference' })).toHaveAttribute('href', 'https://example.org/reference');
  await expect(dialog).toContainText('A bounded reference explanation');
  await dialog.getByRole('button', { name: 'Return to reading' }).click();
  await page.getByLabel('Preview response').selectOption('Limited references');
  await page.getByRole('button', { name: 'References & limitations' }).click();
  await expect(dialog).toContainText('No reference links supplied with this answer.');
  await expect(dialog.getByRole('link')).toHaveCount(0);
  await page.screenshot({ path: '/private/tmp/ce-ask-v2/after/references-390.png' });
});

test('enlarged references remain keyboard reachable with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 500 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ask-reading-preview.html');
  await page.getByLabel('Preview response').selectOption('Safety & references');
  await page.locator('.ce-ask-main').evaluate(main => {
    const elements = [...main.querySelectorAll('*')];
    const sizes = elements.map(el => parseFloat(getComputedStyle(el).fontSize));
    elements.forEach((el, i) => (el as HTMLElement).style.fontSize = `${sizes[i] * 2}px`);
  });
  await page.getByRole('button', { name: 'References & limitations' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('link')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Return to reading' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'References & limitations' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
