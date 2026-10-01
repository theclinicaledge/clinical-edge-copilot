import { test, expect } from '@playwright/test';

const widths = [390, 430, 1280];
for (const width of widths) {
  test('command workspace navigation at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    let providerRequests = 0;
    await page.route('**/api/**', async (route) => { providerRequests++; await route.abort(); });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Clinical Edge workspace' });
    await expect(nav.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('link', { name: "Describe what's happening" })).toBeInViewport();
    await expect(page.locator('.ce-command-home__checks')).toBeInViewport();
    await page.screenshot({ path: '/private/tmp/clinical-edge-slice1-home-' + width + '.png', animations: 'disabled' });

    await page.getByRole('link', { name: "Describe what's happening" }).click();
    await expect(page.getByRole('button', { name: "Describe what's happening", exact: true })).toHaveAttribute('aria-pressed', 'true');
    const narrative = page.getByRole('textbox', { name: 'Nurse narrative' });
    await expect(narrative).toBeVisible();
    await page.screenshot({ path: '/private/tmp/clinical-edge-slice1-rapid-' + width + '.png', animations: 'disabled' });
    await narrative.fill('Fictional practice scenario: RR is 24.');
    await page.setViewportSize({ width: width === 390 ? 844 : width, height: width === 390 ? 390 : 780 });
    await expect(narrative).toHaveValue('Fictional practice scenario: RR is 24.');
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    await nav.getByRole('button', { name: 'Check something' }).click();
    const dialog = page.getByRole('dialog', { name: 'Check something' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close tools' })).toBeFocused();
    await page.screenshot({ path: '/private/tmp/clinical-edge-slice1-check-' + width + '.png', animations: 'disabled' });
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('link', { name: 'Clinical reference' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(nav.getByRole('button', { name: 'Check something' })).toBeFocused();
    await expect(narrative).toHaveValue('Fictional practice scenario: RR is 24.');

    for (const [name, path, target] of [
      ['Rhythm', '/rhythm-lab/library', 'Filter rhythms'],
      ['Medication', '/icu-drips', 'Search drips'],
      ['ABG', '/abg-lab', ''],
      ['Clinical reference', '/reference-hub', 'Search references'],
    ]) {
      await nav.getByRole('button', { name: 'Check something' }).click();
      await page.getByRole('dialog').getByRole('link', { name }).click();
      await expect(page).toHaveURL(new RegExp(path + '$'));
      await expect(nav.getByRole('button', { name: 'Check something' })).toHaveClass(/is-active/);
      if (target) {
        const search = page.getByLabel(target);
        await expect(search).toBeInViewport();
        await page.screenshot({ path: '/private/tmp/clinical-edge-slice1-' + path.slice(1).replaceAll('/', '-') + '-' + width + '.png', animations: 'disabled' });
        await search.fill(name === 'Medication' ? 'norepinephrine' : name === 'Clinical reference' ? 'lactate' : 'sinus');
        await expect(search).toBeFocused();
        await search.press('Tab');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const tapHeights = await nav.locator('a,button').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
      expect(tapHeights.every((height) => height >= 44)).toBe(true);
      const routeClearance = await page.locator('#root > :first-child').evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
      const dockExtent = await nav.evaluate((el) => innerHeight - el.getBoundingClientRect().top);
      expect(routeClearance).toBeGreaterThanOrEqual(dockExtent + 12);
      await nav.getByRole('link', { name: 'Home', exact: true }).click();
      await expect(page).toHaveURL(/\/$/);
      await page.goBack();
      await expect(page).toHaveURL(new RegExp(path + '$'));
      await nav.getByRole('link', { name: 'Home', exact: true }).click();
    }
    await nav.getByRole('button', { name: 'More tools' }).click();
    await page.screenshot({ path: '/private/tmp/clinical-edge-slice1-more-' + width + '.png', animations: 'disabled' });
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Brain Sheets' })).toBeVisible();
    await page.getByRole('dialog').getByRole('link', { name: 'Brain Sheets' }).click();
    await expect(page).toHaveURL(/\/brain-sheets$/);
    await expect(nav.getByRole('button', { name: 'More tools' })).toHaveClass(/is-active/);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const clearance = await page.evaluate(() => {
      const cards = document.querySelectorAll('.bs-list-item');
      const last = cards[cards.length - 1];
      return !last || last.getBoundingClientRect().bottom <= document.querySelector('.ce-tool-dock')!.getBoundingClientRect().top;
    });
    expect(clearance).toBe(true);
    expect(providerRequests).toBe(0);
    expect(errors).toEqual([]);
  });
}

test('home lookup actions open the resource in one action and preserve optional learning', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [name, path] of [
    ['Rhythm', '/rhythm-lab/library'], ['Medication', '/icu-drips'],
    ['ABG', '/abg-lab'], ['Clinical reference', '/reference-hub'],
  ]) {
    await page.goto('/');
    await page.locator('.ce-command-home__checks').getByRole('link', { name }).click();
    await expect(page).toHaveURL(new RegExp(path + '$'));
    if (name === 'Medication') {
      await page.getByText('Practice, compare & clinical pearls', { exact: true }).click();
      await expect(page.getByRole('button', { name: /Shift Challenge/ })).toBeVisible();
    }
    if (name === 'Clinical reference') {
      await page.getByText('Pathways & clinical concepts', { exact: true }).click();
      await expect(page.locator('.rh-pathways')).toBeVisible();
      await expect(page.locator('.rh-concepts')).toBeVisible();
    }
  }
});

test('browser back dismisses the navigation sheet and restores the previous route', async ({ page }) => {
  await page.goto('/');
  await page.locator('.ce-command-home__checks').getByRole('link', { name: 'Medication' }).click();
  await page.getByRole('button', { name: 'More tools' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#root')).not.toHaveAttribute('inert', '');
});
